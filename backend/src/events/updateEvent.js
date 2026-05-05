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
    const body = JSON.parse(event.body);
    const updated = await Event.findOneAndUpdate(
      { eventId: id },
      { ...body },
      { new: true }
    );
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(updated)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};