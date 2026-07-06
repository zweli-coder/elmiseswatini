# Employer Dashboard - Visual & Functional Testing Guide

## Component Structure

```
EmployerDashboard
├── Header/Navbar
│   ├── Logo
│   ├── Welcome Message (User Name)
│   └── Logout Button
├── Main Content
│   ├── Dashboard Title
│   ├── Statistics Section
│   │   ├── Total Applications Card
│   │   ├── Pending Card
│   │   ├── Accepted Card
│   │   └── Rejected Card
│   ├── Action Buttons Section
│   │   ├── View Vacancies
│   │   ├── Post Vacancy
│   │   └── View Applications
│   ├── Employer Jobs Section
│   │   ├── Job Cards/Table
│   │   │   ├── Job Title
│   │   │   ├── Location
│   │   │   ├── Posted Date
│   │   │   ├── Application Count
│   │   │   └── Action Links
│   │   └── Empty State (if no jobs)
│   ├── All Vacancies Section
│   │   ├── Vacancies List
│   │   │   ├── Job Title
│   │   │   ├── Company/Employer
│   │   │   ├── Location
│   │   │   └── View Details
│   │   └── Empty State (if no vacancies)
│   └── Footer
└── Loading States & Error Messages

```

## Visual Test Scenarios

### Scenario 1: Initial Page Load
**Steps:**
1. Open browser console (F12)
2. Navigate to `http://localhost:3000/employer/dashboard`
3. Observe page load sequence

**Visual Indicators:**
- [ ] Spinner/loader appears
- [ ] API calls visible in Network tab
- [ ] Content gradually renders
- [ ] Spinner disappears when done

**Expected Timeline:**
```
0s   - Spinner appears
0.5s - Auth check begins
1s   - Job data API calls made
1.5s - Content starts rendering
2s   - All content visible
2.5s - Spinner removed
```

### Scenario 2: Statistics Cards Display
**Expected Layout:**

```
┌─────────────────────────────────────────┐
│    EMPLOYER DASHBOARD STATISTICS        │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐ ┌──────────┐            │
│  │ TOTAL    │ │ PENDING  │            │
│  │   24     │ │    12    │            │
│  └──────────┘ └──────────┘            │
│                                         │
│  ┌──────────┐ ┌──────────┐            │
│  │ ACCEPTED │ │ REJECTED │            │
│  │    8     │ │    4     │            │
│  └──────────┘ └──────────┘            │
│                                         │
└─────────────────────────────────────────┘
```

**Test Points:**
- [ ] All 4 cards visible
- [ ] Numbers align properly
- [ ] Icons/colors distinguish each card
- [ ] Cards are responsive (stack on mobile)

### Scenario 3: Navigation Menu
**Expected Layout:**

```
┌─────────────────────────────────────────┐
│  [VIEW VACANCIES]  [POST VACANCY]       │
│  [APPLICATIONS]    [LOGOUT]             │
└─────────────────────────────────────────┘
```

**Test Points:**
- [ ] All buttons visible
- [ ] Buttons are clickable
- [ ] Hover effects work
- [ ] Active/current page indicated

### Scenario 4: Jobs List Display
**Expected Layout:**

```
┌─────────────────────────────────────────┐
│ MY POSTED JOBS (4)                      │
├─────────────────────────────────────────┤
│                                         │
│  Software Engineer                      │
│  Location: Mbabane | Posted: 5 days ago│
│  Applications: 12 | Status: Open       │
│  [View Details] [Edit] [Close]         │
│                                         │
│  Marketing Manager                      │
│  Location: Manzini | Posted: 2 days ago│
│  Applications: 8 | Status: Open        │
│  [View Details] [Edit] [Close]         │
│                                         │
└─────────────────────────────────────────┘
```

**Test Points:**
- [ ] Job title visible
- [ ] Location displays
- [ ] Posted date shows
- [ ] Application count visible
- [ ] Action buttons present
- [ ] Table/cards properly formatted

### Scenario 5: All Vacancies Section
**Expected Layout:**

```
┌─────────────────────────────────────────┐
│ ALL AVAILABLE VACANCIES (28)            │
├─────────────────────────────────────────┤
│                                         │
│  Software Engineer                      │
│  Employer: Tech Corp | Mbabane         │
│  Salary: E 45,000 - E 55,000           │
│  [Apply] [Details]                     │
│                                         │
│  Accountant                             │
│  Employer: Finance Ltd | Manzini       │
│  Salary: E 35,000 - E 40,000           │
│  [Apply] [Details]                     │
│                                         │
└─────────────────────────────────────────┘
```

