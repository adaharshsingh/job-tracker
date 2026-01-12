const express = require("express");
const router = express.Router();

const JobApplication = require("../models/JobApplication");
const EmailSnapshot = require("../models/EmailSnapshot");
const SyncLog = require("../models/SyncLog");

const { listJobEmails, getEmailMetadata, getEmailFull } = require("../services/gmail");
const { classifyEmailByRules } = require("../services/ruleClassifier");
const {
  extractCompany,
  extractRole
} = require("../utils/emailEntityExtractor");

/* ---------------- STATUS ORDER ---------------- */
const STATUS_RANK = {
  applied: 1,
  interview: 2,
  offer: 3,
  rejected: 99
};

const INTENT_TO_STATUS = {
  APPLIED: "applied",
  INTERVIEW: "interview",
  OFFER: "offer",
  REJECTED: "rejected"
};

/* -------- HELPERS FOR LINKEDIN DEEP FETCH -------- */

/**
 * Check if email is from LinkedIn
 */
function isLinkedInEmail(email) {
  const from = (email.from || "").toLowerCase();
  const subject = (email.subject || "").toLowerCase();
  return from.includes("linkedin") || subject.includes("linkedin");
}

/**
 * Extract text from email payload (handles text/plain and text/html)
 */
function extractTextFromPayload(payload) {
  let text = "";

  function walk(part) {
    if (!part) return;

    if (part.mimeType === "text/plain" && part.body?.data) {
      text += Buffer.from(part.body.data, "base64").toString("utf-8");
    }

    if (part.mimeType === "text/html" && part.body?.data) {
      const html = Buffer.from(part.body.data, "base64").toString("utf-8");
      text += html.replace(/<[^>]+>/g, " ");
    }

    if (part.parts) part.parts.forEach(walk);
  }

  walk(payload);
  return text;
}

/* ---------------- SYNC ROUTE ---------------- */

