const mongoose = require("mongoose");
const { connectDB } = require("../utils/db");

const eventSchema = new mongoose.Schema({
  eventId: String,
  title: String,
  description: String,
  dateTime: String,
  mediaUrl: String,
  createdAt: String
});

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

module.exports.handler = async () => {
  try {
    await connectDB();
    const events = await Event.find();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(events)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};