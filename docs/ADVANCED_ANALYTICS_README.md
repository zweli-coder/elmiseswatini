# Advanced Analytics Dashboard - Documentation

## Overview

The Advanced Analytics Dashboard provides professional, multi-axis visualization and scatter plot analysis of applications data grouped by industry. This document explains how to use and interact with the various chart types and data analysis features.

## Features

### 1. **Multi-Axis Line Chart**
- **Purpose**: Visualize applications trends across multiple industries simultaneously
- **X-Axis**: Months of the selected year
- **Y-Axes**: Multiple axes, one for each industry (up to 2-3 displayed to avoid clutter)
- **Data Points**: Monthly application count per industry
- **Interactivity**:
  - Hover over lines to see exact values
  - Click legend items to toggle industry visibility
  - Different point styles (circles, rectangles) for visual distinction
  - Color-coded by industry

**Use Case**: Track application trends across different industries throughout a year. Easily compare seasonal patterns and industry performance.

### 2. **Applications Scatter Plot**
- **Purpose**: Analyze application distribution throughout the year by industry
- **X-Axis**: Day of Year (0-365)
- **Y-Axis**: Number of applications received
- **Data Points**: Each point represents applications on a specific day
- **Point Size**: Dynamically sized based on application count (larger = more applications)
- **Interactivity**:
  - Hover to see exact day and application count
  - Color-coded by industry
  - Identify peaks and valleys in application patterns

**Use Case**: Identify specific days or periods with high/low application activity. Discover patterns in recruitment cycles.

### 3. **Industry Group Analysis**
- **Purpose**: Overview of total applications per industry
- **Chart Type**: Line chart showing cumulative trend
- **X-Axis**: Industry names
- **Y-Axis**: Total number of applications
- **Features**:
  - Smooth interpolation between industry points
  - Clear comparison of industry-wise application volumes
  - Professional styling with hover tooltips

**Use Case**: Compare total application volumes across industries to identify which sectors attract the most candidates.

## Data Structure

### Application Object
```javascript
{
  id: number,
  job_id: number,
  employee_id: number,
  status: string,                    // 'pending', 'accepted', 'rejected'
  applied_at: ISO8601 timestamp,    // e.g., "2024-03-15T10:30:00Z"
  cover_letter: string,
  cv_file_path: string,
  cover_letter_file_path: string,
  sector: string,                    // Industry/sector of the job (e.g., "Technology", "Healthcare")
  job_title: string,
  applicant_name: string,
  applicant_email: string,
  experience_years: number
}
```

### Supported Industry Sectors
The dashboard includes predefined colors for these industries:
- **Technology** (#0369a1 - Blue)
- **Healthcare** (#dc2626 - Red)
- **Finance** (#10b981 - Green)
- **Manufacturing** (#f59e0b - Amber)
- **Retail** (#8b5cf6 - Purple)
- **Education** (#06b6d4 - Cyan)
- **Construction** (#ec4899 - Pink)
- **Agriculture** (#14b8a6 - Teal)
- **Hospitality** (#f97316 - Orange)
- **Transportation** (#a855f7 - Violet)
- **Other** (#6b7280 - Gray)

## How to Use

### Accessing the Dashboard
Navigate to: `http://localhost:3000/analytics`

### Selecting a Year
1. Click the year dropdown in the Controls section
2. Available years: 2007-2026 (based on your data)
3. Charts automatically update to show data for the selected year

### Interacting with Charts

#### Zoom & Pan
- Use scroll wheel to zoom in/out
- Click and drag to pan across the chart

#### Toggle Series
- Click legend items to show/hide specific industries
- Double-click to isolate a single industry

#### Export Charts
1. Click the "📥 Download" button on any chart
2. Chart is saved as PNG image to your downloads folder
3. Filename format: `[chart-type]-[year].png`

#### Tooltips
- Hover over data points to see detailed information
- Displays exact values, dates, and counts
- Auto-positions to avoid overlapping with edges

### Data Filtering

The dashboard automatically:
1. **Filters by Year**: Shows only applications from the selected year
2. **Groups by Industry**: Categorizes applications by the `sector` field
3. **Calculates Statistics**: 
   - Total applications count
   - Number of unique industries
   - Monthly distribution
   - Day-of-year distribution

## API Endpoints Used

### Fetching Applications
```
GET /api/admin/applications
Headers: Authorization: Bearer {token}

Response:
[
  {
    id: number,
    job_id: number,
    applied_at: "2024-03-15T10:30:00Z",
    sector: "Technology",
    applicant_name: "John Doe",
    ...
  },
  ...
]
```

## Color Scheme

The dashboard uses a professional color palette:
- **Primary Colors**: Navy (#0a1930), Ocean Blue (#0369a1)
- **Background**: Light Gray (#f8f9fb)
- **Borders**: Subtle Gray (#e5e9f0)
- **Text**: Dark Slate (#0a1930), Medium Gray (#667085)
- **Industry-Specific**: Custom color per industry (see Industry Sectors above)

## Performance Considerations

- **Data Load**: Efficiently filters data by year to reduce processing
- **Chart Rendering**: Uses Chart.js for optimized rendering
- **Memory**: Scatter plot dynamically sizes points based on data
- **Responsiveness**: Responsive grid layout for various screen sizes

## Troubleshooting

### No Data Displayed
- Ensure applications exist for the selected year
- Check browser console for API errors
- Verify authentication token is valid

### Charts Not Loading
- Clear browser cache and reload
- Check network tab in DevTools for API call status
- Ensure backend server is running on port 3001

### Colors Not Showing
- Verify industry names match predefined sectors
- Check that `sector` field is populated in application data
- New industries default to gray color

### Export Not Working
- Check browser permissions for downloads
- Ensure pop-ups are not blocked
- Verify Canvas API is supported in your browser

## Future Enhancements

Potential features for future releases:
- [ ] Date range picker for custom periods
- [ ] Comparison view between multiple years
- [ ] Export to PDF with custom formatting
- [ ] Real-time data updates with WebSocket
- [ ] Custom color scheme configuration
- [ ] Additional chart types (Heatmap, Waterfall, etc.)
- [ ] Data aggregation by region, education level, etc.
- [ ] Predictive analytics for recruitment trends

## Technical Stack

- **Frontend Framework**: React 18+
- **Charting Library**: Chart.js 4+ with react-chartjs-2
- **State Management**: React Hooks (useState, useEffect)
- **Styling**: Inline CSS-in-JS with professional design system
- **Icons**: React Icons (FaChartLine, FaDownload, etc.)

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify API connectivity to backend
3. Review application data in database
4. Contact development team with specific error details

---

**Last Updated**: June 2026
**Version**: 1.0.0
**Status**: Production Ready
