'use strict';

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { requireAdmin, corsHeaders } = require('../utils/adminCheck');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

const EventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  date:        { type: Date,   required: true },
  bannerUrl:   { type: String },
  createdBy:   { type: String },
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

module.exports.handler = async (event) => {
  console.log('[eventsCreate] Invoked');

  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // ── Admin guard ───────────────────────────────────────────────────────────
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

  const { title, description, date, bannerUrl } = body;

  if (!title || !date) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'title and date are required.' }),
    };
  }

  // Extract createdBy from Cognito claims
  let createdBy = 'unknown';
  try {
    const ctx = event.requestContext?.authorizer;
    createdBy =
      ctx?.jwt?.claims?.email ||
      ctx?.claims?.email ||
      ctx?.jwt?.claims?.sub ||
      'unknown';
  } catch {}

  try {
    await connectDB();

    const newEvent = await Event.create({
      title,
      description,
      date: new Date(date),
      bannerUrl: bannerUrl || '',
      createdBy,
    });

    console.log('[eventsCreate] Created event:', newEvent._id);
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
