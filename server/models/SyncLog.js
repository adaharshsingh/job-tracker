const mongoose = require("mongoose");

const SyncLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true, unique: true },
  
  // Last successful sync timestamp
  lastSyncDate: { type: Date, default: () => new Date(0) },
  
  // Summary of last sync
  lastSyncSummary: {
    applied: { type: Number, default: 0 },
    interview: { type: Number, default: 0 },
    offer: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    unknown: { type: Number, default: 0 }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SyncLog", SyncLogSchema);
