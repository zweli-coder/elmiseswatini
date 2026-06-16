import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Scatter } from 'react-chartjs-2';
import { FaChartLine, FaDownload, FaSpinner, FaCalendarAlt, FaIndustry } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE = process.env.REACT_APP_API_URL || '/api';

// Professional color palettes
const INDUSTRY_COLORS = {
  'Technology': '#0369a1',
  'Healthcare': '#dc2626',
  'Finance': '#10b981',
  'Manufacturing': '#f59e0b',
  'Retail': '#8b5cf6',
  'Education': '#06b6d4',
  'Construction': '#ec4899',
  'Agriculture': '#14b8a6',
  'Hospitality': '#f97316',
  'Transportation': '#a855f7',
  'Other': '#6b7280'
};

const AdvancedAnalyticsChart = ({ title, children, onDownload }) => {
  return (
    <div style={styles.chartCard}>
      <div style={styles.chartHeader}>
        <h3 style={styles.chartTitle}>{title}</h3>
        <button style={styles.downloadBtn} onClick={onDownload} title="Download chart">
          <FaDownload /> Download
        </button>
      </div>
      <div style={styles.chartContainer}>
        {children}
      </div>
    </div>
  );
};

// Multi-Axis Line Chart Component
const MultiAxisLineChart = ({ year = 2007, applications = [] }) => {
  const chartRef = React.useRef(null);
  const [chartData, setChartData] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Group applications by industry and month
      const monthlyData = {};
      const industriesSet = new Set();

      applications.forEach(app => {
        const appDate = new Date(app.applied_at);
        const month = appDate.toLocaleString('default', { month: 'short' });
        const industry = app.sector || 'Other';
        
        industriesSet.add(industry);

        if (!monthlyData[month]) {
          monthlyData[month] = {};
        }
        if (!monthlyData[month][industry]) {
          monthlyData[month][industry] = 0;
        }
        monthlyData[month][industry]++;
      });

      const months = Object.keys(monthlyData);
      const industries = Array.from(industriesSet);
      
      // Create datasets for each industry
      const datasets = industries.map((industry, idx) => {
        const color = INDUSTRY_COLORS[industry] || INDUSTRY_COLORS['Other'];
        return {
          label: industry,
          data: months.map(month => monthlyData[month][industry] || 0),
          borderColor: color,
          backgroundColor: color + '20',
          fill: false,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          borderWidth: 2.5,
          yAxisID: 'y' + (idx > 0 ? idx : ''),
          pointStyle: idx % 2 === 0 ? 'circle' : 'rect'
        };
      });

      // Create y-axes for each dataset
      const scales = {
        x: {
          ticks: {
            color: '#0a1930',
            font: { size: 12, weight: '600' }
          },
          grid: {
            display: false
          }
        }
      };

      scales.y = {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        ticks: {
          color: INDUSTRY_COLORS[industries[0]] || '#0369a1',
          font: { size: 11, weight: '600' }
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false
        }
      };

      // Add additional y-axes for other industries
      industries.slice(1).forEach((industry, idx) => {
        const axisId = 'y' + (idx + 1);
        scales[axisId] = {
          type: 'linear',
          display: idx < 2,
          position: idx === 0 ? 'right' : 'left',
          beginAtZero: true,
          ticks: {
            color: INDUSTRY_COLORS[industry] || '#0369a1',
            font: { size: 11, weight: '600' }
          },
          grid: {
            display: idx === 0,
            color: 'rgba(226, 232, 240, 0.3)',
            drawBorder: false
          }
        };
      });

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12, weight: 'bold' },
              padding: 20,
              usePointStyle: true,
              color: '#0a1930',
              boxWidth: 10,
              boxHeight: 10
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            padding: 14,
            cornerRadius: 8,
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y} applications`
            }
          },
          title: {
            display: false
          }
        },
        scales
      };

      setChartData({
        labels: months,
        datasets
      });
      
      setOptions(chartOptions);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [applications, year]);

  const handleDownload = () => {
    const canvas = chartRef.current?.canvas;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `multi-axis-line-${year}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (loading) {
    return (
      <AdvancedAnalyticsChart title="📊 Multi-Axis Line Chart - Applications by Industry" onDownload={handleDownload}>
        <div style={styles.loadingContainer}>
          <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={32} color="#0369a1" />
          <p>Loading chart data...</p>
        </div>
      </AdvancedAnalyticsChart>
    );
  }

  if (error) {
    return (
      <AdvancedAnalyticsChart title="📊 Multi-Axis Line Chart - Applications by Industry" onDownload={handleDownload}>
        <div style={styles.errorContainer}>
          <p style={{ color: '#dc2626' }}>Error: {error}</p>
        </div>
      </AdvancedAnalyticsChart>
    );
  }

  return (
    <AdvancedAnalyticsChart title="📊 Multi-Axis Line Chart - Applications by Industry" onDownload={handleDownload}>
      {chartData && options && <Line ref={chartRef} data={chartData} options={options} height={350} />}
    </AdvancedAnalyticsChart>
  );
};

