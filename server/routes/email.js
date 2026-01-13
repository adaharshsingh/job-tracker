const express = require("express");
const router = express.Router();

const EmailSnapshot = require("../models/EmailSnapshot");

// GET email preview by threadId
router.get("/by-thread/:threadId", async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Not logged in" });
  }
  console.log("GET /email/by-thread", { userId: req.user?.id, threadId: req.params.threadId });

  const email = await EmailSnapshot.findOne({
    userId: req.user.id,
    threadId: req.params.threadId
  }).sort({ createdAt: -1 });

  console.log("email found:", !!email);

  if (!email) return res.json(null);

  // sanitize before returning
  const sanitize = (s) => (s || "").toString().replace(/\s+/g, " ").trim();

  // Truncate snippet to 400 chars to prevent layout lag
  const snippet = sanitize(email.snippet);
  const truncatedSnippet = snippet.length > 400 ? snippet.substring(0, 400) + "..." : snippet;

  res.json({
    subject: sanitize(email.subject),
    snippet: truncatedSnippet,
    from: sanitize(email.from)
  });
});

module.exports = router;
