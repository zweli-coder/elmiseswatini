# Admin Publications Management - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                                │
│                 (Render Deployment)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐          ┌──────────────────┐              │
│  │ Admin Dashboard │ ──────→ │ Publications     │              │
│  │                 │          │ Management Page  │              │
│  │  Manage Pubs    │          │  (NEW FEATURE)   │              │
│  │  Card           │          │                  │              │
│  └─────────────────┘          └──────────────────┘              │
│                                        │                         │
│                                        ↓                         │
│                          ┌──────────────────────┐               │
│                          │  AdminPublications   │               │
│                          │  Manage.js           │               │
│                          │                      │               │
│                          │ • Fetch publications │               │
│                          │ • Search/Filter      │               │
│                          │ • Delete confirm     │               │
│                          │ • Download files     │               │
│                          │ • Show feedback      │               │
│                          └──────────────────────┘               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Fetch API + JWT
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  EXPRESS BACKEND                                 │
│              (Render Deployment)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Routes: /api/publications                                      │
│  ┌─────────────────────────────────┐                           │
│  │ GET /publications               │ ← Fetch all              │
│  │ DELETE /publications/:id        │ ← Delete (admin only)    │
│  │ (verifyAdmin middleware)        │                          │
│  └─────────────────────────────────┘                           │
│                       │                                         │
│                       ↓                                         │
│           ┌───────────────────────┐                            │
│           │  PostgreSQL Database  │                            │
│           │                       │                            │
│           │ publications table    │                            │
│           │ - id (PK)             │                            │
│           │ - title               │                            │
│           │ - description         │                            │
│           │ - category            │                            │
│           │ - year                │                            │
│           │ - type                │                            │
│           │ - file_url            │                            │
│           └───────────────────────┘                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature Flow Diagram

```
┌─────────────────┐
│  Admin User     │
│   Logs In       │
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│  Admin Dashboard        │
│  - Multiple cards       │
│  - Manage Publications  │ ← NEW CARD
└────────┬────────────────┘
         │ Click "Manage"
         ↓
┌─────────────────────────────────────────┐
│  AdminPublicationsManage.js             │
│  - Fetch all publications               │
├─────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────┐ │
│  │  Search Box     │  │  Category    │ │
│  │  (Title/Desc)   │  │  Filter      │ │
│  └────────┬────────┘  └──────┬───────┘ │
│           └────────────┬─────┘          │
│                        ↓                 │
│           ┌────────────────────────┐   │
│           │  Filter Publications   │   │
│           │  by Search + Category  │   │
│           └────────────┬───────────┘   │
│                        ↓                 │
│           ┌────────────────────────┐   │
│           │  Display Grid of Cards │   │
│           │  with:                 │   │
│           │  - Download button     │   │
│           │  - Delete button       │   │
│           └────────────┬───────────┘   │
│                        │                 │
│          ┌─────────────┴──────────┐     │
│          ↓                        ↓     │
│   ┌────────────┐         ┌──────────┐  │
│   │ Download   │         │ Delete   │  │
│   │ File       │         │ Confirm  │  │
│   └────────────┘         └────┬─────┘  │
│                               ↓         │
│                    ┌──────────────────┐ │
│                    │ Modal Dialog     │ │
│                    │ - Show title     │ │
│                    │ - Warning msg    │ │
│                    │ - Confirm btn    │ │
│                    └────────┬─────────┘ │
│                             ↓           │
│                    ┌──────────────────┐ │
│                    │ Delete API Call  │ │
│                    │ DELETE /api/pubs │ │
│                    │ :id with JWT     │ │
│                    └──────────┬───────┘ │
│                               ↓         │
│                  ┌──────────────────┐  │
│                  │  Success Message │  │
│                  │  "Pub deleted"   │  │
│                  │  Auto-dismiss    │  │
│                  └──────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
         │
         ↓
  ┌────────────────────┐
  │ API Response:      │
  │ 200 OK / Error     │
  │ (Handle in catch)  │
  └────────────────────┘
         │
         ↓
  ┌────────────────────────────────┐
  │  Database Updated:             │
  │  - Publication deleted         │
  │  - Not in UI anymore           │
  │  - Not on Public page anymore  │
  └────────────────────────────────┘
```

---

## Component Hierarchy

