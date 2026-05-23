'use strict';

const mongoose = require('mongoose');
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
  console.log('[eventsDelete] Invoked:', JSON.stringify({
    pathParameters: event.pathParameters,
    requestContext: event.requestContext?.authorizer,
  }));

  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // ── Admin guard ───────────────────────────────────────────────────────────
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

  try {
    await connectDB();

    const deleted = await Event.findByIdAndDelete(id);

    if (!deleted) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Event not found.' }),
      };
    }

    console.log('[eventsDelete] Deleted event:', id);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Event deleted successfully.', id }),
    };
  } catch (err) {
    console.error('[eventsDelete] DB error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Internal server error.', error: err.message }),
    };
  }
};
