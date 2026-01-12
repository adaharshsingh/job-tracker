const { google } = require("googleapis");

/**
 * Create Gmail client using OAuth access token
 */
function getGmailClient(accessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  return google.gmail({ version: "v1", auth });
}

/**
 * Fetch recent emails relevant for job tracking
 * Searches INBOX for job-related keywords
 * Can optionally filter by since date
 */
async function listJobEmails(accessToken, maxResults = 50, sinceDate = null) {
  const gmail = getGmailClient(accessToken);

  let query = "in:inbox (application OR applied OR interview OR offer OR rejected OR hiring OR recruiter OR job OR role OR position OR linkedin OR indeed OR glassdoor)";
  
  // If sinceDate is provided, filter for emails after that date
  if (sinceDate) {
    const dateStr = sinceDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    query += ` after:${dateStr}`;
  }

  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: maxResults,
    q: query,
  });

  return res.data.messages || [];
}

/**
 * Fetch minimal email metadata
 * (cheap, fast, safe)
 */
async function getEmailMetadata(accessToken, messageId) {
  const gmail = getGmailClient(accessToken);

  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "metadata",
    metadataHeaders: ["Subject", "From", "Date"]
  });

  const headers = res.data.payload?.headers || [];

  const getHeader = (name) =>
    headers.find(h => h.name === name)?.value || "";

  return {
    id: res.data.id,
    threadId: res.data.threadId,
    subject: getHeader("Subject"),
    from: getHeader("From"),
    date: getHeader("Date"),
    snippet: res.data.snippet
  };
}

/**
 * Fetch full email message (including body)
 * Used for deep LinkedIn analysis
 */
async function getEmailFull(accessToken, messageId) {
  const gmail = getGmailClient(accessToken);

  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full"
  });

  return res.data;
}

module.exports = {
  listJobEmails,
  getEmailMetadata,
  getEmailFull
};