**Test Points:**
- [ ] Shows different jobs (not just employer's)
- [ ] Employer name visible
- [ ] Salary range displays
- [ ] Apply button functional
- [ ] Scrollable if many jobs

### Scenario 6: Empty States

**No Jobs Posted:**
```
┌─────────────────────────────────────────┐
│ MY POSTED JOBS                          │
├─────────────────────────────────────────┤
│                                         │
│         No jobs posted yet              │
│                                         │
│     [POST YOUR FIRST JOB]               │
│                                         │
└─────────────────────────────────────────┘
```

**No Vacancies:**
```
┌─────────────────────────────────────────┐
│ ALL AVAILABLE VACANCIES                 │
├─────────────────────────────────────────┤
│                                         │
│      No vacancies available             │
│                                         │
│       Check back soon...                │
│                                         │
└─────────────────────────────────────────┘
```

### Scenario 7: Loading States

**Skeleton Loading (Optional):**
```
┌─────────────────────────────────────────┐
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  Title skeleton
│ ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  Card skeleton
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░  │  Content skeleton
└─────────────────────────────────────────┘
```

### Scenario 8: Error Display

**Network Error:**
```
┌─────────────────────────────────────────┐
│ ❌ Failed to load data                  │
│                                         │
│    Connection error. Please check:      │
│    • Your internet connection           │
│    • Server is running                  │
│                                         │
│         [RETRY]  [GO HOME]              │
└─────────────────────────────────────────┘
```

**Authentication Error:**
```
┌─────────────────────────────────────────┐
│ ⚠️  Access Denied                       │
│                                         │
│  You don't have permission to view      │
│  this page. Employers only.             │
│                                         │
│        [LOGIN]  [GO HOME]               │
└─────────────────────────────────────────┘
```

## Color & Style Verification

### Expected Color Scheme
- **Primary**: Blue (#007BFF or similar)
- **Success**: Green (#28A745 or similar)
- **Warning**: Orange (#FFC107 or similar)
- **Danger**: Red (#DC3545 or similar)
- **Background**: Light gray (#F5F5F5 or similar)
- **Text**: Dark gray/black (#333 or similar)

### Font & Spacing
- **Headings**: Bold, 24-32px
- **Body Text**: Regular, 14-16px
- **Padding**: 16-32px around sections
- **Margins**: 16-24px between sections

### Responsive Behavior

**Desktop (1920x1080):**
```
[Header spanning full width]
[Two-column layout: Sidebar | Main content]
[3-column stat cards]
[Full-width job table]
```

**Tablet (768px):**
```
[Header spanning full width]
[Single column layout]
[2-column stat cards / 1-column on narrow]
[Condensed job cards]
```

**Mobile (375px):**
```
[Header with hamburger menu]
[Full-width single column]
[1-column stat cards]
[Stacked job cards]
[Bottom navigation]
```

## Animation & Interaction Testing

### Transitions
- [ ] Page load fade-in smooth
- [ ] Button hover color changes
- [ ] Stat cards appear with stagger animation
- [ ] Data updates smoothly

### User Feedback
- [ ] Buttons show loading state while submitting
- [ ] Tooltips appear on hover over truncated text
- [ ] Success messages appear after actions
- [ ] Error messages are visible and readable

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements in order
- [ ] Enter/Space activates buttons
- [ ] Tab shows focus indicator
- [ ] No keyboard traps

### Screen Reader
- [ ] Page has proper heading hierarchy
- [ ] Images have alt text
- [ ] Links have descriptive text
- [ ] Form labels associated with inputs
- [ ] Status messages announced

### Color Contrast
- [ ] Text contrast ratio >= 4.5:1
- [ ] Buttons distinguishable without color alone
- [ ] Error states indicated beyond just color

## Performance Visual Indicators

### Time to Interactive (TTI)
```
0ms   ┤
      ├─ Page starts rendering
100ms ┤
      ├─ Content visible
200ms ┤
      ├─ Interactive (can click buttons)
300ms ┤
      ├─ All data loaded
500ms ┤
      └─ Done
```

### Memory Usage
```
Start:  45 MB
After 1min: 48 MB (+6%)
After 5min: 50 MB (+11%)
After 30min: 52 MB (+15%)
```

## Testing Checklist

### Visual Rendering
- [ ] Layout correct at all breakpoints
- [ ] All text readable
- [ ] Images load properly
- [ ] No overlapping elements
- [ ] Spacing consistent

### Functionality
- [ ] All buttons clickable
- [ ] Links navigate correctly
- [ ] Forms submit data
- [ ] Data displays accurately
- [ ] Real-time updates work

### Performance
- [ ] Page loads within 3 seconds
- [ ] Interactions responsive (< 100ms)
- [ ] No memory leaks
- [ ] Smooth animations

### Accessibility
- [ ] Keyboard navigable
- [ ] Screen reader compatible
- [ ] Color contrast adequate
- [ ] Error messages clear
- [ ] Focus indicators visible

### Cross-browser
- [ ] Chrome: ✓/✗
- [ ] Firefox: ✓/✗
- [ ] Edge: ✓/✗
- [ ] Safari: ✓/✗

---

## Screenshot Capture Points

Capture screenshots of:
1. Dashboard full view
2. Statistics cards
3. Jobs list
4. Empty states
5. Error messages
6. Mobile layout
7. Loading states
8. Responsive breakpoints (1920, 1024, 768, 375)

## Video Recording

Record a video demonstrating:
1. Loading the dashboard
2. Scrolling through content
3. Clicking navigation buttons
4. Refreshing page
5. Error handling
6. Mobile responsive behavior
