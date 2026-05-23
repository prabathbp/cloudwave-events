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

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

module.exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  try {
    await connectDB();
    const events = await Event.find();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(events)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};