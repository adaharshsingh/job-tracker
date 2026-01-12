const express = require("express");
const router = express.Router();

const JobApplication = require("../models/JobApplication");
const EmailSnapshot = require("../models/EmailSnapshot");

const {
  extractCompany,
  extractRole
} = require("../utils/emailEntityExtractor");

/* ---------- CREATE JOB ---------- */
router.post("/", async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const body = { ...req.body };

    // normalize company/role into Entity objects when client sends strings
    if (typeof body.company === "string") {
      body.company = { value: body.company, confidence: 1, source: "user" };
    }

    if (typeof body.role === "string") {
      body.role = { value: body.role, confidence: 1, source: "user" };
    }

    const job = await JobApplication.create({
      ...body,
      userId: req.user.id
    });

    res.json(job);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/* ---------- GET JOBS (SESSION USER) ---------- */
router.get("/", async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const jobs = await JobApplication.find({ 
    userId: req.user.id,
    deletedAt: null  // 🗑️ Only show non-deleted jobs
  })
    .sort({ appliedDate: -1 });

  res.json(jobs);
});

/* ---------- UPDATE JOB (INLINE EDIT) ---------- */
router.patch("/:id", async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const allowedFields = [
    "company",
    "role",
    "currentStatus",
    "jobDescription"
  ];

  const update = {};
  let userTouched = false;

  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      update[key] = req.body[key];
      userTouched = true;
    }
  }

  // 🔒 USER_WINS
  if (userTouched) {
    update.statusSource = "user";
  }

  // If client supplied company/role as strings, coerce into Entity objects
  if (typeof update.company === "string") {
    update.company = { value: update.company, confidence: 1, source: "user" };
  }

  if (typeof update.role === "string") {
    update.role = { value: update.role, confidence: 1, source: "user" };
  }

  const job = await JobApplication.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    update,
    { new: true }
  );

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json(job);
});



/* ---------- DELETE JOB ---------- */
router.delete("/:id", async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Not logged in" });
  }

  // 🗑️ Soft delete: mark as deleted instead of removing
  await JobApplication.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id
    },
    {
      deletedAt: new Date()
    }
  );

  res.json({ success: true });
});

module.exports = router;