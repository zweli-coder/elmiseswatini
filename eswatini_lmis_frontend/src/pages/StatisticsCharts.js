import React from 'react';
import { Bar, Line, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { FaDownload } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Sample data for the statistics
const STATISTICS_DATA = [
  { year: '2017', category: 'Statistics', industry: '', region: 'Hhohho', value: 11.6 },
  { year: '2017', category: 'Statistics', industry: '', region: 'Shiselweni', value: 12.1 },
  { year: '2017', category: 'Statistics', industry: '', region: 'Lubombo', value: 8.8 },
  { year: '2017', category: 'Statistics', industry: '', region: 'National', value: 11.9 },
  { year: '2017', category: 'Statistics', industry: '', region: 'Manzini', value: 13.5 },
];

// Professional color palettes for different chart types
const COLOR_PALETTES = {
  regions: {
    'Hhohho': '#0369a1',
    'Shiselweni': '#7c3aed',
    'Lubombo': '#dc2626',
    'National': '#0ea5e9',
    'Manzini': '#10b981'
  },
  charts: [
    '#0369a1', '#7c3aed', '#dc2626', '#0ea5e9', '#10b981',
    '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'
  ]
};

const ChartCard = ({ title, children, onDownload }) => {
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

const RegionBarChart = () => {
  const chartRef = React.useRef(null);

  const data = {
    labels: STATISTICS_DATA.map(d => d.region),
    datasets: [
      {
        label: 'Statistical Values by Region',
        data: STATISTICS_DATA.map(d => d.value),
        backgroundColor: STATISTICS_DATA.map(d => COLOR_PALETTES.regions[d.region]),
        borderColor: STATISTICS_DATA.map(d => COLOR_PALETTES.regions[d.region]),
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: '#ffffff',
        hoverBorderColor: STATISTICS_DATA.map(d => COLOR_PALETTES.regions[d.region]),
        hoverBorderWidth: 3,
      }
    ]
  };

  const options = {
    indexAxis: 'x',
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
          label: (context) => `Value: ${context.parsed.y.toFixed(1)}`
        },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 }
      },
      filler: {
        propagate: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 15,
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
          font: { size: 12, weight: '600' }
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
      link.download = 'regions-bar-chart.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <ChartCard title="📊 Regional Statistics - Bar Chart" onDownload={handleDownload}>
      <Bar ref={chartRef} data={data} options={options} height={300} />
    </ChartCard>
  );
};

