import React, { useState, useEffect, useRef, useCallback } from 'react';
import heroImage from "../assets/publications.jpg";
import {
  FaFilePdf,
  FaTimes as FaClose,
  FaCalendarAlt,
  FaTrash,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaCaretDown
} from 'react-icons/fa';
import PageLoader from '../components/common/PageLoader';
import { API_ENDPOINT } from '../services/api';

const constructFileUrl = (relativeUrl) => {
  if (!relativeUrl) return '';
  // API_ENDPOINT is guaranteed to include the '/api' suffix from services/api.js.
  // Derive the origin/base by stripping the trailing '/api' so we can point to static files
  // served at the server root (e.g. /uploads).
  const base = String(API_ENDPOINT).replace(/\/api\/?$/i, '');
  return `${base}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
};
// ---------------------------------------------------------------------------
// Custom hook: closes the menu when a click occurs outside the given ref(s)
// ---------------------------------------------------------------------------
function useClickOutside(refs, handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const refsKey = refs.map(r => r.current).join(',');

  useEffect(() => {
    function onMouseDown(e) {
      if (!refs.some(r => r.current && r.current.contains(e.target))) {
        handlerRef.current(e);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refsKey]);
}

// ---------------------------------------------------------------------------
const Publication = () => {

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewingPublication, setViewingPublication] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [isAreaOpen, setIsAreaOpen] = useState(false);
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const [filters, setFilters] = useState({
    area: null,
    topic: null,
    type: null,
    date: ""
  });

  // -- Refs for click-outside -----------------------------------------------
  const areaRef = useRef(null);
  const topicRef = useRef(null);
  const typeRef = useRef(null);

  useClickOutside(
    [areaRef],
    useCallback(() => setIsAreaOpen(false), [])
  );
  useClickOutside(
    [topicRef],
    useCallback(() => setIsTopicOpen(false), [])
  );
  useClickOutside(
    [typeRef],
    useCallback(() => setIsTypeOpen(false), [])
  );

  // Always send token as "Bearer <token>", stripping any existing prefix
  const authHeader = (token) => {
    if (!token) return {};
    const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
    return { Authorization: `Bearer ${raw}` };
  };

  const [deleteMessage, setDeleteMessage] = useState(null);

  const publicationTypes = ['Laws', 'Policies', 'Reports', 'Questionnaires'];

  const normalizePublicationType = (value, category) => {
    if (value) {
      const normalized = String(value).trim().toLowerCase();
      if (/law|act|regulation/.test(normalized)) return 'Laws';
      if (/policy/.test(normalized)) return 'Policies';
      if (/questionnaire|questioner/.test(normalized)) return 'Questionnaires';
      return 'Reports';
    }

    const cat = String(category || '').toLowerCase();
    if (/law|act|regulation/.test(cat)) return 'Laws';
    if (/policy/.test(cat)) return 'Policies';
    if (/questionnaire|questioner/.test(cat)) return 'Questionnaires';
    return 'Reports';
  };

  // Helper to get the CSS class based on category for color-coding
  const getCategoryClass = (publication) => {
    const type = (publication.type || '').toLowerCase();
    if (type.includes('report')) return 'category-report';
    if (type.includes('law')) return 'category-law';
    if (type.includes('policy')) return 'category-policy';
    if (type.includes('survey') || type.includes('questionnaire')) return 'category-survey';
    return ''; // Default class if no match
  };

  const [count, setCount] = useState({
    publications: 0,
    areas: 0,
    years: 0
  });


  const [isLoading, setIsLoading] = useState(true);

  // Start with empty array – no flash of fake data
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    const loadPublications = async () => {
      try {
        // FIX: Do not add /api here, as API_ENDPOINT should already have it.
        const response = await fetch(`${API_ENDPOINT}/publications`);
        if (!response.ok) {
          throw new Error('Unable to fetch publications');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          const mappedData = data.map((item) => {
            const type = normalizePublicationType(item.type, item.category);
            // Preserve file_path or file_url from API response
            const filePath = item.file_path || item.file_url || '';
            return {
              ...item,
              file_path: filePath,
              file_url: filePath,
              area: item.category || "General",
              topic: item.category || "Report",
              type,
              size: item.file_type ? `${item.file_type.toUpperCase()}` : "PDF"
            };
          });
          console.log("PUBLICATIONS FROM API:", mappedData);
          setPublications(mappedData);
        }
      } catch (error) {
        console.error('Publications load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPublications();
  }, []);

  // Add global CSS for hover effects and animations
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .publication-card:hover {
        transform: translateY(-12px) scale(1.02);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15), 0 1px 20px rgba(0, 0, 0, 0.1) !important;
      }

      .publication-card:hover::before {
        background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%);
      }

      .dropdownButton:hover,
      .dropdownButton:focus {
        border-color: #3b82f6 !important;
        background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%) !important;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2) !important;
      }

      .clearAllBtn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4) !important;
      }

      .dropdownMenu {
        animation: slideDown 0.2s ease-out;
        border: 2px solid #e2e8f0;
        border-radius: 14px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      }

      .dropdownMenu div:hover {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2ff 100%);
        color: #3b82f6;
        font-weight: 600;
      }

      .searchInput:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      }

      @media (max-width: 768px) {
        .publication-card:hover {
          transform: translateY(-8px) scale(1.01);
        }
      }
    `;
    
    document.head.appendChild(styleSheet);
    
    return () => {
      try {
        document.head.removeChild(styleSheet);
      } catch (e) {}
    };
  }, []);

  // AUTO FILTER DATA
  const areas = [...new Set(publications.map(doc => doc.area))];
  const topics = [...new Set(publications.map(doc => doc.topic))];

  const numericYears = publications
    .map(doc => Number(doc.year))
    .filter(year => !Number.isNaN(year) && year > 0);

  const latestYear = numericYears.length ? Math.max(...numericYears) : null;
  const secondLatestYear = numericYears.length
    ? Math.max(...numericYears.filter(year => year < latestYear))
    : null;

  const getDocStatus = (doc) => {
    const year = Number(doc.year);
    if (!year || Number.isNaN(year)) return null;
    if (year === latestYear) return 'New';
    if (year === secondLatestYear) return 'Updated';
    console.log("CHECKING DOC:", doc.title);
    return null;
  };

  // FILTER LOGIC
  const filteredDocs = publications.filter(doc => {

    const matchesArea =
      !filters.area || doc.area === filters.area;

    const matchesTopic =
      !filters.topic || doc.topic === filters.topic;

    const matchesType =
      !filters.type || doc.type === filters.type;

    const matchesDate =
      !filters.date ||
      (doc.year && String(doc.year) === String(new Date(filters.date).getFullYear()));

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (doc.title || "").toLowerCase().includes(query) ||
      (doc.description || "").toLowerCase().includes(query) ||
      (doc.type || "").toLowerCase().includes(query) ||
      (doc.category || "").toLowerCase().includes(query);

    return (
      matchesArea &&
      matchesTopic &&
      matchesType &&
      matchesDate &&
      matchesSearch
    );
  });
  console.log("PUBLICATIONS STATE:", publications);

  // OPEN PDF
  const handleDocClick = (doc) => {
    const filePath = doc.file_path || doc.file_url || "";
    const fileUrl = constructFileUrl(filePath);
    
    // Always try to open the document in the in-app modal.
    // The modal will show a download prompt if the file type isn't previewable.
    setSelectedDoc({
      ...doc,
      file_path: filePath,
      file_url: fileUrl,
    });
    setPdfLoadError(false);
    setShowPdfModal(true);
    document.body.style.overflow = "hidden";

    // Set a timeout to detect if the iframe fails to load (e.g., for non-PDF files).
    const timer = setTimeout(() => {
      setPdfLoadError(true);
    }, 5000);

    // Store timer ID so we can clear it if the iframe loads successfully.
    window._pdfLoadTimer = timer;
  };

  // CLOSE PDF
  const closeModal = () => {
    setShowPdfModal(false);
    setSelectedDoc(null);
    setPdfLoadError(false);
    document.body.style.overflow = "auto";
    // Clear any pending timer
    if (window._pdfLoadTimer) {
      clearTimeout(window._pdfLoadTimer);
      window._pdfLoadTimer = null;
    }
  };

  // OPEN VIEW MODAL
  const handleViewDetails = (doc) => {
    setViewingPublication(doc);
    setShowViewModal(true);
    document.body.style.overflow = "hidden";
  };

  // CLOSE VIEW MODAL
  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingPublication(null);
    document.body.style.overflow = "auto";
  };

  const showAllCategories = () => {
    setFilters({
      area: null,
      topic: null,
      type: null,
      date: ""
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.area) count++;
    if (filters.topic) count++;
    if (filters.type) count++;
    if (filters.date) count++;
    return count;
  };

  const getSelectedDisplay = (type) => {
    if (type === 'area' && filters.area) return filters.area;
    if (type === 'topic' && filters.topic) return filters.topic;
    if (type === 'type' && filters.type) return filters.type;
    return `All ${type}s`;
  };

  const years = [...new Set(publications.map(doc => doc.year))];

  // COUNTER EFFECT
  useEffect(() => {
    let start = 0;
    const maxValue = Math.max(
      publications.length,
      areas.length,
      years.length
    );
    const interval = setInterval(() => {
      start += 1;
      setCount({
        publications: Math.min(start, publications.length),
        areas: Math.min(start, areas.length),
        years: Math.min(start, years.length)
      });
      if (start >= maxValue) {
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [publications, areas.length, years.length]);

  // ---------------------------------------------------------------------------
  // handleDelete – sends DELETE to API, shows status messages
  // ---------------------------------------------------------------------------
  const handleDelete = async (id, title) => {
    setDeleting(true);
    setDeleteMessage(null);

    try {
      const token = localStorage.getItem('lmis_token');
      // FIX: Do not add /api here.
      const res = await fetch(`${API_ENDPOINT}/publications/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(token),
        },
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || 'Delete failed');
      }

      // Remove from local state
      setPublications(prev => prev.filter(p => p.id !== id));
      setDeleteConfirm(null);

      setDeleteMessage({
        type: 'success',
        text: `"${title}" has been deleted successfully.`,
      });

      // Auto-hide success message after 4s
      setTimeout(() => setDeleteMessage(null), 4000);
    } catch (err) {
      setDeleteMessage({
        type: 'error',
        text: `Failed to delete: ${err.message}`,
      });
      setTimeout(() => setDeleteMessage(null), 5000);
    } finally {
      setDeleting(false);
    }
  };

  // ---------------------------------------------------------------------------
  return (
    <>
      {isLoading && <PageLoader />}
      <div style={styles.page}>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.03); opacity: 0.92; }
          }
          .publication-card {
            animation: fadeInUp 0.35s ease-out both;
            position: relative;
            border-radius: 24px;
            overflow: hidden;
            min-height: 320px;
            background-size: cover;
            background-position: center;
            box-shadow: 0 12px 40px rgba(0,0,0,0.08);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            border: 2px solid transparent;
            cursor: pointer;
            color: #1e293b;
          }

          .publication-card::before {
            content: '';
            position: absolute;
            inset: 0;
            top: 0;
            left: 0;
            width: 0;
            height: 4px;
            background: linear-gradient(90deg, #3498db 0%, #2ecc71 50%, #f39c12 100%);
            transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            z-index: 3;
          }

          .publication-card::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
              135deg, 
              rgba(255, 255, 255, 0.5) 0%, 
              rgba(255, 255, 255, 0) 100%
            ), 
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.25'/%3E%3C/svg%3E");
            opacity: 1;
            z-index: 1;
            pointer-events: none;
          }

          .publication-card > * {
            position: relative;
            z-index: 2;
            transition: all 0.3s ease;
          }

          .publication-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 20px 40px rgba(52,152,219,0.25);
            border-color: #3498db;
            filter: brightness(1.05);
          }

          .publication-card:hover::before {
            width: 100%;
          }

          .publication-card:hover .docTitle {
            color: #3498db;
          }
          .publication-card:hover .docDesc {
            color: #555555;
          }
          .publication-card:hover .reportBadge {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(30, 64, 175, 0.15);
          }

          .publication-actions {
            position: absolute;
            left: 24px;
            right: 24px;
            bottom: 20px;
            display: flex;
            justify-content: space-between;
            gap: 10px;
            z-index: 4;
            opacity: 1;
            transform: translateY(0);
            flex-wrap: wrap;
          }

          .publication-actions .btn {
            flex: 1;
            min-width: 100px;
            padding: 12px 16px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            text-decoration: none;
            justify-content: center;
            border: none;
            color: #ffffff;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .publication-actions .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
          }

          .publication-actions .btn-view {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .publication-actions .btn-view:hover {
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          }

          .publication-actions .btn-download {
            background: linear-gradient(135deg, #27ae60 0%, #16a085 100%);
          }
          .publication-actions .btn-download:hover {
            background: linear-gradient(135deg, #16a085 0%, #27ae60 100%);
          }

          .publication-actions .btn-delete {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          }
          .publication-actions .btn-delete:hover {
            background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
          }

          .publication-status {
            display: inline-flex;
            align-items: center;
            padding: 4px 8px;
            border-radius: 999px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            margin-bottom: 12px;
            transition: transform 0.25s ease;
            position: relative;
            z-index: 3;
          }

          /* Elegant dropdown styling */
          .dropdown-menu {
            position: absolute;
            top: calc(100% + 6px);
            left: 0;
            right: 0;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
            z-index: 100;
            max-height: 260px;
            overflow-y: auto;
            padding: 6px;
            border: 1px solid rgba(0,0,0,0.04);
            animation: fadeInUp 0.2s ease-out;
          }

          .dropdown-menu::-webkit-scrollbar {
            width: 6px;
          }
          .dropdown-menu::-webkit-scrollbar-track {
            background: transparent;
          }
          .dropdown-menu::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 12px;
          }

          .dropdown-item {
            padding: 10px 14px;
            cursor: pointer;
            border-radius: 8px;
            font-size: 14px;
            color: #1e293b;
            transition: all 0.15s ease;
          }
          .dropdown-item:hover {
            background: #f1f5f9;
            color: #0f172a;
          }
          .dropdown-item:active {
            background: #e2e8f0;
          }
        `}</style>

        {/* Delete Status Message */}
        {deleteMessage && (
          <div style={{
            ...styles.deleteStatusMessage,
            ...(deleteMessage.type === 'success' ? styles.deleteStatusMessageSuccess : styles.deleteStatusMessageError)
          }}>
            {deleteMessage.type === 'success' ? (
              <FaCheckCircle style={{ marginRight: 8 }} />
            ) : (
              <FaExclamationCircle style={{ marginRight: 8 }} />
            )}
            {deleteMessage.text}
          </div>
        )}

        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.heroOverlay}></div>
          <div style={{ ...styles.heroInner, position: 'relative', zIndex: 2 }}>
            <p style={styles.heroMini}>Kingdom of Eswatini</p>
            <h1 style={styles.heroTitle}>Publications</h1>
            <p style={styles.heroSub}>Access official labour market reports, acts and research publications.</p>
          </div>
        </section>

        {/* MAIN */}
        <div style={styles.container}>

          {/* FILTERS */}
          <div style={styles.filterBox}>
            <div style={styles.filterHeader}>
              <span style={styles.filterTitle}>Filter Publications</span>
              {getActiveFilterCount() > 0 && (
                <button style={styles.clearAllBtn} onClick={showAllCategories}>Clear All</button>
              )}
            </div>

            <div style={styles.filterGrid}>

              {/* AREA */}
              <div style={styles.filterGroup}>
                <div style={styles.filterLabel}>By Area</div>
                <div style={{ position: 'relative' }} ref={areaRef}>
                  <div style={styles.dropdownButton} onClick={() => {
                    setIsAreaOpen(prev => !prev);
                    setIsTopicOpen(false);
                    setIsTypeOpen(false);
                  }}>
                    <span>{getSelectedDisplay('area')}</span>
                    <FaCaretDown style={{ transition: 'transform 0.2s', transform: isAreaOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </div>
                  {isAreaOpen && (
                    <div className="dropdown-menu">
                      <div className="dropdown-item" onClick={() => { setFilters({ ...filters, area: null }); setIsAreaOpen(false); }}>
                        All Areas
                      </div>
                      {areas.map(area => (
                        <div key={area} className="dropdown-item" onClick={() => { setFilters({ ...filters, area }); setIsAreaOpen(false); }}>
                          {area}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* TOPIC */}
              <div style={styles.filterGroup}>
                <div style={styles.filterLabel}>By Topic</div>
                <div style={{ position: 'relative' }} ref={topicRef}>
                  <div style={styles.dropdownButton} onClick={() => {
                    setIsTopicOpen(prev => !prev);
                    setIsAreaOpen(false);
                    setIsTypeOpen(false);
                  }}>
                    <span>{getSelectedDisplay('topic')}</span>
                    <FaCaretDown style={{ transition: 'transform 0.2s', transform: isTopicOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </div>
                  {isTopicOpen && (
                    <div className="dropdown-menu">
                      <div className="dropdown-item" onClick={() => { setFilters({ ...filters, topic: null }); setIsTopicOpen(false); }}>
                        All Topics
                      </div>
                      {topics.map(topic => (
                        <div key={topic} className="dropdown-item" onClick={() => { setFilters({ ...filters, topic }); setIsTopicOpen(false); }}>
                          {topic}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* TYPE */}
              <div style={styles.filterGroup}>
                <div style={styles.filterLabel}>By Type</div>
                <div style={{ position: 'relative' }} ref={typeRef}>
                  <div style={styles.dropdownButton} onClick={() => {
                    setIsTypeOpen(prev => !prev);
                    setIsAreaOpen(false);
                    setIsTopicOpen(false);
                  }}>
                    <span>{getSelectedDisplay('type')}</span>
                    <FaCaretDown style={{ transition: 'transform 0.2s', transform: isTypeOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </div>
                  {isTypeOpen && (
                    <div className="dropdown-menu">
                      <div className="dropdown-item" onClick={() => { setFilters({ ...filters, type: null }); setIsTypeOpen(false); }}>
                        All Types
                      </div>
                      {publicationTypes.map(type => (
                        <div key={type} className="dropdown-item" onClick={() => { setFilters({ ...filters, type }); setIsTypeOpen(false); }}>
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* DATE */}
              <div style={styles.filterGroup}>
                <div style={styles.filterLabel}>Select Date</div>
                <div style={styles.calendarWrapper}>
                  <FaCalendarAlt style={styles.calendarIcon} />
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    style={styles.calendarInput}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* SEARCH */}
          <div style={styles.searchSection}>
            <div style={styles.searchLabel}>Search Publications</div>
            <div style={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search by title, description, type or category..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* GRID HEADER */}
          <div style={styles.gridHeader}>
            <h3 style={styles.gridTitle}>Publications ({filteredDocs.length})</h3>
            <button style={styles.clearFiltersBtn} onClick={showAllCategories}>Clear All Filters</button>
          </div>

          {/* GRID */}
          <div style={styles.docGrid}>
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                className={`publication-card ${getCategoryClass(doc)}`}
                style={{ ...styles.docCard }}
                onClick={() => handleDocClick(doc)}
              >
                <div style={{...styles.docYear}}>{doc.year}</div>
                {getDocStatus(doc) && (
                  <span className={`publication-status ${getDocStatus(doc).toLowerCase()}`} style={styles.statusBadge}>
                    {getDocStatus(doc)}
                  </span>
                )}
                <h4 className="docTitle" style={styles.docTitle}>{doc.title}</h4>
                <p className="docDesc" style={styles.docDesc}>{doc.description}</p>
                <div style={styles.docType}>
                  <span className="reportBadge" style={styles.reportBadge}>{doc.category}</span>
                  <span style={styles.docSize}>{doc.size}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* VIEW PUBLICATION DETAILS MODAL */}
        {showViewModal && viewingPublication && (
          <div style={styles.viewModalOverlay}>
            <div style={styles.viewModal}>
              <div style={styles.viewModalHeader}>
                <h3 style={styles.viewModalTitle}>📕 Publication Details</h3>
                <button style={styles.viewModalCloseBtn} onClick={closeViewModal}><FaClose /></button>
              </div>
              <div style={styles.viewModalBody}>
                <div style={styles.viewModalField}>
                  <label style={styles.viewModalLabel}>Title</label>
                  <p style={styles.viewModalText}>{viewingPublication.title}</p>
                </div>
                <div style={styles.viewModalField}>
                  <label style={styles.viewModalLabel}>Description</label>
                  <p style={styles.viewModalText}>{viewingPublication.description}</p>
                </div>
                <div style={styles.viewModalField}>
                  <label style={styles.viewModalLabel}>Category</label>
                  <span style={styles.viewModalBadge}>{viewingPublication.category}</span>
                </div>
                <div style={styles.viewModalRow}>
                  <div style={styles.viewModalField}>
                    <label style={styles.viewModalLabel}>Year</label>
                    <p style={styles.viewModalText}>{viewingPublication.year}</p>
                  </div>
                  <div style={styles.viewModalField}>
                    <label style={styles.viewModalLabel}>Type</label>
                    <p style={styles.viewModalText}>{viewingPublication.type}</p>
                  </div>
                </div>
                {viewingPublication.file_url && (
                  <div style={styles.viewModalField}>
                    <label style={styles.viewModalLabel}>File URL</label>
                    <a href={viewingPublication.file_url} target="_blank" rel="noreferrer" style={styles.viewModalLink}>{viewingPublication.file_url}</a>
                  </div>
                )}
              </div>
              <div style={styles.viewModalFooter}>
                {viewingPublication.file_url && (
                  <a href={viewingPublication.file_url} download target="_blank" rel="noreferrer" style={styles.viewModalDownloadBtn}>
                    <FaFilePdf style={{ marginRight: 8 }} /> Download File
                  </a>
                )}
                <button style={styles.viewModalCloseBtnSecondary} onClick={closeViewModal}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirm && (
          <div style={styles.deleteModalOverlay}>
            <div style={styles.deleteModal}>
              <div style={styles.deleteModalHeader}>
                <FaExclamationCircle style={styles.deleteModalWarningIcon} />
                <h2 style={styles.deleteModalTitle}>Delete Publication?</h2>
                <button style={styles.deleteModalCloseBtn} onClick={() => setDeleteConfirm(null)} disabled={deleting}><FaClose /></button>
              </div>
              <div style={styles.deleteModalBody}>
                <p style={styles.deleteModalText}>Are you sure you want to delete:</p>
                <p style={styles.deleteModalPublicationTitle}>"{deleteConfirm.title}"</p>
                <p style={styles.deleteModalWarningText}>This action cannot be undone. The publication will be removed from the database and the public page.</p>
              </div>
              <div style={styles.deleteModalFooter}>
                <button style={styles.deleteModalCancelBtn} onClick={() => setDeleteConfirm(null)} disabled={deleting}>Cancel</button>
                <button style={styles.deleteModalConfirmBtn} onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.title)} disabled={deleting}>
                  {deleting ? <FaSpinner style={styles.deleteModalSpinner} /> : <FaTrash style={{ marginRight: 8 }} />}
                  {deleting ? 'Deleting...' : 'Delete Publication'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF MODAL */}
        {showPdfModal && selectedDoc && (
          <div style={styles.pdfOverlay}>
            <div style={styles.pdfModal}>
              <div style={styles.pdfHeader}>
                <h3 style={styles.pdfTitle}>{selectedDoc.title}</h3>
                <div style={styles.pdfActions}>
                  <a href={selectedDoc.file_url} download target="_blank" rel="noreferrer" style={styles.downloadBtn}>Download</a>
                  <button style={styles.closeBtn} onClick={closeModal}><FaClose /></button>
                </div>
              </div>
              {pdfLoadError ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  gap: '20px',
                  color: '#d32f2f'
                }}>
                  <FaExclamationCircle size={48} />
                  <div style={{ textAlign: 'center' }}>
                    <p><strong>Unable to load PDF preview</strong></p>
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>
                      The file may not be available or is corrupted. Please try downloading it instead.
                    </p>
                    <a href={selectedDoc.file_url} download target="_blank" rel="noreferrer" style={{
                      display: 'inline-block',
                      marginTop: '15px',
                      padding: '10px 20px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      borderRadius: '4px',
                      textDecoration: 'none'
                    }}>
                      Download File
                    </a>
                  </div>
                </div>
              ) : (
                <iframe 
                  src={selectedDoc.file_url} 
                  title={selectedDoc.title} 
                  style={styles.pdfFrame}
                  onLoad={() => {
                    // Clear timeout if iframe loads successfully
                    if (window._pdfLoadTimer) {
                      clearTimeout(window._pdfLoadTimer);
                      window._pdfLoadTimer = null;
                    }
                  }}
                  onError={() => setPdfLoadError(true)}
                />
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
};

const styles = {

  page: {
    backgroundColor: '#f4f7f6',
    minHeight: '100vh',
    fontFamily: 'sans-serif'
  },

  hero: {
    position: "relative",
    minHeight: "320px",
    width: "100%",
    padding: "40px 80px",
    backgroundImage: `url(${heroImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    alignItems: "center",
    color: "#fff",
    overflow: "hidden"
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(90deg, rgba(15, 23, 42, 0.85), rgba(2, 6, 23, 0.55))",
    zIndex: 1
  },

  heroInner: {
    maxWidth: '800px'
  },

  heroMini: {
    color: '#7dd3fc'
  },

  heroTitle: {
    fontSize: '42px',
    margin: '10px 0'
  },

  heroSub: {
    color: 'rgba(255,255,255,0.8)'
  },

  container: {
    padding: '40px 60px'
  },

  filterBox: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '20px',
    padding: '32px 36px',
    marginBottom: '30px',
    boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)',
    border: '1px solid rgba(59, 130, 246, 0.1)',
    backdrop: 'blur(10px)'
  },

  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid rgba(59, 130, 246, 0.1)'
  },

  filterTitle: {
    fontWeight: '800',
    fontSize: '18px',
    background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.01em'
  },

  clearAllBtn: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
    letterSpacing: '0.02em'
  },

  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '20px'
  },

  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  filterLabel: {
    fontWeight: '700',
    fontSize: '12px',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px'
  },

  dropdownButton: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
    border: '2px solid #e2e8f0',
    padding: '13px 16px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: '600',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
  },

  searchSection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    display: 'flex',
    marginBottom: '30px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
    border: '1px solid rgba(0,0,0,0.03)'
  },

  searchLabel: {
    padding: '15px 24px',
    backgroundColor: '#f8fafc',
    fontWeight: '700',
    fontSize: '14px',
    color: '#0f172a',
    whiteSpace: 'nowrap'
  },

  searchWrapper: {
    flex: 1,
    padding: '8px 20px'
  },

  searchInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },

  docGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(350px,1fr))',
    gap: '25px'
  },

  gridHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    gap: '15px'
  },

  gridTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '20px',
    fontWeight: '700'
  },

  clearFiltersBtn: {
    backgroundColor: '#CE1126',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease'
  },

  docCard: {
    padding: '28px',
    borderRadius: '20px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    color: '#1e293b',
    minHeight: '320px',
    zIndex: 2,
    border: '2px solid rgba(255,255,255,0.6)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)'
  },

  docYear: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontSize: '13px',
    color: '#ffffff',
    zIndex: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: '8px 14px',
    borderRadius: '99px',
    fontWeight: '800',
    border: '2px solid currentColor',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
  },

  docTitle: {
    marginTop: '140px',
    color: '#0f172a',
    zIndex: 2,
    position: 'relative'
  },

  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '6px',
    zIndex: 3,
    position: 'relative'
  },

  docDesc: {
    color: '#475569',
    fontSize: '14px',
    zIndex: 2,
    position: 'relative'
  },

  docType: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px',
    zIndex: 2,
    position: 'relative'
  },

  reportBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#ffffff',
    zIndex: 2,
    position: 'relative'
  },

  docSize: {
    fontSize: '12px',
    color: '#f0f0f0',
    zIndex: 2,
    position: 'relative'
  },

  calendarWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0 12px',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  },

  calendarIcon: {
    color: '#94a3b8',
    fontSize: '14px',
    marginRight: '8px',
    flexShrink: 0
  },

  calendarInput: {
    border: 'none',
    padding: '12px 0',
    flex: 1,
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: 'transparent'
  },

  pdfOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999
  },

  pdfModal: {
    width: '96%',
    height: '95%',
    backgroundColor: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },

  pdfHeader: {
    backgroundColor: '#103063',
    color: '#fff',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  pdfTitle: {
    margin: 0
  },

  pdfActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  downloadBtn: {
    backgroundColor: '#10b981',
    color: '#fff',
    padding: '8px 15px',
    borderRadius: '8px',
    textDecoration: 'none'
  },

  closeBtn: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    cursor: 'pointer'
  },

  pdfFrame: {
    width: '100%',
    height: '100%',
    border: 'none',
    flex: 1
  },

  // Delete status message
  deleteStatusMessage: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999999,
    padding: '14px 22px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    animation: 'fadeInUp 0.3s ease-out'
  },

  deleteStatusMessageSuccess: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0'
  },

  deleteStatusMessageError: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca'
  },

  // View modal
  viewModalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999
  },

  viewModal: {
    width: '96%',
    maxWidth: '700px',
    maxHeight: '90vh',
    backgroundColor: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
  },

  viewModalHeader: {
    backgroundColor: '#103063',
    color: '#fff',
    padding: '18px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },

  viewModalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700'
  },

  viewModalCloseBtn: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  viewModalBody: {
    padding: '24px',
    overflowY: 'auto',
    flexGrow: 1
  },

  viewModalField: {
    marginBottom: '20px'
  },

  viewModalLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  viewModalText: {
    fontSize: '15px',
    color: '#0f172a',
    lineHeight: '1.6',
    margin: 0
  },

  viewModalBadge: {
    display: 'inline-block',
    padding: '8px 14px',
    borderRadius: '999px',
    backgroundColor: '#e0f2fe',
    color: '#0c4a6e',
    fontSize: '13px',
    fontWeight: '600'
  },

  viewModalRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px'
  },

  viewModalLink: {
    color: '#2563eb',
    textDecoration: 'underline',
    fontSize: '14px'
  },

  viewModalFooter: {
    padding: '18px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },

  viewModalDownloadBtn: {
    backgroundColor: '#10b981',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease'
  },

  viewModalCloseBtnSecondary: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    padding: '12px 20px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },

  // Delete modal
  deleteModalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999
  },

  deleteModal: {
    width: '90%',
    maxWidth: '480px',
    backgroundColor: '#fff',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
    animation: 'fadeInUp 0.25s ease-out'
  },

  deleteModalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  deleteModalWarningIcon: {
    color: '#ef4444',
    fontSize: '28px',
    flexShrink: 0
  },

  deleteModalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    flex: 1
  },

  deleteModalCloseBtn: {
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: 'none',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  deleteModalBody: {
    padding: '24px'
  },

  deleteModalText: {
    margin: '0 0 8px 0',
    color: '#475569',
    fontSize: '15px'
  },

  deleteModalPublicationTitle: {
    fontWeight: '700',
    fontSize: '16px',
    color: '#0f172a',
    margin: '0 0 16px 0'
  },

  deleteModalWarningText: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
    lineHeight: 1.5
  },

  deleteModalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },

  deleteModalCancelBtn: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
    color: '#475569',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  },

  deleteModalConfirmBtn: {
    padding: '10px 22px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'background-color 0.2s'
  },

  deleteModalSpinner: {
    animation: 'spin 1s linear infinite',
    marginRight: 8
  }
};

export default Publication;