```
App.js
│
├─ Navbar
├─ Sidebar
├─ Main Routes
│  │
│  ├─ /admin → AdminDashboard
│  │            └─ "Manage Publications" Card
│  │               └─ Link to /admin/publications-manage
│  │
│  └─ /admin/publications-manage → AdminPublicationsManage ✅ NEW
│     │
│     ├─ State Management
│     │  ├─ publications
│     │  ├─ isLoading
│     │  ├─ error
│     │  ├─ searchTerm
│     │  ├─ filterCategory
│     │  ├─ deleteConfirm
│     │  └─ deleteMessage
│     │
│     ├─ Hooks
│     │  ├─ useEffect → fetch publications
│     │  └─ useState → manage component state
│     │
│     └─ UI Components
│        ├─ Header (title + back button)
│        ├─ Search Box
│        ├─ Filter Dropdown
│        ├─ Publications Grid
│        │  └─ Publication Cards
│        │     ├─ Title
│        │     ├─ Description
│        │     ├─ Category Badge
│        │     ├─ Download Button
│        │     └─ Delete Button
│        ├─ Delete Confirmation Modal
│        └─ Status Messages (success/error)
│
└─ Footer
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND                                     │
│                                                                   │
│  1. Component Mounts                                            │
│     └─> useEffect runs                                         │
│         └─> fetchPublications()                                │
│             └─> setIsLoading(true)                             │
│                                                                 │
│  2. Fetch API Call                                             │
│     ├─> GET /api/publications                                  │
│     ├─> No headers needed (public endpoint)                    │
│     └─> Response: Array of publication objects                │
│                                                                 │
│  3. Update State                                               │
│     └─> setPublications(data)                                  │
│         └─> setIsLoading(false)                                │
│                                                                 │
│  4. Render Component                                           │
│     └─> publications.map() → render cards                      │
│                                                                 │
│  5. User Interaction                                           │
│     ├─> Type in search box                                    │
│     │   └─> setSearchTerm(value)                               │
│     │       └─> Re-render with filtered results               │
│     │                                                           │
│     ├─> Select category filter                                │
│     │   └─> setFilterCategory(value)                          │
│     │       └─> Re-render with filtered results               │
│     │                                                           │
│     └─> Click Delete Button                                   │
│         └─> setDeleteConfirm(publication)                     │
│             └─> Show confirmation modal                        │
│                                                                 │
│  6. Delete API Call                                            │
│     ├─> GET token from localStorage                            │
│     ├─> DELETE /api/publications/:id                           │
│     ├─> Headers: Authorization: Bearer {token}                │
│     └─> Response: 200 OK / Error                              │
│                                                                 │
│  7. Update State After Delete                                  │
│     ├─> setPublications(filter out deleted)                   │
│     ├─> setDeleteMessage("Success")                           │
│     ├─> Auto-hide message after 3s                            │
│     └─> setDeleteConfirm(null)                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

         │
         │ API Calls
         ↓

┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND                                      │
│                                                                   │
│  1. GET /api/publications                                       │
│     ├─> Query: SELECT * FROM publications                      │
│     └─> Response: JSON array                                   │
│                                                                 │
│  2. DELETE /api/publications/:id                               │
│     ├─> Verify: JWT token valid?                              │
│     ├─> Verify: User is admin?                                │
│     ├─> Check: Publication exists?                            │
│     ├─> Query: DELETE FROM publications WHERE id = ?          │
│     └─> Response: 200 OK / 403 / 404                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

         │
         ↓

┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE                                       │
│                PostgreSQL                                        │
│                                                                   │
│  publications table:                                            │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ id (PK) │ title │ description │ category │ ... │     │      │
│  ├─────────┼───────┼─────────────┼──────────┼─────┤     │      │
│  │ 1       │ Report│ ...         │ Report   │ ... │     │      │
│  │ 2       │ Guide │ ...         │ Guide    │ ... │     │      │
│  │ 3       │ ...   │ ...         │ ...      │ ... │     │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                   │
│  Deletion Operation:                                            │
│  DELETE FROM publications WHERE id = 2                         │
│  └─> Row deleted permanently                                   │
│      (Assuming foreign key constraints)                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Flow

```
┌───────────────────────────────────────┐
│  Admin User                           │
│  - Authenticated                      │
│  - Has JWT token in localStorage      │
└─────────────────┬─────────────────────┘
                  │
                  ↓
         ┌────────────────────┐
         │ Clicks Delete      │
         │ Button             │
         └────────┬───────────┘
                  │
                  ↓
         ┌────────────────────────────┐
         │ Modal Confirmation         │
         │ - Warns about permanent    │
         │   deletion                 │
         └────────┬───────────────────┘
                  │
                  ↓
         ┌────────────────────────────────┐
         │ Delete API Call                │
         │ DELETE /api/publications/{id}  │
         │ Header: Authorization:        │
         │ Bearer {JWT_TOKEN}            │
         └────────┬─────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ↓                    ↓
    ┌─────────┐          ┌──────────┐
    │ Backend │          │ Backend  │
    │ Step 1  │          │ Step 2   │
    │         │          │          │
    │ Check   │ ────────>│ Verify   │
    │ Token   │          │ Admin    │
    │ Valid   │          │ Role     │
    └─────────┘          └──────────┘
        YES                   YES
        │                      │
        ↓                      ↓
    ┌──────────────────────────────┐
    │ Backend Step 3               │
    │ Delete from Database         │
    │ DELETE FROM publications ... │
    └──────────┬───────────────────┘
               │
        ┌──────┴──────┐
        │             │
    ┌───↓────┐    ┌───↓────┐
    │ Success│    │ Error  │
    │ 200 OK │    │ 4xx/5xx│
    └───┬────┘    └───┬────┘
        │             │
        ↓             ↓
    ┌────────┐    ┌─────────┐
    │ Remove │    │ Show    │
    │ from   │    │ Error   │
    │ UI     │    │ Message │
    └────────┘    └─────────┘

