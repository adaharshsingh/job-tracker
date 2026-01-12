const mongoose = require("mongoose");

const ApplicationEventSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },

  jobApplicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobApplication",
    required: true
  },

  type: {
    type: String,
    enum: ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"],
    required: true
  },

  source: {
    type: String,
    enum: ["email", "manual"],
    required: true
  },

  emailThreadId: String,
  emailMessageId: String,

  detectedIntent: {
    type: String,
    enum: ["APPLIED", "INTERVIEW", "OFFER", "REJECTED", "UNKNOWN"]
  },

  finalIntent: {
    type: String,
    enum: ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"],
    required: true
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ApplicationEvent", ApplicationEventSchema);
