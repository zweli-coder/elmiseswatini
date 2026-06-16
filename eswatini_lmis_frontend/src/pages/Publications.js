import React, { useState, useEffect } from 'react';
import heroImage from "../assets/publications.jpg";
import {
  FaFilePdf,
  FaCaretDown,
  FaEye,
  FaTimes as FaClose,
  FaCalendarAlt
} from 'react-icons/fa';
import PageLoader from '../components/common/PageLoader';

const Publication = () => {

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [isAreaOpen, setIsAreaOpen] = useState(false);
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const [filters, setFilters] = useState({
  area: null,
  topic: null,
  type: null,
  year: null,
  date: ""
});

  const publicationTypes = ['Laws', 'Policies', 'Reports', 'Questionnaires'];

  // Use theme gradients for a unified look; keep type list for filters

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

  const getPublicationTypeColor = (doc) => {
    const type = doc.type;
    if (type === 'Laws') return 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)';
    if (type === 'Policies') return 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
    if (type === 'Questionnaires') return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
    // Default / Reports
    return 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
  };

  const [count, setCount] = useState({
    publications: 0,
    areas: 0,
    years: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  const [publications, setPublications] = useState([
    {
      id: 1,
      title: "Labour Force Survey Report 2023",
      description: "Annual report on employment, unemployment and labour utilisation in Eswatini.",
      category: "Labour Force Survey",
      file_url: "/pdfs/labour-force-survey-report-2023.pdf",
      year: "2023",
      type: "Reports",
      size: "2.4 MB",
      area: "Labour force",
      topic: "Labour Force 2023 report",
      color: "#fde047"
    },

    {
      id: 2,
      title: "Wage Statistics Bulletin 2023",
      description: "Statistics on average wages across industries and sectors in Eswatini.",
      category: "Wage Statistics",
      file_url: "/pdfs/wage-statistics-bulletin-2023.pdf",
      year: "2023",
      type: "Reports",
      id: 3,
      title: "Employment Bulletin Q3 2023",
      description: "Quarterly bulletin covering employment trends in the third quarter of 2023.",
      category: "Employment Bulletin",
      file_url: "/pdfs/employment-bulletin-q3-2023.pdf",
      year: "2023",
      type: "Reports",
      size: "2.0 MB",
      area: "Labour demand",
      topic: "Labour market institutions",
      color: "#86efac"
    },

    {
      id: 4,
      title: "Labour Market Information Report 2022",
      description: "Comprehensive annual labour market report covering all key indicators.",
      category: "Annual Report",
      file_url: "/pdfs/labour-market-information-report-2022.pdf",
      year: "2022",
      type: "Reports",
      size: "3.5 MB",
      area: "Labour force",
      topic: "International labour organisations",
      color: "#fca5a5"
    },

    {
      id: 5,
      title: "Occupational Outlook Handbook 2022",
      description: "Guide to occupational employment projections and career information.",
      category: "Occupational Guide",
      file_url: "/pdfs/occupational-outlook-handbook-2022.pdf",
      year: "2022",
      type: "Reports",
      size: "2.9 MB",
      area: "Skills",
      topic: "Training institutions and courses",
      color: "#c4b5fd"
    },

    {
      id: 6,
      title: "Child Labour Survey Report 2022",
      description: "Survey findings on child labour incidence and characteristics in Eswatini.",
      category: "Special Report",
      file_url: "/pdfs/child-labour-survey-report-2022.pdf",
      year: "2022",
      type: "Reports",
      size: "2.2 MB",
      area: "Poverty in employment",
      topic: "Labour market institutions",
      color: "#fdba74"
    },

    {
      id: 7,
      title: "Labour Force Survey Report 2021",
      description: "Annual report on employment, unemployment and labour utilisation in Eswatini.",
      category: "Labour Force Survey",
      file_url: "/pdfs/labour-force-survey-report-2021.pdf",
      year: "2021",
      type: "Reports",
      size: "2.3 MB",
      area: "Labour force",
      topic: "Labour Force 2023 report",
      color: "#67e8f9"
    },

    {
      id: 8,
      title: "Skills Demand Survey 2021",
      description: "Report on skills demand and shortage areas identified by employers.",
      category: "Skills Report",
      file_url: "/pdfs/skills-demand-survey-2021.pdf",
      year: "2021",
      type: "Reports",
      size: "1.7 MB",
      area: "Skills",
      topic: "Training institutions and courses",
      color: "#f9a8d4"
    }
  ]);

  useEffect(() => {
    const loadPublications = async () => {
      try {
        const response = await fetch('/api/publications');
        if (!response.ok) {
          throw new Error('Unable to fetch publications');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          // Map backend fields to frontend expectations
          const mappedData = data.map((item) => {
            const type = normalizePublicationType(item.type, item.category);
            return {
              ...item,
              area: item.category || "General",
              topic: item.category || "Report",
              type,
              size: item.file_type ? `${item.file_type.toUpperCase()}` : "PDF"
            };
          });
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

  // AUTO FILTER DATA
  const areas = [...new Set(publications.map(doc => doc.area))];
  const topics = [...new Set(publications.map(doc => doc.topic))];
  const years = [...new Set(publications.map(doc => doc.year))];

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

    const matchesYear =
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
      matchesYear &&
      matchesSearch
    );
  });

  // OPEN PDF
  const handleDocClick = (doc) => {
    setSelectedDoc(doc);
    setShowPdfModal(true);

    document.body.style.overflow = "hidden";
  };

  // CLOSE PDF
  const closeModal = () => {
    setShowPdfModal(false);
    setSelectedDoc(null);

    document.body.style.overflow = "auto";
  };

  const resetCategory = (cat) => {
    setFilters({
      ...filters,
      [cat]: null
    });
  };

  const showAllCategories = () => {
    setFilters({
      area: null,
      topic: null,
      type: null,
      year: null,
      date: ""
    });
  };

  const getActiveFilterCount = () => {

    let count = 0;

    if (filters.area) count++;
    if (filters.topic) count++;
    if (filters.type) count++;
    if (filters.year) count++;

    return count;
  };

  const getSelectedDisplay = (type) => {

    if (type === 'area' && filters.area)
      return filters.area;

    if (type === 'topic' && filters.topic)
      return filters.topic;

    if (type === 'type' && filters.type)
      return filters.type;

    if (type === 'year' && filters.year)
      return filters.year;

    return `All ${type}s`;
  };

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

  return (
    <>
      {isLoading && <PageLoader />}
      <div style={styles.page}>
        <style>{`
          .publication-card {
            animation: fadeInUp 0.35s ease-out both;
            position: relative;
            border-radius: 24px;
            overflow: hidden;
            min-height: 320px;
            background-size: cover;
            background-position: center;
            box-shadow: 0 12px 40px rgba(0,0,0,0.1);
            transition: transform 0.4s ease, box-shadow 0.3s ease;
          }


          .publication-actions {
            position: absolute;
            left: 24px;
            right: 24px;
            bottom: 20px;
            display: flex;
            justify-content: space-between;
            gap: 12px;
            z-index: 4;
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 0.28s ease, transform 0.28s ease;
          }

          .publication-card:hover .publication-actions {
            opacity: 1;
            transform: translateY(0);
          }

          .publication-actions .btn {
            padding: 10px 14px;
            border-radius: 12px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            text-decoration: none;
            color: #073049;
            background: rgba(255,255,255,0.95);
            box-shadow: 0 8px 20px rgba(3,7,18,0.08);
            border: none;
          }

          .publication-actions .btn.icon { padding: 10px; border-radius: 10px; }

          .publication-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.2);
          }

          .publication-status {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            margin-bottom: 12px;
            transition: transform 0.25s ease;
            position: relative;
            z-index: 3;
          }

          .publication-status.new {
            background: rgba(16, 185, 129, 0.9);
            color: #ffffff;
            animation: pulse 1.8s ease-in-out infinite;
          }

          .publication-status.updated {
            background: rgba(59, 130, 246, 0.9);
            color: #ffffff;
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.03);
              opacity: 0.92;
            }
          }
        `}</style>

      {/* HEADER */}

      

      {/* HERO */}

      <section style={styles.hero}>

        <div style={styles.heroOverlay}></div>

        <div style={{
          ...styles.heroInner,
          position: 'relative',
          zIndex: 2
        }}>

          <p style={styles.heroMini}>
            Kingdom of Eswatini
          </p>

          <h1 style={styles.heroTitle}>
            Publications
          </h1>

          <p style={styles.heroSub}>
            Access official labour market reports,
            acts and research publications.
          </p>

        </div>

      </section>

      {/* MAIN */}

      <div style={styles.container}>

        {/* FILTERS */}

        <div style={styles.filterBox}>

          <div style={styles.filterHeader}>

            <span style={styles.filterTitle}>
              Filter Publications
            </span>

            {getActiveFilterCount() > 0 && (
              <button
                style={styles.clearAllBtn}
                onClick={showAllCategories}
              >
                Clear All
              </button>
            )}

          </div>

          <div style={styles.filterGrid}>

            {/* AREA */}

            <div style={styles.filterGroup}>

              <div style={styles.filterLabel}>
                By Area
              </div>

              <div style={styles.dropdownContainer}>

                <div
                  style={styles.dropdownButton}
                  onClick={() => {
                    setIsAreaOpen(!isAreaOpen);
                    setIsTopicOpen(false);
                    setIsYearOpen(false);
                  }}
                >

                  <span>
                    {getSelectedDisplay('area')}
                  </span>

                  <FaCaretDown />

                </div>

                {isAreaOpen && (

                  <div style={styles.dropdownMenu}>

                    <div
                      style={styles.dropdownItem}
                      onClick={() => {
                        setFilters({
                          ...filters,
                          area: null
                        });
                        setIsAreaOpen(false);
                      }}
                    >
                      All Areas
                    </div>

                    {areas.map(area => (

                      <div
                        key={area}
                        style={styles.dropdownItem}
                        onClick={() => {
                          setFilters({
                            ...filters,
                            area: area
                          });
                          setIsAreaOpen(false);
                        }}
                      >
                        {area}
                      </div>

                    ))}

                  </div>

                )}

              </div>

            </div>

            {/* TOPIC */}

            <div style={styles.filterGroup}>

              <div style={styles.filterLabel}>
                By Topic
              </div>

              <div style={styles.dropdownContainer}>

                <div
                  style={styles.dropdownButton}
                  onClick={() => {
                    setIsTopicOpen(!isTopicOpen);
                    setIsAreaOpen(false);
                    setIsYearOpen(false);
                  }}
                >

                  <span>
                    {getSelectedDisplay('topic')}
                  </span>

                  <FaCaretDown />

                </div>

                {isTopicOpen && (

                  <div style={styles.dropdownMenu}>

                    <div
                      style={styles.dropdownItem}
                      onClick={() => {
                        setFilters({
                          ...filters,
                          topic: null
                        });
                        setIsTopicOpen(false);
                      }}
                    >
                      All Topics
                    </div>

                    {topics.map(topic => (

                      <div
                        key={topic}
                        style={styles.dropdownItem}
                        onClick={() => {
                          setFilters({
                            ...filters,
                            topic: topic
                          });
                          setIsTopicOpen(false);
                        }}
                      >
                        {topic}
                      </div>

                    ))}

                  </div>

                )}

              </div>

            </div>

            {/* TYPE */}

            <div style={styles.filterGroup}>

              <div style={styles.filterLabel}>
                By Type
              </div>

              <div style={styles.dropdownContainer}>

                <div
                  style={styles.dropdownButton}
                  onClick={() => {
                    setIsTypeOpen(!isTypeOpen);
                    setIsYearOpen(false);
                    setIsTopicOpen(false);
                    setIsAreaOpen(false);
                  }}
                >

                  <span>
                    {getSelectedDisplay('type')}
                  </span>

                  <FaCaretDown />

                </div>

                {isTypeOpen && (

                  <div style={styles.dropdownMenu}>

                    <div
                      style={styles.dropdownItem}
                      onClick={() => {
                        setFilters({
                          ...filters,
                          type: null
                        });
                        setIsTypeOpen(false);
                      }}
                    >
                      All Types
                    </div>

                    {publicationTypes.map(type => (

                      <div
                        key={type}
                        style={styles.dropdownItem}
                        onClick={() => {
                          setFilters({
                            ...filters,
                            type: type
                          });
                          setIsTypeOpen(false);
                        }}
                      >
                        {type}
                      </div>

                    ))}

                  </div>

                )}

              </div>

            </div>

            {/* YEAR */}

<div style={styles.filterGroup}>

  <div style={styles.filterLabel}>
    Select Date
  </div>

  <div style={styles.calendarWrapper}>

    <FaCalendarAlt style={styles.calendarIcon} />

    <input
      type="date"
      value={filters.date}
      onChange={(e) =>
        setFilters({
          ...filters,
          date: e.target.value
        })
      }
      style={styles.calendarInput}
    />

  </div>

</div>

            {/* SHOW ALL */}

            <button
              style={styles.showAllBtn}
              onClick={showAllCategories}
            >
              <FaEye style={{ marginRight: '8px' }} />
              Show All
            </button>

          </div>

        </div>

        {/* SEARCH */}

        <div style={styles.searchSection}>

          <div style={styles.searchLabel}>
            Publications ({filteredDocs.length})
          </div>

          <div style={styles.searchWrapper}>

            <input
              type="text"
              placeholder="Search..."
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
            />

          </div>

        </div>

        {/* GRID */}

        <div style={styles.gridHeader}>
          <h3 style={styles.gridTitle}>Publications ({filteredDocs.length})</h3>
          <button style={styles.clearFiltersBtn} onClick={showAllCategories}>
            Clear All Filters
          </button>
        </div>

        <div style={styles.docGrid}>

          {filteredDocs.map(doc => (

            <div
              key={doc.id}
              className="publication-card"
              style={{
                ...styles.docCard,
                backgroundImage: getPublicationTypeColor(doc)
              }}
              onClick={() => handleDocClick(doc)}
            >

                    <div style={styles.docYear}>
                      {doc.year}
                    </div>

              {getDocStatus(doc) && (
                <span
                  className={`publication-status ${getDocStatus(doc).toLowerCase()}`}
                  style={styles.statusBadge}
                >
                  {getDocStatus(doc)}
                </span>
              )}

              <h4 style={styles.docTitle}>
                {doc.title}
              </h4>

              <p style={styles.docDesc}>
                {doc.description}
              </p>

              <div style={styles.docType}>

                <span style={styles.reportBadge}>
                  {doc.category}
                </span>

                <span style={styles.docSize}>
                  {doc.size}
                </span>

              </div>

              <div className="publication-actions">
                <button
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDocClick(doc);
                  }}
                >
                  <FaEye />
                  <span style={{ marginLeft: 6 }}>View</span>
                </button>

                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaFilePdf />
                  <span style={{ marginLeft: 6 }}>Download</span>
                </a>
              </div>

            </div>

          ))}

        </div>

      </div>

      {/* PDF MODAL */}

      {showPdfModal && selectedDoc && (

        <div style={styles.pdfOverlay}>

          <div style={styles.pdfModal}>

            {/* HEADER */}

            <div style={styles.pdfHeader}>

              <h3 style={styles.pdfTitle}>
                {selectedDoc.title}
              </h3>

              <div style={styles.pdfActions}>

                <a
                  href={selectedDoc.file_url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  style={styles.downloadBtn}
                >
                  Download
                </a>

                <button
                  style={styles.closeBtn}
                  onClick={closeModal}
                >
                  <FaClose />
                </button>

              </div>

            </div>

            {/* PDF */}

            <iframe
              src={selectedDoc.file_url}
              title={selectedDoc.title}
              style={styles.pdfFrame}
            />

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

  topHeader: {
    backgroundColor: '#fff',
    padding: '15px 60px'
  },

  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },

  flag: {
    height: '35px'
  },

  brandTitle: {
    margin: 0,
    color: '#103063'
  },

  brandSub: {
    margin: 0,
    fontSize: '10px'
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

  background:
    "linear-gradient(90deg, rgba(15, 23, 42, 0.85), rgba(2, 6, 23, 0.55))",

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
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '25px',
    marginBottom: '30px'
  },

  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px'
  },

  filterTitle: {
    fontWeight: 'bold'
  },

  clearAllBtn: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '8px',
    cursor: 'pointer'
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
    fontWeight: '600'
  },

  dropdownContainer: {
    position: 'relative'
  },

  dropdownButton: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    cursor: 'pointer'
  },

  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: '8px',
    marginTop: '5px',
    overflow: 'hidden',
    zIndex: 10,
    border: '1px solid #ddd',
    maxHeight: '250px',
    overflowY: 'auto'
  },

  dropdownItem: {
    padding: '12px',
    cursor: 'pointer'
  },

  showAllBtn: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },

  searchSection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    display: 'flex',
    marginBottom: '30px',
    overflow: 'hidden'
  },

  searchLabel: {
    padding: '15px 20px',
    backgroundColor: '#f8fafc',
    fontWeight: 'bold'
  },

  searchWrapper: {
    flex: 1,
    padding: '10px 20px'
  },

  searchInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd'
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
    padding: '25px',
    borderRadius: '24px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.4s ease, box-shadow 0.3s ease',
    backgroundImage: 'none',
    color: '#0f172a',
    minHeight: '320px',
    zIndex: 2
  },

  docYear: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontSize: '12px',
    color: '#1e40af',
    zIndex: 3,
    backgroundColor: '#dbeafe',
    padding: '6px 12px',
    borderRadius: '20px',
    fontWeight: '600'
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
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#0f172a',
    zIndex: 2,
    position: 'relative'
  },

  docSize: {
    fontSize: '12px',
    color: '#64748b',
    zIndex: 2,
    position: 'relative'
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
  yearButtonContent: {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
},



yearDropdownMenu: {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  borderRadius: '12px',
  marginTop: '8px',
  zIndex: 1000,
  border: '1px solid #ddd',
  padding: '15px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
},

yearGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '10px',
  marginTop: '10px',
  maxHeight: '260px',
  overflowY: 'auto'
},

yearItem: {
  padding: '10px',
  textAlign: 'center',
  borderRadius: '10px',
  backgroundColor: '#f1f5f9',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600',
  transition: '0.2s ease'
},

yearItemActive: {
  backgroundColor: '#2563eb',
  color: '#fff'
},

  pdfFrame: {
    width: '100%',
    height: '100%',
    border: 'none',
    flex: 1
  }
};

export default Publication;