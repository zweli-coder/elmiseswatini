# Resources & API Documentation - Quick Start Guide

## Accessing the Resources Section

### Via Navigation Menu
1. Click **"Resources"** in the main navigation bar
2. The Resources page will load with 3 tabs

### Via Footer
1. Scroll to the footer
2. Under **"Resources"** column, click:
   - **"Reports & Data"** → Opens Resources page
   - **"API Documentation"** → Opens API documentation page

### Direct URLs
- Resources Page: `/resources`
- API Documentation: `/api-docs`

---

## Using the Resources Page

### Tab 1: Reports & Data
**Purpose:** Browse and download labour market reports and datasets

**Features:**
- 📊 Grid view of available reports
- 📥 Download button for each report
- 🏷️ Metadata (year, type, file size)
- 🔄 Loading state while fetching data
- ❌ Error handling with retry option

**How to:**
1. Reports automatically load from the system
2. Click **"Download"** button to save a report
3. Each card shows:
   - Report title
   - Description
   - Year and file type
   - Download button

### Tab 2: API Documentation
**Purpose:** Quick reference for developers to access the API

**Available Endpoints:**
- `/publications` - Get reports and documents
- `/statistics` - Get labour market statistics
- `/vacancies` - Get job listings
- `/economic-sectors` - Get sector information
- `/jobseekers` - Get job seeker profiles

**Features:**
- 📋 List of all endpoints
- 🔍 Click "View Details" to expand
- 📝 Example responses
- 🔐 Authentication requirements

### Tab 3: Guides & Tutorials
**Purpose:** Learn how to use ELMIS and its features

**Available Guides:**
1. **Getting Started** - Introduction to ELMIS
2. **Using Statistics** - How to access statistics
3. **API Integration** - Developer guide
4. **Data Download** - How to export data

**FAQs Section:**
- Common questions answered
- Click to expand/collapse questions

---

## Accessing Full API Documentation

### On the Resources Page
1. Click **"View Full API Documentation"** button in API Documentation tab
2. Opens dedicated API documentation page

### Direct Navigation
- Click **"API Documentation"** link in footer Resources column
- Go directly to URL: `/api-docs`

### What's in Full API Documentation
- 📘 Complete API reference
- 🔐 Authentication guide
- 📊 All endpoints with parameters
- ⚠️ Rate limiting information
- ❌ Error codes and meanings
- 💻 Code examples
- 📞 Support contact info

---

## API Documentation Page Guide

### Navigation
Use the **Quick Links** section to jump to:
- Overview
- Authentication
- Available Endpoints
- Rate Limiting
- Error Handling
- Examples

### Endpoint Details
Each endpoint shows:
- HTTP method (GET, POST, etc.)
- Endpoint path
- Description
- Click **"View Details"** to see:
  - Query parameters
  - Example responses
  - Required fields

### Code Examples
Ready-to-use examples for:
- cURL commands
- JavaScript/Fetch
- Other common languages

### Color Coding
- 🟢 **GET** - Retrieve data (green)
- 🔵 **POST** - Create/submit data (blue)
- 🟠 **PUT** - Update data (orange)
- 🔴 **DELETE** - Remove data (red)

---

## Finding Information

### Search Tips
| Looking for... | Go to... |
|---|---|
| Reports to download | Resources → Reports & Data tab |
| How API works | Resources → API Documentation tab |
| Tutorials | Resources → Guides & Tutorials tab |
| Technical details | API Documentation page |
| Code examples | API Documentation page |
| FAQs | Resources → Guides & Tutorials tab |

### Common Tasks

**Download a Report**
1. Go to Resources page
2. Stay on Reports & Data tab
3. Find report you want
4. Click Download button

**Get API Access**
1. Go to API Documentation page
2. Scroll to support section
3. Email api-support@elmis.gov.sz

**Learn About Endpoints**
1. Go to Resources page
2. Click API Documentation tab
3. Click "View Full API Documentation"
4. Find endpoint in list
5. Click "View Details"

**Find FAQs**
1. Go to Resources page
2. Click Guides & Tutorials tab
3. Scroll down to FAQs section
4. Click to expand questions

---

## Tips & Tricks

### 💡 Quick Navigation
- Use keyboard shortcut to quickly access Resources
- Bookmark `/resources` for quick access
- Footer is available on every page

### 📱 Mobile Users
- Resources page is fully responsive
- Works on all screen sizes
- Tabs stack vertically on mobile
- One-tap access to downloads

### 🔗 Sharing
- Share specific endpoint details with developers
- Send API documentation link to partners
- Share report download links with colleagues

### 🔄 Staying Updated
- Resources are updated regularly
- Check back for new guides
- Subscribe to updates (if available)

### ⚡ Performance
- Reports load with spinner animation
- API documentation page includes quick links
- Scroll-to-top button for long pages
- Efficient loading and caching

---

## Troubleshooting

### Reports Not Loading?
1. Check internet connection
2. Click **"Retry"** button
3. Refresh the page (F5)
4. Contact support if issue persists

### Can't Download Report?
1. Check browser download settings
2. Ensure adequate storage space
3. Try different browser
4. Contact support

### API Documentation Page Slow?
1. Wait for page to fully load
2. Close unnecessary browser tabs
3. Clear browser cache
4. Use a faster internet connection

### Links Not Working?
1. Check URL is correct
2. Refresh the page
3. Clear browser cookies
4. Use a different browser

---

## Getting Help

### Support Channels
📧 **Email:** api-support@elmis.gov.sz
📞 **Phone:** +268 2404 1971
🌐 **Website:** https://elmis.gov.sz

### Reporting Issues
Include:
- What page/section you're on
- What you were trying to do
- Any error messages
- Browser and device type

### Requesting Features
- New guides or tutorials
- Additional reports
- API endpoints
- Documentation improvements

---

## Next Steps

### For Regular Users
- Explore Reports & Data section
- Download relevant reports
- Read getting started guide
- Check FAQs

### For Developers
- Review API documentation
- Study code examples
- Request API access
- Test endpoints

### For Administrators
- Update reports regularly
- Monitor API usage
- Add new endpoints
- Maintain documentation

---

## Frequently Asked Questions (FAQ)

**Q: How often are reports updated?**
A: Reports are updated regularly. Check the Resources page for the latest versions.

**Q: Can I download all reports at once?**
A: Currently, reports are downloaded individually. Bulk download may be available soon.

**Q: Is the API free to use?**
A: Yes, for non-commercial use. Contact support for commercial licensing.

**Q: What format are reports in?**
A: Mostly PDF and Word documents. Check metadata for file type.

**Q: Do I need authentication to use the API?**
A: Most endpoints are public. Some admin endpoints require authentication.

**Q: How can I request a new report?**
A: Email api-support@elmis.gov.sz with your request.

**Q: Is there API documentation in other languages?**
A: Currently English only. Translations coming soon.

**Q: How do I report broken links?**
A: Email api-support@elmis.gov.sz with the link details.

---

## More Information

- **API Documentation:** `/api-docs` page
- **Full Implementation Details:** See `RESOURCES_IMPLEMENTATION.md` in docs folder
- **API Reference:** `API_DOCUMENTATION.md` in docs folder

---

**Last Updated:** July 3, 2026  
**Status:** Active  
**Support:** Available 24/7
