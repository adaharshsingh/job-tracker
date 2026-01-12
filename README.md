# 📊 Job Tracker Application

A full-stack job application management and tracking system with Gmail integration, real-time sync, and an intuitive dashboard for monitoring your job search progress.

---

## 🎯 Project Overview

**Job Tracker** helps job seekers organize, track, and manage their job applications from a centralized dashboard. It automatically syncs with your Gmail inbox to extract job-related emails, classifies them using intelligent rules, and presents a comprehensive view of your job search progress.

### Key Features

- **Gmail Integration**: Automatically sync job-related emails from Gmail
- **Smart Classification**: AI-powered rule classifier to categorize job statuses (offer, interview, applied, rejected)
- **Dashboard Analytics**: Real-time charts showing application trends (weekly/monthly views)
- **Job Management**: Create, edit, delete, and filter jobs with soft-delete support
- **Calendar Search**: Date-based filtering with an interactive calendar widget
- **Responsive Design**: Fully responsive UI optimized for mobile, tablet, and desktop
- **Dark Mode Support**: Complete dark/light theme toggle with persistent preference
- **Search & Filter**: Full-text search by company name or job title
- **Bulk Operations**: Select multiple jobs for batch deletion

---

## 🏗️ Architecture

```
jobs/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/         # Dashboard, Login, Review pages
│   │   ├── Components/    # Reusable UI components
│   │   ├── api/           # API client (axios)
│   │   ├── context/       # ThemeContext for dark mode
│   │   ├── utils/         # Helper functions
│   │   └── styles/        # Global CSS
│   └── package.json
│
├── server/                 # Express.js backend
│   ├── routes/            # API endpoints
│   ├── models/            # MongoDB schemas
│   ├── services/          # Gmail, Classification logic
│   ├── auth/              # Google OAuth strategy
│   ├── utils/             # Email extraction utilities
│   └── package.json
│
└── README.md
```

---

## 🚀 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Fast build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **Material-UI DateCalendar** - Calendar widget
- **dayjs** - Date manipulation
- **axios** - HTTP client

### Backend
- **Node.js & Express.js** - Server framework
- **MongoDB & Mongoose** - Database
- **Passport.js** - Google OAuth authentication
- **googleapis** - Gmail API integration
- **dotenv** - Environment configuration

---

## 📋 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Initiate Google OAuth login |
| GET | `/auth/google/callback` | OAuth callback handler |
| GET | `/logout` | Logout user and clear session |
| GET | `/me` | Get current user info |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all user's jobs (non-deleted) |
| POST | `/api/jobs` | Create a new job |
| PATCH | `/api/jobs/:id` | Update job details (inline edit) |
| DELETE | `/api/jobs/:id` | Soft-delete a job |

### Sync
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sync/gmail-unknown` | Sync unknown emails from Gmail |

### Review
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/review/deleted` | Get soft-deleted jobs |

### Email
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/email/:emailId` | Get full email content |

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)
- Google Cloud project with Gmail API enabled
- Google OAuth 2.0 credentials (Client ID & Secret)

### Environment Setup

#### Server (.env)
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/jobs-db
SESSION_SECRET=your_session_secret_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback
FRONTEND_URL=http://localhost:5174
PORT=8000
```

#### Client (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Installation

**Clone & Install Dependencies:**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

**Start MongoDB:**
```bash
# Local MongoDB (if not using Atlas)
mongod
```

**Run Development Servers:**

Terminal 1 - Server:
```bash
cd server
npm start
# Server runs on http://localhost:8000
```

Terminal 2 - Client:
```bash
cd client
npm run dev
# Client runs on http://localhost:5174
```

---

## 📱 Features in Detail

### Dashboard
- **Stats Grid**: Total applications, offers, interviews, rejections
- **Applications Chart**: Weekly/monthly trend visualization
- **Calendar Widget**: Select dates to filter jobs by application date
- **Search Panel**: Full-width search by company or job title with auto-focus
- **Responsive Grid**: Adapts to mobile (stacked) and desktop (side-by-side)