router.post("/gmail-unknown", async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Not logged in" });
  }

  if (!req.user.accessToken) {
    return res.status(401).json({
      error: "No Gmail access token — re-login"
    });
  }

  try {
    const userId = req.user.id;
    
    // 📅 Get last sync date to avoid re-syncing same emails
    const syncLog = await SyncLog.findOne({ userId });
    const sinceDate = syncLog?.lastSyncDate || new Date(0);
    
    console.log(`[SYNC] Starting sync for user ${userId}, since ${sinceDate}`);
    
    const messages = await listJobEmails(req.user.accessToken, 50, sinceDate);
    console.log(`[SYNC] Found ${messages?.length || 0} messages`);

    if (!messages.length) {
      console.log(`[SYNC] No messages found, returning empty summary`);
      return res.json({
        syncedAt: new Date(),
        summary: {
          applied: 0,
          interview: 0,
          offer: 0,
          rejected: 0,
          unknown: 0
        }
      });
    }

    const emails = await Promise.all(
      messages.map(m => getEmailMetadata(req.user.accessToken, m.id))
    );

    const summary = {
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      unknown: 0
    };

    for (const email of emails) {
      const intent = classifyEmailByRules(email);

      /* ---------- JOB EMAIL ---------- */
      if (INTENT_TO_STATUS[intent]) {
        const status = INTENT_TO_STATUS[intent];
        summary[status]++;

        const existing = await JobApplication.findOne({
          userId,
          emailThreadId: email.threadId
        });

        // 🗑️ Check if job was previously deleted
        const wasDeleted = await JobApplication.findOne({
          userId,
          emailThreadId: email.threadId,
          deletedAt: { $ne: null }
        });

        const companyEntity = extractCompany(email);
        let roleEntity = extractRole(email);

        // 🔍 AUTO-LINKEDIN DEEP FETCH: If role is Unknown and it's from LinkedIn, fetch full email
        if (roleEntity.value === "Unknown" && isLinkedInEmail(email)) {
          try {
            const fullEmail = await getEmailFull(req.user.accessToken, email.id);
            const bodyText = extractTextFromPayload(fullEmail.payload);

            // Re-extract role with full email body
            roleEntity = extractRole({
              subject: email.subject,
              snippet: bodyText
            });
          } catch (err) {
            console.warn(`Failed to fetch full email ${email.id}:`, err.message);
            // Fall back to original roleEntity
          }
        }

        // 🆕 CREATE JOB (only if not previously deleted)
        if (!existing && !wasDeleted) {
          const jobSource = isLinkedInEmail(email) ? "linkedin" : "other";
          
          await JobApplication.create({
            userId,
            company: companyEntity,
            role: roleEntity,
            appliedDate: email.date ? new Date(email.date) : new Date(),
            currentStatus: status,
            statusSource: "auto",
            source: jobSource,
            emailThreadId: email.threadId
          });

          // 🗑️ DELETE snapshot (email is now a recognized job, not for review)
          await EmailSnapshot.deleteOne({ userId, messageId: email.id });
        }
        // 🗑️ If job was deleted, only save as snapshot for review
        else if (wasDeleted && !existing) {
          // Save as snapshot so user can review without auto-creating job
          await EmailSnapshot.updateOne(
            { userId, messageId: email.id },
            {
              userId,
              threadId: email.threadId,
              messageId: email.id,
              subject: (email.subject || "").toString().replace(/\s+/g, " ").trim(),
              from: (email.from || "").toString().replace(/\s+/g, " ").trim(),
              snippet: (email.snippet || "").toString().replace(/\s+/g, " ").trim(),
              emailDate: email.date ? new Date(email.date) : new Date(),
              intent: "UNKNOWN"
            },
            { upsert: true }
          );
        }

        // 🔁 UPDATE JOB (PROGRESSIVE + USER_WINS)
        else {
          if (existing.statusSource === "user") continue;

          let changed = false;

          // 🏢 MARK SOURCE (once per job, from first sync)
          if (!existing.source && isLinkedInEmail(email)) {
            existing.source = "linkedin";
            changed = true;
          }

          // ⬆️ STATUS UPGRADE
          if (
            STATUS_RANK[status] >
            STATUS_RANK[existing.currentStatus]
          ) {
            existing.currentStatus = status;
            changed = true;
          }

          // 🧠 COMPANY UPGRADE (ONLY IF UNKNOWN)
          if (
            existing.company?.value === "Unknown" &&
            companyEntity.value !== "Unknown"
          ) {
            existing.company = companyEntity;
            changed = true;
          }

          // 🧠 ROLE UPGRADE (ONLY IF UNKNOWN)
          if (
            existing.role?.value === "Unknown" &&
            roleEntity.value !== "Unknown"
          ) {
            existing.role = roleEntity;
            changed = true;
          }

          if (changed) {
            existing.statusSource = "auto";
            await existing.save();

            // 🗑️ DELETE snapshot (email is a recognized job, not for review)
            await EmailSnapshot.deleteOne({ userId, messageId: email.id });
          }
        }
      }

      /* ---------- UNKNOWN EMAIL ---------- */
      else {
        summary.unknown++;

        // ✅ ONLY save unknown emails for review
        await EmailSnapshot.updateOne(
          { userId, messageId: email.id },
          {
            userId,
            threadId: email.threadId,
            messageId: email.id,
            subject: (email.subject || "").toString().replace(/\s+/g, " ").trim(),
            from: (email.from || "").toString().replace(/\s+/g, " ").trim(),
            snippet: (email.snippet || "").toString().replace(/\s+/g, " ").trim(),
            emailDate: email.date ? new Date(email.date) : new Date(),
            intent: "UNKNOWN"
          },
          { upsert: true }
        );
      }
    }

    // 📝 Track sync date
    await SyncLog.findOneAndUpdate(
      { userId },
      {
        userId,
        lastSyncDate: new Date(),
        lastSyncSummary: summary,
        updatedAt: new Date()
      },
      { upsert: true }
    );

    res.json({
      syncedAt: new Date(),
      summary
    });
  } catch (err) {
    console.error("[SYNC] Error:", err.message, err.stack);
    res.status(400).json({ error: err.message || "Sync failed" });
  }
});

