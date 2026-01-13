/* ---------- OTP / SECURITY TOKENS ---------- */
const OTP_KEYWORDS = [
  "verification code",
  "confirm your identity",
  "verify your account",
  "one-time password",
  "otp",
  "confirm email address",
  "confirm your email",
  "verify email",
  "activation code",
  "security code",
  "temporary password",
  "reset your password",
  "change your password",
  "confirm your login",
  "unusual activity",
  "suspicious login",
  "authorize this login",
  "two-factor",
  "2fa",
  "authenticator"
];

/* ---------- PROMOTIONS / NEWSLETTERS ---------- */
const PROMOTION_KEYWORDS = [
  "promotion",
  "promotional",
  "special offer",
  "discount",
  "deal",
  "limited time",
  "exclusive offer",
  "sale",
  "shop now",
  "buy now",
  "newsletter",
  "unsubscribe",
  "marketing communication"
];

/* ---------- LINKEDIN NEWSLETTERS / NOISE ---------- */
const LINKEDIN_NOISE_KEYWORDS = [
  "linkedin newsletter",
  "linkedin weekly",
  "your top news from linkedin",
  "updates from your network",
  "trending on linkedin",
  "see who viewed your profile",
  "people you may know",
  "job suggestion",
  "someone has viewed your profile",
  "reminder to follow up",
  "linkedin digest"
];

/* ---------- MARKETING / COURSES / TRAINING ---------- */
const MARKETING_KEYWORDS = [
  "certification",
  "course",
  "program",
  "bootcamp",
  "seat",
  "batch",
  "enroll",
  "admission",
  "upskill",
  "training",
  "webinar",
  "workshop",
  "roadmap",
  "prep",
  "preparation",
  "live session",
  "masterclass",
  "join now",
  "register",
  "job alert",
  "jobs you haven't applied",
  "career report",
  "salary",
  "hiring roadmap",
  "learn more",
  "free course",
  "free training"
];

/* ---------- APPLIED ---------- */
const APPLIED_KEYWORDS = [
  "thank you for applying",
  "application received",
  "we received your application",
  "successfully applied",
  "your application was sent"
];

/* ---------- REJECTED ---------- */
const REJECTED_KEYWORDS = [
  "unfortunately",
  "regret to inform",
  "not selected",
  "not moving forward",
  "rejected",
  "position has been filled",
  "has been filled",
  "requisition has been closed",
  "has been closed",
  "we will not be proceeding",
  "application has been closed"
];

/* ---------- INTERVIEW (STRICT) ---------- */
const INTERVIEW_POSITIVE = [
  "interview scheduled",
  "interview invitation",
  "schedule your interview",
  "interview details",
  "technical interview",
  "hr interview",
  "assessment invitation"
];

const INTERVIEW_NEGATIVE = [
  "roadmap",
  "prep",
  "preparation",
  "webinar",
  "workshop",
  "session",
  "guide",
  "plan",
  "masterclass"
];

/* ---------- OFFER ---------- */
const OFFER_KEYWORDS = [
  "offer letter",
  "congratulations",
  "pleased to offer",
  "we are excited to offer"
];

function includesAny(text, keywords) {
  return keywords.some(k => text.includes(k));
}

function classifyEmailByRules({ subject, snippet }) {
  const text = `${subject} ${snippet}`.toLowerCase();

  // 🔒 FILTER OUT: OTP / Security tokens
  if (includesAny(text, OTP_KEYWORDS)) return "IGNORE";

  // 🔒 FILTER OUT: Promotions / Marketing offers
  if (includesAny(text, PROMOTION_KEYWORDS)) return "IGNORE";

  // 🔒 FILTER OUT: LinkedIn newsletters and noise
  if (includesAny(text, LINKEDIN_NOISE_KEYWORDS)) return "IGNORE";

  // 1️⃣ Route obvious noise to MARKETING (not deleted)
  if (includesAny(text, MARKETING_KEYWORDS)) return "MARKETING";

  // 2️⃣ High-signal application events
  if (includesAny(text, OFFER_KEYWORDS)) return "OFFER";

  if (
    includesAny(text, INTERVIEW_POSITIVE) &&
    !includesAny(text, INTERVIEW_NEGATIVE)
  ) {
    return "INTERVIEW";
  }

  if (includesAny(text, REJECTED_KEYWORDS)) return "REJECTED";

  if (includesAny(text, APPLIED_KEYWORDS)) return "APPLIED";

  // 3️⃣ Anything unclear goes to review bucket
  return "UNKNOWN";
}

module.exports = { classifyEmailByRules };
