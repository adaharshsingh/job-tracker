const mongoose = require("mongoose");

const EntitySchema = new mongoose.Schema(
  {
    value: {
      type: String,
      default: "Unknown"
    },
    confidence: {
      type: Number,
      default: 0
    },
    source: {
      type: String,
      enum: ["email", "user", "ml"],
      default: "email"
    }
  },
  { _id: false }
);

const JobApplicationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },

  // 🧠 ENTITY OBJECTS (NOT STRINGS)
  company: {
    type: EntitySchema,
    default: () => ({})
  },

  role: {
    type: EntitySchema,
    default: () => ({})
  },

  jobDescription: {
    type: String,
    default: ""
  },

  source: {
    type: String,
    enum: ["linkedin", "referral", "careers", "other"],
    default: "other"
  },

  appliedDate: {
    type: Date,
    required: true
  },

  currentStatus: {
    type: String,
    enum: ["applied", "interview", "offer", "rejected"],
    default: "applied"
  },

  // 🔒 USER_WINS
  statusSource: {
    type: String,
    enum: ["auto", "user"],
    default: "auto"
  },

  // 🔑 EMAIL THREAD = SINGLE JOB
  emailThreadId: {
    type: String,
    index: true
  },

  // 🗑️ DELETED AT (for tracking if previously deleted)
  deletedAt: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("JobApplication", JobApplicationSchema);