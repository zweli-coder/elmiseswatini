import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  FaCloudUploadAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowLeft,
  FaFileAlt,
  FaFileCsv,
  FaFileCode,
  FaUpload,
  FaEye,
  FaTrash,
  FaSpinner,
  FaChartBar,
  FaTable,
  FaEdit
} from 'react-icons/fa';

const API_BASE = process.env.REACT_APP_API_URL || 'https://elmiseswatini-backend.onrender.com/api';
export const ESWATINI_REGIONS = ['Hhohho', 'Manzini', 'Shiselweni', 'Lubombo'];

const authHeader = () => {
  const token = localStorage.getItem('lmis_token') || '';
  const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
  return raw ? { Authorization: `Bearer ${raw}` } : {};
};

const normalizeKey = (key = '') => key
  .replace(/\uFEFF/g, '')
  .trim()
  .replace(/\s+/g, ' ')
  .replace(/[_-]/g, ' ')
  .toLowerCase();

const parseStatisticalValue = (rawValue) => {
  if (rawValue === '' || rawValue == null) return null;
  let text = String(rawValue).trim();
  if (!text) return null;
  text = text.replace(/,/g, '').replace(/\u2011|\u202F/g, '');
  if (/^(n\/a|na|null|undefined|not available)$/i.test(text)) return null;
  const number = Number(text);
  return Number.isNaN(number) ? null : number;
};

const isLikelyYear = (value) => {
  const text = String(value).trim();
  return /^\d{4}$/.test(text) || /^\d{2}$/.test(text);
};

const tryNormalizeRowByPosition = (row, metadata = {}) => {
  if (!row || typeof row !== 'object') return null;
  const values = Object.values(row)
    .map((v) => (v === undefined || v === null ? '' : String(v).trim()))
    .filter((value) => value !== '');

  if (values.length < 2) return null;
  const lastValue = parseStatisticalValue(values[values.length - 1]);
  if (lastValue == null) return null;

  if (values.length === 2) {
    if (isLikelyYear(values[0])) {
      return { year: values[0], category: '', industry: '', region: '', value: lastValue };
    }
    return { year: metadata.year || null, category: metadata.category || '', industry: '', region: values[0], value: lastValue };
  }

  if (values.length === 3) {
    if (isLikelyYear(values[0])) {
      return { year: values[0], category: values[1], industry: '', region: '', value: lastValue };
    }
    return { year: metadata.year || null, category: '', industry: '', region: values[0], value: lastValue };
  }

  if (values.length === 4) {
    if (isLikelyYear(values[0])) {
      return { year: values[0], category: values[1], industry: values[2], region: '', value: lastValue };
    }
    return { year: metadata.year || null, category: values[0], industry: values[1], region: values[2], value: lastValue };
  }

  if (values.length >= 5 && isLikelyYear(values[0])) {
    return { year: values[0], category: values[1], industry: values[2], region: values[3], value: lastValue };
  }

  return null;
};

export const normalizeUploadRow = (row, metadata = {}) => {
  if (!row || typeof row !== 'object') return null;
  const map = {};
  Object.entries(row).forEach(([key, value]) => {
    map[normalizeKey(String(key))] = value;
  });

  const getValue = (keys) => keys.reduce((result, key) => {
    if (result !== undefined) return result;
    return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined;
  }, undefined);

  const rawYear = getValue(['year', 'yr', 'fiscal year', 'financial year', 'period']);
  const rawCategory = getValue(['category', 'cat', 'statistics category', 'data category', 'indicator', 'group', 'sub category', 'sub-category']);
  const rawIndustry = getValue(['industry', 'sector', 'industry group', 'industry_group', 'economic sector', 'sector name']);
  const rawRegion = getValue(['region', 'area', 'province', 'district', 'region name', 'location', 'state']);
  const rawValue = getValue(['value', 'val', 'amount', 'count', 'figure', 'quantity', 'total', 'number', 'percent', 'percentage']);

  const parsedValue = parseStatisticalValue(rawValue);
  const fallback = tryNormalizeRowByPosition(row, metadata);

  const year = rawYear ?? metadata.year ?? fallback?.year;
  const category = rawCategory ?? metadata.category ?? fallback?.category ?? '';
  const industry = rawIndustry ?? fallback?.industry ?? '';
  const region = rawRegion ?? fallback?.region ?? '';
  const value = parsedValue == null ? fallback?.value : parsedValue;

  if (!year || value == null || !isLikelyYear(year)) return null;

  return {
    year: String(year).trim(),
    category: category == null ? '' : String(category).trim(),
    industry: industry == null ? '' : String(industry).trim(),
    region: region == null ? '' : String(region).trim(),
    value
  };
};

const isHeaderRow = (row) => {
  if (!Array.isArray(row)) return false;
  const low = row.map((cell) => String(cell || '').trim().toLowerCase());
  const keywords = ['year', 'category', 'industry', 'region', 'value', 'amount', 'figure', 'sector', 'indicator'];
  const matches = low.filter((cell) => keywords.some((key) => cell.includes(key)));
  return matches.length >= 2;
};

const isGenericHeaderRow = (row, nextRow) => {
  if (!Array.isArray(row)) return false;
  const normalized = row.map((cell) => String(cell || '').trim().toLowerCase()).join(' ');
  const genericHeader = ['column', 'field', 'header', 'name', 'code'].some((keyword) => normalized.includes(keyword));
  if (!genericHeader) return false;
  if (!Array.isArray(nextRow)) return false;
  return nextRow.some((cell) => parseStatisticalValue(cell) !== null || isLikelyYear(cell));
};

const shouldSkipRow = (row) => {
  if (!Array.isArray(row)) return false;
  const meaningful = row.map((cell) => String(cell || '').trim()).filter((text) => text !== '');
  if (meaningful.length === 0) return true;
  if (meaningful.length === 1 && !isLikelyYear(meaningful[0]) && parseStatisticalValue(meaningful[0]) == null) return true;
  return false;
};

const buildHeaders = (row) => row.map((cell, index) => {
  const text = String(cell || '').trim();
  if (text) return text;
  return `column_${index + 1}`;
});

const buildRowObjects = (headers, rows) => rows
  .filter((row) => Array.isArray(row) && row.some((cell) => cell !== ''))
  .map((row) => {
    const rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = row[index] !== undefined && row[index] !== null ? String(row[index]).trim() : '';
    });
    return rowObj;
  });