const RegionLineChart = () => {
  const chartRef = React.useRef(null);

  const data = {
    labels: STATISTICS_DATA.map(d => d.region),
    datasets: [
      {
        label: 'Value Trend',
        data: STATISTICS_DATA.map(d => d.value),
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
          label: (context) => `Value: ${context.parsed.y.toFixed(1)}`
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
        max: 15,
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
          font: { size: 12, weight: '600' }
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
      link.download = 'regions-line-chart.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <ChartCard title="📈 Regional Trend - Line Chart" onDownload={handleDownload}>
      <Line ref={chartRef} data={data} options={options} height={300} />
    </ChartCard>
  );
};

const RegionDoughnutChart = () => {
  const chartRef = React.useRef(null);

  const data = {
    labels: STATISTICS_DATA.map(d => d.region),
    datasets: [
      {
        label: 'Distribution by Region',
        data: STATISTICS_DATA.map(d => d.value),
        backgroundColor: STATISTICS_DATA.map(d => COLOR_PALETTES.regions[d.region]),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 10
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: { size: 12, weight: '600' },
          padding: 20,
          usePointStyle: true,
          color: '#0a1930'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.toFixed(1)} (${percentage}%)`;
          }
        },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 }
      }
    }
  };

  const handleDownload = () => {
    const canvas = chartRef.current?.canvas;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'regions-doughnut-chart.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <ChartCard title="🍩 Distribution - Doughnut Chart" onDownload={handleDownload}>
      <Doughnut ref={chartRef} data={data} options={options} height={300} />
    </ChartCard>
  );
};

const RegionRadarChart = () => {
  const chartRef = React.useRef(null);

  const data = {
    labels: STATISTICS_DATA.map(d => d.region),
    datasets: [
      {
        label: 'Statistical Coverage',
        data: STATISTICS_DATA.map(d => d.value),
        borderColor: '#0369a1',
        backgroundColor: 'rgba(3, 105, 161, 0.3)',
        pointBackgroundColor: '#0369a1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        fill: true,
        tension: 0.1
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
          label: (context) => `Value: ${context.parsed.r.toFixed(1)}`
        },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 15,
        ticks: {
          color: '#667085',
          font: { size: 10, weight: '600' },
          backdropColor: 'transparent'
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: true,
          borderColor: '#667085'
        },
        pointLabels: {
          color: '#0a1930',
          font: { size: 12, weight: '600' }
        }
      }
    }
  };

  const handleDownload = () => {
    const canvas = chartRef.current?.canvas;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'regions-radar-chart.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <ChartCard title="🎯 Radar Analysis" onDownload={handleDownload}>
      <Radar ref={chartRef} data={data} options={options} height={300} />
    </ChartCard>
  );
};

const RegionPolarChart = () => {
  const chartRef = React.useRef(null);

  const data = {
    labels: STATISTICS_DATA.map(d => d.region),
    datasets: [
      {
        label: 'Regional Values',
        data: STATISTICS_DATA.map(d => d.value),
        backgroundColor: STATISTICS_DATA.map(d => COLOR_PALETTES.regions[d.region]).map(c => c + '80'),
        borderColor: STATISTICS_DATA.map(d => COLOR_PALETTES.regions[d.region]),
        borderWidth: 2.5,
        pointBackgroundColor: STATISTICS_DATA.map(d => COLOR_PALETTES.regions[d.region]),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
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
          label: (context) => `Value: ${context.parsed.r.toFixed(1)}`
        },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 15,
        ticks: {
          color: '#667085',
          font: { size: 10, weight: '600' },
          backdropColor: 'transparent'
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: true,
          borderColor: '#667085'
        },
        pointLabels: {
          color: '#0a1930',
          font: { size: 12, weight: '600' }
        }
      }
    }
  };

  const handleDownload = () => {
    const canvas = chartRef.current?.canvas;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'regions-polar-chart.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <ChartCard title="🌐 Polar Area" onDownload={handleDownload}>
      <PolarArea ref={chartRef} data={data} options={options} height={300} />
    </ChartCard>
  );
};

// Data Table Component
const DataTable = () => {
  return (
    <div style={styles.tableContainer}>
      <h3 style={styles.tableTitle}>📋 Detailed Data Table</h3>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.tableHeaderCell}>Year</th>
              <th style={styles.tableHeaderCell}>Category</th>
              <th style={styles.tableHeaderCell}>Industry</th>
              <th style={styles.tableHeaderCell}>Region</th>
              <th style={styles.tableHeaderCell}>Value</th>
            </tr>
          </thead>
          <tbody>
            {STATISTICS_DATA.map((row, idx) => (
              <tr key={idx} style={{...styles.tableRow, backgroundColor: idx % 2 === 0 ? '#f8f9fb' : '#ffffff'}}>
                <td style={styles.tableCell}>{row.year}</td>
                <td style={styles.tableCell}>{row.category}</td>
                <td style={styles.tableCell}>{row.industry || '-'}</td>
                <td style={styles.tableCell}>{row.region}</td>
                <td style={{...styles.tableCell, fontWeight: 'bold', color: '#0369a1'}}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Component
const StatisticsCharts = () => {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Statistical Dashboard</h1>
        <p style={styles.subtitle}>Comprehensive analysis of regional statistics for 2017</p>
      </div>

      {/* Charts Grid */}
      <div style={styles.chartsGrid}>
        <RegionBarChart />
        <RegionLineChart />
        <RegionDoughnutChart />
        <RegionRadarChart />
        <RegionPolarChart />
      </div>

      {/* Data Table */}
      <DataTable />
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
    marginBottom: '48px',
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
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
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
    cursor: 'pointer',
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
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1.5px solid #e5e9f0',
    padding: '28px',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
  },
  tableTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '800',
    color: '#0a1930',
    paddingBottom: '16px',
    borderBottom: '1.5px solid #e5e9f0',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f8f9fb',
  },
  tableHeaderCell: {
    padding: '14px 16px',
    textAlign: 'left',
    fontWeight: '700',
    color: '#0a1930',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    borderBottom: '2px solid #e5e9f0',
  },
  tableRow: {
    borderBottom: '1px solid #e5e9f0',
    transition: 'background-color 0.2s ease',
  },
  tableCell: {
    padding: '14px 16px',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '500',
  },
};

export default StatisticsCharts;
