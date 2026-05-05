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

module.exports.handler = async (event) => {
  try {
    await connectDB();
    const { id } = event.pathParameters;
    const foundEvent = await Event.findOne({ eventId: id });
    if (!foundEvent) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Event not found" })
      };
    }
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(foundEvent)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};