Security Checkpoints:
✓ JWT Token validation (backend)
✓ Admin role verification (backend middleware)
✓ Database constraint enforcement
✓ Confirmation modal (UX prevention)
✓ No sensitive data in error messages
```

---

## File Structure

```
eswatini_lmis_frontend/
├── src/
│   ├── pages/
│   │   ├── AdminDashboard.js          (Modified: added card)
│   │   ├── AdminPublications.js       (Upload page)
│   │   ├── AdminPublicationsManage.js (NEW: manage/delete)
│   │   ├── AdminPublicationsManage.css(NEW: styling)
│   │   ├── Publications.js            (Public view)
│   │   └── ... (other pages)
│   │
│   ├── services/
│   │   └── api.js                     (API configuration)
│   │
│   ├── App.js                         (Modified: added route)
│   └── ... (other files)
│
├── .env                               (Environment variables)
├── package.json
└── ...

eswatini_lmis_backend/
├── routes/
│   └── publicationsRoutes.js          (DELETE endpoint)
├── .env                               (DB credentials)
├── server.js                          (CORS config)
└── ...

Root Directory:
├── ADMIN_PUBLICATIONS_MANAGEMENT.md   (Feature guide)
├── FEATURE_COMPLETE_CHECKLIST.md      (Testing checklist)
├── DEPLOYMENT_COMPLETE.txt            (Deployment summary)
└── FEATURE_DELIVERY_SUMMARY.txt       (User summary)
```

---

## Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                   DEVELOPMENT                                    │
│                                                                   │
│  1. Code Changes                                                │
│     ├─ AdminPublicationsManage.js (NEW)                        │
│     ├─ AdminPublicationsManage.css (NEW)                       │
│     ├─ AdminDashboard.js (MODIFIED)                            │
│     └─ App.js (MODIFIED)                                       │
│                                                                   │
│  2. Git Commit & Push                                          │
│     └─ git push origin main                                    │
│                                                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                  GITHUB REPOSITORY                               │
│                                                                   │
│  Commit: 3499d40                                                │
│  Branch: main                                                   │
│  Status: Pushed ✓                                               │
│                                                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER PLATFORM                               │
│                                                                   │
│  1. Webhook Triggered                                           │
│     └─ GitHub sends push notification                          │
│                                                                   │
│  2. Auto-Deploy Starts                                         │
│     └─ Frontend service rebuilds                              │
│                                                                   │
│  3. Build Steps                                                │
│     ├─ npm install                                             │
│     ├─ npm run build                                           │
│     └─ npx serve -s build -l 3000                              │
│                                                                   │
│  4. Deployment                                                 │
│     └─ Frontend updated at URL                                │
│                                                                   │
│  Timeline: 2-5 minutes                                         │
│                                                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                   PRODUCTION                                     │
│                                                                   │
│  Status: LIVE ✅                                                 │
│  URL: https://elmis-eswatini-qzwo.onrender.com                 │
│  Page: /admin/publications-manage                              │
│                                                                   │
│  Features Available:                                            │
│  ✓ View publications                                            │
│  ✓ Search by title/description                                 │
│  ✓ Filter by category                                          │
│  ✓ Delete publications                                         │
│  ✓ Download files                                              │
│  ✓ Responsive on all devices                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Metrics

| Metric | Value |
|--------|-------|
| **Components Created** | 1 (AdminPublicationsManage) |
| **CSS Files Created** | 1 (AdminPublicationsManage.css) |
| **Lines of Code** | 753 (JS + CSS) |
| **React Hooks Used** | 2 (useState, useEffect) |
| **API Endpoints Used** | 2 (GET, DELETE) |
| **Features Implemented** | 6 major features |
| **Responsive Breakpoints** | 2 (768px, mobile) |
| **Documentation Pages** | 3 comprehensive guides |
| **Time to Deploy** | 2-5 minutes on Render |
| **Production Status** | ✅ LIVE |

---

*Architecture Diagram Generated: 2024*  
*Status: Complete & Deployed ✅*  
*Production Ready: YES*
