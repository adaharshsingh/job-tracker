# 💼 Job Tracker - Client

Modern React frontend for managing job applications with calendar filtering, Gmail integration, and real-time analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Google OAuth 2.0 credentials (OAuth 2.0 Client ID from Google Cloud Console)

### Installation
```bash
cd client
npm install
```

### Configuration
Create a `.env.local` file:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Development Server
```bash
npm run dev
```
Visit `http://localhost:5174`

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| Framer Motion | 11.x | Animations & transitions |
| Recharts | 2.x | Data visualization (charts) |
| Material-UI DateCalendar | Latest | Date picker component |
| axios | Latest | HTTP client |
| dayjs | Latest | Date manipulation |
| React Router | 6.x | Client-side routing |
| ESLint | Latest | Code linting |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ApplicationsChart.jsx       # Revenue/status chart visualization
│   ├── CalendarSearchPanel.jsx     # Calendar + search input (85:15 ratio)
│   ├── CalendarWidget.jsx          # Date picker widget
│   ├── ComposeJob.jsx              # Job creation form modal
│   ├── DeleteConfirmModal.jsx      # Confirmation dialog for deletion
│   ├── JobsTable.jsx               # Main jobs list with inline editing
│   ├── Navbar.jsx                  # Top navigation bar
│   ├── StatsGrid.jsx               # 4-card stats grid (Total/Pending/Closed/Accepted)
│   └── TopSearchBar.jsx            # Compact header search bar
├── pages/
│   ├── Dashboard.jsx               # Main dashboard (orchestrator)
│   ├── Login.jsx                   # Google OAuth login page
│   └── Review.jsx                  # Job review/detail page
├── context/
│   └── ThemeContext.jsx            # Dark mode state management
├── api/
│   └── client.js                   # Axios instance with auth headers
├── utils/
│   └── extractCompany.js           # Email-based company name extraction
├── styles/
│   ├── calendar.css                # Calendar widget styling
│   └── index.css                   # Global Tailwind directives
├── App.jsx                         # Root component + routing
└── main.jsx                        # React entry point
```

---

## ✨ Key Features

### 📊 Dashboard Analytics
- **StatsGrid**: Display total applications, pending, closed, and accepted jobs
- **ApplicationsChart**: Interactive bar chart showing applications by status
- **Real-time Updates**: Stats refresh when jobs are added/deleted/modified

### 🔍 Search & Filter
- **CalendarSearchPanel**: Split view (85% calendar, 15% search input)
- **Auto-focus**: Click calendar input → top search bar auto-focuses
- **Auto-hide Calendar**: Calendar hides when search is active, shows when cleared
- **Auto-scroll**: Clicking search auto-scrolls JobsTable into view

### 📅 Calendar Widget
- **Date-based Filtering**: Select dates to filter jobs by application date
- **Visual Feedback**: Selected date highlighted in calendar
- **Responsive**: Adapts to mobile/tablet/desktop
- **Animation**: Smooth fade-in/out transitions (Framer Motion)

### 💼 Job Management
- **Inline Editing**: Click row to edit job details (company, role, status, notes)
- **Status Tracking**: Track as Pending → Interested → Declined → Accepted
- **Bulk Delete**: Select multiple jobs with checkboxes, delete with confirmation
- **Soft Delete**: Deleted jobs marked as deleted, not permanently removed
- **Sort & Filter**: Sort by date, company, status, salary

### 🎨 Dark Mode
- **Toggle**: Theme button in navbar
- **Persistent**: Selected theme saved to localStorage
- **Full Coverage**: Applied to all components (cards, inputs, modals)

### 🔐 Authentication
- **Google OAuth 2.0**: Single Sign-On integration
- **Session Management**: Auto-logout on token expiry
- **Secure Headers**: Authorization token sent with all API requests

### ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `A` | New job (focus ComposeJob input) |
| `D` | Delete selected (bulk delete) |
| `S` | Search (focus search input) |
| `Esc` | Close modals / Clear search |

---

## 📱 Responsive Design

### Mobile (< 768px)
- Single column layout (calendar stacked below stats)
- Calendar: 280px height
- Chart: 320px height
- Search bar: full width
- Font sizes reduced

### Tablet (768px - 1024px)
- Stats grid: 2 columns
- Calendar: 350px height
- Chart: 350px height
- Sidebar visible but narrower

### Desktop (1024px+)
- Dashboard: flex layout (60% left content, 40% right sidebar)
- Calendar: 377px height
- Chart: 377px height
- Full-width search bar
- Side-by-side calendar + search

**Responsive CSS** (via Tailwind):
```jsx
<div className="flex flex-col lg:flex-row gap-0 lg:gap-6">
  <div className="w-full lg:w-3/5">
    {/* Main content */}
  </div>
  <div className="w-full lg:w-2/5">
    {/* Sidebar */}
  </div>
</div>
```

---

## 🔗 API Integration

### Base Setup (axios instance)
File: `src/api/client.js`
```javascript
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
});

