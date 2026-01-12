const GENERIC_SENDERS = [
  "linkedin",
  "gmail",
  "google",
  "internshala",
  "naukri",
  "foundit",
  "monster",
  "indeed",
  "glassdoor",
  "jobs"
];

const STOP_WORDS = [
  "hiring",
  "interview",
  "application",
  "applied",
  "update",
  "confirm",
  "role",
  "position",
  "job",
  "re",
  "fw"
];

/* ---------- helpers ---------- */

function safeText(value) {
  if (!value || typeof value !== "string") return "";
  return value.toLowerCase();
}

function capitalize(word = "") {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/* ---------- sender extraction ---------- */

function extractFromSender(from = "") {
  const text = safeText(from);
  const match = text.match(/@([a-z0-9-]+)\./);
  if (!match) return null;

  const domain = match[1];
  if (GENERIC_SENDERS.includes(domain)) return null;

  return capitalize(domain);
}

/* ---------- subject extraction ---------- */

function extractFromSubject(subject = "") {
  let text = safeText(subject);
  if (!text) return null;

  text = text.replace(/^(re:|fw:)\s*/g, "");

  const chunk = text.split(/[-|:–]/)[0];
  let words = chunk.split(/\s+/).slice(0, 3);

  words = words.filter(w => w && !STOP_WORDS.includes(w));

  if (words.length === 0) return null;

  return words.map(capitalize).join(" ");
}

/* ---------- main API ---------- */

export function extractCompany(email = {}) {
  if (!email) return "Unknown";

  const subject = email.subject || "";
  const from = email.from || "";

  return (
    extractFromSender(from) ||
    extractFromSubject(subject) ||
    "Unknown"
  );
}