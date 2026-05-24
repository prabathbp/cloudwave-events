'use strict';

const { connectDB } = require('./db');
const { requireAdmin, corsHeaders } = require('./adminCheck');
const { getEventModel, buildEventQuery } = require('./eventSchema');

module.exports.handler = async (event) => {
  console.log('[eventsDelete] Invoked:', JSON.stringify({
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

  try {
    await connectDB();
    const Event = getEventModel();
    const query = buildEventQuery(id);

    const deleted = await Event.findOneAndDelete(query);

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
      body: JSON.stringify({
        message: 'Event deleted successfully.',
        id: deleted.eventId || deleted._id,
      }),
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