export default client;
```

### API Endpoints Used

**Authentication**
- `POST /api/auth/google` - Google OAuth callback
- `POST /api/auth/logout` - User logout

**Jobs**
- `GET /api/jobs` - Fetch all jobs
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Soft delete job

**Search**
- `GET /api/jobs?search=query&date=2024-01-15` - Filter by company/date

**Gmail Sync**
- `POST /api/sync/gmail` - Trigger Gmail sync
- `GET /api/sync/status` - Sync progress status

**Email**
- `GET /api/email/snapshots` - Fetch email snapshots

---

## 🧠 State Management

### Component-Level State (useState)
- `searchQuery` - Current search input value
- `searchFocused` - Is search active? (controls visibility)
- `selectedDate` - Calendar selected date
- `jobs` - Array of job objects
- `editingId` - Which job is being edited inline
- `theme` - "light" or "dark"

### Global Context (ThemeContext)
```javascript
// Provider in App.jsx
<ThemeContext.Provider value={{ theme, toggleTheme }}>
  {children}
</ThemeContext.Provider>

// Usage in components
const { theme, toggleTheme } = useContext(ThemeContext);
```

### Props Drilling (Dashboard → Children)
```javascript
<StatsGrid jobs={jobs} />
<ApplicationsChart jobs={jobs} />
<JobsTable 
  jobs={jobs} 
  onEdit={handleEdit} 
  onDelete={handleDelete} 
/>
```

---

## 📋 Component Props Reference

### `<Dashboard />`
No props. Orchestrates all dashboard logic:
- Manages `jobs`, `searchQuery`, `searchFocused`, `selectedDate` state
- Fetches jobs on mount
- Handles job CRUD operations
- Passes data to child components

### `<StatsGrid />`
```javascript
<StatsGrid jobs={jobs} />
```
- `jobs: JobApplication[]` - Array of job objects
- Calculates and displays stats (total, pending, closed, accepted)

### `<JobsTable />`
```javascript
<JobsTable 
  jobs={jobs}
  filteredJobs={filteredJobs}
  onEdit={(id, updatedData) => {}}
  onDelete={(ids) => {}}
  searchQuery={searchQuery}
/>
```
- `jobs: JobApplication[]` - All jobs (for reference)
- `filteredJobs: JobApplication[]` - Filtered by search/date
- `onEdit: Function` - Called when job is updated inline
- `onDelete: Function` - Called when job(s) are deleted
- `searchQuery: string` - Current search (highlights matching text)

### `<CalendarSearchPanel />`
```javascript
<CalendarSearchPanel 
  onDateChange={(date) => {}}
  onSearchChange={(query) => {}}
  searchQuery={searchQuery}
  selectedDate={selectedDate}
  searchFocused={searchFocused}
  setSearchFocused={setSearchFocused}
  topSearchRef={topSearchRef}
/>
```
- `onDateChange: Function` - Fired when calendar date selected
- `onSearchChange: Function` - Fired when search input changes
- `searchQuery: string` - Current search text
- `selectedDate: Date` - Currently selected calendar date
- `searchFocused: boolean` - Is search active?
- `setSearchFocused: Function` - Toggle search active state
- `topSearchRef: React.Ref` - Reference to top search input (for auto-focus)

### `<TopSearchBar />`
```javascript
<TopSearchBar 
  value={searchQuery}
  onChange={setSearchQuery}
  onClose={() => setSearchFocused(false)}
  inputRef={topSearchRef}
/>
```
- `value: string` - Current search input value
- `onChange: Function` - Fired on input change
- `onClose: Function` - Fired when close (✕) button clicked
- `inputRef: React.Ref` - For parent to focus input

### `<ComposeJob />`
```javascript
<ComposeJob 
  isOpen={isComposeOpen}
  onClose={() => setIsComposeOpen(false)}
  onSubmit={(jobData) => {}}
/>
```
- `isOpen: boolean` - Show/hide modal
- `onClose: Function` - Called when modal closes
- `onSubmit: Function` - Called when form submitted with job data

### `<DeleteConfirmModal />`
```javascript
<DeleteConfirmModal 
  isOpen={isConfirmOpen}
  itemCount={selectedCount}
  onConfirm={() => {}}
  onCancel={() => {}}
/>
```
- `isOpen: boolean` - Show/hide modal
- `itemCount: number` - Count of items being deleted
- `onConfirm: Function` - Called if user confirms deletion
- `onCancel: Function` - Called if user cancels deletion

---

## ❌ Error Handling

### API Errors
```javascript
try {
  const response = await client.get('/api/jobs');
  setJobs(response.data);
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else {
    // Show error toast
    console.error('Failed to fetch jobs:', error.message);
  }
}
```

### Component Error Boundary (Optional)
Consider adding Error Boundary for better UX:
```javascript
<ErrorBoundary fallback={<ErrorPage />}>
  <Dashboard />