### Job Management
- **Inline Editing**: Click to edit company, role, status, description
- **Bulk Selection**: Press `A` to select all, `D` to delete selected
- **Soft Delete**: Jobs stay in database but hidden from main view
- **Expand Jobs**: Click to view full details and linked emails

### Gmail Sync
- **Automatic Classification**: Uses rule-based classifier to detect job emails
- **Email Snapshot**: Stores email metadata for reference
- **Status Tracking**: Maps email content to job status (offer, interview, etc.)
- **Sync Logs**: Records sync attempts and results

### Authentication
- **Google OAuth 2.0**: Secure login via Google
- **Session Management**: Express-session with cookies
- **Automatic Logout**: Session expires after inactivity

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `A` | Select all jobs |
| `D` | Delete selected jobs (with confirmation) |
| `S` | Trigger Gmail sync |
| `Esc` | Clear selection & close modals |

---

## 🎨 UI/UX Highlights

- **Smooth Animations**: Framer Motion for all transitions
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Dark Mode**: Complete theme support with persistent storage
- **Loading States**: Visual feedback during sync and API calls
- **Error Handling**: User-friendly error messages and retry options
- **Auto-Focus**: Seamless focus management for search inputs

---

## 📊 Data Models

### JobApplication
```javascript
{
  userId: ObjectId,
  company: { value, confidence, source },
  role: { value, confidence, source },
  currentStatus: "offer" | "interview" | "applied" | "rejected",
  statusSource: "gmail" | "user",
  jobDescription: String,
  appliedDate: Date,
  emailSnapshots: [ObjectId],
  deletedAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

### EmailSnapshot
```javascript
{
  userId: ObjectId,
  jobId: ObjectId,
  messageId: String,
  from: String,
  subject: String,
  date: Date,
  snippet: String,
  fullContent: String
}
```

---

## 🔒 Security Features

- **OAuth 2.0**: Google-managed authentication
- **CORS**: Restricted to frontend URL
- **Session Security**: HTTP-only cookies, SameSite policy
- **Input Validation**: Mongoose schema validation
- **Authorization Checks**: User ID verification on all endpoints
- **Soft Delete**: Data preservation instead of hard delete

---

## 📝 File Structure

### Client Key Files
- `Dashboard.jsx` - Main dashboard page with stats, chart, calendar
- `Login.jsx` - Google OAuth login
- `Review.jsx` - View soft-deleted jobs
- `TopSearchBar.jsx` - Compact header search
- `CalendarSearchPanel.jsx` - Calendar + search widget
- `JobsTable.jsx` - Jobs list with inline editing
- `ApplicationsChart.jsx` - Recharts bar chart

### Server Key Files
- `routes/jobs.js` - Job CRUD operations
- `routes/sync.js` - Gmail sync logic
- `services/gmail.js` - Gmail API wrapper
- `services/ruleClassifier.js` - Email classification
- `models/JobApplication.js` - Job schema
- `auth/google.js` - Google OAuth strategy

---

## 🐛 Troubleshooting

### Gmail Sync Returns "Sync failed"
- Check Google OAuth token is valid
- Verify Gmail API is enabled in Google Cloud
- Review server logs for detailed error messages

### Mobile UI Elements Merge
- Clear browser cache
- Ensure responsive breakpoints in Tailwind (sm:, lg:)
- Check viewport meta tag in index.html

### Jobs Not Appearing
- Verify `deletedAt: null` filter is applied
- Check user ID matches session
- Ensure MongoDB connection is active

---

## 🚦 Future Enhancements

- [ ] Email templates for common job statuses
- [ ] Salary tracking and comparison
- [ ] Interview prep scheduler
- [ ] Company insights and ratings
- [ ] Export to CSV/PDF
- [ ] Collaborative job tracking (shared workspaces)
- [ ] Mobile app (React Native)

---

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

---

## 👨‍💻 Development Notes

- **HMR Enabled**: Vite hot module replacement for fast dev experience
- **Animation Delays**: Capped at 0.3s for large lists (JobsTable)
- **Theme Context**: Global theme state via React Context
- **Motion Animations**: Consistent 0.25-0.3s transitions across components

---

## 📞 Support

For issues or questions, please refer to the individual README files:
- [Client Setup](./client/README.md)
- [Server Setup](./server/README.md)
