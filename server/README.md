# 🚀 Job Tracker - Server

Express.js backend for the Job Tracker application. Handles authentication, job management, Gmail integration, and email classification.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)
- Google Cloud project with Gmail API enabled
- Google OAuth 2.0 credentials

### Installation

```bash
cd server
npm install
```

### Environment Setup

Create `.env` file in the server directory:

```env
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jobs-db

# Session & Security
SESSION_SECRET=your_super_secret_key_here_change_in_production
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5174

# Server Port
PORT=8000
```

### Start Server

```bash
npm start
# Server runs on http://localhost:8000
```

---

## 📦 Tech Stack

- **Node.js & Express.js** - Server framework
- **MongoDB & Mongoose** - Database & ODM
- **Passport.js** - Google OAuth authentication
- **googleapis** - Gmail API client
- **dotenv** - Environment configuration
- **CORS** - Cross-origin request handling
- **express-session** - Session management

---

## 📁 Project Structure

```
server/
├── routes/
│   ├── auth.js          # Google OAuth endpoints
│   ├── jobs.js          # CRUD operations for jobs
│   ├── sync.js          # Gmail sync logic
│   ├── review.js        # Soft-deleted jobs
│   └── email.js         # Email metadata endpoints
│
├── models/
│   ├── JobApplication.js    # Job schema
│   ├── EmailSnapshot.js     # Email metadata schema
│   ├── SyncLog.js          # Sync history tracking
│   └── User.js (implicit)  # Via Passport
│
├── services/
│   ├── gmail.js            # Gmail API wrapper
│   └── ruleClassifier.js   # Email classification engine
│
├── auth/
│   └── google.js           # Passport Google strategy
│
├── utils/
│   └── emailEntityExtractor.js  # Extract company/role from emails
│
├── index.js            # Main server entry
└── package.json
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Initiate Google OAuth login |
| GET | `/auth/google/callback` | OAuth callback (auto-handled) |
| GET | `/logout` | Logout & clear session |
| GET | `/me` | Get current user info |

### Jobs

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/jobs` | Get all user jobs (non-deleted) | - |
| POST | `/api/jobs` | Create new job | `{ company, role, currentStatus, jobDescription?, appliedDate? }` |
| PATCH | `/api/jobs/:id` | Update job fields | `{ company?, role?, currentStatus?, jobDescription?, statusSource? }` |
| DELETE | `/api/jobs/:id` | Soft-delete job | - |

**Response Format:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  company: { value: string, confidence: number, source: string },
  role: { value: string, confidence: number, source: string },
  currentStatus: "offer" | "interview" | "applied" | "rejected",
  statusSource: "gmail" | "user",
  jobDescription: string,
  appliedDate: Date,
  emailSnapshots: [ObjectId],
  deletedAt: null | Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Sync (Gmail Integration)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| POST | `/sync/gmail-unknown` | Sync unknown emails from Gmail | `{ summary: { created, updated, processed } }` |

**Error Response:**
```javascript
{ error: "Detailed error message" }
```

### Review (Soft Deleted)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/review/deleted` | Get soft-deleted jobs |

