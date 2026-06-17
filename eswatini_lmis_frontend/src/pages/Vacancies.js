// ===============================
// VACANCIES.JS - COMPLETE VERSION
// ===============================

import React, { useEffect, useState } from "react";
import heroImage from "../assets/vacanyy.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import {
  FaSearch,
  FaBriefcase,
  FaTimes,
  FaMapMarkerAlt,
  FaFilter,
  FaBuilding,
  FaClock,
  FaChevronRight,
  FaSpinner
} from "react-icons/fa";

export default function Vacancies() {

  // ===============================
  // STATE MANAGEMENT
  // ===============================

  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalMode, setModalMode] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [applicationForm, setApplicationForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    sector: "",
    job_type: "",
    cover_letter: ""
  });
  const [applicationFiles, setApplicationFiles] = useState({
    cv_file: null,
    cover_letter_file: null,
    other_file: null
  });
  const MAX_APPLICATION_FILE_SIZE = 15 * 1024 * 1024;
  const ALLOWED_APPLICATION_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const navigate = useNavigate();
  const location = useLocation();

  // ===============================
  // STATIC DATA
  // ===============================

  const sectors = [
    "Agriculture, Forestry and Fishing",
    "Mining and Quarrying",
    "Manufacturing",
    "Electricity, Gas, Steam and Air Conditioning Supply",
    "Water Supply, Sewerage, Waste Management and Remediation Activities",
    "Construction",
    "Wholesale and Retail Trade; Repair of Motor Vehicles and Motorcycles",
    "Transportation and Storage",
    "Accommodation and Food Service Activities",
    "Information and Communication",
    "Financial and Insurance Activities",
    "Real Estate Activities",
    "Professional, Scientific and Technical Activities",
    "Administrative and Support Service Activities",
    "Public Administration and Defence; Compulsory Social Security",
    "Education",
    "Human Health and Social Work Activities",
    "Arts, Entertainment and Recreation",
    "Other Service Activities",
    "Activities of Households as Employers; Undifferentiated Goods and Services-Producing Activities of Households for Own Use",
    "Activities of Extraterritorial Organisations and Bodies",
    "Tourism"
  ];

  const regions = [
    "Hhohho",
    "Lubombo",
    "Manzini",
    "Shiselweni"
  ];

  // ===============================
  // FETCH JOBS
  // ===============================

  useEffect(() => {

    const fetchJobs = async () => {

      setLoading(true);

      try {

        let res;

        try {
          res = await fetch("/api/jobs");
        } catch {
          res = await fetch("https://elmiseswatini-backend.onrender.com/api/jobs");
        }

        if (res.ok) {

          const data = await res.json();

          setAllJobs(Array.isArray(data) ? data : []);
          setFilteredJobs(Array.isArray(data) ? data : []);

        }

      } catch (err) {

        console.error("Jobs fetch error:", err);

      } finally {

        setLoading(false);

      }

    };

    fetchJobs();

  }, []);

  // ===============================
  // FETCH ORGANISATIONS
  // ===============================

  // ===============================
  // FILTER LOGIC
  // ===============================

  useEffect(() => {

    let results = allJobs;

    // SEARCH
    if (search.trim()) {

      results = results.filter((job) =>
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.location?.toLowerCase().includes(search.toLowerCase()) ||
        job.organisation_name?.toLowerCase().includes(search.toLowerCase())
      );

    }

    // FILTER BY SECTOR
    if (selectedSector) {

      results = results.filter((job) =>
        job.sector?.toLowerCase() === selectedSector.toLowerCase()
      );

    }

    // FILTER BY REGION
    if (selectedRegion) {

      results = results.filter((job) =>
        job.location?.toLowerCase().includes(selectedRegion.toLowerCase())
      );

    }

    setFilteredJobs(results);

  }, [search, selectedSector, selectedRegion, allJobs]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sectorParam = params.get('sector')?.trim();
    if (sectorParam) {
      setSelectedSector(sectorParam);
    }
  }, [location.search]);

  // ===============================
  // HANDLE FORM INPUT
  // ===============================

  // Employers post vacancies from the employer dashboard.

  // ===============================
  // SUBMIT VACANCY
  // ===============================

  // Employers post vacancies from the employer dashboard.


  // ===============================
  // TIME AGO
  // ===============================

  const timeAgo = (date) => {

    if (!date) return "Recently";

    const diff = Math.floor(
      (Date.now() - new Date(date)) / (1000 * 60 * 60 * 24)
    );

    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;

    return `${Math.floor(diff / 30)} months ago`;

  };

  // ===============================
  // UI
  // ===============================