// Scatter Plot Component for Applications
const ApplicationsScatterPlot = ({ year = 2007, applications = [] }) => {
  const chartRef = React.useRef(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Transform applications into scatter plot points
      // X-axis: Day of year, Y-axis: Count of applications
      const dayData = {};
      const industriesSet = new Set();

      applications.forEach((app, idx) => {
        const appDate = new Date(app.applied_at);
        const dayOfYear = Math.floor((appDate - new Date(appDate.getFullYear(), 0, 0)) / 86400000);
        const industry = app.sector || 'Other';
        
        industriesSet.add(industry);

        if (!dayData[dayOfYear]) {
          dayData[dayOfYear] = {};
        }
        if (!dayData[dayOfYear][industry]) {
          dayData[dayOfYear][industry] = { count: 0, apps: [] };
        }
        dayData[dayOfYear][industry].count++;
        dayData[dayOfYear][industry].apps.push(app);
      });

      const industries = Array.from(industriesSet);

      // Create scatter datasets for each industry
      const datasets = industries.map((industry) => {
        const color = INDUSTRY_COLORS[industry] || INDUSTRY_COLORS['Other'];
        const points = [];

        Object.entries(dayData).forEach(([dayOfYear, data]) => {
          if (data[industry]) {
            points.push({
              x: parseInt(dayOfYear),
              y: data[industry].count,
              r: Math.sqrt(data[industry].count) * 4 // Point size based on count
            });
          }
        });

        return {
          label: industry,
          data: points,
          backgroundColor: color + '80',
          borderColor: color,
          borderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          tension: 0
        };
      });

      setChartData({
        datasets
      });

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [applications, year]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12, weight: 'bold' },
          padding: 20,
          usePointStyle: true,
          color: '#0a1930'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 14,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          label: (context) => `${context.raw.y} applications`
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Day of Year',
          color: '#0a1930',
          font: { size: 12, weight: 'bold' }
        },
        ticks: {
          color: '#667085',
          font: { size: 11, weight: '600' }
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false
        },
        min: 0,
        max: 365
      },
      y: {
        title: {
          display: true,
          text: 'Number of Applications',
          color: '#0a1930',
          font: { size: 12, weight: 'bold' }
        },
        ticks: {
          color: '#667085',
          font: { size: 11, weight: '600' }
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false
        },
        beginAtZero: true
      }
    }
  };

  const handleDownload = () => {
    const canvas = chartRef.current?.canvas;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `scatter-applications-${year}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (loading) {
    return (
      <AdvancedAnalyticsChart title="🔵 Applications Scatter Plot by Industry (Day of Year)" onDownload={handleDownload}>
        <div style={styles.loadingContainer}>
          <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={32} color="#0369a1" />
          <p>Loading scatter data...</p>
        </div>
      </AdvancedAnalyticsChart>
    );
  }

  if (error) {
    return (
      <AdvancedAnalyticsChart title="🔵 Applications Scatter Plot by Industry (Day of Year)" onDownload={handleDownload}>
        <div style={styles.errorContainer}>
          <p style={{ color: '#dc2626' }}>Error: {error}</p>
        </div>
      </AdvancedAnalyticsChart>
    );
  }

  return (
    <AdvancedAnalyticsChart title="🔵 Applications Scatter Plot by Industry (Day of Year)" onDownload={handleDownload}>
      {chartData && <Scatter ref={chartRef} data={chartData} options={options} height={350} />}
    </AdvancedAnalyticsChart>
  );
};

// Industry Group Analysis Chart
const IndustryGroupChart = ({ year = 2007, applications = [] }) => {
  const chartRef = React.useRef(null);

  const data = {
    labels: Array.from(new Set(applications.map(a => a.sector || 'Other'))),
    datasets: [
      {
        label: `Applications by Industry (${year})`,
        data: Array.from(new Set(applications.map(a => a.sector || 'Other'))).map(industry => 
          applications.filter(a => (a.sector || 'Other') === industry).length
        ),
        borderColor: '#0369a1',
        backgroundColor: 'rgba(3, 105, 161, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#0369a1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        borderWidth: 3,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: { size: 12, weight: 'bold' },
          padding: 20,
          usePointStyle: true,
          color: '#0a1930'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `Applications: ${context.parsed.y}`
        },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#667085',
          font: { size: 11, weight: '600' }
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: '#0a1930',
          font: { size: 11, weight: '600' }
        },
        grid: {
          display: false
        }
      }
    }
  };

  const handleDownload = () => {
    const canvas = chartRef.current?.canvas;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `industry-group-${year}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <AdvancedAnalyticsChart title={`📈 Industry Group Analysis (${year})`} onDownload={handleDownload}>
      <Line ref={chartRef} data={data} options={options} height={300} />
    </AdvancedAnalyticsChart>
  );
};

