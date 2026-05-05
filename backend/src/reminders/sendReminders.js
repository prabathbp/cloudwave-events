const mongoose = require("mongoose");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { connectDB } = require("../utils/db");

const ses = new SESClient({ region: "ap-southeast-1" });

const eventSchema = new mongoose.Schema({
  eventId: String,
  title: String,
  dateTime: String
});

const registrationSchema = new mongoose.Schema({
  eventId: String,
  userEmail: String
});

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
const Registration =
  mongoose.models.Registration ||
  mongoose.model("Registration", registrationSchema);

module.exports.handler = async () => {
  try {
    await connectDB();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const events = await Event.find();

    for (const eventItem of events) {
      const eventDate = new Date(eventItem.dateTime);
      if (eventDate.toDateString() === tomorrow.toDateString()) {
        const registrations = await Registration.find({
          eventId: eventItem.eventId
        });
        for (const reg of registrations) {
          await ses.send(
            new SendEmailCommand({
              Source: process.env.SES_EMAIL,
              Destination: { ToAddresses: [reg.userEmail] },
              Message: {
                Subject: { Data: `Reminder: ${eventItem.title} is tomorrow!` },
                Body: {
                  Text: {
                    Data: `This is a reminder that ${eventItem.title} is happening tomorrow.`
                  }
                }
              }
            })
          );
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Reminders sent successfully" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};