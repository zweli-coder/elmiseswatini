import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINT } from '../services/api';
import PageLoader from '../components/common/PageLoader';
import agricultureImg from '../assets/agriculture.jpg';
import miningImg from '../assets/mining.jpg';
import manufacturingImg from '../assets/manufacturing.jpg';
import constructionImg from '../assets/construction.jpg';
import financeImg from '../assets/jobs.jpg';
import ictImg from '../assets/ict.jpg';
import tourismImg from '../assets/tourism.jpg';
import educationImg from '../assets/education.jpg';
import healthImg from '../assets/health.jpg';
import transportImg from '../assets/transport.jpg';
import defaultImg from '../assets/default.jpg';
import heroImg from '../assets/hero.jpg';

const getSectorImage = (name) => {
  if (!name) return defaultImg;

  const lowerName = name.toLowerCase();

  if (lowerName.includes('agric')) return agricultureImg;
  if (lowerName.includes('mining') || lowerName.includes('quarry')) return miningImg;
  if (lowerName.includes('manufact')) return manufacturingImg;
  if (lowerName.includes('construct')) return constructionImg;
  if (lowerName.includes('financ') || lowerName.includes('insur')) return financeImg;
  if (lowerName.includes('ict') || lowerName.includes('commun')) return ictImg;
  if (lowerName.includes('tour') || lowerName.includes('accom')) return tourismImg;
  if (lowerName.includes('educat')) return educationImg;
  if (lowerName.includes('health') || lowerName.includes('social')) return healthImg;
  if (lowerName.includes('transport') || lowerName.includes('logistics')) return transportImg;

  return defaultImg;
};

const getSectorPreviewPoints = (sector) => {
  const lowerName = (sector.sector_name || '').toLowerCase();
  if (lowerName.includes('agric')) {
    return [
      'Supported by crop production, livestock farming, and agro-processing.',
      'Strong rural employment opportunities for farm technicians and extension workers.',
      'Growth depends on improved irrigation, inputs, and local value addition.'
    ];
  }

  if (lowerName.includes('mining') || lowerName.includes('quarry')) {
    return [
      'Driven by mineral extraction, quarry work, and site services.',
      'Requires equipment operators, safety supervisors, and technical support.',
      'Performance is tied to commodity demand and site safety standards.'
    ];
  }

  if (lowerName.includes('manufact')) {
    return [
      'Includes food, textiles, building materials, and light industries.',
      'Common roles include production operators, quality controllers, and maintenance staff.',
      'Competitiveness depends on stable power, inputs, and market access.'
    ];
  }

  if (lowerName.includes('construct')) {
    return [
      'Covers building, infrastructure, and civil works across public and private projects.',
      'Job openings often include carpenters, masons, supervisors, and machine operators.',
      'Growth follows investment in roads, housing, and commercial development.'
    ];
  }

  if (lowerName.includes('wholesale') || lowerName.includes('retail')) {
    return [
      'Consists of shops, distribution centres, and repair services.',
      'Key roles range from sales and stock control to customer service and logistics.',
      'Demand is linked to consumer spending and value chain efficiency.'
    ];
  }

  if (lowerName.includes('transport') || lowerName.includes('logistics')) {
    return [
      'Connects people and goods through road, freight, and passenger services.',
      'Often hires drivers, warehouse staff, fleet coordinators, and customs aides.',
      'Performance improves with better roads, border clearance, and fleet maintenance.'
    ];
  }

  if (lowerName.includes('tour') || lowerName.includes('accom') || lowerName.includes('food')) {
    return [
      'Includes hotels, restaurants, travel services, and leisure experiences.',
      'Common jobs are receptionists, cooks, tour guides, and housekeeping staff.',
      'Visitor numbers and service quality are central to sector recovery and growth.'
    ];
  }

  if (lowerName.includes('ict') || lowerName.includes('commun')) {
    return [
      'Covers software, digital services, communications, and network support.',
      'Roles include developers, IT technicians, data specialists, and support staff.',
      'Skills growth is essential for modernisation across government and business.'
    ];
  }

  if (lowerName.includes('financ') || lowerName.includes('insur')) {
    return [
      'Includes banking, insurance, and financial support services.',
      'Positions range from tellers and advisors to accountants and compliance officers.',
      'Digital payment systems and regulatory compliance shape market activity.'
    ];
  }

  if (lowerName.includes('educat')) {
    return [
      'Covers schools, training centres, and vocational education programs.',
      'Typical jobs include teachers, trainers, curriculum developers, and administrators.',
      'Demand follows population growth and investment in learning facilities.'
    ];
  }

  if (lowerName.includes('health') || lowerName.includes('social')) {
    return [
      'Includes hospitals, clinics, community health, and social support services.',
      'Common roles are nurses, health workers, records officers, and support staff.',
      'Health outcomes depend on workforce capacity, facilities, and preventive care.'
    ];
  }

  return [
    'This sector plays a key role in Eswatini’s economy through jobs and services.',
    'Typical employment ranges from technical operators to management and support roles.',
    'Growth depends on market demand, infrastructure, and workforce skills.'
  ];
};

