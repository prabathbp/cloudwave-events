'use strict';

const mongoose = require('mongoose');
const { requireAdmin, corsHeaders } = require('../utils/adminCheck');

// ── MongoDB connection (reuse across warm Lambda invocations) ────────────────
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGO_URI;
  await mongoose.connect(uri);
  isConnected = true;
}

// ── Event Schema (match your existing schema exactly) ───────────────────────
const EventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  date:        { type: Date,   required: true },
  bannerUrl:   { type: String },
  createdBy:   { type: String },
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

// ── Handler ──────────────────────────────────────────────────────────────────
module.exports.handler = async (event) => {
  console.log('[eventsUpdate] Invoked:', JSON.stringify({
    pathParameters: event.pathParameters,
    requestContext: event.requestContext?.authorizer,
  }));

  // ── OPTIONS pre-flight ────────────────────────────────────────────────────
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // ── Admin guard ───────────────────────────────────────────────────────────
  const authError = requireAdmin(event);
  if (authError) return authError;

  // ── Parse input ───────────────────────────────────────────────────────────
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

  // ── DB operation ──────────────────────────────────────────────────────────
  try {
    await connectDB();

    const updated = await Event.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
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