// Main Analytics Component
const AdvancedAnalytics = () => {
  const [year, setYear] = useState(2007);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // First try with auth
        let token = localStorage.getItem('lmis_token') || '';
        let headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        let response = await fetch(`${API_BASE}/admin/applications`, { headers });
        
        // If forbidden, try without auth (for demo purposes)
        if (response.status === 403 || response.status === 401) {
          response = await fetch(`${API_BASE}/employers/applications`, { headers });
        }

        if (!response.ok) {
          // If still not found, use mock data for demonstration
          console.warn('Could not fetch from API, using demonstration data');
          setApplications([
            { id: 1, sector: 'Technology', applied_at: new Date(year, 0, 5).toISOString(), applicant_name: 'John Doe' },
            { id: 2, sector: 'Healthcare', applied_at: new Date(year, 0, 12).toISOString(), applicant_name: 'Jane Smith' },
            { id: 3, sector: 'Technology', applied_at: new Date(year, 0, 18).toISOString(), applicant_name: 'Bob Johnson' },
            { id: 4, sector: 'Finance', applied_at: new Date(year, 1, 3).toISOString(), applicant_name: 'Alice Brown' },
            { id: 5, sector: 'Manufacturing', applied_at: new Date(year, 1, 14).toISOString(), applicant_name: 'Charlie Wilson' },
            { id: 6, sector: 'Retail', applied_at: new Date(year, 1, 28).toISOString(), applicant_name: 'Diana Davis' },
            { id: 7, sector: 'Education', applied_at: new Date(year, 2, 5).toISOString(), applicant_name: 'Eve Martinez' },
            { id: 8, sector: 'Technology', applied_at: new Date(year, 2, 20).toISOString(), applicant_name: 'Frank Taylor' },
            { id: 9, sector: 'Healthcare', applied_at: new Date(year, 3, 10).toISOString(), applicant_name: 'Grace Anderson' },
            { id: 10, sector: 'Construction', applied_at: new Date(year, 3, 25).toISOString(), applicant_name: 'Henry Thomas' },
          ]);
          setIndustries(['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Construction']);
          setError('Using demonstration data. Connect with authentication for live data.');
          setLoading(false);
          return;
        }

        const data = await response.json();
        const appsArray = Array.isArray(data) ? data : data.data || [];
        
        // Filter by year and extract industries
        const filtered = appsArray.filter(app => {
          const appYear = new Date(app.applied_at).getFullYear();
          return appYear === year;
        });

        const uniqueIndustries = [...new Set(filtered.map(a => a.sector || 'Other'))];
        
        setApplications(filtered);
        setIndustries(uniqueIndustries);
        setError(null);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(`Error: ${err.message} - Using demonstration data`);
        // Use mock data on error
        setApplications([
          { id: 1, sector: 'Technology', applied_at: new Date(year, 0, 5).toISOString(), applicant_name: 'John Doe' },
          { id: 2, sector: 'Healthcare', applied_at: new Date(year, 0, 12).toISOString(), applicant_name: 'Jane Smith' },
          { id: 3, sector: 'Technology', applied_at: new Date(year, 0, 18).toISOString(), applicant_name: 'Bob Johnson' },
          { id: 4, sector: 'Finance', applied_at: new Date(year, 1, 3).toISOString(), applicant_name: 'Alice Brown' },
          { id: 5, sector: 'Manufacturing', applied_at: new Date(year, 1, 14).toISOString(), applicant_name: 'Charlie Wilson' },
          { id: 6, sector: 'Retail', applied_at: new Date(year, 1, 28).toISOString(), applicant_name: 'Diana Davis' },
          { id: 7, sector: 'Education', applied_at: new Date(year, 2, 5).toISOString(), applicant_name: 'Eve Martinez' },
          { id: 8, sector: 'Technology', applied_at: new Date(year, 2, 20).toISOString(), applicant_name: 'Frank Taylor' },
          { id: 9, sector: 'Healthcare', applied_at: new Date(year, 3, 10).toISOString(), applicant_name: 'Grace Anderson' },
          { id: 10, sector: 'Construction', applied_at: new Date(year, 3, 25).toISOString(), applicant_name: 'Henry Thomas' },
        ]);
        setIndustries(['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Construction']);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [year]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Advanced Analytics Dashboard</h1>
        <p style={styles.subtitle}>Multi-axis visualization and scatter plot analysis of applications data</p>
      </div>

      {/* Controls */}
      <div style={styles.controlsContainer}>
        <div style={styles.controlGroup}>
          <label style={styles.label}>
            <FaCalendarAlt /> Select Year:
          </label>
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            style={styles.yearSelect}
          >
            {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2007, 2008, 2009, 2010].sort().map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div style={styles.statsContainer}>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Total Applications</span>
            <span style={styles.statValue}>{applications.length}</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Industries</span>
            <span style={styles.statValue}>{industries.length}</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.errorBanner}>
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={styles.loadingContainer}>
          <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={40} color="#0369a1" />
          <p>Loading analytics data for {year}...</p>
        </div>
      )}

      {/* Charts */}
      {!loading && applications.length > 0 && (
        <div style={styles.chartsGrid}>
          <MultiAxisLineChart year={year} applications={applications} />
          <ApplicationsScatterPlot year={year} applications={applications} />
          <IndustryGroupChart year={year} applications={applications} />
        </div>
      )}

      {!loading && applications.length === 0 && !error && (
        <div style={styles.emptyState}>
          <FaIndustry size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <p style={styles.emptyStateText}>No applications found for year {year}</p>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fb',
    padding: '48px 80px',
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center',
  },
  title: {
    fontSize: '42px',
    fontWeight: '900',
    color: '#0a1930',
    margin: 0,
    marginBottom: '12px',
    letterSpacing: '-0.7px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#667085',
    margin: 0,
    fontWeight: '500',
  },
  controlsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    backgroundColor: '#ffffff',
    padding: '24px 28px',
    borderRadius: '12px',
    border: '1.5px solid #e5e9f0',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
    flexWrap: 'wrap',
    gap: '20px',
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0a1930',
  },
  yearSelect: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #e5e9f0',
    backgroundColor: '#ffffff',
    color: '#0a1930',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '120px',
  },
  statsContainer: {
    display: 'flex',
    gap: '20px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#f8f9fb',
    borderRadius: '8px',
    border: '1px solid #e5e9f0',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#667085',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#0369a1',
    marginTop: '4px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
    gap: '32px',
    marginBottom: '48px',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1.5px solid #e5e9f0',
    padding: '28px',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
    transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1.5px solid #e5e9f0',
  },
  chartTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '800',
    color: '#0a1930',
    letterSpacing: '-0.3px',
  },
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1.5px solid #e5e9f0',
    backgroundColor: '#ffffff',
    color: '#0369a1',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px',
  },
  chartContainer: {
    position: 'relative',
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1.5px solid #e5e9f0',
    gap: '16px',
  },
  errorContainer: {
    padding: '20px',
    backgroundColor: '#fee2e2',
    borderRadius: '8px',
    border: '1px solid #fecaca',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '16px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontWeight: '600',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1.5px solid #e5e9f0',
  },
  emptyStateText: {
    fontSize: '16px',
    color: '#667085',
    fontWeight: '500',
  }
};

export default AdvancedAnalytics;
