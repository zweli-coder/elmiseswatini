import React, { useState } from "react";
import { FaBook, FaCheckCircle, FaExclamationCircle, FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  'https://elmiseswatini-backend.onrender.com';

const API_ENDPOINT = `${API_BASE}/api`;

const AdminPublications = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    year: ""
  });

  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setUploadStatus(null);

    if (!form.title || !form.description || !form.category || !form.year || !file) {
      setUploadStatus({ type: 'error', message: 'All fields are required' });
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("description", form.description);
    data.append("category", form.category);
    data.append("year", form.year);
    data.append("file", file);

    try {
      const token = localStorage.getItem('lmis_token');
      const response = await fetch(`${API_ENDPOINT}/publications`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (response.ok) {
        setUploadStatus({ type: 'success', message: 'Publication uploaded successfully!' });
        setForm({ title: "", description: "", category: "", year: "" });
        setFile(null);
      } else {
        const err = await response.json();
        setUploadStatus({ type: 'error', message: `Upload failed: ${err.error || 'Server error'}` });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Network error occurred during upload.' });
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#f3f7fb',
      padding: '40px 30px',
      fontFamily: 'Inter, Arial, sans-serif'
    },
    heroBanner: {
      position: 'relative',
      borderRadius: '28px',
      minHeight: '240px',
      backgroundImage: 'url(https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1400&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      marginBottom: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    heroOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, rgba(15,23,42,0.20), rgba(15,23,42,0.70))'
    },
    heroText: {
      position: 'relative',
      zIndex: 1,
      textAlign: 'center',
      padding: '40px 24px',
      color: '#ffffff'
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      maxWidth: '1200px',
      marginBottom: '32px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    header: {
      maxWidth: '700px'
    },
    sectionTag: {
      color: '#0ea5e9',
      fontWeight: 700,
      letterSpacing: '1px',
      textTransform: 'uppercase',
      marginBottom: '10px',
      fontSize: '12px'
    },
    title: {
      fontSize: '38px',
      margin: 0,
      color: '#103063',
      lineHeight: 1.08
    },
    description: {
      color: '#475569',
      fontSize: '16px',
      marginTop: '14px',
      maxWidth: '740px'
    },
    backBtn: {
      border: 'none',
      borderRadius: '12px',
      padding: '12px 20px',
      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      color: '#ffffff',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    formContainer: {
      maxWidth: '700px',
      margin: '0 auto',
      backgroundColor: '#e0f2fe', // Light sky blue theme
      borderRadius: '28px',
      padding: '40px',
      boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
      border: '1px solid rgba(148, 163, 184, 0.16)'
    },
    formGroup: {
      marginBottom: '24px',
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      fontSize: '14px',
      fontWeight: 700,
      color: '#0f172a',
      marginBottom: '8px'
    },
    input: {
      padding: '14px 16px',
      borderRadius: '12px',
      border: '1px solid rgba(15, 23, 42, 0.12)',
      fontSize: '15px',
      fontFamily: 'Inter, Arial, sans-serif',
      transition: 'border-color 0.24s ease, box-shadow 0.24s ease',
      backgroundColor: '#ffffff'
    },
    inputFocus: {
      borderColor: '#0ea5e9',
      boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)',
      outline: 'none'
    },
    textarea: {
      padding: '14px 16px',
      borderRadius: '12px',
      border: '1px solid rgba(15, 23, 42, 0.12)',
      fontSize: '15px',
      fontFamily: 'Inter, Arial, sans-serif',
      minHeight: '120px',
      resize: 'vertical',
      transition: 'border-color 0.24s ease, box-shadow 0.24s ease',
      backgroundColor: '#ffffff'
    },
    fileInput: {
      padding: '14px 16px',
      borderRadius: '12px',
      border: '2px dashed rgba(14, 165, 233, 0.40)',
      backgroundColor: '#dbeafe',
      cursor: 'pointer',
      transition: 'border-color 0.24s ease'
    },
    button: {
      padding: '14px 28px',
      borderRadius: '12px',
      border: 'none',
      backgroundColor: '#0ea5e9',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      boxShadow: '0 12px 24px rgba(14, 165, 233, 0.2)',
      width: '100%'
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    alert: {
      padding: '16px 20px',
      borderRadius: '12px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '15px'
    },
    alertSuccess: {
      backgroundColor: '#d1fae5',
      color: '#166534',
      border: '1px solid #bbf7d0'
    },
    alertError: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      border: '1px solid #fecaca'
    },
    fileName: {
      marginTop: '8px',
      fontSize: '13px',
      color: '#475569',
      fontWeight: 600
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        input:focus, textarea:focus {
          border-color: #0ea5e9 !important;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1) !important;
          outline: none !important;
        }
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px rgba(14, 165, 233, 0.3);
        }
      `}</style>

      {/* Hero Banner */}
      <div style={styles.heroBanner}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroText}>
          <p style={styles.sectionTag}>Publication Management</p>
          <h1 style={{ fontSize: '42px', margin: 0, marginTop: '8px' }}>Upload Publications</h1>
          <p style={{ fontSize: '18px', marginTop: '12px', opacity: 0.94 }}>
            Share labour market reports, research, and official documents
          </p>
        </div>
      </div>

      {/* Header */}
      <div style={styles.headerRow}>
        <div style={styles.header}>
          <p style={styles.sectionTag}>Admin Hub</p>
          <h2 style={styles.title}>Publication Admin</h2>
          <p style={styles.description}>
            Upload new publications and manage labour market information resources.
          </p>
        </div>
        <button style={styles.backBtn} onClick={() => navigate('/admin')}>
          <FaChevronLeft /> Back to Dashboard
        </button>
      </div>

      {/* Form Container */}
      <div style={styles.formContainer}>
        {uploadStatus && (
          <div style={{
            ...styles.alert,
            ...(uploadStatus.type === 'success' ? styles.alertSuccess : styles.alertError)
          }}>
            {uploadStatus.type === 'success' ? (
              <FaCheckCircle style={{ fontSize: '20px' }} />
            ) : (
              <FaExclamationCircle style={{ fontSize: '20px' }} />
            )}
            {uploadStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Publication Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g., Labour Market Report 2024"
              value={form.title}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Description */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Resource Description</label>
            <textarea
              name="description"
              placeholder="Provide a detailed description of the publication..."
              value={form.description}
              onChange={handleChange}
              style={styles.textarea}
              required
            />
          </div>

          {/* Category */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Document Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={{ ...styles.input, cursor: 'pointer' }}
              required
            >
              <option value="">-- Select Category --</option>
              <option value="Laws">Laws</option>
              <option value="Report">Report</option>
              <option value="Policies">Policies</option>
              <option value="Questionnaire">Questionnaire</option>
            </select>
          </div>

          {/* Year */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Release Year</label>
            <input
              type="number"
              name="year"
              placeholder="e.g., 2024"
              value={form.year}
              onChange={handleChange}
              style={styles.input}
              min="2000"
              max={new Date().getFullYear()}
              required
            />
          </div>

          {/* File Upload */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Attach Document</label>
            <input
              type="file"
              onChange={handleFileChange}
              style={styles.fileInput}
              accept=".pdf,.doc,.docx"
              required
            />
            {file && <p style={styles.fileName}>Selected: {file.name}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {})
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Uploading...' : 'Publish Resource'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPublications;
