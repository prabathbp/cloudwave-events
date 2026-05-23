const mongoose = require("mongoose");
const { connectDB } = require("../utils/db");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

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
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    await connectDB();
    const { id } = event.pathParameters;
    const foundEvent = await Event.findOne({ eventId: id });
    if (!foundEvent) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Event not found" })
      };
    }
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(foundEvent)
    };
  } catch (error) {
    console.log("getEventById error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};
