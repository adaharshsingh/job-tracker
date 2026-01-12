require("dotenv").config(); // MUST be first

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");

const { listJobEmails, getEmailMetadata } = require("./services/gmail");
const { classifyEmailByRules } = require("./services/ruleClassifier");

require("./auth/google");

const app = express();

/* ---------- MongoDB Atlas Connection ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.error("MongoDB connection error:", err));

/* ---------- Middleware ---------- */
// Normalize FRONTEND_URL: remove trailing slash for CORS exact match
const normalizedFrontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

app.use(
  cors({
    origin: normalizedFrontendUrl,
    credentials: true
  })
);

app.use(express.json());

app.use(
  session({
    // 🔑 USE DEFAULT COOKIE NAME
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax", // correct for localhost
      secure: false
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ---------- Protected Routes (AFTER passport) ---------- */
app.use("/sync", require("./routes/sync"));
app.use("/review", require("./routes/review"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/email", require("./routes/email"));

/* ---------- Auth ---------- */
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.readonly"]
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Use normalized URL (no trailing slash)
    const target = normalizedFrontendUrl + "/dashboard";
    console.log("Auth callback: redirecting to:", target);
    console.log("User logged in:", req.user?.email || 'unknown');
    res.redirect(target);
  }
);

app.get("/me", (req, res) => {
  res.json(req.user || null);
});

/* ---------- Gmail Debug ---------- */
app.get("/gmail/test", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });

  try {
    const messages = await listJobEmails(req.user.accessToken);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gmail fetch failed" });
  }
});

/* ---------- Logout (FIXED) ---------- */
app.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid", {
        path: "/",
        sameSite: "lax"
      });
      res.json({ success: true });
    });
  });
});

/* ---------- Health ---------- */
app.get("/", (req, res) => {
  res.send("Job Tracker API running");
});

/* ---------- Start Server ---------- */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});