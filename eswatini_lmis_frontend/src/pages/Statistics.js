import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import statisticsHero from '../assets/stats.png';
import { 
  FaSearch, FaTable, FaChartBar, FaDatabase, FaChevronDown, FaCalendarAlt,
  FaHome, FaGripVertical, FaInfoCircle, FaList, 
  FaDownload, FaSort, FaBookOpen, FaBriefcase, FaUserTie 
} from 'react-icons/fa';
import { Bar, Line, Radar, Pie, Doughnut, PolarArea, Chart as ReactChart } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, 
  LineElement, RadialLinearScale, ArcElement, Title, Tooltip, Legend
} from "chart.js";

const API_ENDPOINT = process.env.REACT_APP_API_URL || 'https://elmiseswatini-backend.onrender.com/api';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, 
  LineElement, RadialLinearScale, ArcElement, Title, Tooltip, Legend
);

// --- 1. DATA VIEW COMPONENT (WITH CUSTOM MODAL POPUP) ---
const DataView = ({ dataRows = [] }) => {
  const [showCount, setShowCount] = useState(false); // Controls the modal visibility

  const handleExportExcel = () => {
    const headers = "Year,Category,Industry,Region,Value\n";
    const csvContent = dataRows.map(r => `${r.year},${r.category},${r.industry},${r.region},${r.value}`).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'LMI_Statistics_Data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.dataViewContainer}>
      
      {/* CUSTOM MODAL POPUP - REPLACES BROWSER ALERT */}
      {showCount && (
        <div style={styles.modalOverlay}>
          <div style={styles.globalOverlay}></div>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Records count</span>
              <button style={styles.modalCloseX} onClick={() => setShowCount(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.modalText}>
                <strong style={{ fontSize: '18px', color: '#103063' }}>{dataRows.length}</strong> records found
              </p>
              <button style={styles.modalOkBtn} onClick={() => setShowCount(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.dataActionBar}>
        <button style={styles.actionBtn} onClick={() => setShowCount(true)}>
          <FaList /> Count
        </button>
        <button style={styles.actionBtn} onClick={handleExportExcel}>
          <FaDownload /> Export to Excel
        </button>
      </div>
      <div style={styles.tableCard}>
        <table style={styles.dataTable}>
          <thead>
            <tr style={styles.dataHeaderRow}>
              {["Year", "Category", "Industry", "Region", "Value"].map((h, i) => (
                <th key={i} style={styles.dataHeaderCell}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {h} <FaSort color="#cbd5e1" size={12} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, idx) => (
              <tr key={idx} style={{ ...(idx % 2 === 0 ? styles.rowEven : styles.rowOdd), ...styles.rowHover }}>
                <td style={styles.dataCell}>{row.year}</td>
                <td style={styles.dataCell}>{row.category}</td>
                <td style={styles.dataCell}>{row.industry}</td>
                <td style={styles.dataCell}>{row.region}</td>
                <td style={styles.dataCell}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DetailTable = ({ rows = [] }) => {
  if (!rows.length) {
    return <div style={styles.emptyState}>No table data available for this selection.</div>;
  }

  return (
    <div style={styles.dataViewContainer}>
      <div style={styles.tableInfoBar}>
        <span style={styles.tableInfoText}>{rows.length} record{rows.length === 1 ? '' : 's'} displayed</span>
        <span style={styles.tableInfoText}>Use the table below to review the selected dataset.</span>
      </div>
      <div style={styles.tableCard}>
        <table style={styles.dataTable}>
          <thead>
            <tr style={styles.dataHeaderRow}>
              {['Year', 'Category', 'Industry', 'Region', 'Value'].map((heading, idx) => (
                <th key={idx} style={styles.dataHeaderCell}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} style={{ ...(idx % 2 === 0 ? styles.rowEven : styles.rowOdd), ...styles.rowHover }}>
                <td style={styles.dataCell}>{row.year}</td>
                <td style={styles.dataCell}>{row.category}</td>
                <td style={styles.dataCell}>{row.industry}</td>
                <td style={styles.dataCell}>{row.region}</td>
                <td style={styles.dataCell}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 2. PIVOT TABLE COMPONENT ---
const PivotTable = () => {
  const headers = ["Administration", "Agriculture", "Construction", "Education Health...", "Finance Ict...", "Industry", "Trade", "Transport...", "All Industries"];
  const rows = [
    { region: "Hhohho", values: [38.512, 19.177, 34.041, 37.154, 47.948, 17.362, 30.905, 36.441, "30.667"] },
    { region: "Lubombo", values: [9.428, 45.027, 11.828, 12.755, 3.822, 14.483, 8.768, 9.37, "15.203"] },
    { region: "Manzini", values: [44.451, 20.241, 48.675, 35.949, 45.077, 54.747, 47.748, 45.519, "42.35"] },
    { region: "Shiselweni", values: [7.609, 15.555, 5.455, 14.143, 3.153, 13.408, 12.579, 8.669, "11.779"] },
  ];

  return (
    <div style={styles.pivotWrapper}>
      <div style={styles.pivotControls}>
        <div style={styles.pivotBox}><div style={styles.pivotBoxLabel}>Available fields</div><div style={styles.dashedContainer}></div></div>
        <div style={styles.pivotBox}>
          <div style={styles.pivotBoxLabel}>Columns</div>
          <div style={styles.dashedContainer}>
            <span style={styles.pivotTag}><FaGripVertical size={10} style={{marginRight: '5px'}}/> Year</span>
            <span style={styles.pivotTag}><FaGripVertical size={10} style={{marginRight: '5px'}}/> Industry Group (EIN)</span>
          </div>
        </div>
        <div style={styles.pivotBox}>
          <div style={styles.pivotBoxLabel}>Rows</div>
          <div style={styles.dashedContainer}><span style={styles.pivotTag}><FaGripVertical size={10} style={{marginRight: '5px'}}/> Region</span></div>
        </div>
      </div>
      <div style={styles.tableScrollWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th rowSpan="2" style={styles.pivotHeaderCellMain}></th>
              <th colSpan={headers.length} style={styles.pivotHeaderYear}>2010</th>
            </tr>
            <tr>{headers.map((h, i) => (<th key={i} style={styles.tableCellSubHeader}>{h}</th>))}</tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={styles.tableCellRegion}>{row.region}</td>
                {row.values.map((v, j) => (<td key={j} style={styles.tableCellData}>{v}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function Statistics() {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedYearDate, setSelectedYearDate] = useState("");
  const [count, setCount] = useState(0);
  const [matchingStats, setMatchingStats] = useState([]); // ← Holds grouped cards
  const [selectedStat, setSelectedStat] = useState(null);
  const [activeTab, setActiveTab] = useState("Chart");
  const [searchTerm, setSearchTerm] = useState("");
  const [chartType, setChartType] = useState("Bar");
  const [selectedDataset, setSelectedDataset] = useState('chartData');
  const [apiStats, setApiStats] = useState(null);
  const [rawDbData, setRawDbData] = useState([]); // ← Raw rows from /api/statistics/raw

  const colors = { primary: '#103063', secondary: '#00AEEF', bgLight: '#F1F5F9', accent: '#4ade80' };

  // ============================================================
  // FALLBACK MOCK DATA (when DB has no records)
  // ============================================================
  const mockData = [
    { id: 1, type: 'report', title: 'Labour force survey 2013 report', description: "Basic statistics on the country's human resource.", category: 'Labour force', year: '2013' },
    { id: 2, type: 'act', title: 'Employment act', description: 'Legislation relating to employment and new provisions.', category: 'Industrial relations', year: '2010' },
    { id: 3, type: 'report', title: '2019 EMPLOYMENT AND WAGES SURVEY KEY FINDINGS', description: 'Key findings from the 2019 survey.', category: 'Employment income', year: '2020' },
    { id: 4, type: 'report', title: 'Skills Development Report', description: 'National skills and training statistics.', category: 'Skills', year: '2024' }
  ];

  // ============================================================
  // EFFECT 1: FETCH RAW STATISTICS FROM BACKEND
  // Endpoint: GET /api/statistics/raw
  // Returns: All rows from statistical_data + upload metadata
  // ============================================================
  useEffect(() => {
    let mounted = true;
    fetch(`${API_ENDPOINT}/statistics/raw`)
      .then(res => res.json())
      .then(data => {
        if (mounted) {
          setRawDbData(Array.isArray(data) ? data : []);
        }
      })
      .catch(err => console.warn('Failed to load raw statistics', err));
    return () => { mounted = false; };
  }, []);

  // ============================================================
  // EFFECT 2: GROUP RAW ROWS BY UPLOAD_ID
  // Input: rawDbData (array of rows with upload_id + metadata)
  // Output: matchingStats (array of card objects)
  //
  // LOGIC:
  // 1. If rawDbData exists, reduce it into an object keyed by upload_id
  // 2. For each row, create or append to the upload_id key
  // 3. Build card title from upload metadata (upload_title, upload_year, etc.)
  // 4. Accumulate all rows for that upload in a rows array
  // 5. Convert object to array and apply filters
  // 6. Set matchingStats with filtered results
  // ============================================================
  useEffect(() => {
    // GROUPING PHASE: Build cards keyed by upload_id
    const source = rawDbData && rawDbData.length
      ? Object.values(
          rawDbData.reduce((acc, row) => {
            // Use upload_id as the key; fallback to 'unknown' if null
            const uploadKey = row.upload_id != null ? String(row.upload_id) : 'unknown';

            // Initialize card for this upload_id if it doesn't exist
            if (!acc[uploadKey]) {
              const uploadId = row.upload_id != null ? row.upload_id : 'unknown';
              const titleCategory = row.upload_category || row.category || 'Statistics';
              const titleYear = row.upload_year || row.year || '';

              // Create card object with aggregated metadata
              acc[uploadKey] = {
                id: uploadId,                    // ← Card ID (same as upload_id)
                upload_id: uploadId,             // ← Upload ID for backend queries
                type: 'report',                  // ← Card type (affects styling)
                title: row.upload_title 
                  || `Upload #${uploadId}${titleYear ? ` — ${titleYear}` : ''}`,
                description: row.upload_description 
                  || `Uploaded dataset containing ${titleCategory} records.`,
                category: titleCategory,
                year: titleYear,
                totalRecords: 0,                 // ← Will be incremented
                rows: []                         // ← Will collect all rows for this upload
              };
            }

            // Append this row to the card's rows array
            acc[uploadKey].rows.push(row);
            acc[uploadKey].totalRecords++;

            return acc;
          }, {})
        )
      : mockData;

    // FILTERING PHASE: Apply user filters
    const filteredData = source.filter((item) => {
      const matchesCategory = selectedCategory === "" || item.category === selectedCategory;
      const matchesYear = selectedYear === "" || item.year === selectedYear;
      const matchesSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) 
        || (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesYear && matchesSearch;
    });

    setMatchingStats(filteredData);

  }, [selectedCategory, selectedYear, searchTerm, rawDbData]);

  // ============================================================
  // EFFECT 3: FETCH CHART DATA FROM BACKEND
  // Used for chart rendering in the detail view
  // ============================================================
  useEffect(() => {
    let mounted = true;
    fetch(`${API_ENDPOINT}/statistics/charts`)
      .then(res => res.json())
      .then(data => { if (mounted) setApiStats(data); })
      .catch(err => console.warn('Failed to load statistics', err));
    return () => { mounted = false; };
  }, []);

  // ============================================================
  // EFFECT 4: COUNTER ANIMATION
  // ============================================================
  useEffect(() => {
    let start = 0;
    const end = 665000;
    const duration = 1500;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(Math.floor(start));
    }, 16);

    return () => clearInterval(timer);
  }, []);

  const categories = ["Employed population", "Employment income", "Equity in employment", "Labour demand", "Labour force", "Labour under-utilisation", "Industrial relations", "Poverty", "Skills"];
  const filterYears = ["2007", "2008", "2009", "2010", "2013", "2014", "2016", "2018", "2020", "2021", "2024", "2025"];
  const availableYears = Array.from(new Set(rawDbData.flatMap((row) => [row.upload_year, row.year]).filter(Boolean).map((year) => String(year).trim()))).sort((a, b) => a.localeCompare(b));

  const yearOptions = availableYears.length ? availableYears : filterYears;
  const detailYears = selectedStat?.rows?.length
    ? Array.from(new Set(selectedStat.rows.map((row) => String(row.year).trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    : yearOptions;

  const renderActiveChart = () => {
    const selectedRows = selectedStat?.rows || [];
    const rawData = selectedRows.length ? selectedRows : rawDbData || [];

    const groupedByYear = rawData.reduce((acc, item) => {
      const yearKey = item.year ? String(item.year).trim() : 'Unknown';
      if (!acc[yearKey]) acc[yearKey] = [];
      acc[yearKey].push(item);
      return acc;
    }, {});

    const years = Object.keys(groupedByYear).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const regions = [...new Set(rawData.map(d => d.region).filter(Boolean))];

const datasets = regions.map(region => {
  return {
    label: region,
    data: years.map(year => {
      const match = groupedByYear[year]?.find(r => r.region === region);
      return match ? Number(match.value) : 0;
    }),
  };
});

const chartDataFromDB = {
  labels: years.length ? years : ['Unknown'],
  datasets
};
    const defaultChartData = {
      labels: ['Admin', 'Agric', 'Industry', 'Trade', 'Finance', 'Education'],
      datasets: [
        { label: 'Hhohho', data: [38.5, 19.1, 34, 30.9, 47.9, 17.3], backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'] },
        { label: 'Manzini', data: [44.4, 20.2, 48.6, 47.7, 45, 54.7], backgroundColor: '#94a3b8' },
      ]
    };

    const isValidChartData = (data) => {
      return data && Array.isArray(data.labels) && Array.isArray(data.datasets) && data.datasets.length > 0;
    };

    const safeChartData = selectedRows.length ? chartDataFromDB : (isValidChartData(apiStats?.chartData) ? apiStats.chartData : defaultChartData);
    const safeDatasets = Array.isArray(safeChartData.datasets) && safeChartData.datasets.length ? safeChartData.datasets : defaultChartData.datasets;
    const firstDataset = safeDatasets[0] || defaultChartData.datasets[0];
    const secondDataset = safeDatasets[1] || defaultChartData.datasets[1];
    const chartLabels = Array.isArray(safeChartData.labels) ? safeChartData.labels : defaultChartData.labels;

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } }
    };

    const getChartData = (data) => {
      if (!isValidChartData(data)) {
        return defaultChartData;
      }
      return {
        labels: Array.isArray(data.labels) ? data.labels : defaultChartData.labels,
        datasets: Array.isArray(data.datasets) && data.datasets.length ? data.datasets : defaultChartData.datasets
      };
    };

    const singleSeries = (cd) => {
      const normalized = getChartData(cd);
      return { labels: normalized.labels, datasets: [ { ...normalized.datasets[0] } ] };
    };

    const scatterData = selectedRows.length ? {
      datasets: [
        { label: 'Values', data: selectedRows.map((row, idx) => ({ x: idx + 1, y: Number(row.value) || 0 })), backgroundColor: '#3b82f6' }
      ]
    } : apiStats?.scatter && Array.isArray(apiStats.scatter.datasets) ? apiStats.scatter : {
      datasets: [
        { label: 'Points', data: [ { x: 1, y: 38.5 }, { x: 2, y: 19.1 }, { x: 3, y: 34 }, { x: 4, y: 30.9 }, { x: 5, y: 47.9 } ], backgroundColor: '#3b82f6' }
      ]
    };

    const bubbleLikeData = selectedRows.length ? {
      labels: selectedRows.map((row, idx) => row.region || `Row ${idx + 1}`),
      datasets: [
        { label: 'Bubble-like', data: selectedRows.map((row, idx) => ({ x: idx + 1, y: Number(row.value) || 0, r: Math.max(5, Math.min(18, Math.abs(Number(row.value) || 0) / 5 || 8)) })), backgroundColor: '#10b981' }
      ]
    } : apiStats?.bubble && Array.isArray(apiStats.bubble.datasets) ? apiStats.bubble : {
      labels: chartLabels,
      datasets: [
        { label: 'Bubble-like', data: Array.isArray(firstDataset.data) ? firstDataset.data : [], backgroundColor: '#10b981', pointRadius: [6, 10, 8, 12, 7, 9] }
      ]
    };

    const treemapData = selectedRows.length ? {
      tree: selectedRows.map((row) => ({ v: Number(row.value) || 0, label: row.industry || row.category || row.region || row.year || 'Row' }))
    } : apiStats?.treemap ? apiStats.treemap : {
      tree: chartLabels.map((l, i) => ({ v: Array.isArray(firstDataset.data) ? firstDataset.data[i] || 0 : 0, label: l }))
    };

    const mixedData = {
      labels: chartLabels,
      datasets: [
        { type: 'bar', label: firstDataset.label || 'Series 1', data: Array.isArray(firstDataset.data) ? firstDataset.data : [], backgroundColor: firstDataset.backgroundColor || '#3b82f6' },
        { type: 'line', label: secondDataset.label || 'Series 2', data: Array.isArray(secondDataset.data) ? secondDataset.data : [], borderColor: '#103063', fill: false }
      ]
    };

    const sankeyData = apiStats?.sankey ? apiStats.sankey : { nodes: [], links: [] };
    const candlestickData = apiStats?.candlestick ? apiStats.candlestick : { datasets: [] };

    const getVisualData = () => {
      switch (selectedDataset) {
        case 'scatter':
          return scatterData;
        case 'bubble':
          return bubbleLikeData;
        case 'treemap':
          return treemapData;
        case 'sankey':
          return sankeyData;
        case 'candlestick':
          return candlestickData;
        default:
          return safeChartData;
      }
    };

    const activeData = getVisualData();
    const activeChartData = getChartData(activeData);

    const optionsHorizontal = { ...baseOptions, indexAxis: 'y' };
    const optionsStacked = { ...baseOptions, scales: { x: { stacked: true }, y: { stacked: true } } };
    const options100Stacked = { ...optionsStacked, plugins: { tooltip: { mode: 'index' }, legend: { position: 'top' } } };
    const optionsMultiAxis = {
      ...baseOptions,
      scales: {
        y: { type: 'linear', display: true, position: 'left' },
        y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
      }
    };

    switch (chartType) {
      case 'Horizontal Bar':
      case 'Column':
      case 'Grouped Column':
        return <Bar data={chartDataFromDB} options={optionsHorizontal} />;
      case 'Stacked Bar':
      case 'Horizontal Stacked Bar':
        return <Bar data={safeChartData} options={optionsStacked} />;
      case '100% Stacked Bar':
      case 'Stacked100 Area':
        return <Bar data={safeChartData} options={options100Stacked} />;
      case 'Grouped Bar':
        return <Bar data={safeChartData} options={baseOptions} />;
      case 'Mixed (Bar+Line)':
        return <Bar data={mixedData} options={baseOptions} />;
      case 'Line':
        return <Line data={activeChartData} options={baseOptions} />;
      case 'Smooth Line':
      case 'Spline':
        return <Line data={activeChartData} options={{ ...baseOptions, elements: { line: { tension: 0.4 } } }} />;
      case 'Area':
      case 'Stacked Area':
        return <Line data={activeChartData} options={{ ...baseOptions, elements: { line: { fill: true } }, ...(chartType === 'Stacked Area' ? { stacked: true } : {}) }} />;
      case 'Stepped Line':
        return <Line data={activeChartData} options={{ ...baseOptions, elements: { line: { stepped: true } } }} />;
      case 'Multi-axis Line':
        return <Line data={{ labels: chartLabels, datasets: [ { label: firstDataset.label || 'Series 1', data: Array.isArray(firstDataset.data) ? firstDataset.data : [], yAxisID: 'y' }, { label: secondDataset.label || 'Series 2', data: Array.isArray(secondDataset.data) ? secondDataset.data : [], yAxisID: 'y1' } ] }} options={optionsMultiAxis} />;
      case 'Radar':
      case 'Radial (Alias)':
        return <Radar data={activeChartData} options={baseOptions} />;
      case 'PolarArea':
      case 'Polar (Alias)':
        return <PolarArea data={singleSeries(activeChartData)} options={baseOptions} />;
      case 'Treemap':
        return <ReactChart type="treemap" data={treemapData} options={baseOptions} />;
      case 'Sankey':
        return <ReactChart type="sankey" data={sankeyData} options={baseOptions} />;
      case 'Candlestick':
        return <ReactChart type="candlestick" data={candlestickData} options={baseOptions} />;
      case 'Pie':
        return <Pie data={singleSeries(activeChartData)} options={baseOptions} />;
      case 'Doughnut':
      case 'Donut (Center)':
        return <Doughnut data={singleSeries(activeChartData)} options={baseOptions} />;
      case 'Scatter (Points)':
        if (selectedDataset === 'scatter') {
          return <Line data={scatterData} options={{ ...baseOptions, elements: { line: { showLine: false } } }} />;
        }
        if (Array.isArray(activeChartData.labels)) {
          const pts = activeChartData.labels.map((l, i) => ({ x: i + 1, y: (activeChartData.datasets?.[0]?.data?.[i]) || 0 }));
          return <Line data={{ datasets: [ { label: 'Points', data: pts } ] }} options={{ ...baseOptions, elements: { line: { showLine: false } } }} />;
        }
        return <Line data={scatterData} options={{ ...baseOptions, elements: { line: { showLine: false } } }} />;
      case 'Bubble-like':
        return <Line data={bubbleLikeData} options={{ ...baseOptions, elements: { point: { hoverRadius: 10 } } }} />;
      case 'Combo (Bar+Line+Area)':
        return <Bar data={{ labels: chartLabels, datasets: [ { type: 'bar', label: firstDataset.label || 'Series 1', data: Array.isArray(firstDataset.data) ? firstDataset.data : [], backgroundColor: firstDataset.backgroundColor || '#3b82f6' }, { type: 'line', label: secondDataset.label || 'Series 2', data: Array.isArray(secondDataset.data) ? secondDataset.data : [], fill: true } ] }} options={baseOptions} />;
      case 'Mini (Sparkline)':
        return <Line data={safeChartData} options={{ ...baseOptions, plugins: { legend: { display: false } }, elements: { point: { radius: 0 } } }} />;
      case 'Heatmap (Simulated)':
        return <Bar data={{ labels: chartLabels, datasets: [ { label: 'Heat', data: Array.isArray(firstDataset.data) ? firstDataset.data : [], backgroundColor: ['#fee2e2','#fecaca','#fca5a5','#f87171','#ef4444','#dc2626'] } ] }} options={baseOptions} />;
      default:
        return <Bar data={activeChartData} options={baseOptions} />;
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div styles={styles.pageWrapper}></div>

      <div style={styles.appContent}></div>
     

      {/* HERO BACKGROUND SECTION */}
<section
  style={{
    ...styles.hero,
    backgroundImage: `url(${statisticsHero})`
  }}
>
  <div style={styles.heroOverlay}></div>

  <div style={{ ...styles.heroInner, position: "relative", zIndex: 2 }}>
    <p style={styles.heroMini}>Kingdom of Eswatini</p>

    <h1 style={styles.heroTitle}>Statistics Dashboard</h1>

    <p style={styles.heroSub}>
      Explore labour market trends, charts, and statistical insights across Eswatini.
    </p>
  </div>
</section>

     

      <main style={styles.mainContent}>
        <main style={styles.contentShell}></main>
        {!selectedStat && (
          <div style={styles.filterCard}>
            <div style={styles.filterGrid}>
              <div style={styles.filterSection}>
                <h4 style={styles.filterLabel}>
  Filter by Area

  <span
    style={styles.badgeGreen}
    onClick={() => setSelectedCategory("")}
  >
    Show All
  </span>
</h4>
                <div style={styles.tagGrid}>
                  {categories.map(cat => (<span key={cat} onClick={() => setSelectedCategory(cat)} style={selectedCategory === cat ? styles.tagActiveGreen : styles.tag}>{cat}</span>))}
                </div>
              </div>
              <div style={styles.filterSection}>
               <h4 style={styles.filterLabel}>
                <FaCalendarAlt style={{ marginRight: '8px', color: '#3b82f6' }} />
                Filter by date

                <span
                  style={styles.badgeBlue}
                  onClick={() => {
                    setSelectedYear("");
                    setSelectedYearDate("");
                  }}
                >
                  Show All
                </span>
              </h4>
                <div style={styles.dateControl}>
                  <input
                    type="date"
                    value={selectedYearDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedYearDate(value);
                      setSelectedYear(value ? value.split('-')[0] : '');
                    }}
                    style={styles.dateInput}
                  />
                </div>
              </div>
            </div>
            <div style={styles.clearFilterWrapper}>
  <button
    style={styles.clearFilterBtn}
    onClick={() => {
      setSelectedCategory("");
      setSelectedYear("");
      setSelectedYearDate("");
      setSearchTerm("");
    }}
  >
    Clear Filters
  </button>
</div>

          </div>
        )}

        {!selectedStat ? (
          <div style={styles.resultsBox}>
            <div style={styles.searchBarContainer}>
                <div style={styles.searchLabel}>Matching Publications</div>
                <div style={styles.searchInputWrapper}><FaSearch color="#94A3B8" /><input style={styles.searchInput} placeholder="Type to search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            </div>
           <div style={{ ...styles.grid, animation: "fadeInUp 0.6s ease-out" }}>
              {matchingStats.map(stat => (
                <div
  key={stat.id}
 onClick={() => {
  setSelectedStat(stat);
}}
  style={stat.type === 'report' ? styles.pubCardYellow : styles.pubCardGreen}
  onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-8px)";
  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)";
  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.5)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = "none";
  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.25)";
}}
>
                  <div style={styles.pubTitle}>
  {stat.title}
</div>

<div style={styles.pubDesc}>
  {stat.description}
</div>

<div
  style={{
    marginTop: "10px",
    fontSize: "12px",
    color: "#103063",
    fontWeight: "bold"
  }}
>
  Records: {stat.totalRecords}
</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.detailBody}>
            <div style={styles.sidebar}>
              <div onClick={() => setActiveTab("Table")} style={activeTab === "Table" ? styles.tabActive : styles.tab}><FaTable size={18} /><span>Table</span></div>
              <div onClick={() => setActiveTab("Chart")} style={activeTab === "Chart" ? styles.tabActive : styles.tab}><FaChartBar size={18} /><span>Chart</span></div>
              <div onClick={() => setActiveTab("Data")} style={activeTab === "Data" ? styles.tabActive : styles.tab}><FaDatabase size={18} /><span>Data</span></div>
            </div>

            <div style={styles.contentArea}>
               <div style={styles.whiteCard}>
                  <div style={styles.detailHeader}>
                    <button onClick={() => setSelectedStat(null)} style={styles.backBtn}>← Back</button>
                    <div>
                      <span style={styles.detailTitleText}>{selectedStat?.title || 'Statistics detail'}</span>
                      <div style={styles.detailSubtitleText}>{selectedStat?.description || 'Data and visuals for the selected dataset.'}</div>
                    </div>
                  </div>

                  {activeTab === "Chart" && (
                    <>
                      <div style={styles.chartControls}>
                        <div style={styles.controlGroup}>
                          <label style={styles.controlLabel}>Chart type</label>
                          <div style={styles.selectWrapper}>
                            <select style={styles.select} value={chartType} onChange={(e) => setChartType(e.target.value)}>
                              <option>Bar</option>
                              <option>Horizontal Bar</option>
                              <option>Stacked Bar</option>
                              <option>Grouped Bar</option>
                              <option>100% Stacked Bar</option>
                              <option>Mixed (Bar+Line)</option>
                              <option>Line</option>
                              <option>Smooth Line</option>
                              <option>Area</option>
                              <option>Stacked Area</option>
                              <option>Stepped Line</option>
                              <option>Multi-axis Line</option>
                              <option>Radar</option>
                              <option>PolarArea</option>
                              <option>Pie</option>
                              <option>Doughnut</option>
                              <option>Donut (Center)</option>
                              <option>Scatter (Points)</option>
                              <option>Bubble-like</option>
                              <option>Column</option>
                              <option>Horizontal Stacked Bar</option>
                              <option>Spline</option>
                              <option>Combo (Bar+Line+Area)</option>
                              <option>Mini (Sparkline)</option>
                              <option>Heatmap (Simulated)</option>
                              <option>Stacked100 Area</option>
                              <option>Polar (Alias)</option>
                              <option>Radial (Alias)</option>
                              <option>Grouped Column</option>
                            </select>
                            <FaChevronDown style={styles.selectIcon} />
                          </div>
                        </div>
                        <div style={styles.controlGroup}>
                          <label style={styles.controlLabel}>Dataset</label>
                          <div style={styles.selectWrapper}>
                            <select style={styles.select} value={selectedDataset} onChange={(e) => setSelectedDataset(e.target.value)}>
                              <option value="chartData">Sectors (chartData)</option>
                              <option value="scatter">Applications (scatter)</option>
                              <option value="bubble">Experience (bubble)</option>
                              <option value="treemap">Treemap (sectors)</option>
                              <option value="sankey">Sankey (flows)</option>
                              <option value="candlestick">Candlestick (OHLC)</option>
                            </select>
                            <FaChevronDown style={styles.selectIcon} />
                          </div>
                        </div>
                        <div style={styles.controlGroup}>
                          <label style={styles.controlLabel}>View</label>
                          <div style={styles.selectWrapper}>
                            <select style={styles.select}>
                              <option>Industry Group (EIN)</option>
                              <option>Year</option>
                            </select>
                            <FaChevronDown style={styles.selectIcon} />
                          </div>
                        </div>
                        <div style={styles.controlGroup}>
                          <label style={styles.controlLabel}>Plot every value of</label>
                          <div style={styles.selectWrapper}>
                            <select style={styles.select}>
                              <option>Region</option>
                              <option>Year</option>
                            </select>
                            <FaChevronDown style={styles.selectIcon} />
                          </div>
                        </div>
                        <div style={styles.controlGroup}>
                          <label style={styles.controlLabel}>For year</label>
                          <div style={styles.selectWrapper}>
                            <select style={styles.select}>
                              {(selectedStat ? detailYears : yearOptions).map(y => <option key={y}>{y}</option>)}
                            </select>
                            <FaChevronDown style={styles.selectIcon} />
                          </div>
                        </div>
                      </div>
                      <div style={{height: '400px', marginTop: '20px'}}>{renderActiveChart()}</div>
                    </>
                  )}
                  {activeTab === "Table" && <DetailTable rows={selectedStat?.rows || []} />}
                  {activeTab === "Data" && <DataView dataRows={selectedStat?.rows || []} />}
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
 pageWrapper: {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  fontFamily: "Inter, sans-serif",
  backgroundColor: "#ffffff",   // ✅ solid white
  position: "relative",
},
mainContentWrapper: {
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(6px)',
  padding: '20px 0',
},
contentShell: {
  backgroundColor: "#ffffff",
  borderRadius: "0px",
  padding: "20px 0",
  width: "100%",
},
  leftAlignedContainer: { width: '90%', maxWidth: '1400px', margin: '0 0 0 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  topHeader: { backgroundColor: '#fff', padding: '15px 0', borderBottom: '1px solid #e2e8f0' },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '15px' },
  flag: { width: '45px', height: 'auto' },
  logoTextWrapper: { display: 'flex', flexDirection: 'column' },
  logoText: { margin: 0, fontSize: '20px', fontWeight: 'bold' },
  logoSub: { margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase' },
  navLinks: { display: 'flex' },
  navLink: { color: '#fff', textDecoration: 'none', padding: '15px 25px', fontSize: '14px', display: 'flex', alignItems: 'center', fontWeight: '500' },
  activeNavLink: { color: '#fff', textDecoration: 'none', padding: '15px 25px', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center' },
  modernSubHeader: { backgroundColor: '#fff', padding: '30px 0', borderBottom: '1px solid #e2e8f0' },
  dashboardTitle: { margin: 0, fontSize: '24px', color: '#103063', fontWeight: '800' },
  dashboardSub: { margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' },
  quickStats: { display: 'flex', gap: '15px' },
  statBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '600', color: '#475569' },
hero: {
  position: "relative",
  minHeight: "350px",
  width: "100%",
  padding: "40px 60px",   // 🔥 reduced from 100px
  color: "white",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  overflow: "hidden",
  marginBottom: "0px",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center"   // keeps content centered vertically
}, 
heroOverlay: {
  position: "absolute",
  inset: 0,

  background:
    "linear-gradient(90deg, rgba(15, 23, 42, 0.85), rgba(2, 6, 23, 0.55))",

  zIndex: 1
},

heroInner: {
  maxWidth: "750px",
  position: "relative",
  zIndex: 2
},

heroMini: {
  fontSize: "13px",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "#93c5fd",
  marginBottom: "10px"
},

heroTitle: {
  fontSize: "40px",
  fontWeight: "600",
  letterSpacing: "0.5px",
  margin: "10px 0",
  lineHeight: "1.2"
},

heroSub: {
  fontSize: "15px",
  color: "rgba(255,255,255,0.85)",
  maxWidth: "600px",
  lineHeight: "1.6"
},

 filterCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', borderTop: '4px solid #4ade80' },
  filterGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "30px",
},
  filterLabel: { fontWeight: 'bold', fontSize: '14px', marginBottom: '15px', color: '#103063' },
  badgeGreen: { backgroundColor: '#4ade80', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', marginLeft: '8px' },
  badgeBlue: { backgroundColor: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', marginLeft: '8px' },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  yearGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' },
  tag: { fontSize: '12px', color: '#64748b', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', border: '1px solid #f1f5f9' },
  tagActiveGreen: { backgroundColor: '#22c55e', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' },
  tagActiveBlue: { backgroundColor: '#3b82f6', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' },
  searchBarContainer: { display: 'flex', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' },
  searchLabel: { padding: '15px 20px', fontWeight: 'bold', fontSize: '14px', borderRight: '1px solid #e2e8f0', minWidth: '200px', color: '#103063' },
  searchInputWrapper: { flex: 1, display: 'flex', alignItems: 'center', padding: '0 15px', backgroundColor: '#F8FAFC' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '10px', fontSize: '14px' },
 grid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
},
pubCardYellow: {
  background: 'rgba(254, 249, 195, 0.6)',
  border: '1px solid rgba(253, 224, 71, 0.6)',
  padding: '20px',
  borderRadius: '14px',
  cursor: 'pointer',
  minHeight: '120px',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
},

pubCardGreen: {
  background: 'rgba(240, 253, 244, 0.6)',
  border: '1px solid rgba(74, 222, 128, 0.6)',
  padding: '20px',
  borderRadius: '14px',
  cursor: 'pointer',
  minHeight: '120px',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
},
  pubTitle: { fontWeight: 'bold', fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase', color: '#103063' },
  pubDesc: { fontSize: '12px', lineHeight: '1.5', color: '#475569' },
  detailBody: { display: 'flex', gap: '20px' },
  sidebar: { width: '80px', backgroundColor: '#fff', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', borderRadius: '12px', height: 'fit-content', overflow: 'hidden' },
  tab: { padding: '25px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: '#94A3B8', fontSize: '11px', gap: '8px' },
  tabActive: { padding: '25px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#00AEEF', borderLeft: '4px solid #00AEEF', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#f8fafc', gap: '8px' },
  contentArea: { flex: 1 },
  whiteCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', borderTop: '4px solid #4ade80' },
  detailHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' },
  detailTitleText: { fontSize: '15px', color: '#103063', fontWeight: '600' },
  detailSubtitleText: { fontSize: '13px', color: '#475569', marginTop: '6px' },
  backBtn: { border: '1px solid #E2E8F0', padding: '6px 15px', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  chartControls: { display: 'flex', gap: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '20px' },
  controlGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  controlLabel: { fontSize: '11px', color: '#103063', fontWeight: '700', textTransform: 'uppercase' },
  selectWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  dateControl: { position: 'relative', display: 'flex', alignItems: 'center', flexGrow: 1, width: '100%' },
  dateInput: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', backgroundColor: '#fff', appearance: 'none', cursor: 'pointer' },
  select: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', backgroundColor: '#fff', appearance: 'none', cursor: 'pointer' },
  selectIcon: { position: 'absolute', right: '12px', pointerEvents: 'none', color: '#94a3b8', fontSize: '10px' },
  dataViewContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  dataActionBar: { display: 'flex', gap: '10px', paddingBottom: '15px', flexWrap: 'wrap' },
  actionBtn: { backgroundColor: '#4ade80', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  tableCard: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'auto', boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)' },
  tableInfoBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: '16px 16px 0 0', border: '1px solid #e2e8f0', borderBottom: 'none' },
  tableInfoText: { fontSize: '13px', color: '#475569' },
  dataTable: { width: '100%', borderCollapse: 'collapse', minWidth: '720px', tableLayout: 'fixed' },
  dataHeaderRow: { backgroundColor: '#f8fafc' },
  dataHeaderCell: { position: 'sticky', top: 0, zIndex: 2, padding: '14px', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', backgroundColor: '#fff' },
  emptyState: { padding: '40px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' },
  dataCell: { padding: '14px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowEven: { backgroundColor: '#fff' },
  rowOdd: { backgroundColor: '#fbfdff' },
  rowHover: { transition: 'background-color 150ms ease', cursor: 'default' },
  pivotWrapper: { marginTop: '10px' },
  pivotControls: { display: 'flex', gap: '15px', marginBottom: '20px' },
  pivotBox: { flex: 1, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' },
  pivotBoxLabel: { fontSize: '11px', fontWeight: 'bold', color: '#103063', marginBottom: '8px', textTransform: 'uppercase' },
  dashedContainer: { minHeight: '40px', border: '1px dashed #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 10px', gap: '10px' },
  pivotTag: { backgroundColor: '#00AEEF', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center' },
  tableScrollWrapper: { overflowX: 'auto', marginTop: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  pivotHeaderCellMain: { backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' },
  pivotHeaderYear: { backgroundColor: '#103063', color: '#fff', padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' },
  tableCellSubHeader: { padding: '10px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', textAlign: 'center', fontSize: '12px', minWidth: '100px' },
  tableCellRegion: { padding: '12px', border: '1px solid #e2e8f0', fontWeight: 'bold', color: '#103063', backgroundColor: '#fff' },
  tableCellData: { padding: '12px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' },

  // --- MODAL STYLES ---
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000
  },
  resultsBox: {
  backgroundColor: "#ffffff",
  padding: "10px 0",
},
  modalContent: {
    backgroundColor: '#fff', borderRadius: '8px', width: '400px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden'
  },
  modalHeader: {
    padding: '12px 20px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  modalTitle: { fontSize: '16px', fontWeight: '600', color: '#475569' },
  modalCloseX: { border: 'none', background: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' },
  modalBody: { padding: '30px', textAlign: 'center' },
  modalText: { fontSize: '15px', color: '#64748b', marginBottom: '20px' },
  modalOkBtn: {
    backgroundColor: '#3b82f6', color: '#fff', border: 'none',
    padding: '8px 40px', borderRadius: '4px', cursor: 'pointer',
    fontWeight: '600', fontSize: '14px'
  },
hero: {
  position: "relative",
  minHeight: "300px",
  padding: "70px 60px",
  color: "white",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  overflow: "hidden",
  marginBottom: "30px",
},
heroOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "transparent",
  zIndex: 1,
},

heroInner: {
  maxWidth: "900px",
},

heroMini: {
  fontSize: "13px",
  color: "#7dd3fc",
  marginBottom: "10px",
},

heroTitle: {
  fontSize: "40px",
  fontWeight: "bold",
  marginBottom: "10px",
},

heroSub: {
  fontSize: "15px",
  color: "rgba(255,255,255,0.75)",
  maxWidth: "700px",
},

pageWrapper: {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  fontFamily: "Inter, sans-serif",
  backgroundColor: "#ffffff",
  position: "relative",
},

badgeGreen: {
  backgroundColor: '#4ade80',
  color: '#fff',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '10px',
  marginLeft: '8px',
  cursor: 'pointer'
},

badgeBlue: {
  backgroundColor: '#3b82f6',
  color: '#fff',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '10px',
  marginLeft: '8px',
  cursor: 'pointer'
},
globalOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.45)",
  zIndex: 0,
},

clearFilterWrapper: {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '20px',
},

filterCard: {
  backgroundColor: "#ffffff",
  padding: "25px",
  borderRadius: "14px",
  border: "1px solid #e2e8f0",
  marginBottom: "25px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
},
clearFilterBtn: {
  backgroundColor: '#103063',
  color: '#fff',
  border: 'none',
  padding: '10px 18px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: '0.3s ease',
},
pubCardYellow: {
  background: "linear-gradient(135deg, #e2e8f0, #b9c8f6)",
  border: "1px solid rgba(59,130,246,0.35)",
  padding: "20px",
  borderRadius: "14px",
  cursor: "pointer",
  minHeight: "120px",
  transition: "all 0.3s ease",
  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
},
pubCardGreen: {
  background: "linear-gradient(135deg, #dbeafe, #7dd3fc)",
  border: "1px solid rgba(59,130,246,0.4)",
  padding: "20px",
  borderRadius: "14px",
  cursor: "pointer",
  minHeight: "120px",
  transition: "all 0.3s ease",
  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
},
appContent: {
  position: "relative",
  zIndex: 1,
}


}
const animationStyle = document.createElement("style");
animationStyle.innerHTML = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
document.head.appendChild(animationStyle);;