import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaTrash, FaSpinner, FaChevronLeft, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import './AdminPublicationsManage.css';

const API_ENDPOINT = process.env.REACT_APP_API_URL || 'https://elmiseswatini-backend.onrender.com/api';

const AdminPublicationsManage = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewingPublication, setViewingPublication] = useState(null);

  // Fetch all publications
  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_ENDPOINT}/publications`);
      if (!response.ok) {
        throw new Error('Failed to fetch publications');
      }
      const data = await response.json();
      setPublications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching publications:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (publicationId, title) => {
    setDeleting(true);
    setDeleteMessage(null);
    try {
      const token = localStorage.getItem('lmis_token');
      const response = await fetch(`${API_ENDPOINT}/publications/${publicationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete publication');
      }

      // Remove from state
      setPublications(publications.filter(p => p.id !== publicationId));
      setDeleteMessage({
        type: 'success',
        text: `Publication "${title}" deleted successfully!`
      });
      setDeleteConfirm(null);

      // Auto-hide success message after 3 seconds
      setTimeout(() => setDeleteMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting publication:', err);
      setDeleteMessage({
        type: 'error',
        text: `Error: ${err.message}`
      });
    } finally {
      setDeleting(false);
    }
  };

  // Filter publications
  const filteredPublications = publications.filter(pub => {
    const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pub.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || pub.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(publications.map(p => p.category))];

  return (
    <div className="admin-publications-manage">
      {/* Header */}
      <div className="admin-manage-header">
        <button className="back-btn" onClick={() => navigate('/admin')}>
          <FaChevronLeft /> Back to Dashboard
        </button>
        <h1><FaBook /> Manage Publications</h1>
        <p>View, search, and delete publications from the system</p>
      </div>

      {/* Status Messages */}
      {deleteMessage && (
        <div className={`status-message ${deleteMessage.type}`}>
          {deleteMessage.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{deleteMessage.text}</span>
        </div>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <div className="error-message">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchPublications}>Retry</button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search publications by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="results-count">
          {filteredPublications.length} of {publications.length} publications
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading publications...</p>
        </div>
      ) : filteredPublications.length === 0 ? (
        <div className="empty-state">
          <FaBook className="empty-icon" />
          <p>{searchTerm || filterCategory ? 'No publications match your search.' : 'No publications found.'}</p>
        </div>
      ) : (
        <div className="publications-grid">
          {filteredPublications.map(pub => (
            <div key={pub.id} className="publication-card">
              <div className="card-header">
                <h3>{pub.title}</h3>
                <span className="category-badge">{pub.category}</span>
              </div>

              <div className="card-body">
                <p className="description">{pub.description}</p>
                <div className="meta-info">
                  <span className="year">{pub.year}</span>
                  <span className="type">{pub.type}</span>
                </div>
              </div>

              <div className="card-footer">
                <button
                  className="view-btn"
                  onClick={() => setViewingPublication(pub)}
                  title="View publication details"
                >
                  View
                </button>
                <button
                  className="delete-btn"
                  onClick={() => setDeleteConfirm(pub)}
                  disabled={deleting}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <FaExclamationCircle className="warning-icon" />
              <h2>Delete Publication?</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete:</p>
              <p className="publication-title">"{deleteConfirm.title}"</p>
              <p className="warning-text">This action cannot be undone. The publication will be removed from the database and the public page.</p>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.title)}
                disabled={deleting}
              >
                {deleting ? <FaSpinner className="spinner" /> : <FaTrash />}
                {deleting ? 'Deleting...' : 'Delete Publication'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Publication Modal */}
      {viewingPublication && (
        <div className="modal-overlay" onClick={() => setViewingPublication(null)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <FaBook className="view-icon" />
              <h2>Publication Details</h2>
            </div>
            <div className="modal-body view-modal-body">
              <div className="view-field">
                <label>Title</label>
                <p className="field-value">{viewingPublication.title}</p>
              </div>
              <div className="view-field">
                <label>Description</label>
                <p className="field-value">{viewingPublication.description}</p>
              </div>
              <div className="view-field">
                <label>Category</label>
                <p className="field-value badge-style">{viewingPublication.category}</p>
              </div>
              <div className="view-field-row">
                <div className="view-field">
                  <label>Year</label>
                  <p className="field-value">{viewingPublication.year}</p>
                </div>
                <div className="view-field">
                  <label>Type</label>
                  <p className="field-value">{viewingPublication.type}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setViewingPublication(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPublicationsManage;
