import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaDownload,
  FaDatabase,
  FaCode,
  FaFileAlt,
  FaChartBar,
  FaBook,
  FaExternalLinkAlt,
  FaSpinner
} from 'react-icons/fa';
import { API_ENDPOINT } from '../services/api';
import './Resources.css';

const Resources = () => {
  const [reports, setReports] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => {
    fetchResourcesData();
  }, []);

  const fetchResourcesData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch publications which serve as reports and data
      const publicationsResponse = await fetch(`${API_ENDPOINT}/publications`);
      if (!publicationsResponse.ok) {
        throw new Error('Failed to fetch publications');
      }
      const publicationsData = await publicationsResponse.json();
      setPublications(publicationsData || []);

      // Filter publications into reports
      const reportsList = publicationsData.filter(
        pub => pub.category === 'Report' || 
                pub.type === 'Reports' || 
                pub.file_type === 'pdf'
      );
      setReports(reportsList.length > 0 ? reportsList : publicationsData);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const constructFileUrl = (relativeUrl) => {
    if (!relativeUrl) return '';
    const base = String(API_ENDPOINT).replace(/\/api\/?$/i, '');
    return `${base}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
  };

  const downloadFile = (pub) => {
    const fileUrl = constructFileUrl(pub.file_url || pub.file_path);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = pub.title || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="resources-page">
      {/* Hero Section */}
      <div className="resources-hero">
        <div className="hero-content">
          <h1>Resources</h1>
          <p>Access reports, data, API documentation, and other resources to support your labour market analysis.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="resources-container">
        {/* Tab Navigation */}
        <div className="resources-tabs">
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FaChartBar /> Reports & Data
          </button>
          <button
            className={`tab-btn ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            <FaCode /> API Documentation
          </button>
          <button
            className={`tab-btn ${activeTab === 'guides' ? 'active' : ''}`}
            onClick={() => setActiveTab('guides')}
          >
            <FaBook /> Guides & Tutorials
          </button>
        </div>

        {/* Tab Content */}
        <div className="resources-content">
          {/* Reports & Data Tab */}
          {activeTab === 'reports' && (
            <div className="tab-pane active">
              <div className="section-header">
                <h2>Reports & Data</h2>
                <p>Download comprehensive labour market reports and datasets for analysis and research.</p>
              </div>

              {loading ? (
                <div className="loading-spinner">
                  <FaSpinner className="spinner-icon" />
                  <p>Loading resources...</p>
                </div>
              ) : error ? (
                <div className="error-message">
                  <p>{error}</p>
                  <button onClick={fetchResourcesData} className="retry-btn">
                    Retry
                  </button>
                </div>
              ) : reports.length > 0 ? (
                <div className="reports-grid">
                  {reports.map((report, idx) => (
                    <div key={idx} className="report-card">
                      <div className="report-icon">
                        <FaFileAlt />
                      </div>
                      <h3>{report.title || 'Untitled Report'}</h3>
                      <p className="report-desc">{report.description || 'Labour market report'}</p>
                      <div className="report-meta">
                        {report.year && <span className="meta-badge">{report.year}</span>}
                        {report.file_type && <span className="meta-badge">{report.file_type.toUpperCase()}</span>}
                        {report.size && <span className="meta-badge">{report.size}</span>}
                      </div>
                      <button
                        className="download-btn"
                        onClick={() => downloadFile(report)}
                      >
                        <FaDownload /> Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaDatabase className="empty-icon" />
                  <p>No reports available at the moment.</p>
                  <p className="empty-subtitle">Please check back later for updated resources.</p>
                </div>
              )}
            </div>
          )}

          {/* API Documentation Tab */}
          {activeTab === 'api' && (
            <div className="tab-pane active">
              <div className="section-header">
                <h2>API Documentation</h2>
                <p>Integrate ELMIS data into your applications with our RESTful API.</p>
              </div>

              <div className="api-documentation">
                <div className="api-intro">
                  <p>The ELMIS API provides programmatic access to labour market data, statistics, and information.</p>
                </div>

                {/* API Endpoints */}
                <div className="api-section">
                  <h3>Available Endpoints</h3>
                  
                  <div className="endpoint-card">
                    <div className="endpoint-header">
                      <span className="method get">GET</span>
                      <code>/api/publications</code>
                    </div>
                    <p className="endpoint-desc">Retrieve all publications and reports</p>
                    <details className="endpoint-details">
                      <summary>View Details</summary>
                      <div className="details-content">
                        <h4>Response:</h4>
                        <pre>{`{
  "publications": [
    {
      "id": "1",
      "title": "Labour Market Report 2024",
      "description": "Annual report",
      "category": "Report",
      "file_url": "/uploads/publications/report.pdf"
    }
  ]
}`}</pre>
                      </div>
                    </details>
                  </div>

                  <div className="endpoint-card">
                    <div className="endpoint-header">
                      <span className="method get">GET</span>
                      <code>/api/statistics</code>
                    </div>
                    <p className="endpoint-desc">Retrieve labour market statistics and indicators</p>
                    <details className="endpoint-details">
                      <summary>View Details</summary>
                      <div className="details-content">
                        <h4>Query Parameters:</h4>
                        <ul>
                          <li><code>year</code> - Filter by year</li>
                          <li><code>sector</code> - Filter by economic sector</li>
                        </ul>
                      </div>
                    </details>
                  </div>

                  <div className="endpoint-card">
                    <div className="endpoint-header">
                      <span className="method get">GET</span>
                      <code>/api/vacancies</code>
                    </div>
                    <p className="endpoint-desc">Retrieve job vacancy listings</p>
                    <details className="endpoint-details">
                      <summary>View Details</summary>
                      <div className="details-content">
                        <h4>Query Parameters:</h4>
                        <ul>
                          <li><code>sector</code> - Filter by sector</li>
                          <li><code>status</code> - Filter by status (active, closed)</li>
                        </ul>
                      </div>
                    </details>
                  </div>

                  <div className="endpoint-card">
                    <div className="endpoint-header">
                      <span className="method get">GET</span>
                      <code>/api/economic-sectors</code>
                    </div>
                    <p className="endpoint-desc">Retrieve economic sector information</p>
                    <details className="endpoint-details">
                      <summary>View Details</summary>
                      <div className="details-content">
                        <h4>Returns:</h4>
                        <p>List of all economic sectors with descriptions and related data</p>
                      </div>
                    </details>
                  </div>
                </div>

                {/* Authentication */}
                <div className="api-section">
                  <h3>Authentication</h3>
                  <p>Public endpoints do not require authentication. For admin endpoints, include a Bearer token:</p>
                  <pre><code>Authorization: Bearer YOUR_API_TOKEN</code></pre>
                </div>

                {/* Rate Limiting */}
                <div className="api-section">
                  <h3>Rate Limiting</h3>
                  <p>API requests are limited to 1000 requests per hour per IP address.</p>
                </div>

                {/* Full Documentation Link */}
                <div className="api-cta">
                  <Link to="/api-docs" className="primary-btn">
                    View Full API Documentation <FaExternalLinkAlt />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Guides & Tutorials Tab */}
          {activeTab === 'guides' && (
            <div className="tab-pane active">
              <div className="section-header">
                <h2>Guides & Tutorials</h2>
                <p>Learn how to use ELMIS and access the data you need.</p>
              </div>

              <div className="guides-grid">
                <div className="guide-card">
                  <div className="guide-icon">
                    <FaBook />
                  </div>
                  <h3>Getting Started</h3>
                  <p>An introduction to ELMIS and how to navigate the platform.</p>
                  <a href="#getting-started" className="guide-link">Read Guide →</a>
                </div>

                <div className="guide-card">
                  <div className="guide-icon">
                    <FaChartBar />
                  </div>
                  <h3>Using Statistics</h3>
                  <p>Learn how to access and interpret labour market statistics.</p>
                  <a href="#statistics-guide" className="guide-link">Read Guide →</a>
                </div>

                <div className="guide-card">
                  <div className="guide-icon">
                    <FaCode />
                  </div>
                  <h3>API Integration</h3>
                  <p>Guide for developers integrating ELMIS API into applications.</p>
                  <a href="#api-integration" className="guide-link">Read Guide →</a>
                </div>

                <div className="guide-card">
                  <div className="guide-icon">
                    <FaDatabase />
                  </div>
                  <h3>Data Download</h3>
                  <p>How to download and export labour market data.</p>
                  <a href="#data-download" className="guide-link">Read Guide →</a>
                </div>
              </div>

              {/* FAQs */}
              <div className="faqs-section">
                <h3>Frequently Asked Questions</h3>
                
                <details className="faq-item">
                  <summary>What data is available in ELMIS?</summary>
                  <p>ELMIS provides comprehensive labour market information including job statistics, vacancy listings, economic sector data, and educational training opportunities.</p>
                </details>

                <details className="faq-item">
                  <summary>Can I download all data?</summary>
                  <p>Yes, most data can be downloaded through the platform. Some datasets may require registration or special access permissions.</p>
                </details>

                <details className="faq-item">
                  <summary>Is the API free to use?</summary>
                  <p>Yes, our API is free for non-commercial use. For commercial applications, please contact us for licensing information.</p>
                </details>

                <details className="faq-item">
                  <summary>How often is data updated?</summary>
                  <p>Data is updated regularly. Statistical data is typically updated quarterly, while job listings are updated continuously.</p>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resources;
