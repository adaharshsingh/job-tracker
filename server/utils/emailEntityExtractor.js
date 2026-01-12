function normalize(t = "") {
  return typeof t === "string" ? t.toLowerCase() : "";
}

function titleCase(str = "") {
  return str
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ---------- COMPANY ---------- */
function extractCompany(email = {}) {
  const subject = normalize(email.subject);
  const snippet = normalize(email.snippet);
  const from = normalize(email.from);

  let m =
    subject.match(/sent to ([a-z0-9 &.-]+)/) ||
    subject.match(/at ([a-z0-9 &.-]+)/);

  if (m) {
    return {
      value: titleCase(m[1]),
      confidence: 0.75,
      source: "email"
    };
  }

  m = snippet.match(/^([a-z0-9 &.-]+)\s·/);
  if (m) {
    return {
      value: titleCase(m[1]),
      confidence: 0.7,
      source: "email"
    };
  }

  m = from.match(/@([a-z0-9-]+)\./);
  if (
    m &&
    ![
      "linkedin",
      "gmail",
      "google",
      "internshala",
      "naukri",
      "foundit",
      "monster"
    ].includes(m[1])
  ) {
    return {
      value: titleCase(m[1]),
      confidence: 0.6,
      source: "email"
    };
  }

  return {
    value: "Unknown",
    confidence: 0,
    source: "email"
  };
}

/* ---------- ROLE ---------- */
function extractRole(email = {}) {
  const text = normalize(`${email.subject || ""} ${email.snippet || ""}`);

  const patterns = [
    /(full stack engineer|backend engineer|frontend engineer)/,
    /(software engineer|sde[- ]?[1-3])/,
    /(data analyst|business analyst)/,
    /(machine learning engineer|ml engineer)/,
    /(intern|trainee)/,
    /(developer|engineer|analyst|manager|consultant)/
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      return {
        value: titleCase(m[0]),
        confidence: 0.65,
        source: "email"
      };
    }
  }

  return {
    value: "Unknown",
    confidence: 0,
    source: "email"
  };
}

module.exports = { extractCompany, extractRole };