</ErrorBoundary>
```

---

## ⚡ Performance Optimizations

1. **Memoization**: Use `React.memo()` for components that receive same props
```javascript
export default React.memo(JobsTable);
```

2. **useCallback**: Memoize event handlers passed to children
```javascript
const handleEdit = useCallback((id, data) => {
  updateJob(id, data);
}, [jobs]);
```

3. **useMemo**: Memoize filtered results
```javascript
const filteredJobs = useMemo(() => {
  return jobs.filter(job => job.company.includes(searchQuery));
}, [jobs, searchQuery]);
```

4. **Code Splitting**: Lazy load pages with React.lazy()
```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Review = lazy(() => import('./pages/Review'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</Suspense>
```

5. **Lazy Loading Images**: Use `<img loading="lazy">` for images

6. **CSS Optimization**: Tailwind CSS purges unused styles in production

---

## 🐛 Debugging Tips

### 1. React DevTools
- Install React DevTools browser extension
- Inspect component tree, props, state
- Track component re-renders with "Highlight updates when components render"

### 2. Network Tab (DevTools)
- Monitor API requests
- Check response payloads and status codes
- Verify authentication headers are sent

### 3. Vite HMR
- Hot Module Replacement automatically reloads changed components
- Check browser console for HMR connection status

### 4. Console Logging
```javascript
// Log component lifecycle
useEffect(() => {
  console.log('Dashboard mounted');
  return () => console.log('Dashboard unmounted');
}, []);

// Log state changes
useEffect(() => {
  console.log('Search query changed:', searchQuery);
}, [searchQuery]);
```

### 5. Inspect Element
- Right-click → Inspect Element to check CSS styles
- Toggle dark mode in DevTools to verify Tailwind dark mode
- Check responsive design with mobile emulation (Ctrl+Shift+M)

---

## 📝 Common Tasks

### Add a New Component
1. Create file: `src/components/MyComponent.jsx`
2. Build component with `export default MyComponent;`
3. Import in parent: `import MyComponent from '../components/MyComponent';`
4. Use: `<MyComponent prop1={value1} />`

### Add a New Page
1. Create file: `src/pages/MyPage.jsx`
2. Add route in `App.jsx`:
```javascript
<Routes>
  <Route path="/mypage" element={<MyPage />} />
</Routes>
```
3. Link from navbar: `<Link to="/mypage">My Page</Link>`

### Modify Tailwind Styles
1. Edit `tailwind.config.js` to add custom colors, fonts, spacing
2. Use in JSX: `<div className="bg-custom-blue text-custom-gray">`
3. Or use inline: `<div style={{ backgroundColor: 'custom-color' }}>`

### Add Dark Mode Support
- Wrap with `ThemeContext.Provider` (already done in App.jsx)
- Use `useContext(ThemeContext)` to get current theme
- Apply conditional classes: `className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`

### Update API Endpoint
1. Edit `src/api/client.js` if changing base URL
2. Update component where API is called:
```javascript
const response = await client.get('/api/new-endpoint');
```
3. Test with backend running: `cd ../server && npm start`

---

## 🚀 Build & Deploy

### Local Build
```bash
npm run build
npm run preview  # Preview production build locally
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```
- Vercel auto-detects Vite project
- Set environment variables in Vercel dashboard
- Deploy from git on every push

### Deploy to Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Deploy to Custom Server
```bash
npm run build  # Generates dist/ folder
# Upload dist/ to your server
# Configure web server (nginx/Apache) to serve dist/index.html for all routes
```

---

## 📦 Dependencies Overview

| Package | Version | Why |
|---------|---------|-----|
| `react` | 18.x | UI library |
| `react-dom` | 18.x | React rendering |
| `react-router-dom` | 6.x | Client-side routing |
| `axios` | Latest | HTTP requests (with auth headers) |
| `dayjs` | Latest | Date parsing/formatting |
| `recharts` | 2.x | Chart component |
| `@mui/x-date-pickers` | Latest | Material-UI calendar |
| `@emotion/react` | Latest | CSS-in-JS (MUI dependency) |
| `@emotion/styled` | Latest | CSS-in-JS (MUI dependency) |
| `framer-motion` | 11.x | Animations (search bar, modals) |
| `tailwindcss` | 3.x | Styling framework |
| `autoprefixer` | Latest | CSS vendor prefixes |
| `postcss` | Latest | CSS processing |
| `eslint` | Latest | Linting |
| `@vitejs/plugin-react` | Latest | Vite React support |

---

## ✅ Best Practices

1. **Component Naming**: Use PascalCase (JobsTable.jsx, not jobsTable.jsx)
2. **Props Validation**: Document props with comments or PropTypes
3. **Avoid Prop Drilling**: Use Context API for deeply nested props
4. **Separate Concerns**: Keep API logic in `/api`, styling in Tailwind/CSS
5. **Error Handling**: Always handle axios errors gracefully
6. **Accessibility**: Use semantic HTML, ARIA labels, keyboard navigation
7. **Testing**: Add unit tests with Jest and React Testing Library
8. **Git Hygiene**: Commit frequently with clear messages, use .gitignore

---

## 📞 Support

For issues or questions:
1. Check [React Documentation](https://react.dev)
2. Check [Vite Documentation](https://vite.dev)
3. Check [Tailwind CSS Documentation](https://tailwindcss.com)
4. Check [Framer Motion Documentation](https://www.framer.com/motion)
5. Review server README.md for API details
6. Check GitHub issues in project repository

---

**Last Updated**: January 2026
**Maintainers**: Job Tracker Team
