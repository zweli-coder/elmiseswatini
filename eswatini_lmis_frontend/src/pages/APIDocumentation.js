import React, { useEffect, useState } from 'react';
import { FaCode, FaBook, FaArrowUp } from 'react-icons/fa';
import './APIDocumentation.css';

const APIDocumentation = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="api-documentation-page">
      <div className="api-hero">
        <div className="hero-content">
          <FaCode className="hero-icon" />
          <h1>API Documentation</h1>
          <p>Complete reference for integrating ELMIS data into your applications</p>
        </div>
      </div>

      <div className="api-documentation-container">
        <div className="api-content">
          <div className="toc-section">
            <h2>Quick Links</h2>
            <ul className="toc-list">
              <li><a href="#overview">Overview</a></li>
              <li><a href="#authentication">Authentication</a></li>
              <li><a href="#endpoints">Available Endpoints</a></li>
              <li><a href="#rate-limiting">Rate Limiting</a></li>
              <li><a href="#error-handling">Error Handling</a></li>
              <li><a href="#examples">Examples</a></li>
            </ul>
          </div>

          <section id="overview" className="api-section">
            <h2>Overview</h2>
            <p>The ELMIS API provides programmatic access to comprehensive labour market data including:</p>
            <ul>
              <li>Job listings and vacancies</li>
              <li>Labour statistics and indicators</li>
              <li>Economic sector information</li>
              <li>Education and training opportunities</li>
              <li>Publications and reports</li>
            </ul>
            <div className="info-box">
              <p><strong>Base URL:</strong> <code>https://elmis-eswatini-api.onrender.com/api</code></p>
              <p><strong>API Version:</strong> 1.0</p>
            </div>
          </section>

          <section id="authentication" className="api-section">
            <h2>Authentication</h2>
            <p>Most endpoints are publicly accessible without authentication.</p>
            <p>For protected endpoints (admin only), include a Bearer token:</p>
            <pre><code>Authorization: Bearer YOUR_ACCESS_TOKEN</code></pre>
          </section>

          <section id="endpoints" className="api-section">
            <h2>Available Endpoints</h2>

            <div className="endpoint">
              <div className="endpoint-method get">GET</div>
              <div className="endpoint-path">/publications</div>
              <p className="endpoint-desc">Retrieve all publications and reports</p>
              <details>
                <summary>View Details</summary>
                <div className="details-box">
                  <p><strong>Query Parameters:</strong></p>
                  <ul>
                    <li><code>type</code> - Filter by type (Laws, Policies, Reports, Questionnaires)</li>
                    <li><code>year</code> - Filter by year</li>
                    <li><code>category</code> - Filter by category</li>
                    <li><code>search</code> - Search query</li>
                  </ul>
                </div>
              </details>
            </div>

            <div className="endpoint">
              <div className="endpoint-method get">GET</div>
              <div className="endpoint-path">/statistics</div>
              <p className="endpoint-desc">Retrieve labour market statistics and indicators</p>
            </div>

            <div className="endpoint">
              <div className="endpoint-method get">GET</div>
              <div className="endpoint-path">/vacancies</div>
              <p className="endpoint-desc">Retrieve all job vacancies</p>
            </div>

            <div className="endpoint">
              <div className="endpoint-method get">GET</div>
              <div className="endpoint-path">/economic-sectors</div>
              <p className="endpoint-desc">Retrieve all economic sectors</p>
            </div>

            <div className="endpoint">
              <div className="endpoint-method get">GET</div>
              <div className="endpoint-path">/jobseekers</div>
              <p className="endpoint-desc">Retrieve job seeker profiles</p>
            </div>
          </section>

          <section id="rate-limiting" className="api-section">
            <h2>Rate Limiting</h2>
            <p>API requests are limited to <strong>1,000 requests per hour</strong> per IP address.</p>
          </section>

          <section id="error-handling" className="api-section">
            <h2>Error Handling</h2>
            <table className="error-table">
              <thead>
                <tr>
                  <th>Status Code</th>
                  <th>Message</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>400</td>
                  <td>Bad Request</td>
                  <td>Invalid parameters or request body</td>
                </tr>
                <tr>
                  <td>401</td>
                  <td>Unauthorized</td>
                  <td>Missing or invalid token</td>
                </tr>
                <tr>
                  <td>404</td>
                  <td>Not Found</td>
                  <td>Resource not found</td>
                </tr>
                <tr>
                  <td>429</td>
                  <td>Too Many Requests</td>
                  <td>Rate limit exceeded</td>
                </tr>
                <tr>
                  <td>500</td>
                  <td>Server Error</td>
                  <td>Internal server error</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section id="examples" className="api-section">
            <h2>Code Examples</h2>
            <h3>Get Job Vacancies</h3>
            <pre><code>{`curl -X GET "https://api.elmis.gov.sz/api/vacancies?sector=Manufacturing"`}</code></pre>
            <h3>JavaScript Example</h3>
            <pre><code>{`fetch('https://api.elmis.gov.sz/api/vacancies')
  .then(r => r.json())
  .then(d => console.log(d))`}</code></pre>
          </section>

          <section className="api-section support-section">
            <h2>Need Help?</h2>
            <p>For API support, contact us at:</p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:api-support@elmis.gov.sz">api-support@elmis.gov.sz</a></li>
              <li><strong>Phone:</strong> +268 2404 1971</li>
            </ul>
          </section>
        </div>
      </div>

      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          <FaArrowUp />
        </button>
      )}

      <div className="api-support-cta">
        <div className="cta-content">
          <FaBook className="cta-icon" />
          <h2>Ready to Integrate?</h2>
          <p>Get started with the ELMIS API in minutes</p>
          <a href="mailto:api-support@elmis.gov.sz" className="cta-btn">
            Request Access
          </a>
        </div>
      </div>
    </div>
  );
};

export default APIDocumentation;
