const mongoose = require("mongoose");

module.exports = () => {
  mongoose.connect(process.env.MONGODB_URI);
  mongoose.connection.on("connected", () => {
    console.log("database connection successful.");
  });
  mongoose.connection.on("error", (err) => {
    console.error(err);
  });
  mongoose.connection.on("disconnected", () => {
    console.log("database connection disconnected.");
  });
};
