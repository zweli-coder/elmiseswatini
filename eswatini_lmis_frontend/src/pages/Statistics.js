import React, { useState, useEffect, useMemo } from "react";
import statisticsHero from '../assets/education.jpg';
import { 
  FaSearch, FaTable, FaChartBar, FaDatabase, FaChevronDown, FaCalendarAlt,
  FaGripVertical, FaList, 
  FaDownload, FaSort
} from 'react-icons/fa';
import { Bar, Line, Radar, Pie, Doughnut, PolarArea, Chart as ReactChart } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, ArcElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { API_ENDPOINT } from '../services/api';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, ArcElement, Title, Tooltip, Legend, Filler
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
const PivotTable = ({ data = [] }) => {
  const [rowField, setRowField] = useState('region');
  const [colField, setColField] = useState('year');
  const [valueField, setValueField] = useState('value');
  const [aggFunction, setAggFunction] = useState('SUM');

  const fields = useMemo(() => (data.length > 0 ? Object.keys(data[0]).filter(f => !['id', 'upload_id', 'created_at'].includes(f)) : []), [data]);
  const numericFields = fields.filter(f => data.some(row => typeof row[f] === 'number' || !isNaN(parseFloat(row[f]))));
  const categoricalFields = fields.filter(f => !numericFields.includes(f) && f !== 'value');

  const pivotData = useMemo(() => {
    if (!data.length || !rowField || !colField || !valueField) return { rows: [], cols: [], totals: {} };

    const rowValues = [...new Set(data.map(item => item[rowField]))].sort();
    const colValues = [...new Set(data.map(item => item[colField]))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));

    const matrix = rowValues.map(rowVal => {
      const rowData = { rowHeader: rowVal };
      colValues.forEach(colVal => {
        const matching = data.filter(item => item[rowField] === rowVal && item[colField] === colVal);
        let aggregatedValue = 0;
        if (matching.length > 0) {
          const values = matching.map(item => parseFloat(item[valueField]) || 0);
          switch (aggFunction) {
            case 'SUM':
              aggregatedValue = values.reduce((a, b) => a + b, 0);
              break;
            case 'AVG':
              aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
              break;
            case 'COUNT':
              aggregatedValue = matching.length;
              break;
            case 'MEDIAN':
              const sorted = values.sort((a, b) => a - b);
              const mid = Math.floor(sorted.length / 2);
              aggregatedValue = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
              break;
            default:
              aggregatedValue = values.reduce((a, b) => a + b, 0);
          }
        }
        rowData[colVal] = aggFunction === 'COUNT' ? aggregatedValue : aggregatedValue.toFixed(2);
      });
      return rowData;
    });
    
    const colTotals = {};
    colValues.forEach(col => {
      colTotals[col] = matrix.reduce((sum, row) => sum + (parseFloat(row[col]) || 0), 0);
    });

    matrix.forEach(row => {
      row.rowTotal = colValues.reduce((sum, col) => sum + (parseFloat(row[col]) || 0), 0);
    });

    const grandTotal = Object.values(colTotals).reduce((sum, val) => sum + val, 0);

    return { 
      rows: matrix, 
      cols: colValues, 
      totals: {
        cols: colTotals,
        grandTotal
      } 
    };
  }, [data, rowField, colField, valueField, aggFunction]);

  const handleExport = () => {
    let csv = `${rowField},${pivotData.cols.join(',')},Row Total\n`;
    
    pivotData.rows.forEach(row => {
      const values = pivotData.cols.map(col => row[col] || '0');
      csv += `${row.rowHeader},${values.join(',')},${row.rowTotal.toFixed(2)}\n`;
    });

    csv += `Column Total,${pivotData.cols.map(col => (pivotData.totals.cols[col] || 0).toFixed(2)).join(',')},${pivotData.totals.grandTotal.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'pivot_table_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.pivotWrapper}>
      <div style={styles.pivotControlsV2}>
        <label style={styles.pivotControlGroup}>
          <span style={styles.pivotBoxLabel}>Rows</span>
          <select style={styles.pivotSelect} value={rowField} onChange={e => setRowField(e.target.value)}>
            {categoricalFields.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
          </select>
        </label>
        <label style={styles.pivotControlGroup}>
          <span style={styles.pivotBoxLabel}>Columns</span>
          <select style={styles.pivotSelect} value={colField} onChange={e => setColField(e.target.value)}>
            {categoricalFields.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
          </select>
        </label>
        <label style={styles.pivotControlGroup}>
          <span style={styles.pivotBoxLabel}>Values</span>
          <select style={styles.pivotSelect} value={valueField} onChange={e => setValueField(e.target.value)}>
            {numericFields.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
          </select>
        </label>
        <label style={styles.pivotControlGroup}>
          <span style={styles.pivotBoxLabel}>Aggregate</span>
          <select style={styles.pivotSelect} value={aggFunction} onChange={e => setAggFunction(e.target.value)}>
            <option value="SUM">Sum</option>
            <option value="AVG">Average</option>
            <option value="COUNT">Count</option>
            <option value="MEDIAN">Median</option>
          </select>
        </label>
        <div style={styles.pivotExportContainer}>
          <button onClick={handleExport} style={styles.exportBtn}>
            <FaDownload style={{ marginRight: 8 }} />
            Export CSV
          </button>
        </div>
      </div>
      <div style={styles.tableScrollWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.pivotHeaderCellMain}>{`${rowField} / ${colField}`}</th>
              {pivotData.cols.map((col, i) => (<th key={i} style={styles.tableCellSubHeader}>{col}</th>))}
              <th style={{...styles.tableCellSubHeader, ...styles.totalCellHeader}}>Row Total</th>
            </tr>
          </thead>
          <tbody>
            {pivotData.rows.map((row, i) => (
              <tr key={i}>
                <td style={styles.tableCellRegion}>{row.rowHeader}</td>
                {pivotData.cols.map((col, j) => (<td key={j} style={styles.tableCellData}>{row[col]}</td>))}
                <td style={{...styles.tableCellData, ...styles.totalCell}}>{row.rowTotal.toFixed(2)}</td>
              </tr>
            ))}
            <tr style={styles.totalRow}>
              <td style={{...styles.tableCellRegion, ...styles.totalCellHeader}}>Column Total</td>
              {pivotData.cols.map((col, j) => (<td key={j} style={{...styles.tableCellData, ...styles.totalCell}}>{(pivotData.totals.cols[col] || 0).toFixed(2)}</td>))}
              <td style={{...styles.tableCellData, ...styles.grandTotalCell}}>{pivotData.totals.grandTotal.toFixed(2)}</td>
            </tr>
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
  const [matchingStats, setMatchingStats] = useState([]); // ← Holds grouped cards
  const [selectedStat, setSelectedStat] = useState(null);
  const [activeTab, setActiveTab] = useState("Chart");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDataset] = useState('chartData');
  const [chartType, setChartType] = useState("Smooth Line");
  const [apiStats, setApiStats] = useState(null);
  const [rawDbData, setRawDbData] = useState([]); // ← Raw rows from /api/statistics/raw

  // New state for dynamic chart controls
  const [chartXAxis, setChartXAxis] = useState('year');
  const [chartYAxis] = useState('value');
  const [chartGroupBy, setChartGroupBy] = useState('region');

  // ============================================================
  // FALLBACK MOCK DATA (when DB has no records)
  // ============================================================
  const mockData = useMemo(
    () => [
      { id: 1, type: 'report', title: 'Labour force survey 2013 report', description: "Basic statistics on the country's human resource.", category: 'Labour force', year: '2013' },
      { id: 2, type: 'act', title: 'Employment act', description: 'Legislation relating to employment and new provisions.', category: 'Industrial relations', year: '2010' },
      { id: 3, type: 'report', title: '2019 EMPLOYMENT AND WAGES SURVEY KEY FINDINGS', description: 'Key findings from the 2019 survey.', category: 'Employment income', year: '2020' },
      { id: 4, type: 'report', title: 'Skills Development Report', description: 'National skills and training statistics.', category: 'Skills', year: '2024' }
    ],
    []
  );

  // ============================================================
  // EFFECT 1: FETCH RAW STATISTICS FROM BACKEND
  // Endpoint: GET /api/statistics/raw
  // Returns: All rows from statistical_data + upload metadata
  // ============================================================
  useEffect(() => {
    let mounted = true;
    // FIX: Do not add /api here, as API_ENDPOINT should already have it.
    fetch(`${API_ENDPOINT}/statistics/raw`) // This was already correct, ensuring it stays this way.
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

  }, [selectedCategory, selectedYear, searchTerm, rawDbData, mockData]);

  // ============================================================
  // EFFECT 3: FETCH CHART DATA FROM BACKEND
  // Used for chart rendering in the detail view
  // ============================================================
  useEffect(() => {
    let mounted = true;
    // FIX: Do not add /api here.
    fetch(`${API_ENDPOINT}/statistics/charts`) // This was also correct, ensuring it stays this way.
      .then(res => res.json())
      .then(data => { if (mounted) setApiStats(data); })
      .catch(err => console.warn('Failed to load statistics', err));
    return () => { mounted = false; };
  }, []);

  // ============================================================
  // EFFECT 4: COUNTER ANIMATION
  // ============================================================
  useEffect(() => {
  }, []);

  const categories = ["Employed population", "Employment income", "Equity in employment", "Labour demand", "Labour force", "Labour under-utilisation", "Industrial relations", "Poverty", "Skills"];
  const filterYears = ["2007", "2008", "2009", "2010", "2013", "2014", "2016", "2018", "2020", "2021", "2024", "2025"];
  const availableYears = Array.from(new Set(rawDbData.flatMap((row) => [row.upload_year, row.year]).filter(Boolean).map((year) => String(year).trim()))).sort((a, b) => a.localeCompare(b));

  const yearOptions = availableYears.length ? availableYears : filterYears;
  const detailYears = selectedStat?.rows?.length
    ? Array.from(new Set(selectedStat.rows.map((row) => String(row.year).trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    : yearOptions;

  const chartFieldOptions = selectedStat?.rows?.length > 0 ? Object.keys(selectedStat.rows[0]).filter(k => !['id', 'upload_id', 'created_at', 'upload_title', 'upload_description', 'upload_category', 'upload_year'].includes(k)) : ['year', 'category', 'industry', 'region', 'value'];

  const renderActiveChart = () => {
    const selectedRows = selectedStat?.rows || [];
    const rawData = selectedRows.length ? selectedRows : rawDbData || [];

    // --- DYNAMIC CHART DATA LOGIC ---
    const labels = [...new Set(rawData.map(row => String(row[chartXAxis] || 'N/A').trim()))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const groups = [...new Set(rawData.map(row => String(row[chartGroupBy] || 'Default').trim()))];

    const groupedData = rawData.reduce((acc, row) => {
      const xValue = String(row[chartXAxis] || 'N/A').trim();
      const groupValue = String(row[chartGroupBy] || 'Default').trim();
      const yValue = parseFloat(row[chartYAxis]) || 0;

      if (!acc[xValue]) acc[xValue] = {};
      acc[xValue][groupValue] = (acc[xValue][groupValue] || 0) + yValue;
      return acc;
    }, {});

    const PALETTE = ['#3b82f6', '#f97316', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#ef4444'];
    const datasets = groups.map((group, idx) => ({
      label: group,
      data: labels.map(label => (groupedData[label]?.[group] || 0).toFixed(2)),
      backgroundColor: PALETTE[idx % PALETTE.length],
      borderColor: PALETTE[idx % PALETTE.length],
      fill: chartType.toLowerCase().includes('area'),
    }));

    const chartDataFromDB = { labels, datasets };
    // --- END DYNAMIC LOGIC ---

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
      };
      return {
        labels: Array.isArray(data.labels) ? data.labels : defaultChartData.labels,
        datasets: Array.isArray(data.datasets) && data.datasets.length ? data.datasets : defaultChartData.datasets
      };
    };

    const singleSeries = (cd) => {
      const normalized = getChartData(cd);
      return { labels: normalized.labels, datasets: [ { ...normalized.datasets[0], data: normalized.datasets[0].data.map(v => Number(v)) } ] };
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
    getChartData(activeData);

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
        return <Bar data={chartDataFromDB} options={chartType === 'Horizontal Bar' ? optionsHorizontal : baseOptions} />;
      case 'Stacked Bar':
      case 'Horizontal Stacked Bar':
        return <Bar data={safeChartData} options={optionsStacked} />;
      case '100% Stacked Bar':
      case 'Stacked100 Area':
        return <Bar data={safeChartData} options={options100Stacked} />;
      case 'Grouped Column':
      case 'Grouped Bar': // Alias for Grouped Column
        return <Bar data={safeChartData} options={baseOptions} />;
      case 'Mixed (Bar+Line)':
        return <Bar data={mixedData} options={baseOptions} />;
      case 'Line':
        return <Line data={chartDataFromDB} options={baseOptions} />;
      case 'Smooth Line':
      case 'Spline':
        return <Line data={chartDataFromDB} options={{ ...baseOptions, elements: { line: { tension: 0.4 } } }} />;
      case 'Area':
      case 'Stacked Area':
        return <Line data={chartDataFromDB} options={{ ...baseOptions, elements: { line: { fill: true } }, scales: { y: { stacked: chartType === 'Stacked Area' } } }} />;
      case 'Stepped Line':
        return <Line data={chartDataFromDB} options={{ ...baseOptions, elements: { line: { stepped: true } } }} />;
      case 'Multi-axis Line':
        return <Line data={mixedData} options={optionsMultiAxis} />;
      case 'Radar':
      case 'Radial (Alias)':
        return <Radar data={chartDataFromDB} options={baseOptions} />;
      case 'PolarArea':
      case 'Polar (Alias)':
        return <PolarArea data={singleSeries(chartDataFromDB)} options={baseOptions} />;
      case 'Treemap':
        return <ReactChart type="treemap" data={treemapData} options={baseOptions} />;
      case 'Sankey':
        return <ReactChart type="sankey" data={sankeyData} options={baseOptions} />;
      case 'Candlestick':
        return <ReactChart type="candlestick" data={candlestickData} options={baseOptions} />;
      case 'Pie':
        return <Pie data={singleSeries(chartDataFromDB)} options={baseOptions} />;
      case 'Doughnut':
      case 'Donut (Center)':
        return <Doughnut data={singleSeries(chartDataFromDB)} options={baseOptions} />;
      case 'Scatter (Points)':
        if (Array.isArray(chartDataFromDB.labels)) {
          const datasets = chartDataFromDB.datasets.map(ds => ({
            ...ds,
            data: ds.data.map((val, i) => ({ x: i, y: val }))
          }));
          return <Line data={{ datasets }} options={{ ...baseOptions, elements: { line: { showLine: false } } }} />;
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
        return <Bar data={chartDataFromDB} options={baseOptions} />;
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
                  }}
                >
                  Show All
                </span>
              </h4>
                <div style={styles.selectWrapper}>
                  <select
                    style={styles.select}
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                    }}
                  >
                    <option value="">All Years</option>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <FaChevronDown style={styles.selectIcon} />
                </div>
              </div>
            </div>
            <div style={styles.clearFilterWrapper}>
  <button
    style={styles.clearFilterBtn}
    onClick={() => {
      setSelectedCategory("");
      setSelectedYear("");
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
              <div onClick={() => setActiveTab("Pivot")} style={activeTab === "Pivot" ? styles.tabActive : styles.tab}><FaGripVertical size={18} /><span>Pivot</span></div>
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
                          <div style={{...styles.selectWrapper, flex: 1.5}}>
                            <select style={styles.select} value={chartType} onChange={(e) => setChartType(e.target.value)}>
                              <option>Smooth Line</option>
                              <option>Line</option>
                              <option>Area</option>
                              <option>Stacked Area</option>
                              <option>Column</option>
                              <option>Horizontal Bar</option>
                              <option>Stacked Bar</option>
                              <option>100% Stacked Bar</option>
                              <option>Grouped Bar</option>
                              <option>Mixed (Bar+Line)</option>
                              <option>Stepped Line</option>
                              <option>Multi-axis Line</option>
                              <option>Scatter (Points)</option>
                              <option>Bubble-like</option>
                              <option>Combo (Bar+Line+Area)</option>
                              <option>Radar</option>
                              <option>PolarArea</option>
                              <option>Pie</option>
                              <option>Doughnut</option>
                            </select>
                            <FaChevronDown style={styles.selectIcon} />
                          </div>
                        </div>
                        <div style={styles.controlGroup}>
                          <label style={styles.controlLabel}>View (X-Axis)</label>
                          <div style={styles.selectWrapper}>
                            <select style={styles.select} value={chartXAxis} onChange={e => setChartXAxis(e.target.value)}>
                              {chartFieldOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                            </select>
                            <FaChevronDown style={styles.selectIcon} />
                          </div>
                        </div>
                        <div style={styles.controlGroup}>
                          <label style={styles.controlLabel}>Plot every value of (Group By)</label>
                          <div style={styles.selectWrapper}>
                            <select style={styles.select} value={chartGroupBy} onChange={e => setChartGroupBy(e.target.value)}>
                              {chartFieldOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                            </select>
                            <FaChevronDown style={styles.selectIcon} />
                          </div>
                        </div>
                        <div style={styles.controlGroup}>
                          <label style={styles.controlLabel}>For year</label>
                          <div style={styles.selectWrapper}>
                            <select style={styles.select} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                              <option value="">All Years</option>
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
                  {activeTab === "Pivot" && <PivotTable data={selectedStat?.rows || []} />}
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
 pageWrapperBase: {
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
heroBase: {
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
heroOverlayBase: {
  position: "absolute",
  inset: 0,

  background:
    "linear-gradient(90deg, rgba(15, 23, 42, 0.85), rgba(2, 6, 23, 0.55))",

  zIndex: 1
},
 
heroInnerBase: {
  maxWidth: "750px",
  position: "relative",
  zIndex: 2
},

heroMiniBase: {
  fontSize: "13px",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "#93c5fd",
  marginBottom: "10px"
},
 
heroTitleBase: {
  fontSize: "40px",
  fontWeight: "600",
  letterSpacing: "0.5px",
  margin: "10px 0",
  lineHeight: "1.2"
},
 
heroSubBase: {
  fontSize: "15px",
  color: "rgba(255,255,255,0.85)",
  maxWidth: "600px",
  lineHeight: "1.6"
},

 filterCardBase: { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', borderTop: '4px solid #4ade80' },
  filterGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "30px",
},
  filterLabel: { fontWeight: 'bold', fontSize: '14px', marginBottom: '15px', color: '#103063' },
  badgeGreenBase: { backgroundColor: '#4ade80', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', marginLeft: '8px' },
  badgeBlueBase: { backgroundColor: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', marginLeft: '8px' },
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
pubCardYellowBase: {
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
 
pubCardGreenBase: {
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
  pivotControlsV2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    alignItems: 'flex-end',
  },
  pivotExportContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: '2px', // Align with other inputs
  },
  exportBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: '1px solid #10b981', background: '#ecfdf5', color: '#065f46', cursor: 'pointer', fontWeight: 700,
  },
  pivotControlGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  pivotSelect: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', backgroundColor: '#fff', appearance: 'none', cursor: 'pointer' },
  pivotBoxLabel: { fontSize: '11px', fontWeight: 'bold', color: '#103063', textTransform: 'uppercase' },
  tableScrollWrapper: { overflowX: 'auto', marginTop: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '13px' },
  pivotHeaderCellMain: { position: 'sticky', left: 0, zIndex: 2, backgroundColor: '#ffffff', padding: '14px 16px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', fontWeight: 700, color: '#0f172a' },
  tableCellSubHeader: { padding: '14px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', color: '#475569', textAlign: 'center', fontSize: '12px', minWidth: '110px', fontWeight: 600 },
  tableCellRegion: { position: 'sticky', left: 0, zIndex: 1, padding: '14px 16px', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #e2e8f0', fontWeight: 600, color: '#1e3a8a', backgroundColor: '#f8fafc' },
  tableCellData: { padding: '14px 16px', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', textAlign: 'center', color: '#475569' },
  totalRow: { backgroundColor: '#f0f9ff', fontWeight: 'bold' },
  totalCellHeader: { position: 'sticky', left: 0, zIndex: 1, backgroundColor: '#f0f9ff', color: '#0c4a6e', fontWeight: 700, padding: '14px 16px', borderRight: '1px solid #e2e8f0' },
  totalCell: { color: '#0c4a6e', fontWeight: 700, padding: '14px 16px', borderRight: '1px solid #e2e8f0', textAlign: 'center' },
  grandTotalCell: { backgroundColor: '#dbeafe', color: '#4338ca', fontWeight: 800, fontSize: '14px', padding: '14px 16px', textAlign: 'center' },

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