/* ---------- CREATE JOB LOGIC (SHARED BETWEEN BOTH ENDPOINTS) ---------- */
async function processJobEmail(email, userId, intent, companyEntity, roleEntity, req) {
  const status = INTENT_TO_STATUS[intent];

  const existing = await JobApplication.findOne({
    userId,
    emailThreadId: email.threadId,
    deletedAt: null
  });

  // 🗑️ Check if job was previously deleted
  const wasDeleted = await JobApplication.findOne({
    userId,
    emailThreadId: email.threadId,
    deletedAt: { $ne: null }
  });

  // 🆕 CREATE JOB (only if not previously deleted)
  if (!existing && !wasDeleted) {
    const jobSource = isLinkedInEmail(email) ? "linkedin" : "other";
    
    await JobApplication.create({
      userId,
      company: companyEntity,
      role: roleEntity,
      appliedDate: email.date ? new Date(email.date) : new Date(),
      currentStatus: status,
      statusSource: "auto",
      source: jobSource,
      emailThreadId: email.threadId
    });

    // 🗑️ DELETE snapshot (email is now a recognized job, not for review)
    await EmailSnapshot.deleteOne({ userId, messageId: email.id });
  }
  // 🗑️ If job was deleted, only save as snapshot for review
  else if (wasDeleted) {
    // Save as snapshot so user can review without auto-creating job
    const snapshot = await EmailSnapshot.findOne({
      userId,
      messageId: email.id
    });

    if (!snapshot) {
      await EmailSnapshot.create({
        userId,
        threadId: email.threadId,
        messageId: email.id,
        subject: (email.subject || "").toString().replace(/\s+/g, " ").trim(),
        from: (email.from || "").toString().replace(/\s+/g, " ").trim(),
        snippet: (email.snippet || "").toString().replace(/\s+/g, " ").trim(),
        emailDate: email.date ? new Date(email.date) : new Date(),
        intent: "UNKNOWN"
      });
    }
  }
  // 🔁 UPDATE JOB (PROGRESSIVE + USER_WINS) - only if existing and not deleted
  else if (existing) {
    if (existing.statusSource === "user") return;

    let changed = false;

    // 🏢 MARK SOURCE (once per job, from first sync)
    if (!existing.source && isLinkedInEmail(email)) {
      existing.source = "linkedin";
      changed = true;
    }

    // ⬆️ STATUS UPGRADE
    if (
      STATUS_RANK[status] >
      STATUS_RANK[existing.currentStatus]
    ) {
      existing.currentStatus = status;
      changed = true;
    }

    // 🧠 COMPANY UPGRADE (ONLY IF UNKNOWN)
    if (
      existing.company?.value === "Unknown" &&
      companyEntity.value !== "Unknown"
    ) {
      existing.company = companyEntity;
      changed = true;
    }

    // 🧠 ROLE UPGRADE (ONLY IF UNKNOWN)
    if (
      existing.role?.value === "Unknown" &&
      roleEntity.value !== "Unknown"
    ) {
      existing.role = roleEntity;
      changed = true;
    }

    if (changed) {
      existing.statusSource = "auto";
      await existing.save();

      // 🗑️ DELETE snapshot (email is a recognized job, not for review)
      await EmailSnapshot.deleteOne({ userId, messageId: email.id });
    }
  }
}