const parseWithSheetJS = (buffer, isText = false) => {
  const wb = XLSX.read(buffer, {
    type: isText ? 'string' : 'array',
    cellDates: true
  });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '', header: 1, blankrows: false });
  const rows = rawRows.map((row) => Array.isArray(row) ? row : [row]);

  let headers = [];
  let dataRows = rows;
  const headerRowIndex = rows.findIndex((row, index) => index < 5 && (isHeaderRow(row) || isGenericHeaderRow(row, rows[index + 1])));

  if (headerRowIndex !== -1) {
    headers = buildHeaders(rows[headerRowIndex]);
    dataRows = rows.slice(headerRowIndex + 1);
  } else {
    const firstDataRow = rows.findIndex((row) => !shouldSkipRow(row));
    const maxColumns = rows.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0);
    headers = Array.from({ length: maxColumns }, (_, index) => `column_${index + 1}`);
    dataRows = firstDataRow > 0 ? rows.slice(firstDataRow) : rows;
  }

  return { headers, rows: buildRowObjects(headers, dataRows) };
};

const parseJson = (text) => {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.data ?? data.rows ?? [];
  const headers = arr.length ? Object.keys(arr[0]) : [];
  return { headers, rows: arr };
};

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const getFieldCandidates = (parsed) => {
  if (!parsed || !parsed.headers || !parsed.rows) return { numericHeaders: [], categoryHeaders: [] };
  const numericHeaders = parsed.headers.filter((header) => {
    const key = normalizeKey(header);
    if (/year|period|date|time/i.test(key)) return false;
    return parsed.rows.some((row) => parseStatisticalValue(row[header]) != null);
  });
  const categoryHeaders = parsed.headers.filter((header) => !numericHeaders.includes(header));
  return { numericHeaders, categoryHeaders };
};