const EconomicSectors = () => {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        let res;
        try {
          res = await fetch(`${API_ENDPOINT}/economic-sectors`);
        } catch {
          res = await fetch(`${API_ENDPOINT}/economic-sectors`);
        }
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setSectors(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch economic sectors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return <div style={styles.errorMessage}>Error: {error.message}</div>;
  }

  return (
    <div style={styles.page}>
      

      {/* HERO SECTION */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroInner}>
          <p style={styles.heroMini}>Kingdom of Eswatini</p>
          <h1 style={styles.heroTitle}>Economic Sectors</h1>
          <p style={styles.heroSub}>
            Discover the key industries and economic activities driving employment,
            innovation, and growth across the Kingdom of Eswatini.
          </p>
        </div>
      </section>

      {/* Main Content - Sector Cards */}
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Sectors Overview</h2>
        {sectors.length === 0 ? (
          <div style={styles.noDataMessage}>No economic sectors found.</div>
        ) : (
          <div style={styles.sectorGrid}>
            {sectors.map((sector) => (
              <div 
                key={sector.id} 
                style={{
                  ...styles.sectorCard,
                  backgroundImage: `url(${getSectorImage(sector.sector_name)})`,
                }}
                onClick={() => navigate(`/economic-sectors/${sector.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.filter = 'brightness(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                <h3 style={styles.sectorName}>{sector.sector_name}</h3>
                <p style={styles.sectorDescription}>{sector.description}</p>
                <div style={styles.statsRow}>
                  {sector.contribution_to_gdp && (
                    <div style={styles.statItem}><span style={styles.statLabel}>GDP</span> {sector.contribution_to_gdp}%</div>
                  )}
                  {sector.employment_percentage && (
                    <div style={styles.statItem}><span style={styles.statLabel}>Employment</span> {sector.employment_percentage}%</div>
                  )}
                </div>
                {sector.key_industries && (
                  <div style={styles.keyIndustries}>
                    <strong>Key Industries:</strong> {sector.key_industries}
                  </div>
                )}
                <button style={styles.viewBtn}>View Economic Sector</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
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
    padding: '15px 60px',
    borderBottom: '1px solid #e2e8f0'
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
    color: '#103063',
    fontSize: '24px'
  },
  brandSub: {
    margin: 0,
    fontSize: '10px',
    letterSpacing: '1px',
    color: '#64748b'
  },
  hero: {
    position: 'relative',
    padding: '100px 60px',
    backgroundImage: `url(${heroImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#fff',
    minHeight: '400px',
    display: 'flex',
    alignItems: 'center'
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'transparent',
    zIndex: 1
  },
  heroInner: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '800px'
  },
  heroMini: {
    color: '#7dd3fc',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontWeight: '600',
    marginBottom: '10px',
    fontSize: '14px'
  },
  heroTitle: {
    fontSize: '48px',
    margin: '10px 0',
    fontWeight: 'bold'
  },
  heroSub: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: '1.6',
    maxWidth: '600px'
  },
  container: {
    padding: '40px 60px',
  },
  sectionTitle: {
    color: '#103063',
    marginBottom: '30px',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  sectorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '25px'
  },
  sectorCard: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  sectorName: {
    margin: '0 0 15px 0',
    fontSize: '20px',
    color: '#fff',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
  },
  sectorDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 20px 0',
    flex: 1,
    textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
  },
  previewListWrapper: {
    marginBottom: '18px',
    backgroundColor: 'rgba(255,255,255,0.14)',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.18)',
    color: '#f8fafc'
  },
  previewList: {
    paddingLeft: '18px',
    margin: 0,
    color: '#f8fafc',
    lineHeight: '1.6'
  },
  previewListItem: {
    marginBottom: '10px'
  },
  statsRow: {
    display: 'flex',
    gap: '15px',
    paddingTop: '15px',
    borderTop: '1px solid rgba(255,255,255,0.3)',
    marginBottom: '15px',
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: '10px',
    borderRadius: '8px'
  },
  statItem: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
  },
  statLabel: {
    fontSize: '11px',
    color: '#a5f3fc',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '2px',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
  },
  keyIndustries: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    lineHeight: '1.4',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
    marginBottom: '15px'
  },
  viewBtn: {
    marginTop: 'auto',
    backgroundColor: '#0ea5e9',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    fontSize: '13px'
  },
  noDataMessage: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
    backgroundColor: '#fff',
    borderRadius: '12px'
  },
  errorMessage: {
    color: '#dc2626',
    padding: '20px',
    textAlign: 'center'
  }
};
export default EconomicSectors;