const decodeToken = (token) => {
  try {
    const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
    const payload = raw.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const getAuthToken = () => {
  return localStorage.getItem('lmis_token');
};

const getUserId = () => {
  const token = getAuthToken();
  if (!token) return null;
  const payload = decodeToken(token);
  return payload?.id || null;
};

const fetchCurrentUser = async () => {
  try {
    const res = await API.get('/auth/me');
    return res.data;
  } catch {
    return null;
  }
};

const handleApplicationFile = (field, file) => {
  if (!file) {
    setApplicationFiles((prev) => ({ ...prev, [field]: null }));
    return;
  }

  if (!ALLOWED_APPLICATION_FILE_TYPES.includes(file.type)) {
    setApplyMessage('Only PDF, Word, and plain text files are allowed.');
    return;
  }

  if (file.size > MAX_APPLICATION_FILE_SIZE) {
    setApplyMessage('Each file must be 15MB or smaller.');
    return;
  }

  setApplyMessage('');
  setApplicationFiles((prev) => ({ ...prev, [field]: file }));
};

const closeModal = () => {
  setSelectedJob(null);
  setModalMode("");
  setApplyMessage("");
  setApplicationForm({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    sector: "",
    job_type: "",
    cover_letter: ""
  });
  setApplicationFiles({
    cv_file: null,
    cover_letter_file: null,
    other_file: null
  });
  setUserEmail("");
};

const handleApply = async (job) => {
  const token = getAuthToken();
  let selected = job;

  if (!selected || typeof selected !== 'object') {
    selected = allJobs.find((item) => String(item.id) === String(job));
  }

  if (!selected) return;

  if (!token) {
    localStorage.setItem('pending_vacancy_id', selected.id);
    setSelectedJob(selected);
    setModalMode('auth');
    return;
  }

  const currentUser = await fetchCurrentUser();
  if (currentUser) {
    setUserEmail(currentUser.email || "");
    setApplicationForm((prev) => ({
      ...prev,
      full_name: currentUser.full_name || prev.full_name,
      email: currentUser.email || prev.email,
    }));
  }

  setSelectedJob(selected);
  setModalMode('details');
};

const handleJobApply = async () => {
  if (!selectedJob) return;
  const userId = getUserId();

  if (!userId) {
    setApplyMessage('Unable to identify your account. Please log in again.');
    return;
  }

  if (
    !applicationForm.full_name.trim() ||
    !applicationForm.email.trim() ||
    !applicationForm.company.trim() ||
    !applicationForm.location.trim() ||
    !applicationForm.sector.trim() ||
    !applicationForm.job_type.trim() ||
    !applicationForm.cover_letter.trim()
  ) {
    setApplyMessage('Please complete your name, email, company, location, sector, job type, and cover letter before applying.');
    return;
  }

  if (!applicationFiles.cv_file) {
    setApplyMessage('Please attach your CV to complete the application.');
    return;
  }

  setApplyLoading(true);
  setApplyMessage('');

  try {
    const formData = new FormData();
    formData.append('job_id', selectedJob.id);
    formData.append('user_id', userId);
    formData.append('full_name', applicationForm.full_name);
    formData.append('email', applicationForm.email);
    formData.append('phone', applicationForm.phone);
    formData.append('company', applicationForm.company);
    formData.append('location', applicationForm.location);
    formData.append('sector', applicationForm.sector);
    formData.append('job_type', applicationForm.job_type);
    formData.append('cover_letter', applicationForm.cover_letter);
    formData.append('cv_file', applicationFiles.cv_file);

    if (applicationFiles.cover_letter_file) {
      formData.append('cover_letter_file', applicationFiles.cover_letter_file);
    }

    if (applicationFiles.other_file) {
      formData.append('other_file', applicationFiles.other_file);
    }

    const res = await API.post('/apply', formData);

    setApplyMessage(res.data?.message || 'Application submitted successfully.');
    setApplicationFiles({ cv_file: null, cover_letter_file: null, other_file: null });
  } catch (err) {
    setApplyMessage(err?.response?.data?.error || 'Unable to apply for this job.');
  } finally {
    setApplyLoading(false);
  }
};

useEffect(() => {
  const token = getAuthToken();
  const pendingId = localStorage.getItem('pending_vacancy_id');

  if (token && pendingId && allJobs.length > 0) {
    const job = allJobs.find((item) => String(item.id) === String(pendingId));
    if (job) {
      setSelectedJob(job);
      setModalMode('details');
    }
    localStorage.removeItem('pending_vacancy_id');
  }
}, [allJobs]);

  return (

    <div className="vac-root">

      {/* HEADER */}


      {/* HERO */}

      <section className="vac-hero">
        <div className="vac-hero-image">
  <img
  src={heroImage}
  alt="Hero Background"
/>
</div>

        <div className="vac-hero-inner">

          <p className="vac-hero-mini">
            Kingdom of Eswatini
          </p>

          <h1 className="vac-hero-title">
            Job Vacancies
          </h1>

          <p className="vac-hero-sub">
            Browse the latest employment opportunities
            across all sectors and regions of Eswatini.
          </p>

          <div className="vac-hero-stats">

            <div className="vac-hero-stat">
              <strong>{allJobs.length}</strong>
              <span>Open Vacancies</span>
            </div>

            <div className="vac-hero-stat-divider"></div>

            <div className="vac-hero-stat">
              <strong>{sectors.length}</strong>
              <span>Sectors</span>
            </div>

            <div className="vac-hero-stat-divider"></div>

            <div className="vac-hero-stat">
              <strong>{regions.length}</strong>
              <span>Regions</span>
            </div>

          </div>

        </div>

      </section>

      {/* MAIN */}

      <main className="vac-main">

        {/* ACTION BAR */}

        <div className="vac-action-bar">

          <div className="vac-search-wrap">

            <FaSearch className="vac-search-icon" />

            <input
              className="vac-search-input"
              placeholder="Search by title, organisation or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (

              <button
                className="vac-search-clear"
                onClick={() => setSearch("")}
              >
                <FaTimes />
              </button>

            )}

          </div>

        </div>

        {/* FILTERS */}

        <div className="vac-filter-card">

          <div className="vac-filter-row">

            {/* SECTORS */}

            <div className="vac-filter-group">

              <h4 className="vac-filter-label">
                <FaFilter />
                Filter by Sector
              </h4>

              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="vac-sector-dropdown"
              >
                <option value="">All Sectors</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>

            </div>

            {/* REGIONS */}

            <div className="vac-filter-group">

              <h4 className="vac-filter-label">
                <FaMapMarkerAlt />
                Filter by Region
              </h4>

              <div className="vac-tags">

                <span
                  className={`vac-tag ${selectedRegion === "" ? "active" : ""}`}
                  onClick={() => setSelectedRegion("")}
                >
                  All
                </span>

                {regions.map((region) => (

                  <span
                    key={region}
                    className={`vac-tag ${selectedRegion === region ? "active" : ""}`}
                    onClick={() =>
                      setSelectedRegion(
                        selectedRegion === region ? "" : region
                      )
                    }
                  >
                    {region}
                  </span>

                ))}

              </div>

            </div>

          </div>

        </div>

        {/* RESULTS HEADER */}

        <div className="vac-results-header">

          <span className="vac-results-count">
            {loading
              ? "Loading..."
              : `${filteredJobs.length} vacancies found`}
          </span>

          {(selectedSector || selectedRegion || search) && (

            <button
              className="vac-clear-filters"
              onClick={() => {
                setSearch("");
                setSelectedSector("");
                setSelectedRegion("");
              }}
            >
              <FaTimes />
              Clear Filters
            </button>

          )}

        </div>

        {selectedSector && !loading && (
          <div className="vac-filter-context">
            Showing vacancies for <strong>{selectedSector}</strong>. If there are no matching openings, the page will tell you and provide a way back.
          </div>
        )}

        {/* LOADING */}

        {loading ? (

          <div className="vac-loading">

            <FaSpinner className="spin" />

            <p>Loading vacancies...</p>

          </div>

        ) : filteredJobs.length === 0 ? (

          <div className="vac-empty">

            <FaBriefcase className="vac-empty-icon" />

            <h3>{selectedSector ? `No vacancies found for ${selectedSector}` : 'No vacancies found'}</h3>

            <p>
              {selectedSector
                ? `There are currently no open positions matching the ${selectedSector} sector. Try clearing the sector filter or return to the dashboard.`
                : 'Try adjusting your search or filters.'}
            </p>

            {selectedSector && (
              <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="vac-submit-btn" onClick={() => navigate(-1)}>Go back</button>
                <button className="vac-cancel-btn" onClick={() => setSelectedSector('')}>Clear Sector Filter</button>
              </div>
            )}

          </div>

        ) : (

          <div className="vac-grid">

            {filteredJobs.map((job, index) => (

              <div
                key={job.id || index}
                className="vac-card"
              >

                <div className="vac-card-top">

                  <div className="vac-card-icon">
                    <FaBuilding />
                  </div>

                  <div className="vac-card-meta">

                    <span className="vac-card-company">
                      {job.organisation_name || "Government of Eswatini"}
                    </span>

                    <span className="vac-card-time">
                      <FaClock style={{ marginRight: "4px" }} />
                      {timeAgo(job.created_at)}
                    </span>

                  </div>

                </div>

                <h3 className="vac-card-title">
                  {job.title}
                </h3>

                <div className="vac-card-tags">

                  {job.job_type && (
                    <span className="vac-job-type">
                      {job.job_type}
                    </span>
                  )}

                  {job.sector && (
                    <span className="vac-sector-badge">
                      {job.sector}
                    </span>
                  )}

                  {job.location && (
                    <span className="vac-location">
                      <FaMapMarkerAlt style={{ marginRight: "4px" }} />
                      {job.location}
                    </span>
                  )}

                </div>

                <p className="vac-card-desc">
                  {job.description?.length > 120
                    ? job.description.substring(0, 120) + "..."
                    : job.description}
                </p>

                <div className="vac-card-footer">

                  <span className="vac-sector-footer">
                    <FaBriefcase style={{ marginRight: "5px" }} />
                    {job.sector || "General"}
                  </span>

                  <button className="vac-apply-btn"
                    onClick={() => handleApply(job)}
                    >
                    Apply
                    <FaChevronRight style={{ marginLeft: "4px" }} />
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>

      {selectedJob && modalMode && (
        <div className="vac-modal-backdrop" onClick={closeModal}>
          <div className="vac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vac-modal-header">
              <div>
                <p className="vac-modal-eyebrow">
                  {modalMode === 'auth' ? 'Login required' : 'Job details'}
                </p>
                <h2 className="vac-modal-title">
                  {modalMode === 'auth'
                    ? 'Please log in or register to apply for this job'
                    : selectedJob.title}
                </h2>
              </div>
              <button className="vac-modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <div className="vac-modal-body">
              {modalMode === 'auth' ? (
                <>
                  <p className="vac-card-desc">
                    You must be signed in to view the full vacancy details and apply.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      className="vac-submit-btn"
                      onClick={() => navigate(`/login?redirect=/vacancies?jobId=${selectedJob.id || ''}`)}
                    >
                      Login
                    </button>
                    <button
                      className="vac-cancel-btn"
                      onClick={() => navigate(`/register?redirect=/vacancies?jobId=${selectedJob.id || ''}`)}
                    >
                      Register
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="vac-detail-grid">
                    <div className="vac-detail-row">
                      <span className="vac-detail-label">Company</span>
                      <span>{selectedJob.organisation_name || 'Government of Eswatini'}</span>
                    </div>
                    {selectedJob.location && (
                      <div className="vac-detail-row">
                        <span className="vac-detail-label">Location</span>
                        <span>{selectedJob.location}</span>
                      </div>
                    )}
                    <div className="vac-detail-row">
                      <span className="vac-detail-label">Sector</span>
                      <span>{selectedJob.sector || 'Not specified'}</span>
                    </div>
                    {selectedJob.job_type && (
                      <div className="vac-detail-row">
                        <span className="vac-detail-label">Job type</span>
                        <span>{selectedJob.job_type}</span>
                      </div>
                    )}
                  </div>

                  <div className="vac-application-area">
                    <div className="vac-form-group full">
                      <strong>Description</strong>
                      <p style={{ marginTop: '8px', color: '#334155', lineHeight: 1.75 }}>
                        {selectedJob.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="vac-form-group full">
                      <label>
                        Full Name
                        <input
                          className="vac-input"
                          type="text"
                          value={applicationForm.full_name}
                          onChange={(e) => setApplicationForm({ ...applicationForm, full_name: e.target.value })}
                          placeholder="Your full name"
                        />
                      </label>
                    </div>
                    <div className="vac-form-group full">
                      <label>
                        Company
                        <input
                          className="vac-input"
                          type="text"
                          value={applicationForm.company}
                          onChange={(e) => setApplicationForm({ ...applicationForm, company: e.target.value })}
                          placeholder="Company you are applying to"
                        />
                      </label>
                    </div>
                    <div className="vac-form-group full">
                      <label>
                        Location
                        <input
                          className="vac-input"
                          type="text"
                          value={applicationForm.location}
                          onChange={(e) => setApplicationForm({ ...applicationForm, location: e.target.value })}
                          placeholder="Job location"
                        />
                      </label>
                    </div>
                    <div className="vac-form-group full">
                      <label>
                        Select Sector
                        <select
                          className="vac-input"
                          value={applicationForm.sector}
                          onChange={(e) => setApplicationForm({ ...applicationForm, sector: e.target.value })}
                        >
                          <option value="">Choose a sector</option>
                          {sectors.map((sector) => (
                            <option key={sector} value={sector}>
                              {sector}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="vac-form-group full">
                      <label>
                        Job Type
                        <select
                          className="vac-input"
                          value={applicationForm.job_type}
                          onChange={(e) => setApplicationForm({ ...applicationForm, job_type: e.target.value })}
                        >
                          <option value="">Choose a job type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Temporary">Temporary</option>
                          <option value="Internship">Internship</option>
                          <option value="Other">Other</option>
                        </select>
                      </label>
                    </div>
                    <div className="vac-form-group full">
                      <label>
                        Application Email
                        <input
                          className="vac-input"
                          type="email"
                          value={applicationForm.email}
                          onChange={(e) => {
                            if (!userEmail) {
                              setApplicationForm({ ...applicationForm, email: e.target.value });
                            }
                          }}
                          placeholder="Use the email address for this application"
                          readOnly={!!userEmail}
                        />
                      </label>
                      {userEmail && <small className="vac-form-note">Using your signed-in email for this application.</small>}
                    </div>
                    <div className="vac-form-group full">
                      <label>
                        Phone Number
                        <input
                          className="vac-input"
                          type="tel"
                          value={applicationForm.phone}
                          onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
                          placeholder="Your phone number"
                        />
                      </label>
                    </div>
                    <div className="vac-form-group full">
                      <label>
                        Upload CV (required)
                        <input
                          className="vac-input"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => handleApplicationFile('cv_file', e.target.files[0])}
                        />
                      </label>
                      {applicationFiles.cv_file && (
                        <small className="vac-form-note">Selected file: {applicationFiles.cv_file.name}</small>
                      )}
                    </div>
                    <div className="vac-form-group full">
                      <label>
                        Upload Cover Letter (optional)
                        <input
                          className="vac-input"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => handleApplicationFile('cover_letter_file', e.target.files[0])}
                        />
                      </label>
                      {applicationFiles.cover_letter_file && (
                        <small className="vac-form-note">Selected file: {applicationFiles.cover_letter_file.name}</small>
                      )}
                    </div>
                    <div className="vac-form-group full">
                      <label>
                        Upload Additional File (optional)
                        <input
                          className="vac-input"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => handleApplicationFile('other_file', e.target.files[0])}
                        />
                      </label>
                      {applicationFiles.other_file && (
                        <small className="vac-form-note">Selected file: {applicationFiles.other_file.name}</small>
                      )}
                    </div>
                    <div className="vac-form-group full">
                      <label>
                        Cover Letter / Application Note
                        <textarea
                          className="vac-input vac-textarea"
                          rows="5"
                          value={applicationForm.cover_letter}
                          onChange={(e) => setApplicationForm({ ...applicationForm, cover_letter: e.target.value })}
                          placeholder="Write a short note explaining why you are a fit for this role"
                        />
                      </label>
                    </div>
                    {applyMessage && (
                    <div className={`vac-alert ${applyMessage.toLowerCase().includes('success') ? 'success' : 'error'}`}>
                      {applyMessage}
                    </div>
                  )}
                  </div>
                </>
              )}
            </div>
            {modalMode === 'details' && (
              <div className="vac-modal-footer">
                <button className="vac-cancel-btn" onClick={closeModal}>
                  Close
                </button>
                <button className="vac-submit-btn" onClick={handleJobApply} disabled={applyLoading}>
                  {applyLoading ? 'Applying...' : 'Apply for this job'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
.vac-hero{
  position: relative;
  min-height: 340px;
  width: 100%;
  overflow: hidden;

  display: flex;
  align-items: center;

  padding: 40px 80px;

  color: #fff;
}

.vac-hero-image{
  position: absolute;
  inset: 0;
  z-index: 0;
}

.vac-hero-image img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.25;
}

.vac-hero-inner{
  position: relative;
  z-index: 1;
}
      

        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
          font-family:Inter,sans-serif;
        }

        body{
          background:#f4f7fb;
        }

        .vac-root{
          min-height:100vh;
        }

        .vac-header{
          background:white;
          padding:16px 40px;
          border-bottom:1px solid #e2e8f0;
        }

        .vac-modal-backdrop{
          position:fixed;
          inset:0;
          background:rgba(0,0,0,.45);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:18px; /* ensure spacing on small screens */
          z-index:999;
        }

        .vac-modal{
          background:white;
          width:100%;
          max-width:620px; /* smaller, more compact */
          border-radius:14px;
          overflow:hidden;
          box-shadow:0 14px 36px rgba(15,23,42,0.14);
          max-height:80vh; /* prevent overlap with viewport */
          display:flex;
          flex-direction:column;
        }

        .vac-modal-header{
          background:#0b2545;
          padding:16px 18px;
          display:flex;
          justify-content:space-between;
          align-items:center;
        }

        .vac-modal-title{
          color:white;
          font-size:1rem;
          line-height:1.2;
        }
        .vac-hero-sub{
          color:rgba(255,255,255,.7);
          max-width:700px;
        }

        .vac-hero-mini{
          color:#7dd3fc;
          margin-bottom:12px;
        }

        .vac-hero-stats{
          display:flex;
          gap:20px;
          margin-top:30px;
        }

        .vac-hero-stat strong{
          color:white;
          display:block;
          font-size:28px;
        }

        .vac-hero-stat span{
          color:rgba(255,255,255,.7);
          font-size:12px;
        }

        .vac-hero-stat-divider{
          width:1px;
          background:rgba(255,255,255,.2);
        }

        .vac-main{
          padding:40px;
        }

        .vac-action-bar{
          display:flex;
          gap:16px;
          margin-bottom:24px;
        }

        .vac-search-wrap{
          flex:1;
          display:flex;
          align-items:center;
          background:white;
          border-radius:12px;
          border:1px solid #e2e8f0;
          padding:0 16px;
        }

        .vac-search-input{
          flex:1;
          border:none;
          outline:none;
          padding:14px;
        }

        .vac-search-clear{
          border:none;
          background:none;
          cursor:pointer;
        }

        .vac-add-btn{
          background:#0b2545;
          color:white;
          border:none;
          padding:14px 22px;
          border-radius:12px;
          cursor:pointer;
          font-weight:600;
          display:flex;
          align-items:center;
          gap:8px;
        }

        .vac-filter-card{
          background:#f3f4f6;
          padding:24px;
          border-radius:16px;
          margin-bottom:24px;
          border:1px solid #e5e7eb;
        }

        .vac-filter-row{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:30px;
        }

        .vac-sector-dropdown{
          padding:12px 14px;
          border-radius:10px;
          border:1px solid #d1d5db;
          outline:none;
          background:white;
          font-size:14px;
          font-weight:500;
          color:#0b2545;
          cursor:pointer;
          transition:all 0.3s ease;
        }

        .vac-sector-dropdown:hover{
          border-color:#0ea5e9;
          box-shadow:0 2px 8px rgba(14, 165, 233, 0.15);
        }

        .vac-sector-dropdown:focus{
          border-color:#0ea5e9;
        }

        .vac-filter-context{
          background:#e0f2fe;
          border:1px solid #bae6fd;
          color:#0c4a6e;
          padding:16px 22px;
          border-radius:14px;
          margin-bottom:20px;
          font-size:14px;
          line-height:1.7;
        }
          box-shadow:0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .vac-filter-label{
          margin-bottom:10px;
          display:flex;
          align-items:center;
          gap:8px;
          color:#0b2545;
        }

        .vac-tags{
          display:flex;
          flex-wrap:wrap;
          gap:8px;
        }

        .vac-tag{
          padding:7px 14px;
          border-radius:999px;
          border:1px solid #e2e8f0;
          cursor:pointer;
          font-size:12px;
        }

        .vac-tag.active{
          background:#0ea5e9;
          color:white;
        }

        .vac-results-header{
          display:flex;
          justify-content:space-between;
          margin-bottom:20px;
        }

        .vac-clear-filters{
          border:none;
          background:#ef4444;
          color:white;
          padding:8px 14px;
          border-radius:8px;
          cursor:pointer;
        }

        .vac-grid{
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(340px,1fr));
          gap:24px;
        }

        .vac-card{
          background:#e0f7ff;
          border-radius:20px;
          padding:28px;
          border:2px solid #b3d9f5;
          box-shadow:0 4px 6px rgba(11, 37, 69, 0.08), 0 2px 4px rgba(11, 37, 69, 0.04);
          transition:all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          position:relative;
          overflow:hidden;
        }

        .vac-card::before{
          content:'';
          position:absolute;
          top:0;
          left:0;
          right:0;
          height:3px;
          background:linear-gradient(90deg, #0b2545, #0ea5e9);
          opacity:0;
          transition:opacity 0.3s ease;
        }

        .vac-card:hover{
          transform:translateY(-6px) scale(1.01);
          box-shadow:0 16px 24px rgba(11, 37, 69, 0.15), 0 8px 12px rgba(11, 37, 69, 0.08);
          border-color:#0ea5e9;
          border-width:2px;
          background:#d4effe;
        }

        .vac-card:hover::before{
          opacity:1;
        }

        .vac-card-top{
          display:flex;
          gap:14px;
          margin-bottom:18px;
          align-items:flex-start;
        }

        .vac-card-icon{
          width:50px;
          height:50px;
          background:linear-gradient(135deg, #0ea5e9, #06b6d4);
          border-radius:14px;
          display:flex;
          align-items:center;
          justify-content:center;
          color:white;
          font-size:22px;
          flex-shrink:0;
          box-shadow:0 4px 12px rgba(14, 165, 233, 0.25);
          transition:all 0.3s ease;
        }

        .vac-card:hover .vac-card-icon{
          transform:scale(1.1) rotate(5deg);
          box-shadow:0 6px 16px rgba(14, 165, 233, 0.35);
        }

        .vac-card-company{
          font-size:12px;
          font-weight:700;
          display:block;
          color:#0b2545;
          letter-spacing:0.3px;
          text-transform:uppercase;
        }

        .vac-card-time{
          font-size:11px;
          color:#94a3b8;
          display:flex;
          align-items:center;
          gap:4px;
          margin-top:4px;
        }

        .vac-card-title{
          font-size:19px;
          margin-bottom:14px;
          font-weight:700;
          color:#0b2545;
          line-height:1.4;
          transition:color 0.3s ease;
        }

        .vac-card:hover .vac-card-title{
          color:#0ea5e9;
        }

        .vac-card-tags{
          display:flex;
          flex-wrap:wrap;
          gap:8px;
          margin-bottom:16px;
        }

        .vac-job-type{
          background:linear-gradient(135deg, #f0fdf4, #dcfce7);
          color:#065f46;
          border:1px solid #86efac;
          padding:5px 12px;
          border-radius:999px;
          font-size:11px;
          font-weight:600;
          transition:all 0.2s ease;
        }

        .vac-job-type:hover{
          transform:scale(1.05);
          box-shadow:0 2px 8px rgba(6, 95, 70, 0.15);
        }

        .vac-sector-badge{
          background:linear-gradient(135deg, #eff6ff, #dbeafe);
          color:#1e40af;
          border:1px solid #93c5fd;
          padding:5px 12px;
          border-radius:999px;
          font-size:11px;
          font-weight:600;
          transition:all 0.2s ease;
        }

        .vac-sector-badge:hover{
          transform:scale(1.05);
          box-shadow:0 2px 8px rgba(30, 64, 175, 0.15);
        }

        .vac-location{
          background:linear-gradient(135deg, #f1f5f9, #e2e8f0);
          border:1px solid #cbd5e1;
          padding:5px 12px;
          border-radius:999px;
          font-size:11px;
          font-weight:600;
          color:#475569;
          display:flex;
          align-items:center;
          gap:4px;
          transition:all 0.2s ease;
        }

        .vac-location:hover{
          transform:scale(1.05);
          background:linear-gradient(135deg, #e2e8f0, #cbd5e1);
          box-shadow:0 2px 8px rgba(71, 85, 105, 0.15);
        }

        .vac-card-desc{
          color:#64748b;
          font-size:14px;
          line-height:1.6;
          margin-bottom:18px;
          font-weight:500;
        }

        .vac-card-footer{
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding-top:16px;
          border-top:2px solid #cbd5e1;
        }

        .vac-sector-footer{
          font-size:12px;
          font-weight:700;
          color:#0b2545;
          display:flex;
          align-items:center;
          gap:6px;
        }

        .vac-apply-btn{
          background:linear-gradient(135deg, #0b2545, #134074);
          color:white;
          border:none;
          padding:10px 18px;
          border-radius:10px;
          cursor:pointer;
          display:flex;
          align-items:center;
          gap:6px;
          font-weight:600;
          font-size:13px;
          transition:all 0.3s ease;
          box-shadow:0 4px 12px rgba(11, 37, 69, 0.25);
          position:relative;
          overflow:hidden;
        }

        .vac-apply-btn::before{
          content:'';
          position:absolute;
          top:0;
          left:-100%;
          width:100%;
          height:100%;
          background:rgba(255, 255, 255, 0.2);
          transition:left 0.3s ease;
          z-index:-1;
        }

        .vac-apply-btn:hover{
          transform:translateY(-2px);
          box-shadow:0 6px 16px rgba(11, 37, 69, 0.35);
          background:linear-gradient(135deg, #134074, #0b2545);
        }

        .vac-apply-btn:hover::before{
          left:100%;
        }

        .vac-apply-btn:active{
          transform:translateY(0);
        }

        .vac-loading,
        .vac-empty{
          padding:80px;
          text-align:center;
        }

        .vac-empty-icon{
          font-size:42px;
          color:#cbd5e1;
          margin-bottom:10px;
        }

        .vac-modal-backdrop{
          position:fixed;
          inset:0;
          background:rgba(0,0,0,.6);
          display:flex;
          align-items:center;
          justify-content:center;
          z-index:999;
        }

        .vac-modal{
          background:white;
          width:min(100%, 680px);
          max-width:680px;
          border-radius:20px;
          overflow:hidden;
          box-shadow:0 18px 40px rgba(15,23,42,0.18);
        }

        .vac-modal-header{
          background:#0b2545;
          padding:20px 22px;
          display:flex;
          justify-content:space-between;
          align-items:center;
        }

        .vac-modal-title{
          color:white;
          font-size:1.1rem;
          line-height:1.3;
        }

        .vac-modal-eyebrow{
          color:#7dd3fc;
          font-size:11px;
          margin-bottom:5px;
        }

        .vac-modal-close{
          border:none;
          background:none;
          color:white;
          font-size:18px;
          cursor:pointer;
        }

        .vac-modal-body{
          padding:14px 16px 12px;
          overflow:auto; /* enable scrolling when content is tall */
        }

        .vac-detail-grid{
          display:grid;
          grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));
          gap:10px;
          margin-bottom:14px;
        }

        .vac-detail-row{
          display:flex;
          flex-direction:column;
          justify-content:space-between;
          gap:6px;
          border:1px solid #e2e8f0;
          border-radius:14px;
          padding:14px 16px;
          background:#f8fafc;
        }

        .vac-detail-label{
          font-size:0.92rem;
          font-weight:700;
          color:#334155;
          text-transform:uppercase;
          letter-spacing:0.02em;
        }

        .vac-detail-row span:last-child{
          color:#0f172a;
          font-size:0.96rem;
          line-height:1.6;
        }

        .vac-form-grid{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:16px;
        }

        .vac-form-group{
          display:flex;
          flex-direction:column;
          gap:10px;
        }

        .vac-form-group.full{
          grid-column:1/-1;
        }

        .vac-form-group label{
          font-weight:700;
          color:#334155;
          display:flex;
          flex-direction:column;
          gap:8px;
        }

        .vac-application-area{
          background: linear-gradient(180deg, rgba(235,248,255,0.94) 0%, rgba(245,251,255,0.96) 100%);
          border: 1px solid rgba(59,130,246,0.16);
          border-radius: 12px;
          padding: 12px;
          box-shadow: inset 0 0 0 1px rgba(15,23,42,0.02);
          margin-top: 12px;
        }

        .vac-application-area .vac-form-group.full{
          margin-bottom: 16px;
        }

        .vac-input{
          width:100%;
          padding:14px 16px;
          border-radius:12px;
          border:1px solid #bfdbfe;
          background:#ffffff;
          outline:none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          font-size:0.96rem;
          color:#0f172a;
        }

        .vac-input:focus{
          border-color:#2563eb;
          box-shadow:0 0 0 4px rgba(37,99,235,0.12);
        }

        .vac-textarea{
          min-height:140px;
          resize:vertical;
          background:#ffffff;
        }

        .vac-form-note{
          color:#2563eb;
          font-size:0.88rem;
          margin-top:-8px;
        }

        .vac-alert{
          padding:12px 16px;
          border-radius:10px;
          margin-bottom:16px;
          display:flex;
          align-items:center;
          gap:8px;
        }

        .vac-alert.success{
          background:#ecfdf5;
          color:#065f46;
        }

        .vac-alert.error{
          background:#fef2f2;
          color:#991b1b;
        }

        .vac-modal-footer{
          padding:20px 24px;
          display:flex;
          justify-content:flex-end;
          gap:12px;
        }

        .vac-cancel-btn{
          padding:12px 18px;
          border-radius:10px;
          border:1px solid #e2e8f0;
          cursor:pointer;
        }

        .vac-submit-btn{
          background:#0b2545;
          color:white;
          border:none;
          padding:12px 20px;
          border-radius:10px;
          cursor:pointer;
          display:flex;
          align-items:center;
          gap:8px;
        }

        .spin{
          animation:spin 1s linear infinite;
        }

        @keyframes spin{
          from{transform:rotate(0deg);}
          to{transform:rotate(360deg);}
        }

        @media(max-width:768px){

          .vac-main{
            padding:20px;
          }

          .vac-action-bar{
            flex-direction:column;
          }

          .vac-filter-row{
            grid-template-columns:1fr;
          }

          .vac-form-grid{
            grid-template-columns:1fr;
          }

          .vac-hero-title{
            font-size:30px;
          }

        }

      `}</style>

    </div>

  );

}