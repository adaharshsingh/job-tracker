require("dotenv").config(); // MUST be first

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const mongoose = require("mongoose");

const { listJobEmails, getEmailMetadata } = require("./services/gmail");
const { classifyEmailByRules } = require("./services/ruleClassifier");

require("./auth/google");

const app = express();

// 🔥 CRITICAL: Trust proxy for Render (or any reverse proxy)
app.set("trust proxy", 1);

/* ---------- MongoDB Atlas Connection ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.error("MongoDB connection error:", err));

/* ---------- Middleware ---------- */
app.use(
  cors({
    origin: "https://applyd.online",
    credentials: true
  })
);

app.use(express.json());

app.use(
  session({
    name: "jobtracker.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions"
    }),
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: ".applyd.online",
      maxAge: 7 * 24 * 60 * 60 * 1000
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
    console.log("User logged in:", req.user?.email);

    req.session.save(() => {
      res.setHeader("Cache-Control", "no-store");
      // CRITICAL: respond once to same origin to commit cookie before cross-site
      res.redirect(303, "https://applyd.online/auth-complete");
    });
  }
);

app.get("/me", (req, res) => {
  console.log("=== GET /me ===");
  console.log("Session ID:", req.sessionID);
  console.log("Session user:", req.user?.email || "null");
  console.log("Full session data keys:", Object.keys(req.session || {}));
  
  if (req.user) {
    console.log("✅ User authenticated:", req.user.email);
  } else {
    console.log("❌ User is null - session not found in MongoDB or passport deserialize failed");
  }
  
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
      res.clearCookie("jobtracker.sid", {
        path: "/",
        domain: isProd ? ".applyd.online" : undefined,
        secure: isProd,
        sameSite: isProd ? "none" : "lax"
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