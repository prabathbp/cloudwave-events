const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    eventId: String,
    title: String,
    description: String,
    dateTime: String,
    mediaUrl: String,
    createdAt: String,
    createdBy: String,
  },
  { strict: false }
);

function getEventModel() {
  return mongoose.models.Event || mongoose.model('Event', eventSchema);
}

/**
 * Resolve path id to either MongoDB _id or legacy eventId UUID.
 */
function buildEventQuery(id) {
  if (!id) return null;

  if (/^[a-fA-F0-9]{24}$/.test(id) && mongoose.Types.ObjectId.isValid(id)) {
    return { _id: id };
  }

  return { eventId: id };
}

/**
 * Map request body to legacy event fields used in production data.
 */
function pickUpdateFields(body) {
  const update = {};

  if (body.title !== undefined) update.title = body.title;
  if (body.description !== undefined) update.description = body.description;

  if (body.dateTime !== undefined) update.dateTime = body.dateTime;
  else if (body.date !== undefined) update.dateTime = body.date;

  if (body.mediaUrl !== undefined) update.mediaUrl = body.mediaUrl;
  else if (body.bannerUrl !== undefined) update.mediaUrl = body.bannerUrl;

  return update;
}

module.exports = {
  getEventModel,
  buildEventQuery,
  pickUpdateFields,
};
