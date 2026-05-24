'use strict';

const { connectDB } = require('./db');
const { requireAdmin, corsHeaders } = require('./adminCheck');
const {
  getEventModel,
  buildEventQuery,
  pickUpdateFields,
} = require('./eventSchema');

module.exports.handler = async (event) => {
  console.log('[eventsUpdate] Invoked:', JSON.stringify({
    pathParameters: event.pathParameters,
  }));

  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const authError = requireAdmin(event);
  if (authError) return authError;

  const id = event.pathParameters?.id;
  if (!id) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Missing event ID.' }),
    };
  }

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

  const update = pickUpdateFields(body);
  if (Object.keys(update).length === 0) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'No valid fields to update.' }),
    };
  }

  try {
    await connectDB();
    const Event = getEventModel();
    const query = buildEventQuery(id);

    const updated = await Event.findOneAndUpdate(
      query,
      { $set: update },
      { new: true }
    );

    if (!updated) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Event not found.' }),
      };
    }

    console.log('[eventsUpdate] Updated event:', id);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Event updated successfully.', event: updated }),
    };
  } catch (err) {
    console.error('[eventsUpdate] DB error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Internal server error.', error: err.message }),
    };
  }
};
