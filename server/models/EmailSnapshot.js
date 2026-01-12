const mongoose = require("mongoose");

const EmailSnapshotSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },

  threadId: { type: String, required: true },
  messageId: { type: String, required: true },

  subject: String,
  from: String,
  snippet: String,
  
  // 📅 Email date from Gmail (when email was actually sent)
  emailDate: { type: Date },

  intent: {
    type: String,
    enum: ["UNKNOWN"],
    default: "UNKNOWN"
  },

  createdAt: { type: Date, default: Date.now }
});

// ✅ SAFE EXPORT
module.exports =
  mongoose.models.EmailSnapshot ||
  mongoose.model("EmailSnapshot", EmailSnapshotSchema);
