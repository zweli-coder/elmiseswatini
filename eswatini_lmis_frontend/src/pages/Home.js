

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import slide1 from '../assets/hero.jpg';
import slide2 from '../assets/Sibebe.png';
import slide3 from '../assets/plane.png';

import jobsBg from '../assets/jobs.jpg';
import statisticsBg from '../assets/stats.png';
import industryBg from '../assets/industry.jpg';
import seekersBg from '../assets/seeker.jpg';


import {
  FaSearch,
  FaChartLine,
  FaSpinner,
  FaChartBar,
  FaBriefcase,
  FaUsers,
  FaUserTie,
  FaTimes,
  FaArrowRight,
  FaEye,
  FaGlobeAfrica,
  FaBuilding,
  FaTools,
  FaMapMarkerAlt
} from 'react-icons/fa';

const heroImages = [slide1, slide2, slide3];


const Home = () => {

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // MODALS
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [showJobSeekerModal, setShowJobSeekerModal] = useState(false);

  // DATA
  const [jobSeekerData, setJobSeekerData] = useState([]);
  const [loadingJobSeekers, setLoadingJobSeekers] = useState(false);

  const [summaryData, setSummaryData] = useState({
    employersByIndustry: [],
    employmentByStatus: [],
    jobsByMonth: [],
    applicationStatus: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        let response;
        try {
          response = await fetch('/api/statistics/summary');
        } catch (err) {
          response = await fetch('http://localhost:3001/api/statistics/summary');
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setSummaryData({
          employersByIndustry: data?.data?.employersByIndustry || [],
          employmentByStatus: data?.data?.employmentByStatus || [],
          jobsByMonth: data?.data?.jobsByMonth || [],
          applicationStatus: data?.data?.applicationStatus || [],
          loading: false,
          error: null
        });
      } catch (err) {
        console.error('Dashboard Error:', err);
        setSummaryData({
          employersByIndustry: [],
          employmentByStatus: [],
          jobsByMonth: [],
          applicationStatus: [],
          loading: false,
          error: err.message
        });
      }
    };
    fetchSummary();
  }, []);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide(prev => (prev + 1) % heroImages.length);
  }, 5000);

  return () => clearInterval(interval);
}, [heroImages.length]);

  const handleOpenJobSeekerModal = async () => {
    setShowJobSeekerModal(true);
    setLoadingJobSeekers(true);
    try {
      let res;
      try {
        res = await fetch('/api/employees');
      } catch (err) {
        res = await fetch('http://localhost:3001/api/employees');
      }
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      setJobSeekerData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setJobSeekerData([]);
    } finally {
      setLoadingJobSeekers(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const queryText = searchQuery.trim().toLowerCase();
    if (!queryText) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }

    const matches = (value) => {
      if (!value) return false;
      return String(value).toLowerCase().includes(queryText);
    };

    setIsSearching(true);
    setShowResults(true);

    try {
      const [jobsRes, publicationsRes, seekersRes, adviceRes, sectorsRes, trainingRes] = await Promise.all([
        fetch('/api/jobs').catch(() => ({ ok: false, json: async () => [] })),
        fetch('/api/publications').catch(() => ({ ok: false, json: async () => [] })),
        fetch('/api/employees').catch(() => ({ ok: false, json: async () => [] })),
        fetch('/api/career-advice').catch(() => ({ ok: false, json: async () => [] })),
        fetch('/api/economic-sectors').catch(() => ({ ok: false, json: async () => [] })),
        fetch('/api/education-training').catch(() => ({ ok: false, json: async () => [] }))
      ]);

      const jobs = jobsRes.ok ? await jobsRes.json() : [];
      const publications = publicationsRes.ok ? await publicationsRes.json() : [];
      const seekers = seekersRes.ok ? await seekersRes.json() : [];
      const advice = adviceRes.ok ? await adviceRes.json() : [];
      const sectors = sectorsRes.ok ? await sectorsRes.json() : [];
      const training = trainingRes.ok ? await trainingRes.json() : [];

      const results = [];

      jobs.forEach((job) => {
        if (
          matches(job.title) ||
          matches(job.description) ||
          matches(job.location) ||
          matches(job.job_type) ||
          matches(job.sector) ||
          matches(job.organisation_name)
        ) {
          results.push({
            type: 'Job',
            title: job.title || 'Job opening',
            subtitle: job.organisation_name || job.location || job.sector || 'Vacancy',
            description: job.description || job.location || job.job_type,
            path: '/vacancies'
          });
        }
      });

      publications.forEach((pub) => {
        if (
          matches(pub.title) ||
          matches(pub.description) ||
          matches(pub.category) ||
          matches(pub.year) ||
          matches(pub.file_type)
        ) {
          results.push({
            type: 'Publication',
            title: pub.title || 'Publication',
            subtitle: pub.category || pub.year || 'Publication',
            description: pub.description || pub.file_type,
            path: '/publications'
          });
        }
      });

      seekers.forEach((seeker) => {
        if (
          matches(seeker.fullname) ||
          matches(seeker.description) ||
          matches(seeker.skills) ||
          matches(seeker.education_level) ||
          matches(seeker.sector) ||
          matches(seeker.employment_status) ||
          matches(seeker.region) ||
          matches(seeker.phone) ||
          matches(seeker.national_id)
        ) {
          results.push({
            type: 'Job Seeker',
            title: seeker.fullname || 'Job Seeker',
            subtitle: seeker.sector || seeker.region || seeker.employment_status || 'Candidate',
            description: seeker.description || seeker.skills,
            path: '/jobseekers'
          });
        }
      });

      advice.forEach((item) => {
        if (
          matches(item.title) ||
          matches(item.summary) ||
          matches(item.body) ||
          matches(item.category)
        ) {
          results.push({
            type: 'Career Advice',
            title: item.title || 'Career advice',
            subtitle: item.category || 'Advice',
            description: item.summary,
            path: '/career-advice'
          });
        }
      });

      sectors.forEach((sector) => {
        if (
          matches(sector.sector_name) ||
          matches(sector.description) ||
          matches(sector.category)
        ) {
          results.push({
            type: 'Sector',
            title: sector.sector_name || 'Economic sector',
            subtitle: sector.category || 'Sector',
            description: sector.description,
            path: '/economic-sectors'
          });
        }
      });

      training.forEach((item) => {
        if (
          matches(item.title) ||
          matches(item.category) ||
          matches(item.description)
        ) {
          results.push({
            type: 'Training',
            title: item.title || 'Training program',
            subtitle: item.category || 'Education & training',
            description: item.description,
            path: '/education-training'
          });
        }
      });

      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result) => {
    setShowResults(false);
    setSearchQuery('');
    if (result.type === 'job') navigate('/vacancies');
    else if (result.type === 'publication') navigate('/publications');
    else if (result.type === 'seeker') navigate('/jobseekers');
  };

  return (

    <div className="lmis-root">

      {/* ========================================= */}
      {/* INDUSTRY MODAL                            */}
      {/* ========================================= */}

      {showIndustryModal && (
        <div className="lmis-modal-backdrop" onClick={() => setShowIndustryModal(false)}>
          <div className="lmis-modal industry-modal" onClick={(e) => e.stopPropagation()}>

            <div className="lmis-modal-header">
              <div>
                <p className="lmis-modal-eyebrow">Public Statistics</p>
                <h2 className="lmis-modal-title">Employees By Industry</h2>
              </div>
              <button className="lmis-modal-close" onClick={() => setShowIndustryModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="lmis-modal-body">
              {summaryData.employersByIndustry.length === 0 ? (
                <div className="lmis-modal-empty">
                  <FaBuilding className="modal-empty-icon" />
                  <p>No industry data available.</p>
                </div>
              ) : (
                <div className="industry-grid">
                  {summaryData.employersByIndustry.map((item, idx) => (
                    <div key={idx} className="industry-card">
                      <div className="industry-card-top">
                        <FaBuilding className="industry-icon" />
                        <span className="industry-name">{item?.name || 'Unknown'}</span>
                      </div>
                      <div className="industry-value">{item?.value || 0}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lmis-modal-footer">
              <button className="lmis-modal-btn" onClick={() => { setShowIndustryModal(false); navigate('/statistics'); }}>
                <FaEye /> View Statistics
              </button>
             
            </div>

          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* JOB SEEKER MODAL                          */}
      {/* ========================================= */}

      {showJobSeekerModal && (
        <div className="lmis-modal-backdrop" onClick={() => setShowJobSeekerModal(false)}>
          <div className="lmis-modal lmis-modal-wide" onClick={(e) => e.stopPropagation()}>

            <div className="lmis-modal-header">
              <div>
                <p className="lmis-modal-eyebrow">Registered Profiles</p>
                <h2 className="lmis-modal-title">Job Seekers</h2>
              </div>
              <button className="lmis-modal-close" onClick={() => setShowJobSeekerModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="lmis-modal-body">
              {loadingJobSeekers ? (
                <div className="lmis-modal-loading">
                  <FaSpinner className="spin" />
                  <p>Loading Job Seekers...</p>
                </div>
              ) : jobSeekerData.length === 0 ? (
                <div className="lmis-modal-empty">
                  <FaUsers className="modal-empty-icon" />
                  <p>No registered job seekers found.</p>
                </div>
              ) : (
                <>
                  <div className="job-seeker-summary">
                    <div className="summary-box">
                      <FaUsers />
                      <div>
                        <h3>{jobSeekerData.length}</h3>
                        <p>Total Job Seekers</p>
                      </div>
                    </div>
                    <div className="summary-box">
                      <FaGlobeAfrica />
                      <div>
                        <h3>Eswatini</h3>
                        <p>National Database</p>
                      </div>
                    </div>
                  </div>

                  <div className="lmis-table-wrapper">
                    <div className="lmis-modal-table-header">
                      <span>Name</span>
                      <span>Sector</span>
                      <span>Region</span>
                      <span>Experience</span>
                    </div>
                    {jobSeekerData.map((seeker, idx) => (
                      <div key={idx} className="lmis-modal-table-row">
                        <span>{seeker?.full_name || '—'}</span>
                        <span>{seeker?.sector || '—'}</span>
                        <span><FaMapMarkerAlt /> {seeker?.region || '—'}</span>
                        <span>{seeker?.experience_years ? `${seeker.experience_years} yrs` : '—'}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="lmis-modal-footer">
              <button className="lmis-modal-btn" onClick={() => { setShowJobSeekerModal(false); navigate('/jobseekers'); }}>
                <FaUsers /> View All Job Seekers
              </button>
              <button className="lmis-modal-btn secondary-btn" onClick={() => { setShowJobSeekerModal(false); navigate('/vacancies'); }}>
                <FaBriefcase /> View Vacancies
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ========================================= */}
      {/* HERO                                      */}
      {/* ========================================= */}

      <section className="lmis-hero">
   <div
   className="lmis-hero-background"
  style={{
    backgroundImage: `url(${heroImages[currentSlide]})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
/>
        <div className="lmis-hero-effects">
          <span className="lmis-hero-spot spot1" />
          <span className="lmis-hero-spot spot2" />
          <span className="lmis-hero-spot spot3" />
        </div>
        <div className="lmis-overlay">
          <div className="lmis-hero-content">
            <p className="lmis-hero-mini">Kingdom of Eswatini</p>
            <h2 className="lmis-hero-title">National Labour Market Information Platform</h2>
            <p className="lmis-hero-sub">
              Access employment statistics, labour market insights, publications and vacancies.
            </p>
            <form onSubmit={handleSearch} className="lmis-search-form">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search jobs, publications or employees..."
                className="lmis-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
              />
              <button type="submit" className="lmis-search-btn">
                {isSearching ? <FaSpinner className="spin" /> : 'Search'}
              </button>
              {showResults && (
                <div className="lmis-results-dropdown">
                  {searchResults.length === 0 ? (
                    <div className="lmis-result-item">No results found</div>
                  ) : searchResults.map((result, idx) => (
                    <div key={idx} className="lmis-result-item" onClick={() => handleResultClick(result)}>
                      <div className="lmis-result-row">
                        <span className="lmis-result-badge">{result.type}</span>
                        <span className="lmis-result-title">{result.title}</span>
                      </div>
                      {result.subtitle && <div className="lmis-result-subtitle">{result.subtitle}</div>}
                      {result.description && <div className="lmis-result-description">{result.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>5520
      </section>

      {/* ========================================= */}
      {/* MAIN                                      */}
      {/* ========================================= */}

      <main className="lmis-main">

        <div className="lmis-section-header">
          <div>
            <p className="lmis-section-mini">Public Dashboard</p>
            <h2 className="lmis-section-title">Labour Market Overview</h2>
          </div>
        </div>

        {summaryData.loading ? (
          <div className="lmis-loading">
            <FaSpinner className="spin" />
            <p>Loading Dashboard...</p>
          </div>
        ) : (
          <div className="lmis-grid">

        {/* CARD 1 — Monthly Job Postings */}
<div
  className="lmis-card"
  style={{
    backgroundImage: `url(${jobsBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
  onClick={() => navigate('/vacancies')}
>
  <div className="lmis-hint">Navigate To Jobs Portal <FaArrowRight /></div>
  <div className="lmis-card-content-wrapper">
    <div className="lmis-card-header">
      <FaChartBar className="blue" />
      <h3>Monthly Job Postings</h3>
    </div>
    <div className="lmis-card-content">
      {summaryData.jobsByMonth.length === 0 ? (
        <div className="industry-empty">
          <FaChartBar className="industry-big-icon" />
          <p>No postings available.</p>
        </div>
      ) : summaryData.jobsByMonth.map((item, idx) => (
        <div key={idx} className="simple-row">
          <span>{item?.month || 'Month'}</span>
          <span>{item?.count || 0}</span>
        </div>
      ))}
    </div>
  </div>
</div>

{/* CARD 2 — Statistics */}
<div
  className="lmis-card"
  style={{
    backgroundImage: `url(${statisticsBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
  onClick={() => navigate('/statistics')}
>
  <div className="lmis-hint">Explore Statistics <FaArrowRight /></div>
  <div className="lmis-card-content-wrapper">
    <div className="lmis-card-header">
      <FaChartLine className="green" />
      <h3>Labour Market Statistics</h3>
    </div>
    <div className="industry-empty">
      <FaChartLine className="industry-big-icon" style={{ color: '#22c55e' }} />
      <p>Explore charts, pivot tables and raw data across all labour market categories.</p>
    </div>
  </div>
</div>

{/* CARD 3 — Employees by Industry */}
<div
  className="lmis-card"
  style={{
    backgroundImage: `url(${industryBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
  onClick={() => setShowIndustryModal(true)}
>
  <div className="lmis-hint">Analyze Industrial Data <FaArrowRight /></div>
  <div className="lmis-card-content-wrapper">
    <div className="lmis-card-header">
      <FaUsers className="orange" />
      <h3>Employees By Industry</h3>
    </div>
    <div className="industry-empty">
      <FaUsers className="industry-big-icon" />
      <p>Access localized employee metrics by sector.</p>
    </div>
  </div>
</div>

{/* CARD 4 — Job Seeker Status */}
<div
  className="lmis-card"
  style={{
    backgroundImage: `url(${seekersBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
  onClick={handleOpenJobSeekerModal}
>
  <div className="lmis-hint">Manage Registered Talent <FaArrowRight /></div>
  <div className="lmis-card-content-wrapper">
    <div className="lmis-card-header">
      <FaBriefcase className="purple" />
      <h3>Job Seeker Status</h3>
    </div>
    <div className="lmis-card-content">
      {summaryData.employmentByStatus.length === 0 ? (
        <div className="industry-empty">
          <FaUserTie className="industry-big-icon" />
          <p>Talent database overview.</p>
        </div>
      ) : summaryData.employmentByStatus.map((item, idx) => (
        <div key={idx} className="simple-row">
          <span>{item?.name || 'Unknown'}</span>
          <span>{item?.value || 0}</span>
        </div>
      ))}
    </div>
  </div>
</div>

          </div>
        )}

      </main>

      {/* ========================================= */}
      {/* STYLES                                    */}
      {/* ========================================= */}

      <style>{`

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        *{ margin:0; padding:0; box-sizing:border-box; }
        body{ font-family:'Inter',sans-serif; background:#f4f7fb; }
        .lmis-root{ min-height:100vh; background:#f4f7fb; }

        /* HEADER */
        .lmis-header{ background:white; padding:20px 40px; border-bottom:1px solid #e5e7eb; }
        .lmis-logo{ font-size:26px; font-weight:700; color:#0b2545; }
        .lmis-tagline{ color:#64748b; }

        /* HERO */
        .lmis-hero{ position:relative; min-height:460px; overflow:hidden; }
        .lmis-hero::before{ content:''; position:absolute; inset:0; background: radial-gradient(circle at 20% 20%, rgba(59,130,246,0.22), transparent 25%), radial-gradient(circle at 85% 25%, rgba(16,185,129,0.18), transparent 22%); z-index:1; pointer-events:none; animation: heroGlow 14s ease-in-out infinite; }
        
        .lmis-hero-background{ position:absolute; inset:0; background:url('https://images.unsplash.com/photo-1521790360230-8a028a21ff4e?auto=format&fit=crop&w=1600&q=80') center/cover; background-size:cover; filter: brightness(0.62); z-index:0; }
        .lmis-hero-slider{ display:none; }
        .lmis-slide{ display:none; }
        .lmis-hero-effects{ position:absolute; inset:0; pointer-events:none; z-index:1; }
        .lmis-hero-spot{ position:absolute; border-radius:50%; filter: blur(40px); opacity:0.45; }
        .lmis-hero-spot.spot1{ width:320px; height:320px; left:8%; top:18%; background: rgba(59,130,246,0.24); animation: heroSpot1 12s ease-in-out infinite; }
        .lmis-hero-spot.spot2{ width:260px; height:260px; right:6%; top:28%; background: rgba(16,185,129,0.20); animation: heroSpot2 14s ease-in-out infinite; }
        .lmis-hero-spot.spot3{ width:220px; height:220px; left:45%; bottom:6%; background: rgba(248,113,113,0.16); animation: heroSpot3 10s ease-in-out infinite; }
        @keyframes heroSlide {
          0%, 22% { transform: translateX(0%); }
          28%, 50% { transform: translateX(-100%); }
          56%, 78% { transform: translateX(-200%); }
          100% { transform: translateX(-200%); }
        }
        @keyframes heroZoom {
          0%, 100% { transform: scale(1.06) translateY(0); }
          50% { transform: scale(1.12) translateY(-8px); }
        }
        @keyframes heroGlow {
          0%, 100% { opacity: 1; transform: translateY(0px) scale(1); }
          50% { opacity: 0.85; transform: translateY(-14px) scale(1.05); }
        }
        @keyframes heroSpot1 { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-18px) scale(1.05); } }
        @keyframes heroSpot2 { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-28px) scale(1.06); } }
        @keyframes heroSpot3 { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-22px) scale(1.04); } }
        .lmis-overlay{ position:relative; min-height:460px; background: linear-gradient(180deg, rgba(4,12,27,0.18) 0%, rgba(7,18,40,0.82) 100%); display:flex; align-items:center; padding:40px; z-index:2; }
        .lmis-hero-mini{ color:#38bdf8; text-transform:uppercase; letter-spacing:1px; margin-bottom:15px; font-size:13px; font-weight:700; opacity:0; animation: heroTextIn 0.9s ease-out forwards; animation-delay:0.25s; }
        .lmis-hero-title{ color:white; font-size:48px; margin-bottom:15px; opacity:0; transform: translateY(18px); animation: heroTextIn 0.9s ease-out forwards; animation-delay:0.35s; }
        .lmis-hero-sub{ color:#e2e8f0; margin-bottom:25px; opacity:0; transform: translateY(18px); animation: heroTextIn 0.9s ease-out forwards; animation-delay:0.45s; }
        .lmis-search-form{ opacity:0; transform: translateY(22px); animation: heroTextIn 0.9s ease-out forwards; animation-delay:0.55s; }
        @keyframes heroTextIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* SEARCH */
        .lmis-search-form{ background:white; border-radius:14px; display:flex; align-items:center; overflow:hidden; width:650px; position:relative; }
        .search-icon{ margin-left:18px; color:#94a3b8; }
        .lmis-search-input{ flex:1; padding:18px; border:none; outline:none; }
        .lmis-search-btn{ background:#0ea5e9; color:white; border:none; padding:14px 24px; margin:5px; border-radius:10px; cursor:pointer; font-weight:600; }
        .lmis-results-dropdown{ position:absolute; top:100%; left:0; right:0; background:white; border-radius:0 0 14px 14px; box-shadow:0 15px 40px rgba(0,0,0,0.1); z-index:100; }
        .lmis-result-item{ padding:14px 20px; border-bottom:1px solid #f1f5f9; cursor:pointer; }
        .lmis-result-item:hover{ background:#f8fafc; }

        /* MAIN */
        .lmis-main{ padding:50px 40px; }
        .lmis-section-mini{ color:#0ea5e9; font-size:13px; font-weight:700; text-transform:uppercase; margin-bottom:8px; }
        .lmis-section-title{ font-size:32px; color:#0f172a; font-weight:700; }

        /* GRID */
        .lmis-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:25px; margin-top:30px; }

        /* CARDS */
        .lmis-card{ position:relative; border-radius:24px; overflow:hidden; min-height:320px; cursor:pointer; transition:0.4s; box-shadow:0 12px 40px rgba(0,0,0,0.1); background-size:cover; background-position:center; }
        .lmis-card:hover{ transform:translateY(-10px); }
        .card-img-jobs{ background:url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=600') center/cover; }
        .card-img-stats{ background:url('https://images.unsplash.com/photo-1551288049-bbbda536639a?q=80&w=600') center/cover; }
        .card-img-industry{ background:url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600') center/cover; }
        .card-img-seekers{ background:url('https://images.unsplash.com/photo-1521791136064-7986c2959213?q=80&w=600') center/cover; }
        .lmis-card::after{ content:''; position:absolute; inset:0; background:linear-gradient(to top, rgba(11,37,69,0.95), rgba(11,37,69,0.35)); }
        .lmis-card-content-wrapper{ position:relative; z-index:2; padding:25px; color:white; margin-top:150px; }
        .lmis-card-content{ position:relative; z-index:2; }
        .lmis-card-header{ display:flex; align-items:center; gap:12px; margin-bottom:20px; }
        .lmis-card-header h3{ font-size:22px; }

        .blue{ color:#38bdf8; font-size:22px; }
        .green{ color:#22c55e; font-size:22px; }
        .orange{ color:#f59e0b; font-size:22px; }
        .purple{ color:#a855f7; font-size:22px; }

        .lmis-hint{ position:absolute; top:20px; left:20px; z-index:3; background:#f59e0b; color:#0b2545; padding:10px 16px; border-radius:30px; display:flex; align-items:center; gap:10px; font-size:12px; font-weight:700; }

        .simple-row{ display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.1); color:white; }

        .industry-empty{ text-align:center; padding:20px 0; color:rgba(255,255,255,0.85); }
        .industry-big-icon{ font-size:50px; margin-bottom:10px; color:#f59e0b; }

        /* LOADING */
        .lmis-loading{ display:flex; flex-direction:column; justify-content:center; align-items:center; gap:15px; padding:80px 20px; color:#0f172a; }
        .lmis-loading svg{ font-size:40px; color:#0ea5e9; }

        /* MODAL BACKDROP */
        .lmis-modal-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,0.75); display:flex; justify-content:center; align-items:center; z-index:9999; padding:20px; }
        .lmis-modal{ background:white; width:600px; max-height:90vh; overflow-y:auto; border-radius:24px; animation:modalFade 0.3s ease; }
        .lmis-modal-wide{ width:900px; }
        @keyframes modalFade{ from{ opacity:0; transform:translateY(20px); } to{ opacity:1; transform:translateY(0); } }
        .lmis-modal-header{ padding:25px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; }
        .lmis-modal-eyebrow{ color:#0ea5e9; font-size:13px; font-weight:700; text-transform:uppercase; }
        .lmis-modal-title{ font-size:28px; color:#0f172a; margin-top:5px; }
        .lmis-modal-close{ background:#f1f5f9; border:none; width:45px; height:45px; border-radius:50%; cursor:pointer; font-size:18px; }
        .lmis-modal-body{ padding:25px; }

        /* INDUSTRY GRID */
        .industry-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:20px; }
        .industry-card{ background:#f8fafc; border-radius:18px; padding:20px; transition:0.3s; border:1px solid #e2e8f0; }
        .industry-card:hover{ transform:translateY(-5px); box-shadow:0 10px 25px rgba(0,0,0,0.08); }
        .industry-card-top{ display:flex; align-items:center; gap:12px; margin-bottom:18px; }
        .industry-icon{ color:#0ea5e9; font-size:22px; }
        .industry-name{ font-weight:600; color:#0f172a; font-size:13px; }
        .industry-value{ font-size:32px; font-weight:700; color:#0ea5e9; }

        /* JOB SEEKER SUMMARY */
        .job-seeker-summary{ display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:25px; }
        .summary-box{ background:#f8fafc; border-radius:18px; padding:20px; display:flex; align-items:center; gap:15px; }
        .summary-box svg{ font-size:30px; color:#0ea5e9; }
        .summary-box h3{ font-size:28px; }

        /* TABLE */
        .lmis-modal-table-header, .lmis-modal-table-row{ display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:15px; padding:16px; align-items:center; }
        .lmis-modal-table-header{ background:#0f172a; color:white; border-radius:14px; font-weight:600; }
        .lmis-modal-table-row{ border-bottom:1px solid #e2e8f0; font-size:14px; }

        /* MODAL FOOTER */
        .lmis-modal-footer{ padding:20px 25px; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:15px; }
        .lmis-modal-btn{ background:#0ea5e9; color:white; border:none; padding:14px 22px; border-radius:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:10px; }
        .secondary-btn{ background:#0f172a; }
        .lmis-modal-empty, .lmis-modal-loading{ text-align:center; padding:50px 20px; }
        .modal-empty-icon{ font-size:50px; color:#94a3b8; margin-bottom:15px; }

        @keyframes spin{ from{ transform:rotate(0deg); } to{ transform:rotate(360deg); } }
        .spin{ animation:spin 1s linear infinite; }

        @media(max-width:768px){
          .lmis-grid{ grid-template-columns:1fr; }
          .lmis-search-form{ width:100%; }
          .lmis-hero-title{ font-size:34px; }
          .lmis-modal-wide{ width:100%; }
          .lmis-modal-table-header, .lmis-modal-table-row{ grid-template-columns:1fr; }
          .job-seeker-summary{ grid-template-columns:1fr; }
        }

      `}</style>

    </div>

  );

};

export default Home;
