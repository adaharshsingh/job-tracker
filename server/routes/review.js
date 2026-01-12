const express = require("express");
const router = express.Router();

const JobApplication = require("../models/JobApplication");
const EmailSnapshot = require("../models/EmailSnapshot");

const {
  extractCompany,
  extractRole
} = require("../utils/emailEntityExtractor");

/* ---------- GET UNKNOWN EMAILS ---------- */
router.get("/unknown", async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const items = await EmailSnapshot.find({
    userId: req.user.id
  }).sort({ createdAt: -1 });

  res.json(items);
});

/* ---------- CONFIRM EMAIL ---------- */
router.post("/confirm", async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const { snapshotId, finalIntent } = req.body;

  const ALLOWED = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED", "IGNORE"];
  if (!ALLOWED.includes(finalIntent)) {
    return res.status(400).json({ error: "Invalid intent" });
  }

  const snapshot = await EmailSnapshot.findById(snapshotId);
  if (!snapshot) {
    return res.status(404).json({ error: "Email not found" });
  }

  // IGNORE → just remove from queue
  if (finalIntent === "IGNORE") {
    await snapshot.deleteOne();
    return res.json({ success: true });
  }

  const userId = req.user.id;
  const status = finalIntent.toLowerCase();

  // Extract entities ONCE
  const companyEntity = extractCompany(snapshot);
  const roleEntity = extractRole(snapshot);

  // Find existing job by email thread (only non-deleted)
  let job = await JobApplication.findOne({
    userId,
    emailThreadId: snapshot.threadId,
    deletedAt: null
  });

  /* ---------- CREATE JOB ---------- */
  if (!job) {
    job = await JobApplication.create({
      userId,
      company: companyEntity,
      role: roleEntity,
      appliedDate: snapshot.emailDate ? new Date(snapshot.emailDate) : new Date(),
      currentStatus: status,
      statusSource: "user", // 🔒 USER_WINS
      emailThreadId: snapshot.threadId
    });
  }

  /* ---------- UPDATE JOB (USER_WINS) ---------- */
  else {
    job.currentStatus = status;
    job.statusSource = "user";
    job.deletedAt = null; // 🔄 Restore if was soft-deleted

    // Upgrade entities ONLY if unknown
    if (
      job.company?.value === "Unknown" &&
      companyEntity.value !== "Unknown"
    ) {
      job.company = companyEntity;
    }

    if (
      job.role?.value === "Unknown" &&
      roleEntity.value !== "Unknown"
    ) {
      job.role = roleEntity;
    }

    await job.save();
  }

  // ✅ KEEP snapshot (don't delete) so Dashboard can still show snippet on preview
  // Update it to have clean/sanitized text
  const sanitize = (s) => (s || "").toString().replace(/\s+/g, " ").trim();
  await EmailSnapshot.updateOne(
    { _id: snapshot._id },
    {
      subject: sanitize(snapshot.subject),
      from: sanitize(snapshot.from),
      snippet: sanitize(snapshot.snippet)
    }
  );

  res.json({
    success: true,
    jobId: job._id
  });
});

module.exports = router;