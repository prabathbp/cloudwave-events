const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = require("crypto");
}

let cachedConnection = null;

module.exports.connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    });
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.log("MongoDB error:", error.message);
    throw error;
  }
};