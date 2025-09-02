const mongoose = require("mongoose");

const SessionLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    // Denormalized for easy display
    type: String,
    required: true,
  },
  loginTime: {
    type: Date,
    required: true,
  },
  logoutTime: {
    type: Date,
  },
  durationInSeconds: {
    type: Number,
  },
});

module.exports = mongoose.model("SessionLog", SessionLogSchema);
