const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { connectDB } = require("../utils/db");

const ses = new SESClient({ region: "ap-southeast-1" });

const registrationSchema = new mongoose.Schema({
  registrationId: String,
  eventId: String,
  userEmail: String,
  registeredAt: String
});

const Registration =
  mongoose.models.Registration ||
  mongoose.model("Registration", registrationSchema);

module.exports.handler = async (event) => {
  try {
    await connectDB();
    const body = JSON.parse(event.body);

    const existing = await Registration.findOne({
      eventId: body.eventId,
      userEmail: body.userEmail
    });

    if (existing) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Already registered for this event" })
      };
    }

    const registration = await Registration.create({
      registrationId: uuidv4(),
      eventId: body.eventId,
      userEmail: body.userEmail,
      registeredAt: new Date().toISOString()
    });

    await ses.send(
      new SendEmailCommand({
        Source: process.env.SES_EMAIL,
        Destination: { ToAddresses: [body.userEmail] },
        Message: {
          Subject: { Data: "CloudWave Event Registration Confirmed" },
          Body: {
            Text: {
              Data: "You have successfully registered for the event!"
            }
          }
        }
      })
    );

    return {
      statusCode: 201,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(registration)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};