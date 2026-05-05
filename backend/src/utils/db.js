const mongoose = require("mongoose");

let cachedConnection = null;

module.exports.connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }
  const connection = await mongoose.connect(process.env.MONGO_URI);
  cachedConnection = connection;
  return connection;
};