const buildChartData = (parsed, xField, yField, groupField, chartType) => {
  if (!parsed || !parsed.rows || !xField || !yField) return null;

  const rows = parsed.rows || [];
  const labelsSet = new Set();
  const buckets = {};
  const pieBuckets = {};

  rows.forEach((row) => {
    const xValue = row[xField];
    const yValue = parseStatisticalValue(row[yField]);
    if (yValue == null) return;
    const label = String(xValue ?? '').trim();
    const group = groupField ? String(row[groupField] ?? 'Other').trim() : 'Total';
    if (!label) return;

    if (chartType === 'pie') {
      const key = groupField ? group : label;
      pieBuckets[key] = (pieBuckets[key] || 0) + yValue;
      return;
    }

    labelsSet.add(label);
    if (!buckets[label]) buckets[label] = {};
    buckets[label][group] = (buckets[label][group] || 0) + yValue;
  });

  if (chartType === 'pie') {
    const labels = Object.keys(pieBuckets).sort();
    const data = labels.map((label) => pieBuckets[label]);
    return {
      labels,
      datasets: [{
        label: yField,
        data,
        backgroundColor: labels.map((_, index) => ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'][index % 6]),
        borderColor: '#fff',
        borderWidth: 1,
      }]
    };
  }

  const labels = [...labelsSet].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const groups = groupField ? Array.from(new Set(Object.values(buckets).flatMap((item) => Object.keys(item)))) : ['Total'];

  const datasets = groups.map((group, idx) => ({
    label: groupField ? group : yField,
    data: labels.map((label) => (buckets[label]?.[group] || 0)),
    backgroundColor: ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'][idx % 6],
    borderColor: '#0f172a',
    borderWidth: 1,
    fill: false,
  }));

  return { labels, datasets };
};

const getSuggestedChartTypes = (parsed, xField) => {
  if (!parsed || !xField) return ['bar', 'line', 'pie'];
  const key = normalizeKey(xField);
  if (/year|period|date/.test(key)) return ['line', 'bar', 'pie'];
  return ['bar', 'pie', 'line'];
};

const resolveDefaultChartFields = (parsed) => {
  if (!parsed) return { xField: '', yField: '', groupField: '' };
  const { numericHeaders, categoryHeaders } = getFieldCandidates(parsed);
  const xField = categoryHeaders.find((h) => /(year|period|date)/i.test(normalizeKey(h)))
    || categoryHeaders.find((h) => /(region|category|industry)/i.test(normalizeKey(h)))
    || parsed.headers[0] || '';
  const yField = numericHeaders.includes('value') ? 'value' : numericHeaders[0] || numericHeaders[0] || parsed.headers.find((h) => !categoryHeaders.includes(h)) || '';
  const groupField = categoryHeaders.find((h) => /(category|industry|region)/i.test(normalizeKey(h)) && h !== xField) || categoryHeaders[1] || '';
  return { xField, yField, groupField };
};

export default function AdminStatistics() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [normalizedRows, setNormalizedRows] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadError, setUploadError] = useState('');
  const [uploadStats, setUploadStats] = useState({ parsed_rows: 0, normalized_rows: 0, inserted_rows: 0 });

  const [pasteText, setPasteText] = useState('');
  const [pasteStatus, setPasteStatus] = useState(null);
  const [pasteLoading, setPasteLoading] = useState(false);

  const [manualRow, setManualRow] = useState({ year: '', category: '', industry: '', region: '', value: '' });
  const [manualStatus, setManualStatus] = useState(null);
  const [manualLoading, setManualLoading] = useState(false);

  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceCategory, setResourceCategory] = useState('Statistics');
  const [resourceYear, setResourceYear] = useState('');
  const STAT_CATEGORIES = ['Statistics', 'Dataset', 'Indicator', 'Report'];
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [savedUpload, setSavedUpload] = useState(null);
  const [analysisMode, setAnalysisMode] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [xAxisField, setXAxisField] = useState('');
  const [yAxisField, setYAxisField] = useState('');
  const [groupByField, setGroupByField] = useState('');
  const chartRef = useRef(null);

  const [tab, setTab] = useState('file');

  const [rawStats, setRawStats] = useState([]);
  const [loadingRaw, setLoadingRaw] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const loadUploadedFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch(`${API_BASE}/admin/statistics-uploads-list`);
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      setUploadedFiles(Array.isArray(data)
        ? data.map((file) => ({
            ...file,
            filePath: file.file_path || file.filePath || '',
            filename: file.filename || (file.file_path || file.filePath || '').split('/').pop() || 'unknown',
            originalName: file.originalName || file.originalname || file.filename || (file.file_path || file.filePath || '').split('/').pop() || 'unknown',
            uploadedAt: file.created_at || file.uploadedAt || null,
          }))
        : []);
    } catch (err) {
      console.warn('Failed to load uploaded files', err.message);
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  const loadRawStats = useCallback(async () => {
    setLoadingRaw(true);
    try {
      const res = await fetch(`${API_BASE}/admin/statistics`, {
        headers: { ...authHeader() }
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      setRawStats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load raw stats', err.message);
    } finally {
      setLoadingRaw(false);
    }
  }, []);

  useEffect(() => {
    loadRawStats();
    loadUploadedFiles();
  }, [loadRawStats, loadUploadedFiles]);

  useEffect(() => {
    if (!parsed) {
      setXAxisField('');
      setYAxisField('');
      setGroupByField('');
      return;
    }
    const { xField, yField, groupField } = resolveDefaultChartFields(parsed);
    setXAxisField(xField);
    setYAxisField(yField);
    setGroupByField(groupField);
    setChartType(/year|period|date/.test(normalizeKey(xField)) ? 'line' : 'bar');
  }, [parsed]);

  const analyzeUploadedFile = async (upload) => {
    if (!upload?.id) return;
    setUploadError('');
    setUploadStatus('parsing');
    try {
      const res = await fetch(`${API_BASE}/admin/statistics-uploads/${upload.id}`, {
        headers: { ...authHeader() }
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server ${res.status}`);
      }
      const body = await res.json();
      const rows = Array.isArray(body.rows) ? body.rows : [];
      if (!rows.length) throw new Error('No rows available for this upload.');

      setParsed({
        headers: rows.length ? Object.keys(rows[0]) : [],
        rows,
      });
      setSavedUpload(body.upload || upload);
      setAnalysisMode(true);
      setUploadStatus('ready');
    } catch (err) {
      setUploadError(err.message);
      setUploadStatus('error');
    }
  };

  const buildChartPreview = () => buildChartData(parsed, xAxisField, yAxisField, groupByField, chartType);

  const exportChartPNG = () => {
    if (!chartRef.current) return;
    const image = chartRef.current.toBase64Image();
    const link = document.createElement('a');
    link.href = image;
    link.download = 'statistics-chart.png';
    link.click();
  };

  const exportChartPDF = () => {
    if (!chartRef.current) return;
    const image = chartRef.current.toBase64Image();
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Chart Export</title></head><body style="margin:0;padding:0;"><img src="${image}" style="width:100%;height:auto;" /></body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const processFile = useCallback(async (f) => {
    setFile(f);
    setParsed(null);
    setNormalizedRows([]);
    setUploadStatus('parsing');
    setUploadError('');
    setShowPreview(false);

    try {
      const ext = f.name.split('.').pop().toLowerCase();
      let result;
      if (ext === 'csv') result = parseWithSheetJS(await f.text(), true);
      else if (ext === 'xlsx' || ext === 'xls') result = parseWithSheetJS(await f.arrayBuffer());
      else if (ext === 'json') result = parseJson(await f.text());
      else throw new Error('Unsupported format. Use CSV, XLSX, or JSON.');

      if (!result.rows.length) throw new Error('File is empty or could not be parsed.');
      setParsed(result);
      setNormalizedRows(result.rows
        .map((row) => normalizeUploadRow(row, { year: resourceYear, category: resourceCategory }))
        .filter(Boolean));
      setUploadStatus('ready');
    } catch (err) {
      setUploadError(err.message);
      setUploadStatus('error');
    }
  }, [resourceYear, resourceCategory]);

  const resetFile = () => {
    setFile(null);
    setParsed(null);
    setNormalizedRows([]);
    setFileUploaded(false);
    setSavedUpload(null);
    setUploadedFileId(null);
    setAnalysisMode(false);
    setUploadStatus('idle');
    setUploadError('');
    setShowPreview(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const saveFile = async () => {
    if (!parsed || !file) return;
    if (!resourceTitle || !resourceTitle.trim()) {
      setUploadError('Please provide a title for the resource.');
      setUploadStatus('error');
      return;
    }
    setUploadStatus('uploading');
    setUploadError('');
    try {
      const fileData = new FormData();
      fileData.append('file', file);
      fileData.append('title', resourceTitle);
      fileData.append('description', resourceDescription);
      fileData.append('category', resourceCategory || 'Statistics');
      fileData.append('year', resourceYear || parsed.rows[0]?.year || '');

      const saveRes = await fetch(`${API_BASE}/admin/statistics-file`, {
        method: 'POST',
        headers: { ...authHeader() },
        body: fileData
      });
      if (!saveRes.ok) {
        const saveBody = await saveRes.json().catch(() => ({}));
        const details = saveBody.detected_headers ? ` Detected headers: ${saveBody.detected_headers.join(', ')}` : '';
        throw new Error(`${saveBody.error || `File store failed ${saveRes.status}`}${details}`);
      }
      const body = await saveRes.json().catch(() => ({}));
      const upload = body?.upload || null;
      const id = upload?.id || upload?.file_id || null;
      const insertedRows = Number(body?.inserted_rows ?? 0);

      setSavedUpload(upload);
      setUploadedFileId(id);
      setFileUploaded(true);
      setUploadStats({
        parsed_rows: Number(body?.parsedRows ?? body?.rowCount ?? 0),
        normalized_rows: normalizedRows.length,
        inserted_rows: insertedRows
      });

      await loadUploadedFiles();
      setUploadStatus(insertedRows > 0 ? 'success' : 'file_saved');
    } catch (err) {
      setUploadError(err.message);
      setUploadStatus('error');
    }
  };

  const publishParsedRows = async () => {
    if (uploadStatus === 'uploading' || uploadStatus === 'success') {
      return;
    }

    if (!uploadedFileId && !normalizedRows.length) {
      const sampleHeaders = parsed?.headers?.join(', ') || '';
      setUploadError(`No valid rows found. Detected columns: ${sampleHeaders}`);
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    try {
      let res;
      if (uploadedFileId) {
        res = await fetch(`${API_BASE}/admin/statistics-uploads/${uploadedFileId}/process`, {
          method: 'POST',
          headers: { ...authHeader() }
        });
      } else {
        const payload = { data: normalizedRows };
        res = await fetch(`${API_BASE}/admin/statistics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }

      setUploadStatus('success');
      await loadRawStats();
    } catch (err) {
      setUploadError(err.message);
      setUploadStatus('error');
    }
  };

  const submitPaste = async () => {
    if (!fileUploaded) {
      setPasteStatus({ type: 'error', message: 'Please upload a file first.' });
      return;
    }
    if (!pasteText.trim()) return;
    setPasteLoading(true);
    setPasteStatus(null);
    try {
      const rows = pasteText
        .trim()
        .split('\n')
        .filter(line => line.trim() && !line.toLowerCase().startsWith('year'))
        .map(line => {
          const [year, category, industry, region, value] = line.split(',').map(p => p.trim());
          if (!year || !value) throw new Error('Each row needs at least Year and Value.');
          return { year, category, industry, region, value: Number(value) };
        });
      if (!rows.length) throw new Error('No valid rows found.');
      const payload = { data: rows };
      if (uploadedFileId) payload.upload_id = uploadedFileId;
      const res = await fetch(`${API_BASE}/admin/statistics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      setPasteStatus({ type: 'success', message: `Published ${rows.length} rows.` });
      setPasteText('');
      await loadRawStats();
    } catch (err) {
      setPasteStatus({ type: 'error', message: err.message });
    } finally {
      setPasteLoading(false);
    }
  };

  const submitManual = async () => {
    if (!fileUploaded) {
      setManualStatus({ type: 'error', message: 'Please upload a file first.' });
      return;
    }
    setManualLoading(true);
    setManualStatus(null);
    try {
      const row = {
        year: manualRow.year.trim(),
        category: manualRow.category.trim(),
        industry: manualRow.industry.trim(),
        region: manualRow.region.trim(),
        value: manualRow.value === '' ? null : Number(manualRow.value)
      };
      if (!row.year || !row.category || !row.industry || !row.region || row.value == null || Number.isNaN(row.value)) {
        throw new Error('Please complete all fields and enter a valid numeric value.');
      }
      const payload = { data: [row] };
      if (uploadedFileId) payload.upload_id = uploadedFileId;
      const res = await fetch(`${API_BASE}/admin/statistics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      setManualStatus({ type: 'success', message: 'Row published successfully.' });
      setManualRow({ year: '', category: '', industry: '', region: '', value: '' });
      await loadRawStats();
    } catch (err) {
      setManualStatus({ type: 'error', message: err.message });
    } finally {
      setManualLoading(false);
    }
  };

  const deleteRow = async (id) => {
    if (!window.confirm('Delete this row?')) return;
    setDeleteLoading(id);
    try {
      const res = await fetch(`${API_BASE}/admin/statistics/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeader() }
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server ${res.status}`);
      }
      await loadRawStats();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const fileIcon = (name = '') => {
    const ext = (name.split('.').pop() || '').toLowerCase();
    if (ext === 'csv') return <FaFileCsv style={{ color: '#22c55e', fontSize: 24 }} />;
    if (ext === 'json') return <FaFileCode style={{ color: '#f59e0b', fontSize: 24 }} />;
    return <FaFileAlt style={{ color: '#3b82f6', fontSize: 24 }} />;
  };

  return (
    <div style={s.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .as-spin { animation: spin 0.85s linear infinite; }
        .as-card:hover { box-shadow: 0 12px 36px rgba(15,23,42,0.12) !important; }
        .as-tab:hover { background: #f1f5f9 !important; }
        .as-btn:hover { opacity: 0.9; }
        .as-drop:hover { border-color: #0ea5e9 !important; background: #f0f9ff !important; }
      `}</style>

      <div style={s.topBar}>
        <button style={s.backBtn} onClick={() => navigate('/admin')}>
          <FaArrowLeft style={{ marginRight: 8 }} /> Back to Dashboard
        </button>
        <div style={s.topBarRight}>
          <FaChartBar style={{ color: '#0ea5e9', marginRight: 8 }} />
          <span style={s.topBarTitle}>Statistics Admin</span>
        </div>
      </div>

      <div style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroContent}>
          <p style={s.heroTag}>Admin · Data Management</p>
          <h1 style={s.heroTitle}>Publish Statistical Data</h1>
          <p style={s.heroSub}>Upload files, paste CSV rows, or add a manual record. Data is stored in the statistical_data table and shown on the Statistics page.</p>
        </div>
      </div>

      <div style={s.body}>
        <div style={{ ...s.card, borderTop: '4px solid #0ea5e9' }} className="as-card">
          <div style={s.tabBar}>
            <button style={{ ...s.tabBtn, ...(tab === 'file' ? s.tabBtnActive : {}) }} className="as-tab" onClick={() => setTab('file')}>
              <FaUpload style={{ marginRight: 8 }} /> Upload File
            </button>
            <button style={{ ...s.tabBtn, ...(tab === 'paste' ? s.tabBtnActive : {}) }} className="as-tab" onClick={() => setTab('paste')}>
              <FaTable style={{ marginRight: 8 }} /> Paste CSV
            </button>
            <button style={{ ...s.tabBtn, ...(tab === 'manual' ? s.tabBtnActive : {}) }} className="as-tab" onClick={() => setTab('manual')}>
              <FaEdit style={{ marginRight: 8 }} /> Manual Entry
            </button>
          </div>

          {tab === 'file' && (
            <>
              <p style={s.cardSub}>Upload a statistics dataset and save it with publication-style metadata. After saving the file upload, paste or add manual rows linked to the same upload.</p>

              {uploadStatus === 'error' && uploadError && (
                <div style={s.errorPill}><FaExclamationCircle style={{ marginRight: 8 }} />{uploadError}</div>
              )}

              <div style={{ display: 'grid', gap: 18, marginBottom: 20 }}>
                <label style={s.fieldLabel}>
                  <span style={s.fieldLabelText}>Publication Title</span>
                  <input
                    type="text"
                    placeholder="e.g., Labour Market Report 2024"
                    value={resourceTitle}
                    onChange={e => setResourceTitle(e.target.value)}
                    style={s.fieldInput}
                  />
                </label>

                <label style={s.fieldLabel}>
                  <span style={s.fieldLabelText}>Resource Description</span>
                  <textarea
                    placeholder="Provide a detailed description of the publication..."
                    value={resourceDescription}
                    onChange={e => setResourceDescription(e.target.value)}
                    style={{ ...s.fieldInput, minHeight: 110, resize: 'vertical' }}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 16 }}>
                  <label style={s.fieldLabel}>
                    <span style={s.fieldLabelText}>Document Category</span>
                    <select
                      value={resourceCategory}
                      onChange={e => setResourceCategory(e.target.value)}
                      style={s.fieldInput}
                    >
                      <option value="">-- Select Category --</option>
                      {STAT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>

                  <label style={s.fieldLabel}>
                    <span style={s.fieldLabelText}>Release Year</span>
                    <input
                      type="number"
                      placeholder="e.g., 2024"
                      value={resourceYear}
                      onChange={e => setResourceYear(e.target.value)}
                      style={s.fieldInput}
                    />
                  </label>
                </div>

                <label style={s.fieldLabel}>
                  <span style={s.fieldLabelText}>Attach Statistics File</span>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={e => e.target.files[0] && processFile(e.target.files[0])}
                    style={{ ...s.fieldInput, padding: '14px 12px', borderStyle: 'dashed', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                  />
                </label>

                {file && (
                  <p style={{ margin: 0, color: '#475569', fontSize: 13 }}>Selected file: <strong>{file.name}</strong></p>
                )}

                {uploadStatus === 'parsing' && (
                  <div style={s.centerBox}><FaSpinner className="as-spin" style={{ fontSize: 24, color: '#0ea5e9' }} /><p style={s.centerText}>Parsing file…</p></div>
                )}

                {uploadStatus === 'ready' && parsed && (
                  <div style={{ ...s.successBanner, backgroundColor: '#eff6ff', color: '#0369a1', borderColor: '#bfdbfe' }}>
                    <FaCheckCircle style={{ marginRight: 10, fontSize: 18 }} /> File ready to save with metadata.
                  </div>
                )}

                <button
                  style={{
                    ...s.primaryBtn,
                    width: '100%',
                    opacity: (!file || uploadStatus === 'parsing') ? 0.6 : 1,
                    cursor: (!file || uploadStatus === 'parsing') ? 'not-allowed' : 'pointer'
                  }}
                  onClick={saveFile}
                  disabled={!file || uploadStatus === 'parsing'}
                >
                  <FaCloudUploadAlt style={{ marginRight: 8 }} /> Save Upload Metadata
                </button>
              </div>

              {parsed && (
                <div style={s.parsedPanel}>
                  <div style={s.fileRow}>
                    {fileIcon(file?.name)}
                    <div style={s.fileInfo}>
                      <span style={s.fileName}>{file?.name}</span>
                      <span style={s.fileMeta}>{parsed.rows.length} rows · {parsed.headers.length} columns</span>
                    </div>
                    {uploadStatus === 'ready' && <button style={s.iconBtn} onClick={resetFile} title="Remove"><FaTrash style={{ color: '#dc2626' }} /></button>}
                    {uploadStatus === 'success' && <FaCheckCircle style={{ color: '#22c55e', fontSize: 24 }} />}
                  </div>

                  <div style={s.colRow}>{parsed.headers.map(h => <span key={h} style={s.colPill}>{h}</span>)}</div>

                  {uploadStatus !== 'success' && (
                    <button style={s.ghostBtn} onClick={() => setShowPreview(v => !v)}>
                      <FaEye style={{ marginRight: 6 }} />{showPreview ? 'Hide preview' : 'Preview rows'}
                    </button>
                  )}

                  {showPreview && uploadStatus !== 'success' && (
                    <div style={s.tableWrap}>
                      <table style={s.table}>
                        <thead><tr>{parsed.headers.map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                        <tbody>
                          {parsed.rows.slice(0, 8).map((row, idx) => (
                            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                              {parsed.headers.map(h => <td key={h} style={s.td}>{String(row[h] ?? '')}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parsed.rows.length > 8 && <p style={s.moreRows}>…and {parsed.rows.length - 8} more rows</p>}
                    </div>
                  )}

                  {uploadStatus === 'uploading' && (
                    <div style={s.centerBox}><FaSpinner className="as-spin" style={{ fontSize: 22, color: '#0ea5e9' }} /><p style={s.centerText}>Publishing…</p></div>
                  )}

                  {uploadStatus === 'success' && (
                    <div style={s.successBanner}><FaCheckCircle style={{ marginRight: 10, fontSize: 18 }} />Upload metadata saved. You can now publish the parsed rows into the Statistics table.</div>
                  )}

                  {uploadStatus === 'error' && (
                    <div style={s.errorPill}><FaExclamationCircle style={{ marginRight: 8 }} />{uploadError}</div>
                  )}

                  {uploadStatus === 'ready' && (
                    <div style={s.actionRow}>
                      <button style={s.cancelBtn} onClick={resetFile}>Cancel</button>
                      <button style={s.primaryBtn} className="as-btn" onClick={saveFile}><FaUpload style={{ marginRight: 8 }} /> Save Upload Metadata</button>
                    </div>
                  )}

                  {savedUpload && (
                    <div style={{ ...s.alertBase, ...s.alertSuccess, marginTop: 16, borderLeft: '4px solid #16a34a' }}>
                      <div style={{ marginBottom: 8, fontWeight: 600, color: '#0f172a' }}>Upload saved successfully</div>
                      {savedUpload.id != null && (
                        <div style={{ fontSize: 14, color: '#334155' }}><strong>Upload ID:</strong> {savedUpload.id}</div>
                      )}
                      <div style={{ fontSize: 14, color: '#334155' }}><strong>Title:</strong> {savedUpload.title || resourceTitle}</div>
                      <div style={{ fontSize: 14, color: '#334155' }}><strong>Category:</strong> {savedUpload.category || resourceCategory}</div>
                      <div style={{ fontSize: 14, color: '#334155' }}><strong>Year:</strong> {savedUpload.year || resourceYear || 'N/A'}</div>
                      {savedUpload.file_path && (
                        <div style={{ marginTop: 6 }}>
                          <a href={savedUpload.file_path} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9' }}>
                            View uploaded file
                          </a>
                        </div>
                      )}
                      <div style={{ marginTop: 10, fontSize: 13, color: '#0f172a' }}>
                        {uploadStatus === 'success'
                          ? 'Upload metadata saved. Use the Publish button below to move the parsed rows into the Statistics table.'
                          : 'Next, add the parsed rows from this upload into the Statistics table.'}
                      </div>
                    </div>
                  )}

                  {savedUpload && parsed && (
                    <div style={{ marginTop: 18, padding: 18, borderRadius: 18, backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>Analyze this dataset</div>
                          <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                            Auto-detected {parsed.headers.length} columns and {parsed.rows.length} rows.
                          </div>
                        </div>
                        <button style={{ ...s.ghostBtn, whiteSpace: 'nowrap' }} onClick={() => setAnalysisMode((current) => !current)}>
                          <FaChartBar style={{ marginRight: 8 }} />{analysisMode ? 'Hide analysis' : 'View analysis'}
                        </button>
                      </div>

                      {analysisMode && (
                        <div style={{ marginTop: 18 }}>
                          <div style={s.analysisGrid}>
                            <label style={s.fieldLabel}>
                              <span style={s.fieldLabelText}>X-axis field</span>
                              <select style={s.fieldInput} value={xAxisField} onChange={(e) => setXAxisField(e.target.value)}>
                                {parsed.headers.map((header) => <option key={header} value={header}>{header}</option>)}
                              </select>
                            </label>
                            <label style={s.fieldLabel}>
                              <span style={s.fieldLabelText}>Y-axis field</span>
                              <select style={s.fieldInput} value={yAxisField} onChange={(e) => setYAxisField(e.target.value)}>
                                {parsed.headers.map((header) => <option key={header} value={header}>{header}</option>)}
                              </select>
                            </label>
                            <label style={s.fieldLabel}>
                              <span style={s.fieldLabelText}>Group by</span>
                              <select style={s.fieldInput} value={groupByField} onChange={(e) => setGroupByField(e.target.value)}>
                                <option value="">None</option>
                                {parsed.headers.filter((header) => header !== xAxisField).map((header) => <option key={header} value={header}>{header}</option>)}
                              </select>
                            </label>
                            <label style={s.fieldLabel}>
                              <span style={s.fieldLabelText}>Chart type</span>
                              <select style={s.fieldInput} value={chartType} onChange={(e) => setChartType(e.target.value)}>
                                {getSuggestedChartTypes(parsed, xAxisField).map((type) => (
                                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                ))}
                              </select>
                            </label>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                            <div style={{ ...s.alertBase, ...s.alertSuccess, borderLeft: '4px solid #0ea5e9', backgroundColor: '#eff6ff', color: '#0f172a' }}>
                              <span style={{ fontWeight: 700 }}>Suggested chart:</span> {chartType.charAt(0).toUpperCase() + chartType.slice(1)} using {xAxisField} and {yAxisField}.
                            </div>
                          </div>

                          {(() => {
                            const chartData = buildChartPreview();
                            if (!chartData || !chartData.labels || !chartData.labels.length) {
                              return <div style={s.noticeBanner}>Unable to create a chart preview for the selected fields. Please choose a numeric Y field and a valid X field.</div>;
                            }
                            return (
                              <>
                                <div style={s.chartFrame}>
                                  {chartType === 'bar' && <Bar ref={chartRef} data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }, tooltip: { mode: 'index', intersect: false } }, scales: { x: { title: { display: true, text: xAxisField } }, y: { title: { display: true, text: yAxisField } } } }} />}
                                  {chartType === 'line' && <Line ref={chartRef} data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }, tooltip: { mode: 'index', intersect: false } }, scales: { x: { title: { display: true, text: xAxisField } }, y: { title: { display: true, text: yAxisField } } } }} />}
                                  {chartType === 'pie' && <Pie ref={chartRef} data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: (context) => `${context.label}: ${context.parsed}` } } } }} />}
                                </div>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14 }}>
                                  <button style={s.primaryBtn} onClick={exportChartPNG}><FaFileAlt style={{ marginRight: 8 }} /> Export PNG</button>
                                  <button style={s.ghostBtn} onClick={exportChartPDF}><FaFileAlt style={{ marginRight: 8 }} /> Export PDF</button>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {uploadStatus === 'file_saved' && (
                    <>
                      <div style={{ ...s.alertBase, ...s.alertWarning, marginTop: 16, borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ marginBottom: 8, fontWeight: 600, color: '#92400e' }}>Upload metadata saved. No rows were inserted yet.</div>
                        <div style={{ fontSize: 13, color: '#78350f' }}>
                          Parsed rows: {uploadStats.parsed_rows}, normalized rows: {uploadStats.normalized_rows}, inserted rows: {uploadStats.inserted_rows}.
                        </div>
                        <div style={{ marginTop: 6, fontSize: 13, color: '#78350f' }}>
                          The file is stored and ready to process. Click Publish rows to move the parsed data into the Statistics table.
                        </div>
                      </div>
                      <div style={s.actionRow}>
                        <button style={s.cancelBtn} onClick={resetFile}>Upload another</button>
                        <button
                          style={s.primaryBtn}
                          className="as-btn"
                          onClick={publishParsedRows}
                          disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}
                        ><FaUpload style={{ marginRight: 8 }} /> Publish rows</button>
                      </div>
                    </>
                  )}

                  {uploadStatus === 'success' && (
                    <div style={s.actionRow}>
                      <button style={s.cancelBtn} onClick={resetFile}>Upload another</button>
                      <Link to="/statistics" style={s.primaryBtn}><FaChartBar style={{ marginRight: 8 }} /> View Statistics Page</Link>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {tab === 'paste' && (
            <>
              <div style={s.hintBox}>
                <p style={s.hintTitle}>CSV Structure</p>
                <p style={s.hintText}>Year, Category, Industry, Region, Value</p>
                <p style={{ ...s.hintText, marginTop: 4, fontStyle: 'italic', fontSize: 12, color: '#94a3b8' }}>Example: 2024, Employment income, Agriculture, Manzini, 22.5</p>
              </div>

              {!fileUploaded && (
                <div style={s.noticeBanner}><FaExclamationCircle style={{ marginRight: 8 }} /> Upload a file first to enable paste or manual entry.</div>
              )}

              {pasteStatus && (
                <div style={{ ...s.alertBase, ...(pasteStatus.type === 'success' ? s.alertSuccess : s.alertError) }}>
                  {pasteStatus.type === 'success' ? <FaCheckCircle style={{ marginRight: 8 }} /> : <FaExclamationCircle style={{ marginRight: 8 }} />}
                  {pasteStatus.message}
                </div>
              )}

              <textarea
                style={s.textarea}
                placeholder="Paste CSV rows here...\n2024, Employment income, Agriculture, Manzini, 22.5"
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                disabled={!fileUploaded}
              />

              <button
                style={{ ...s.primaryBtn, width: '100%', justifyContent: 'center', opacity: (!fileUploaded || pasteLoading || !pasteText.trim()) ? 0.6 : 1, cursor: (!fileUploaded || pasteLoading || !pasteText.trim()) ? 'not-allowed' : 'pointer' }}
                onClick={submitPaste}
                disabled={!fileUploaded || pasteLoading || !pasteText.trim()}
              >
                {pasteLoading ? <><FaSpinner className="as-spin" style={{ marginRight: 8 }} /> Publishing…</> : <><FaCloudUploadAlt style={{ marginRight: 8 }} /> Publish Pasted Rows</>}
              </button>
            </>
          )}

          {tab === 'manual' && (
            <>
              <div style={s.hintBox}>
                <p style={s.hintTitle}>Manual Data Entry</p>
                <p style={s.hintText}>Select the Eswatini region, then enter year, category, industry and a numeric value. Published rows become available for chart analysis on the Statistics page.</p>
              </div>

              {!fileUploaded && (
                <div style={s.noticeBanner}><FaExclamationCircle style={{ marginRight: 8 }} /> Upload a file first to enable manual entry.</div>
              )}

              {manualStatus && (
                <div style={{ ...s.alertBase, ...(manualStatus.type === 'success' ? s.alertSuccess : s.alertError) }}>
                  {manualStatus.type === 'success' ? <FaCheckCircle style={{ marginRight: 8 }} /> : <FaExclamationCircle style={{ marginRight: 8 }} />}
                  {manualStatus.message}
                </div>
              )}

              <div style={s.manualGrid}>
                {['year', 'category', 'industry', 'region', 'value'].map(field => (
                  <label key={field} style={s.fieldLabel}>
                    <span style={s.fieldLabelText}>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                    {field === 'region' ? (
                      <select
                        style={s.fieldInput}
                        value={manualRow.region}
                        onChange={e => setManualRow(prev => ({ ...prev, region: e.target.value }))}
                        disabled={!fileUploaded}
                      >
                        <option value="">Select region</option>
                        {ESWATINI_REGIONS.map(regionOption => (
                          <option key={regionOption} value={regionOption}>{regionOption}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        style={s.fieldInput}
                        type={field === 'value' ? 'number' : 'text'}
                        value={manualRow[field]}
                        onChange={e => setManualRow(prev => ({ ...prev, [field]: e.target.value }))}
                        placeholder={field === 'value' ? 'Numeric value' : `Enter ${field}`}
                        disabled={!fileUploaded}
                      />
                    )}
                  </label>
                ))}
              </div>

              <button
                style={{ ...s.primaryBtn, width: '100%', justifyContent: 'center', opacity: !fileUploaded || manualLoading ? 0.6 : 1, cursor: !fileUploaded || manualLoading ? 'not-allowed' : 'pointer' }}
                onClick={submitManual}
                disabled={!fileUploaded || manualLoading}
              >
                {manualLoading ? <><FaSpinner className="as-spin" style={{ marginRight: 8 }} /> Publishing…</> : <><FaUpload style={{ marginRight: 8 }} /> Publish Manual Row</>}
              </button>
            </>
          )}
        </div>

        <div style={s.card} className="as-card">
          <h2 style={s.cardTitle}><FaTable style={{ marginRight: 10, color: '#0ea5e9' }} /> Manage Statistical Rows</h2>
          <p style={s.cardSub}>View and delete rows stored in the <strong>statistical_data</strong> table.</p>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button style={s.primaryBtn} onClick={loadRawStats}><FaSpinner className={loadingRaw ? 'as-spin' : ''} style={{ marginRight: 8 }} /> Refresh</button>
          </div>

          <div style={{ marginTop: 16 }}>
            {loadingRaw ? <p style={{ color: '#64748b' }}>Loading rows…</p> : (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>ID</th>
                      <th style={s.th}>Year</th>
                      <th style={s.th}>Category</th>
                      <th style={s.th}>Industry</th>
                      <th style={s.th}>Region</th>
                      <th style={s.th}>Value</th>
                      <th style={s.th}>Created</th>
                      <th style={s.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawStats.length === 0 ? (
                      <tr><td colSpan="8" style={s.td}>No rows found.</td></tr>
                    ) : rawStats.map(row => (
                      <tr key={row.id}>
                        <td style={s.td}>{row.id}</td>
                        <td style={s.td}>{row.year}</td>
                        <td style={s.td}>{row.category}</td>
                        <td style={s.td}>{row.industry}</td>
                        <td style={s.td}>{row.region}</td>
                        <td style={s.td}>{row.value}</td>
                        <td style={s.td}>{row.created_at ? new Date(row.created_at).toLocaleString() : ''}</td>
                        <td style={s.td}>
                          <button style={{ ...s.cancelBtn, padding: '8px 10px' }} onClick={() => deleteRow(row.id)} disabled={deleteLoading === row.id}>
                            {deleteLoading === row.id ? <FaSpinner className="as-spin" /> : <><FaTrash style={{ marginRight: 6 }} />Delete</>}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div style={s.card} className="as-card">
          <h2 style={s.cardTitle}><FaCloudUploadAlt style={{ marginRight: 10, color: '#10b981' }} /> Uploaded Statistics Files</h2>
          <p style={s.cardSub}>Review all statistics files stored in <strong>uploads/statistics</strong> directory.</p>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button style={s.primaryBtn} onClick={loadUploadedFiles}><FaSpinner className={loadingFiles ? 'as-spin' : ''} style={{ marginRight: 8 }} /> Refresh</button>
          </div>

          <div style={{ marginTop: 16 }}>
            {loadingFiles ? (
              <p style={{ color: '#64748b' }}>Loading files…</p>
            ) : uploadedFiles.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#64748b' }}>
                <FaFileAlt style={{ fontSize: 40, color: '#cbd5e1', marginBottom: 12 }} />
                <p style={{ margin: 0, fontSize: 14 }}>No uploaded files found</p>
              </div>
            ) : (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Filename</th>
                      <th style={s.th}>Title</th>
                      <th style={s.th}>Category</th>
                      <th style={s.th}>Type</th>
                      <th style={s.th}>Size</th>
                      <th style={s.th}>Uploaded</th>
                      <th style={s.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedFiles.map((file) => (
                      <tr key={file.id || file.filename}>
                        <td style={s.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {fileIcon(file.filename)}
                            <span style={{ fontSize: 13, color: '#0f172a', wordBreak: 'break-word', maxWidth: 240 }}>{file.filename}</span>
                          </div>
                        </td>
                        <td style={s.td}>{file.title || '-'}</td>
                        <td style={s.td}>{file.category || '-'}</td>
                        <td style={s.td}>
                          <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 8, backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: 12, fontWeight: 700 }}>
                            {file.file_type?.toUpperCase() || file.fileType?.toUpperCase() || 'FILE'}
                          </span>
                        </td>
                        <td style={s.td}>{file.fileSize ? `${(file.fileSize / 1024).toFixed(2)} KB` : 'N/A'}</td>
                        <td style={s.td}>{file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : 'Unknown'}</td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button style={{ ...s.ghostBtn, display: 'inline-flex', padding: '6px 10px', fontSize: 12 }} onClick={() => analyzeUploadedFile(file)}>
                              <FaChartBar style={{ marginRight: 4 }} /> Analyze
                            </button>
                            <a href={file.filePath} target="_blank" rel="noreferrer" style={{ ...s.ghostBtn, display: 'inline-flex', padding: '6px 10px', fontSize: 12 }}>
                              <FaEye style={{ marginRight: 4 }} /> View
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f3f7fb', fontFamily: 'Inter, Arial, sans-serif' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' },
  backBtn: { display: 'inline-flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 14, fontWeight: 700 },
  topBarRight: { display: 'flex', alignItems: 'center' },
  topBarTitle: { fontSize: 14, fontWeight: 700, color: '#103063' },
  hero: { position: 'relative', minHeight: 220, backgroundImage: 'linear-gradient(135deg, #0e7490 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', borderRadius: 20, overflow: 'hidden' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.40)' },
  heroContent: { position: 'relative', zIndex: 1, padding: '36px 28px' },
  heroTag: { margin: 0, fontSize: 11, fontWeight: 700, color: '#7dd3fc', letterSpacing: 1.4, textTransform: 'uppercase' },
  heroTitle: { margin: '12px 0 10px', color: '#fff', fontSize: 32, fontWeight: 800, lineHeight: 1.1 },
  heroSub: { margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: 14, maxWidth: 620 },
  body: { maxWidth: 940, margin: '28px auto 60px', padding: '0 20px', display: 'grid', gap: 22 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 10px 40px rgba(15,23,42,0.06)', border: '1px solid rgba(226,232,240,0.9)' },
  tabBar: { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  tabBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s ease' },
  tabBtnActive: { background: '#dbeafe', color: '#1d4ed8', borderColor: '#bfdbfe' },
  cardSub: { margin: '0 0 18px', color: '#64748b', fontSize: 13 },
  dropZone: { border: '2px dashed #cbd5e1', borderRadius: 18, padding: '44px 24px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', transition: 'all 0.2s ease' },
  dropActive: { borderColor: '#0ea5e9', backgroundColor: '#eff6ff' },
  dropIcon: { fontSize: 42, color: '#94a3b8', marginBottom: 14 },
  dropText: { margin: 0, fontSize: 16, color: '#334155', fontWeight: 700 },
  dropHint: { margin: '6px 0 0', fontSize: 13, color: '#64748b' },
  dropLink: { color: '#0ea5e9', fontWeight: 700 },
  parsedPanel: { display: 'grid', gap: 14 },
  analysisGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 18 },
  chartFrame: { position: 'relative', minHeight: 320, padding: 14, borderRadius: 18, backgroundColor: '#fff', border: '1px solid #cbd5e1' },
  fileRow: { display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 14, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' },
  fileInfo: { display: 'grid', gap: 4 },
  fileName: { fontSize: 14, fontWeight: 700, color: '#0f172a' },
  fileMeta: { fontSize: 12, color: '#64748b' },
  iconBtn: { border: 'none', background: 'transparent', cursor: 'pointer', padding: 6 },
  colRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  colPill: { display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 999, backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: 12, fontWeight: 700, border: '1px solid #bae6fd' },
  ghostBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 16px', background: '#fff', color: '#475569', cursor: 'pointer', fontWeight: 700 },
  tableWrap: { overflowX: 'auto', borderRadius: 14, border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '11px 14px', color: '#475569', borderBottom: '1px solid #f1f5f9' },
  moreRows: { margin: 12, textAlign: 'center', color: '#64748b', fontSize: 13 },
  centerBox: { display: 'flex', alignItems: 'center', gap: 12, padding: 18 },
  centerText: { margin: 0, color: '#64748b', fontSize: 14 },
  successBanner: { display: 'flex', alignItems: 'center', gap: 10, padding: 15, borderRadius: 14, backgroundColor: '#ecfdf5', color: '#166534', border: '1px solid #bbf7d0', fontWeight: 700 },
  errorPill: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 12, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontWeight: 700 },
  noticeBanner: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 14, backgroundColor: '#eff6ff', color: '#0f172a', border: '1px solid #bfdbfe', fontWeight: 700, marginBottom: 16 },
  actionRow: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  cancelBtn: { padding: '12px 20px', borderRadius: 12, border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer' },
  primaryBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #0f172a, #0ea5e9)', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s ease' },
  hintBox: { backgroundColor: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 16 },
  hintTitle: { margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569' },
  hintText: { margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.6 },
  textarea: { width: '100%', minHeight: 200, borderRadius: 14, border: '1px solid #cbd5e1', padding: 14, fontSize: 14, fontFamily: 'Inter, Arial, sans-serif', color: '#0f172a', resize: 'vertical' },
  alertBase: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700 },
  alertSuccess: { backgroundColor: '#ecfdf5', color: '#166534', border: '1px solid #bbf7d0' },
  alertWarning: { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' },
  alertError: { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' },
  manualGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 18 },
  fieldLabel: { display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#334155' },
  fieldLabelText: { fontWeight: 700, color: '#0f172a' },
  fieldInput: { width: '100%', borderRadius: 12, border: '1px solid #cbd5e1', padding: '12px 14px', fontSize: 14, color: '#0f172a', backgroundColor: '#fff' }
};