/* ---------- SYNC WITH CUSTOM MAX RESULTS ---------- */
router.post("/gmail-unknown/fetch", async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Not logged in" });
  }

  if (!req.user.accessToken) {
    return res.status(401).json({
      error: "No Gmail access token — re-login"
    });
  }

  try {
    const userId = req.user.id;
    // Get maxResults from query parameter or body, default to 30
    const maxResults = parseInt(req.query.maxResults || req.body.maxResults || "30", 10);
    
    if (maxResults < 1 || maxResults > 100) {
      return res.status(400).json({ error: "maxResults must be between 1 and 100" });
    }

    const messages = await listJobEmails(req.user.accessToken, maxResults);

    if (!messages.length) {
      return res.json({
        syncedAt: new Date(),
        summary: {
          applied: 0,
          interview: 0,
          offer: 0,
          rejected: 0,
          unknown: 0
        }
      });
    }

    const emails = await Promise.all(
      messages.map(m => getEmailMetadata(req.user.accessToken, m.id))
    );

    const summary = {
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      unknown: 0
    };

    for (const email of emails) {
      const intent = classifyEmailByRules(email);

      /* ---------- JOB EMAIL ---------- */
      if (INTENT_TO_STATUS[intent]) {
        const status = INTENT_TO_STATUS[intent];
        summary[status]++;

        const existing = await JobApplication.findOne({
          userId,
          emailThreadId: email.threadId,
          deletedAt: null
        });

        // 🗑️ Check if job was previously deleted
        const wasDeleted = await JobApplication.findOne({
          userId,
          emailThreadId: email.threadId,
          deletedAt: { $ne: null }
        });

        const companyEntity = extractCompany(email);
        let roleEntity = extractRole(email);

        // 🔍 AUTO-LINKEDIN DEEP FETCH: If role is Unknown and it's from LinkedIn, fetch full email
        if (roleEntity.value === "Unknown" && isLinkedInEmail(email)) {
          try {
            const fullEmail = await getEmailFull(req.user.accessToken, email.id);
            const bodyText = extractTextFromPayload(fullEmail.payload);

            // Re-extract role with full email body
            roleEntity = extractRole({
              subject: email.subject,
              snippet: bodyText
            });
          } catch (err) {
            console.warn(`Failed to fetch full email ${email.id}:`, err.message);
            // Fall back to original roleEntity
          }
        }

        // 🆕 CREATE JOB (only if not previously deleted)
        if (!existing && !wasDeleted) {
          const jobSource = isLinkedInEmail(email) ? "linkedin" : "other";
          
          await JobApplication.create({
            userId,
            company: companyEntity,
            role: roleEntity,
            appliedDate: email.date ? new Date(email.date) : new Date(),
            currentStatus: status,
            statusSource: "auto",
            source: jobSource,
            emailThreadId: email.threadId
          });

          // 🗑️ DELETE snapshot (email is now a recognized job, not for review)
          await EmailSnapshot.deleteOne({ userId, messageId: email.id });
        }
        // 🗑️ If job was deleted, only save as snapshot for review
        else if (wasDeleted && !existing) {
          // Save as snapshot so user can review without auto-creating job
          await EmailSnapshot.updateOne(
            { userId, messageId: email.id },
            {
              userId,
              threadId: email.threadId,
              messageId: email.id,
              subject: (email.subject || "").toString().replace(/\s+/g, " ").trim(),
              from: (email.from || "").toString().replace(/\s+/g, " ").trim(),
              snippet: (email.snippet || "").toString().replace(/\s+/g, " ").trim(),
              emailDate: email.date ? new Date(email.date) : new Date(),
              intent: "UNKNOWN"
            },
            { upsert: true }
          );
        }

        // 🔁 UPDATE JOB (PROGRESSIVE + USER_WINS)
        else {
          if (existing.statusSource === "user") continue;

          let changed = false;

          // 🏢 MARK SOURCE (once per job, from first sync)
          if (!existing.source && isLinkedInEmail(email)) {
            existing.source = "linkedin";
            changed = true;
          }

          // ⬆️ STATUS UPGRADE
          if (
            STATUS_RANK[status] >
            STATUS_RANK[existing.currentStatus]
          ) {
            existing.currentStatus = status;
            changed = true;
          }

          // 🧠 COMPANY UPGRADE (ONLY IF UNKNOWN)
          if (
            existing.company?.value === "Unknown" &&
            companyEntity.value !== "Unknown"
          ) {
            existing.company = companyEntity;
            changed = true;
          }

          // 🧠 ROLE UPGRADE (ONLY IF UNKNOWN)
          if (
            existing.role?.value === "Unknown" &&
            roleEntity.value !== "Unknown"
          ) {
            existing.role = roleEntity;
            changed = true;
          }

          if (changed) {
            await existing.save();

            // 🗑️ DELETE snapshot (email is a recognized job, not for review)
            await EmailSnapshot.deleteOne({ userId, messageId: email.id });
          }
        }
      }

      // ---------- UNKNOWN EMAIL ----------
      else {
        summary.unknown++;

        // Save as snapshot so user can review
        const existing = await EmailSnapshot.findOne({
          userId,
          messageId: email.id
        });

        if (!existing) {
          await EmailSnapshot.create({
            userId,
            threadId: email.threadId,
            messageId: email.id,
            subject: (email.subject || "").toString().replace(/\s+/g, " ").trim(),
            from: (email.from || "").toString().replace(/\s+/g, " ").trim(),
            snippet: (email.snippet || "").toString().replace(/\s+/g, " ").trim(),
            emailDate: email.date ? new Date(email.date) : new Date(),
            intent: "UNKNOWN"
          });
        }
      }
    }

    // 📝 Track sync date
    await SyncLog.findOneAndUpdate(
      { userId },
      {
        userId,
        lastSyncDate: new Date(),
        lastSyncSummary: summary,
        updatedAt: new Date()
      },
      { upsert: true }
    );

    res.json({
      syncedAt: new Date(),
      summary
    });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;