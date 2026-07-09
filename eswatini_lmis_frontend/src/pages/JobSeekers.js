import React, { useEffect, useState, useCallback } from 'react';
import heroImage from "../assets/seeker.jpg";
import API from '../services/api';
import {
  FaUserAlt, FaBriefcase, FaPlus, FaEnvelope, FaSpinner,
  FaTimes, FaSearch, FaCalendarAlt
} from 'react-icons/fa';

const JobSeekers = () => {
  const [seekers, setSeekers] = useState([]);
  const [filteredSeekers, setFilteredSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    if (!successMessage) return;
    const timeout = setTimeout(() => setSuccessMessage(''), 2000);
    return () => clearTimeout(timeout);
  }, [successMessage]);

  const sectors = [
    "Accommodation and Food Service Activities",
    "Administrative and Support Service Activities",
    "Agriculture, forestry and fishing",
    "Arts, Entertainment and Recreation",
    "Construction",
    "Education",
    "Electricity, Gas, Steam and Air Condition Supply",
    "Financial and Insurance Activities",
    "Human Health and Social Work Activities",
    "Information and Communication",
    "Manufacturing",
    "Mining and Quarrying",
    "Other Service Activities",
    "Professional, Scientific and Technical Activities",
    "Public Administration and Defence",
    "Real Estate Activities",
    "Repair of Motor Vehicles and Motorcycles",
    "Transport and Storage",
    "Water Supply, Sewerage & Waste Management",
    "Wholesale and retail trade"
  ];

  const regions = ['Hhohho', 'Lubombo', 'Manzini', 'Shiselweni'];

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    national_id: '',
    description: '',
    phone: '',
    education_level: '',
    region: 'Hhohho',
    sector: sectors[0],
    employment_status: 'Unemployed',
    skills: '',
    experience_years: 0,
    profile_picture: null
  });

  // Use the centralized API service for consistent backend requests.
  const MAX_PROFILE_PIC_SIZE = 5 * 1024 * 1024;

  const fetchSeekers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get('/employees');
      setSeekers(response.data);
      setFilteredSeekers(response.data);
      setErrorMessage('');
    } catch (err) {
      console.error('Unable to load talent pool:', err);
      const message = err?.response?.data?.error || err?.message || 'Unable to load talent pool. Check backend.';
      setErrorMessage(message);
      setSeekers([]);
      setFilteredSeekers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeekers();
  }, [fetchSeekers]);

  // Filter logic
  useEffect(() => {
    let result = [...seekers];
    if (selectedRegion !== 'All') result = result.filter(s => s.region === selectedRegion);
    if (selectedSector !== 'All' && selectedSector !== 'All Sectors') result = result.filter(s => s.sector === selectedSector);
    if (selectedYear) {
      result = result.filter((s) => {
        const year = s.created_at ? new Date(s.created_at).getFullYear() : null;
        return year === Number(selectedYear);
      });
    }
    if (searchName.trim()) {
      const query = searchName.toLowerCase();
      result = result.filter(s =>
        (s.fullname?.toLowerCase() || '').includes(query) ||
        (s.sector?.toLowerCase()    || '').includes(query)
      );
    }
    setFilteredSeekers(result);
  }, [selectedRegion, selectedSector, selectedYear, searchName, seekers]);

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    if (!formData.full_name || !formData.email || !formData.description) {
      setErrorMessage('Please fill in all required fields (*)');
      setSubmitting(false);
      return;
    }
    try {
      if (formData.profile_picture && formData.profile_picture.size > MAX_PROFILE_PIC_SIZE) {
        setErrorMessage('Profile picture too large. Please use an image under 5MB.');
        setSubmitting(false);
        return;
      }

      setSuccessMessage('Creating your job seeker profile...');

      // Use the centralized API service for consistent backend handling.
      const profileResponse = await API.post('/employees', {
        full_name:         formData.full_name,
        email:             formData.email,
        national_id:       formData.national_id,
        description:       formData.description,
        phone:             formData.phone,
        education_level:   formData.education_level,
        region:            formData.region,
        sector:            formData.sector,
        skills:            formData.skills,
        experience_years:  parseInt(formData.experience_years) || 0,
        employment_status: formData.employment_status,
        profile_picture:   formData.profile_picture ? await fileToBase64(formData.profile_picture) : null
      });

      const profileData = profileResponse.data || {};

      if (profileResponse.status >= 400) {
        setErrorMessage(profileData.error || 'Registration failed');
        setSubmitting(false);
        return;
      }

      setSuccessMessage('You have registered successfully.');
      setShowModal(false);
      setFormData({
        full_name: '',
        email: '',
        national_id: '',
        description: '',
        phone: '',
        education_level: '',
        region: 'Hhohho',
        sector: sectors[0],
        employment_status: 'Unemployed',
        skills: '',
        experience_years: 0,
        profile_picture: null,
      });
      fetchSeekers();
    } catch (err) {
      setErrorMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleProfilePictureChange = (file) => {
    if (!file) {
      setFormData({ ...formData, profile_picture: null });
      return;
    }

    if (file.size > MAX_PROFILE_PIC_SIZE) {
      setErrorMessage('Profile picture too large. Please use an image under 5MB.');
      setFormData({ ...formData, profile_picture: null });
      return;
    }

    setErrorMessage('');
    setFormData({ ...formData, profile_picture: file });
  };

  return (
    <div style={styles.pageWrapper}>

      {/* ── AUTH BAR (replaces old header login buttons) ── */}

      {/* ── HERO ── */}
      <section
  style={{
    ...styles.subHero,
    backgroundImage: `url(${heroImage})`
  }}
>
        <div style={styles.heroOverlay}>
          <div style={styles.heroContent}>
            <h2 style={styles.heroTitle}>Talent Pool</h2>
            <p style={{ color: '#fff', opacity: 0.9, marginBottom: '20px' }}>
              Connecting Eswatini's workforce with opportunity.
            </p>
            <button onClick={() => setShowModal(true)} style={styles.registerActionBtn}>
              <FaPlus style={{ marginRight: '10px' }} /> New Job Seeker
            </button>
          </div>
        </div>
      </section>

      {successMessage && !showModal && (
        <div style={styles.successPopup}>{successMessage}</div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={styles.mainContent}>

        {/* Filters */}
        <div style={styles.filterContainer}>
          <div style={styles.filterRow}>
            <div style={styles.filterSection}>
              <h4 style={styles.filterLabel}>Sector</h4>
              <select
                style={styles.filterSelect}
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
              >
                <option value="All">All Sectors</option>
                {sectors.map((sec, idx) => (
                  <option key={idx} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
            <div style={styles.filterSection}>
              <h4 style={styles.filterLabel}>Year</h4>
              <div style={styles.selectWithIcon}>
                <FaCalendarAlt style={styles.fieldIcon} />
                <input
                  type="date"
                  style={{ ...styles.filterSelect, paddingLeft: '42px' }}
                  value={selectedYear ? `${selectedYear}-01-01` : ''}
                  onChange={(e) => setSelectedYear(e.target.value ? e.target.value.slice(0, 4) : '')}
                />
              </div>
              <span style={styles.filterHint}>Leave blank for All Years</span>
            </div>
            <div style={styles.filterSection}>
              <h4 style={styles.filterLabel}>Region</h4>
              <select
                style={styles.filterSelect}
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <option value="All">All Regions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.searchSection}>
            <div style={styles.searchWrapper}>
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name or sector..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                style={{ ...styles.searchInput, paddingLeft: '40px' }}
              />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div style={styles.resultsCount}>
          Found {filteredSeekers.length} job seeker{filteredSeekers.length !== 1 ? 's' : ''}
        </div>

        {/* Job Seekers Grid */}
        <div style={styles.cardGrid}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <FaSpinner style={styles.spinner} />
              <p>Loading talent database...</p>
            </div>
          ) : filteredSeekers.length > 0 ? (
            filteredSeekers.map((s) => (
              <div key={s.id} style={styles.seekerCard}>
                <div style={styles.cardTop}>
                  <div style={styles.profileImageContainer}>
                    {s.profile_picture ? (
                      <img src={s.profile_picture} alt={s.fullname} style={styles.profileImage} />
                    ) : (
                      <div style={styles.avatarIcon}><FaUserAlt color="#fff" /></div>
                    )}
                  </div>
                  <div style={styles.cardMeta}>
                    <h3 style={styles.seekerName}>{s.fullname}</h3>
                    <div style={styles.regionTag}>{s.region || 'Region not specified'}</div>
                  </div>
                <div style={styles.cardHeader}>
                      <div style={styles.profileImageContainer}>
                          {s.profile_picture ? (
                              <img src={s.profile_picture} alt={s.fullname} style={styles.profileImage} />
                          ) : (
                              <div style={styles.avatarIcon}><FaUserAlt color="#fff" /></div>
                          )}
                      </div>
                      <div style={styles.cardMeta}>
                          <h3 style={styles.seekerName}>{s.fullname}</h3>
                          <div style={styles.regionTag}>{s.region || 'Region not specified'}</div>
                      </div>
                  </div>
                </div>
                <p style={styles.sectorText} title={s.sector}>
                  <FaBriefcase style={{ marginRight: '8px', flexShrink: 0 }} />
                  <span style={styles.truncateText}>{s.sector || 'Sector not specified'}</span>
                </p>
                <p style={styles.description}>{s.description || 'Highly motivated professional seeking opportunities.'}</p>
                <div style={styles.cardFooter}>
                  {s.experience_years > 0 && <span style={styles.experienceTag}>{s.experience_years} yrs exp.</span>}
                  <button style={styles.contactBtn}><FaEnvelope style={{ marginRight: '6px' }} /> Contact</button>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.noResults}>
              <p>No job seekers found matching your filters.</p>
              <button
                onClick={() => { setSelectedRegion('All'); setSelectedSector('All'); setSelectedYear(''); setSearchName(''); }}
                style={styles.resetBtn}
              >Clear All Filters</button>
            </div>
          )}
        </div>
      </main>


      {/* ── REGISTRATION MODAL ── */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>New Job Seeker Registration</h3>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}><FaTimes /></button>
            </div>
            {errorMessage   && <div style={styles.errorBanner}>{errorMessage}</div>}
            {successMessage && <div style={styles.successBanner}>{successMessage}</div>}
            <form onSubmit={handleRegister} style={styles.formBody}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input required style={styles.input} value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address *</label>
                  <input type="email" required style={styles.input} value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <input className="fancy-input" style={styles.input} value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g., +26877123456"
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>National ID</label>
                  <input className="fancy-input" style={styles.input} value={formData.national_id}
                    onChange={e => setFormData({ ...formData, national_id: e.target.value })}
                    placeholder="e.g., 1234567890"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Education Level</label>
                  <input className="fancy-input" style={styles.input} value={formData.education_level}
                    onChange={e => setFormData({ ...formData, education_level: e.target.value })}
                    placeholder="e.g., Tertiary, Secondary"
                  />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Sector *</label>
                <select required className="fancy-input" style={styles.input} value={formData.sector}
                  onChange={e => setFormData({ ...formData, sector: e.target.value })}>
                  {sectors.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Professional Summary *</label>
                <textarea required className="fancy-input" style={{ ...styles.input, height: '80px' }} value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about your skills, experience, and career goals..."
                />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Region *</label>
                  <select required className="fancy-input" style={styles.input} value={formData.region}
                      onChange={e => setFormData({ ...formData, region: e.target.value })}>
                    {regions.map((r, i) => <option key={i} value={r}>{r}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Employment Status</label>
                  <select className="fancy-input" style={styles.input} value={formData.employment_status}
                      onChange={e => setFormData({ ...formData, employment_status: e.target.value })}>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Employed">Employed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Student">Student</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Profile Picture</label>
                <input type="file" accept="image/*" className="fancy-input" style={styles.input}
                  onChange={e => handleProfilePictureChange(e.target.files[0] || null)}
                />
                <span style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                  Max size 5MB. Use JPG/PNG for best results.
                </span>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Skills (comma separated)</label>
                <input style={styles.input} value={formData.skills}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g., JavaScript, Project Management, Data Analysis"
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" className="submit-btn fancy-btn" style={styles.submitBtn} disabled={submitting}>
                  {submitting ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  pageWrapper:          { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F1F5F9', fontFamily: 'sans-serif' },

  /* Auth bar — slim strip replacing old header */
  authBar:              { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', padding: '10px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eee' },
  loginBtn:             { padding: '8px 20px', border: '1px solid #103063', borderRadius: '4px', background: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  logoutBtn:            { padding: '8px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' },
  userBadge:            { padding: '8px 16px', backgroundColor: '#f1f5f9', borderRadius: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' },

  /* Hero */
subHero: {
  height: '250px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center'
},
  heroOverlay:          { backgroundColor: 'transparent', width: '100%', height: '100%', display: 'flex', alignItems: 'center' },
  heroContent:          { padding: '0 5%' },
  heroTitle:            { color: '#fff', fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' },
  registerActionBtn:    { backgroundColor: '#00AEEF', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' },

  /* Main */
  mainContent:          { width: '90%', margin: '40px auto', flex: 1 },
  successPopup:         { position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 3000, minWidth: '320px', maxWidth: '520px', padding: '16px 22px', borderRadius: '16px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', boxShadow: '0 20px 40px rgba(16, 48, 99, 0.15)', fontSize: '15px', fontWeight: 700, textAlign: 'center' },
  filterContainer:      { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' },
  searchSection:        { marginTop: '20px' },
  searchWrapper:        { position: 'relative', width: '100%' },
  searchIcon:           { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' },
  searchInput:          { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' },
  filterRow:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', alignItems: 'flex-end' },
  selectWithIcon:       { position: 'relative', width: '100%' },
  fieldIcon:            { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' },
  filterSection:        { display: 'flex', flexDirection: 'column' },
  filterSelect:         { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e6eef7', fontSize: '14px', background: '#fbfdff', outline: 'none' },
  filterLabel:          { fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' },
  filterHint:           { fontSize: '11px', color: '#94a3b8', marginTop: '6px' },
  filterBtnGroup:       { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  regionBtn:            { background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 18px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
  regionBtnActive:      { background: '#103063', color: '#fff', border: '1px solid #103063', padding: '8px 18px', borderRadius: '4px', fontSize: '13px' },
  sectorFilterDropdown: { padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '14px', width: '100%', maxWidth: '400px', backgroundColor: '#f8fafc', outline: 'none' },
  resultsCount:         { marginBottom: '20px', color: '#64748b', fontSize: '14px' },
  cardGrid:             { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' },
  seekerCard:           { background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)', padding: '28px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(16, 48, 99, 0.08), 0 2px 4px rgba(16, 48, 99, 0.04)', border: '2px solid #b3d9f5', display: 'flex', flexDirection: 'column', transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', position: 'relative', overflow: 'hidden' },

  seekerCardHover:      { transform: 'translateY(-6px) scale(1.01)', boxShadow: '0 16px 24px rgba(16, 48, 99, 0.15), 0 8px 12px rgba(16, 48, 99, 0.08)', borderColor: '#00AEEF' },

  cardTop:              { display: 'flex', gap: '16px', marginBottom: '18px', alignItems: 'flex-start' },

  profileImageContainer: { width: '62px', height: '62px', borderRadius: '16px', overflow: 'hidden', background: 'linear-gradient(135deg, #00AEEF, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)', transition: 'all 0.3s ease' },

  profileImage:         { width: '100%', height: '100%', objectFit: 'cover' },

  avatarIcon:           { fontSize: '28px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  cardMeta:             { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },

  seekerName:           { margin: 0, fontSize: '20px', fontWeight: 700, color: '#103063', lineHeight: 1.3, transition: 'color 0.3s ease' },

  cardHeader:           { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  avatar:               { width: '45px', height: '45px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  regionTag:            { alignSelf: 'flex-start', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: '#065f46', border: '1px solid #86efac', transition: 'all 0.2s ease' },
  experienceTag:        { background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: '#1e40af', border: '1px solid #93c5fd', display: 'inline-block', transition: 'all 0.2s ease' },
  sectorText:           { fontSize: '14px', color: '#64748b', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', overflow: 'hidden', fontWeight: 500 },
  truncateText:         { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  description:          { fontSize: '14px', lineHeight: '1.6', color: '#334155', minHeight: '65px', fontWeight: 500 },
  cardFooter:           { marginTop: 'auto', borderTop: '2px solid #cbd5e1', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  contactBtn:           { flex: 1, padding: '11px 16px', border: 'none', background: 'linear-gradient(135deg, #103063, #134074)', color: '#fff', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(16, 48, 99, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },

  contactBtnHover:      { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(16, 48, 99, 0.35)' },
  loadingContainer:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', gridColumn: '1/-1' },
  spinner:              { fontSize: '40px', color: '#103063', animation: 'spin 1s linear infinite' },
  noResults:            { textAlign: 'center', padding: '60px', gridColumn: '1/-1' },
  resetBtn:             { marginTop: '15px', padding: '8px 20px', background: '#103063', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },

  /* Modals */
  modalOverlay:         { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '90px', zIndex: 2000 },
  modalContent:         { background: '#fff', width: '680px', borderRadius: '12px', overflow: 'hidden', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', marginTop: '10px', boxShadow: '0 12px 40px rgba(2,6,23,0.15)' },
  modalContentSmall:    { background: '#fff', width: '450px', borderRadius: '12px', overflow: 'hidden' },
  modalHeader:          { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn:             { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' },
  errorBanner:          { backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 20px', margin: '10px 20px', borderRadius: '8px', fontSize: '13px' },
  successBanner:        { backgroundColor: '#dcfce7', color: '#16a34a', padding: '12px 20px', margin: '10px 20px', borderRadius: '8px', fontSize: '13px' },
  formBody:             { padding: '25px' },
  formRow:              { display: 'flex', gap: '20px', marginBottom: '15px' },
  formGroup:            { flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '15px' },
  label:                { fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#475569' },
  input:                { padding: '12px 14px', border: '1px solid #e6eef7', borderRadius: '12px', fontSize: '14px', background: '#fbfdff' },
  hint:                 { fontSize: '12px', color: '#64748b', marginTop: '6px' },
  modalActions:         { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px' },
  cancelBtn:            { padding: '10px 25px', background: '#f1f5f9', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.25s ease' },
  submitBtn:            { padding: '10px 25px', background: 'linear-gradient(90deg,#103063,#0e7490)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', boxShadow: '0 8px 20px rgba(2,6,23,0.12)', transition: 'transform 0.18s ease, box-shadow 0.18s ease' },
  errorText:            { color: '#dc2626', fontSize: '13px', marginTop: '5px', textAlign: 'center' },
  demoNote:             { fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee' },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .job-seeker-card:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 16px 24px rgba(16, 48, 99, 0.15), 0 8px 12px rgba(16, 48, 99, 0.08);
    border-color: #00AEEF;
  }

  .job-seeker-card:hover::before {
    opacity: 1;
  }
  .fancy-input { transition: box-shadow 0.18s ease, transform 0.12s ease; border-radius: 12px; }
  .fancy-input:focus { box-shadow: 0 8px 18px rgba(14,165,233,0.12); transform: translateY(-2px); outline: none; border-color: #06b6d4; }
  .fancy-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(2,6,23,0.12); }
  .submit-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(2,6,23,0.18); }
  .cancel-btn:hover { transform: translateY(-2px); }
  .fancy-input[type="file"] { padding: 8px; }
`;
document.head.appendChild(styleSheet);

export default JobSeekers;