### Email

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/email/:emailId` | Get full email content |

---

## 🔐 Authentication Flow

1. **Login**: User clicks "Login with Google" → redirected to `/auth/google`
2. **OAuth Consent**: User grants permissions for Gmail access
3. **Callback**: Google redirects to `/auth/google/callback`
4. **Session**: Express-session creates HTTP-only cookie
5. **Protected Routes**: All `/api/*` routes check `req.user`
6. **Logout**: `/logout` clears session cookie

### Protected Routes Middleware

All routes check:
```javascript
if (!req.user || !req.user.id) {
  return res.status(401).json({ error: "Not logged in" });
}
```

---

## 📊 Data Models

### JobApplication

```javascript
{
  userId: ObjectId,          // Link to user (from Passport)
  company: {
    value: String,           // Company name
    confidence: Number,      // 0-1 confidence score
    source: "gmail" | "user" // Where it came from
  },
  role: {
    value: String,           // Job title
    confidence: Number,
    source: "gmail" | "user"
  },
  currentStatus: "offer" | "interview" | "applied" | "rejected",
  statusSource: "gmail" | "user",  // Who determined the status
  jobDescription: String,    // Full job description
  appliedDate: Date,         // When applied
  emailSnapshots: [ObjectId],// Links to EmailSnapshot docs
  deletedAt: Date | null,    // Soft delete timestamp
  createdAt: Date,
  updatedAt: Date
}
```

### EmailSnapshot

```javascript
{
  userId: ObjectId,
  jobId: ObjectId,           // Link to job
  messageId: String,         // Gmail message ID
  from: String,              // Sender email
  subject: String,
  date: Date,
  snippet: String,           // Preview text
  fullContent: String,       // Complete email body
  createdAt: Date
}
```

### SyncLog (Optional, for tracking)

```javascript
{
  userId: ObjectId,
  startTime: Date,
  endTime: Date,
  summary: {
    created: Number,
    updated: Number,
    processed: Number
  },
  errors: [String],
  createdAt: Date
}
```

---

## 🤖 Gmail Sync Logic

### Flow
1. Fetch all unread emails from Gmail
2. For each email:
   - Extract company name and role
   - Classify email type (offer, interview, applied, rejected)
   - Check if job already exists
   - Create or update job + email snapshot
3. Return summary of changes

### Email Classification Rules

**Offer Emails**: Keywords like "offer", "congratulations", "we're excited"

**Interview Emails**: Keywords like "interview", "schedule", "next round"

**Rejection Emails**: Keywords like "unfortunately", "not selected", "moving forward"

**Application Confirmation**: Keywords like "applied", "submitted", "confirms"

### Company & Role Extraction

Uses regex patterns to extract:
- Company names from sender domain
- Job titles from email subject or body
- Confidence scores based on keyword matches

---

## 🔧 Key Endpoints in Detail

### POST `/api/jobs` - Create Job

```bash
curl -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Acme Corp",
    "role": "Senior Developer",
    "currentStatus": "interview",
    "appliedDate": "2026-01-10"
  }'
```

### PATCH `/api/jobs/:id` - Update Job

```bash
curl -X PATCH http://localhost:8000/api/jobs/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "currentStatus": "offer",
    "statusSource": "user"
  }'
```

### POST `/sync/gmail-unknown` - Sync Gmail

```bash
curl -X POST http://localhost:8000/sync/gmail-unknown \
  -H "Content-Type: application/json"
```

Returns:
```json
{
  "summary": {
    "created": 3,
    "updated": 2,
    "processed": 15
  }
}
```

---

## 🐛 Error Handling

### Common Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| 401 | "Not logged in" | User not authenticated |
| 400 | "Validation error" | Invalid request data |
| 404 | "Job not found" | ID doesn't exist or deleted |
| 500 | "Sync failed" | Gmail API error |

### Server Logging

Errors are logged with context:
```javascript
console.error("Sync error:", err.response?.data || err.message);
```

Check server console for detailed error messages during development.

---

## 🔗 CORS Configuration

```javascript
cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true  // Allow cookies
})
```

For production, update `FRONTEND_URL` env variable.

---

## 📝 Session Configuration

```javascript
session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,      // Prevent XSS
    sameSite: "lax",     // CSRF protection
    secure: false        // Set to true in production (HTTPS)
  }
})
```

---

## 🚀 Production Deployment

### Environment Variables (Update for Production)

```env
MONGO_URI=mongodb+srv://prod-user:prod-pass@prod-cluster.mongodb.net/jobs-db
SESSION_SECRET=long_random_secret_key_minimum_32_characters
NODE_ENV=production
GOOGLE_CLIENT_ID=prod-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=prod-client-secret
GOOGLE_CALLBACK_URL=https://yourapp.com/auth/google/callback
FRONTEND_URL=https://yourapp.com
PORT=3000
```

### Deploy to Heroku

```bash
heroku create your-app-name
heroku config:set MONGO_URI=...
heroku config:set SESSION_SECRET=...
# (set all env vars)
git push heroku main
```

### Deploy to Railway / Render

1. Connect GitHub repository
2. Add environment variables in dashboard
3. Deploy automatically on push

---

## 🧪 Testing Endpoints

### Test Authentication
```bash
curl -b cookies.txt http://localhost:8000/me
# Should return 401 if not logged in
```

### Test Job Creation
```bash
curl -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"company":"Test Corp","role":"Developer"}'
# Should return 401 if not authenticated
```

---

## 📚 Dependencies Overview

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | 4.x | Web framework |
| `mongoose` | 7.x | MongoDB ODM |
| `passport` | 0.6.x | Authentication |
| `passport-google-oauth20` | 2.x | Google OAuth |
| `googleapis` | 118.x | Gmail API |
| `cors` | 2.8.x | Cross-origin requests |
| `express-session` | 1.x | Session management |
| `dotenv` | 16.x | Environment config |

---

## 🔗 Related Documentation

- [Client README](../client/README.md)
- [Main Project README](../README.md)
- [Express Docs](https://expressjs.com)
- [Mongoose Docs](https://mongoosejs.com)
- [Passport.js Docs](http://www.passportjs.org)
- [Gmail API Docs](https://developers.google.com/gmail/api)

---

## 💡 Tips & Best Practices

- **Never commit `.env`**: Use `.env.example` template instead
- **Validate input**: Use Mongoose schema validation
- **Log errors**: Always log API errors for debugging
- **Test CORS**: Ensure frontend URL matches `FRONTEND_URL` env var
- **Secure cookies**: Use `secure: true` in production (requires HTTPS)
- **Rate limiting**: Add express-rate-limit for production
- **Monitoring**: Set up error tracking (Sentry, DataDog, etc.)

---

## 🎯 Next Steps

1. Set up `.env` with your credentials
2. Start MongoDB
3. Run `npm start`
4. Open http://localhost:8000 in browser
5. Test Google OAuth login
6. Create/sync jobs via frontend

Happy coding! 🚀
