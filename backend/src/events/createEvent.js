const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
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
    const body = JSON.parse(event.body);
    const newEvent = await Event.create({
      eventId: uuidv4(),
      title: body.title,
      description: body.description,
      dateTime: body.dateTime,
      mediaUrl: body.mediaUrl || "",
      createdAt: new Date().toISOString()
    });
    return {
      statusCode: 201,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(newEvent)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
