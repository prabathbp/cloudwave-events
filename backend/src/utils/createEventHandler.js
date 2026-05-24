'use strict';

const { v4: uuidv4 } = require('uuid');
const { connectDB } = require('./db');
const { requireAdmin, corsHeaders } = require('./adminCheck');
const { getEventModel } = require('./eventSchema');

module.exports.handler = async (event) => {
  console.log('[eventsCreate] Invoked');

  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const authError = requireAdmin(event);
  if (authError) return authError;

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Invalid JSON body.' }),
    };
  }

  const title = body.title;
  const description = body.description || '';
  const dateTime = body.dateTime || body.date;
  const mediaUrl = body.mediaUrl || body.bannerUrl || '';

  if (!title || !dateTime) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'title and dateTime are required.' }),
    };
  }

  let createdBy = 'unknown';
  try {
    const ctx = event.requestContext?.authorizer;
    createdBy =
      ctx?.jwt?.claims?.email ||
      ctx?.claims?.email ||
      ctx?.jwt?.claims?.sub ||
      'unknown';
  } catch {
    // ignore
  }

  try {
    await connectDB();
    const Event = getEventModel();

    const newEvent = await Event.create({
      eventId: uuidv4(),
      title,
      description,
      dateTime: typeof dateTime === 'string' ? dateTime : new Date(dateTime).toISOString(),
      mediaUrl,
      createdAt: new Date().toISOString(),
      createdBy,
    });

    console.log('[eventsCreate] Created event:', newEvent.eventId);
    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Event created successfully.', event: newEvent }),
    };
  } catch (err) {
    console.error('[eventsCreate] DB error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Internal server error.', error: err.message }),
    };
  }
};
