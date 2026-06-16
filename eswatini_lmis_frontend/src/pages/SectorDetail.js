import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLoader from '../components/common/PageLoader';

const getSectorImage = (name) => {
  if (!name) return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80';
  const lowerName = name.toLowerCase();
  if (lowerName.includes('administr') || lowerName.includes('support services')) return 'https://images.unsplash.com/photo-1521747116042-5a810fda9664?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('agric')) return 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('art') || lowerName.includes('entertain') || lowerName.includes('recreation')) return 'https://images.unsplash.com/photo-1515162305280-5e7f74a33b4a?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('construct')) return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('ener') || lowerName.includes('power')) return 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('health') || lowerName.includes('social')) return 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('household') || lowerName.includes('employees')) return 'https://images.unsplash.com/photo-1542736667-069246bdbc9a?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('international') || lowerName.includes('organization') || lowerName.includes('organisation')) return 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('other services') || lowerName.includes('other')) return 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('professional') || lowerName.includes('scientific') || lowerName.includes('technical')) return 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('public administration') || lowerName.includes('public admin')) return 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('real estate') || lowerName.includes('property')) return 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('transport') || lowerName.includes('logistics')) return 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('tour') || lowerName.includes('accom')) return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('manufact')) return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('educat') || lowerName.includes('train')) return 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('mining') || lowerName.includes('quarry') || lowerName.includes('mineral') || lowerName.includes('extract')) return 'https://images.unsplash.com/photo-1574689049868-e94ed5301745?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('water') || lowerName.includes('sewerage') || lowerName.includes('supply')) return 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('wholesale') || lowerName.includes('trade')) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('financ') || lowerName.includes('insur')) return 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=1600&q=80';
  if (lowerName.includes('ict') || lowerName.includes('commun')) return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80';
  return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80';
};

const normalizeText = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const buildSectorTrend = (rows) => {
  const totalsByYear = rows.reduce((acc, row) => {
    const year = String(row.year || '').trim();
    if (!year) return acc;
    const value = parseFloat(row.value) || 0;
    acc[year] = (acc[year] || 0) + value;
    return acc;
  }, {});

  return Object.entries(totalsByYear)
    .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
    .map(([year, value]) => ({ year, value: Number(value.toFixed(2)) }));
};

const buildSectorBreakdown = (rows) => {
  const totals = rows.reduce((acc, row) => {
    const label = (row.industry || row.category || row.region || 'Other').trim();
    if (!label) return acc;
    acc[label] = (acc[label] || 0) + (parseFloat(row.value) || 0);
    return acc;
  }, {});

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([activity, value]) => ({ activity, value: Number(value.toFixed(2)) }));
};

const matchesSectorData = (sector, row) => {
  const sectorTokens = normalizeText(sector.sector_name || sector.slug || '').split(' ').filter((token) => token.length > 2);
  if (!sectorTokens.length) return false;

  const rowText = normalizeText(`${row.industry || ''} ${row.category || ''} ${row.region || ''}`);
  return sectorTokens.some((token) => rowText.includes(token));
};

const getSectorPerformance = (sector, statsRows = []) => {
  if (Array.isArray(statsRows) && statsRows.length > 0) {
    return {
      gdpTrend: buildSectorTrend(statsRows),
      employmentBreakdown: buildSectorBreakdown(statsRows),
      source: 'actual'
    };
  }

  const key = (sector.slug || sector.sector_name || '').toLowerCase();
  const defaultTrend = [
    { year: '2018', value: 14 },
    { year: '2019', value: 15 },
    { year: '2020', value: 14.2 },
    { year: '2021', value: 15.7 },
    { year: '2022', value: 16.4 },
    { year: '2023', value: 17.1 }
  ];
  const defaultBreakdown = [
    { activity: 'Primary', value: 35 },
    { activity: 'Secondary', value: 25 },
    { activity: 'Tertiary', value: 40 }
  ];

  if (key.includes('wholesale') || key.includes('retail')) {
    return {
      gdpTrend: [
        { year: '2018', value: 11.2 },
        { year: '2019', value: 11.4 },
        { year: '2020', value: 11.0 },
        { year: '2021', value: 11.8 },
        { year: '2022', value: 12.3 },
        { year: '2023', value: 12.7 }
      ],
      employmentBreakdown: [
        { activity: 'Retail', value: 42 },
        { activity: 'Wholesale', value: 28 },
        { activity: 'Trade Services', value: 18 },
        { activity: 'Distribution', value: 12 }
      ],
      source: 'fallback'
    };
  }

  if (key.includes('transport') || key.includes('logistics')) {
    return {
      gdpTrend: [
        { year: '2018', value: 9.1 },
        { year: '2019', value: 9.4 },
        { year: '2020', value: 8.7 },
        { year: '2021', value: 9.5 },
        { year: '2022', value: 10.1 },
        { year: '2023', value: 10.9 }
      ],
      employmentBreakdown: [
        { activity: 'Freight', value: 38 },
        { activity: 'Passenger Transport', value: 30 },
        { activity: 'Warehousing', value: 18 },
        { activity: 'Logistics Support', value: 14 }
      ],
      source: 'fallback'
    };
  }

  if (key.includes('tourism')) {
    return {
      gdpTrend: [
        { year: '2018', value: 7.6 },
        { year: '2019', value: 7.8 },
        { year: '2020', value: 4.2 },
        { year: '2021', value: 6.3 },
        { year: '2022', value: 8.0 },
        { year: '2023', value: 8.5 }
      ],
      employmentBreakdown: [
        { activity: 'Hotels', value: 34 },
        { activity: 'Travel', value: 24 },
        { activity: 'Entertainment', value: 22 },
        { activity: 'Guides & Tours', value: 20 }
      ],
      source: 'fallback'
    };
  }

  if (key.includes('agric')) {
    return {
      gdpTrend: [
        { year: '2018', value: 14.8 },
        { year: '2019', value: 15.1 },
        { year: '2020', value: 14.4 },
        { year: '2021', value: 15.6 },
        { year: '2022', value: 16.2 },
        { year: '2023', value: 16.8 }
      ],
      employmentBreakdown: [
        { activity: 'Crop Farming', value: 45 },
        { activity: 'Livestock', value: 28 },
        { activity: 'Agro-processing', value: 17 },
        { activity: 'Support Services', value: 10 }
      ],
      source: 'fallback'
    };
  }

  return {
    gdpTrend: defaultTrend,
    employmentBreakdown: defaultBreakdown,
    source: 'fallback'
  };
};

const getSectorOverviewPoints = (sector) => {
  const lowerName = (sector.sector_name || '').toLowerCase();
  const common = [
    'Includes businesses that are central to Eswatini’s economic growth and employment landscape.',
    'Highlights sector trends, key challenges, and contribution to national output.',
    'Focuses on workforce, value chain, and growth drivers for the sector.'
  ];

  if (lowerName.includes('agric')) {
    return [
      'Agriculture is a cornerstone of Eswatini’s rural economy and employment.',
      'The sector covers crop production, livestock farming, and agro-processing.',
      'It supports livelihoods through food security, exports, and rural development.'
    ];
  }

  if (lowerName.includes('transport') || lowerName.includes('logistics')) {
    return [
      'Transport and logistics connect Eswatini to regional trade corridors.',
      'The sector includes freight movement, passenger transport, and warehousing.',
      'Performance depends on infrastructure, border efficiency, and trade demand.'
    ];
  }

  if (lowerName.includes('tourism')) {
    return [
      'Tourism supports hotels, cultural experiences, and nature-based travel.',
      'The sector is sensitive to visitor flows and regional travel demand.',
      'It creates jobs across hospitality, tours, and hospitality services.'
    ];
  }

  return common;
};

const getSectorJobRoles = (sector) => {
  const lowerName = (sector.sector_name || '').toLowerCase();
  if (lowerName.includes('agric')) {
    return [
      'Farm worker and crop production assistant',
      'Livestock officer and poultry farm technician',
      'Agro-processing operator and quality controller',
      'Irrigation technician and extension service provider'
    ];
  }

  if (lowerName.includes('mining') || lowerName.includes('quarry')) {
    return [
      'Miner and extraction equipment operator',
      'Site engineer and safety officer',
      'Crusher maintenance technician',
      'Geological survey assistant'
    ];
  }

  if (lowerName.includes('manufact')) {
    return [
      'Production line operator and machine attendant',
      'Quality control inspector',
      'Maintenance technician and equipment mechanic',
      'Supply chain coordinator and production planner'
    ];
  }

  if (lowerName.includes('construct')) {
    return [
      'Carpenter, bricklayer, and concrete finisher',
      'Site supervisor and project estimator',
      'Civil engineering technician',
      'Health and safety officer'
    ];
  }

  if (lowerName.includes('wholesale') || lowerName.includes('retail')) {
    return [
      'Sales associate and store manager',
      'Customer service representative',
      'Inventory controller and merchandiser',
      'Logistics and distribution assistant'
    ];
  }

  if (lowerName.includes('transport') || lowerName.includes('logistics')) {
    return [
      'Truck driver and freight handler',
      'Logistics coordinator and warehouse supervisor',
      'Bus or taxi operator',
      'Customs clearing and documentation assistant'
    ];
  }

  if (lowerName.includes('accommodation') || lowerName.includes('food') || lowerName.includes('tourism')) {
    return [
      'Hotel receptionist and front desk agent',
      'Chef, cook, and kitchen assistant',
      'Tour guide and event host',
      'Housekeeping and hospitality service staff'
    ];
  }

  if (lowerName.includes('ict') || lowerName.includes('commun')) {
    return [
      'Software developer and web developer',
      'Network technician and IT support specialist',
      'Data analyst and digital services officer',
      'Mobile application developer'
    ];
  }

  if (lowerName.includes('financ') || lowerName.includes('insur')) {
    return [
      'Bank teller and customer service officer',
      'Accountant and financial analyst',
      'Insurance advisor and claims clerk',
      'Compliance and risk management assistant'
    ];
  }

  if (lowerName.includes('education')) {
    return [
      'Teacher and classroom assistant',
      'Curriculum developer and training facilitator',
      'Academic administrator',
      'Early childhood educator'
    ];
  }

  if (lowerName.includes('health') || lowerName.includes('social')) {
    return [
      'Nurse and community health worker',
      'Medical records officer',
      'Health promotion officer',
      'Social work support staff'
    ];
  }

  return [
    'Specialized and support roles tied to sector operations',
    'Technical roles that keep goods and services moving',
    'Management and coordination positions at every level'
  ];
};

const getSectorSkills = (sector) => {
  const lowerName = (sector.sector_name || '').toLowerCase();
  if (lowerName.includes('agric')) {
    return [
      'Knowledge of crop and livestock production practices',
      'Safe handling of agro-chemicals and equipment',
      'Basic agro-processing and quality control skills',
      'Water management and irrigation techniques'
    ];
  }

  if (lowerName.includes('manufact')) {
    return [
      'Machine operation and maintenance',
      'Quality assurance and safety compliance',
      'Inventory management and process planning',
      'Basic engineering and technical troubleshooting'
    ];
  }

  if (lowerName.includes('transport') || lowerName.includes('logistics')) {
    return [
      'Route planning and freight documentation',
      'Vehicle maintenance and safe driving practices',
      'Warehouse organisation and stock control',
      'Customs and supply chain coordination'
    ];
  }

  if (lowerName.includes('ict') || lowerName.includes('commun')) {
    return [
      'Digital literacy and software troubleshooting',
      'Network installation and system support',
      'Data management and reporting',
      'Cybersecurity awareness'
    ];
  }

  if (lowerName.includes('financ') || lowerName.includes('insur')) {
    return [
      'Numeracy and financial record keeping',
      'Customer service in banking and insurance',
      'Regulatory compliance and reporting',
      'Digital payment and fintech familiarity'
    ];
  }

  if (lowerName.includes('education')) {
    return [
      'Lesson planning and teaching methods',
      'Communication and learning support skills',
      'Classroom management and learner assessment',
      'Educational technology basics'
    ];
  }

  return [
    'Relevant practical knowledge for the sector value chain',
    'Strong communication and teamwork skills',
    'Attention to safety, quality, and customer expectations',
    'Adaptability to demand and operational changes'
  ];
};

const getSectorGrowthNotes = (sector) => {
  const lowerName = (sector.sector_name || '').toLowerCase();
  if (lowerName.includes('agric')) {
    return [
      'Growth depends on better access to modern inputs and irrigation.',
      'Improved agro-processing can capture higher value locally.',
      'Rural employment is sensitive to climate and market prices.'
    ];
  }

  if (lowerName.includes('tourism')) {
    return [
      'Tourism growth depends on regional visitor flows and infrastructure.',
      'Seasonal demand makes year-round employment planning harder.',
      'Hospitality quality and travel safety are core competitiveness factors.'
    ];
  }

  if (lowerName.includes('transport') || lowerName.includes('logistics')) {
    return [
      'Reliable roads and border clearance improve efficiency.',
      'Logistics demand grows with trade and distribution activity.',
      'Driver training and vehicle maintenance are ongoing priorities.'
    ];
  }

  if (lowerName.includes('manufact')) {
    return [
      'Access to affordable energy and inputs drives competitiveness.',
      'Skills development is needed for modern production techniques.',
      'Linking manufacturing to local supply chains improves resilience.'
    ];
  }

  if (lowerName.includes('educat')) {
    return [
      'Quality teacher training affects education outcomes.',
      'Curriculum alignment with labour market needs is essential.',
      'Investment in learning facilities supports broader access.'
    ];
  }

  return [
    'Sector performance depends on skills availability and operational capacity.',
    'Improved access to finance, transport, and infrastructure supports growth.',
    'Real demand and policy support shape future opportunities.'
  ];
};

const LineChart = ({ data, width = 460, height = 180 }) => {
  const [tooltip, setTooltip] = useState(null);
  const maxValue = Math.max(...data.map((item) => item.value)) * 1.15;
  const minValue = Math.min(...data.map((item) => item.value));
  const points = data
    .map((item, index) => {
      const x = 40 + (index * (width - 60)) / (data.length - 1);
      const y = height - 30 - ((item.value - minValue) / (maxValue - minValue)) * (height - 60);
      return `${x},${y}`;
    })
    .join(' ');

  const tooltipX = tooltip ? Math.min(tooltip.x + 10, width - 140) : 0;
  const tooltipY = tooltip ? Math.max(tooltip.y - 55, 10) : 0;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={styles.chartSvg}>
      <rect x="40" y="20" width={width - 55} height={height - 55} fill="#f8fbff" rx="12" />
      {[0.25, 0.5, 0.75].map((step) => {
        const y = 20 + (height - 55) * step;
        return <line key={step} x1="40" y1={y} x2={width - 15} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinejoin="round" />
      {data.map((item, index) => {
        const x = 40 + (index * (width - 60)) / (data.length - 1);
        const y = height - 30 - ((item.value - minValue) / (maxValue - minValue)) * (height - 60);
        return (
          <g key={item.year}>
            <circle
              cx={x}
              cy={y}
              r="6"
              fill="#fff"
              stroke="#2563eb"
              strokeWidth="2"
              onMouseEnter={() => setTooltip({ x, y, label: item.year, value: item.value })}
              onMouseLeave={() => setTooltip(null)}
            />
            <circle
              cx={x}
              cy={y}
              r="14"
              fill="transparent"
              onMouseEnter={() => setTooltip({ x, y, label: item.year, value: item.value })}
              onMouseLeave={() => setTooltip(null)}
            />
          </g>
        );
      })}
      {data.map((item, index) => {
        const x = 40 + (index * (width - 60)) / (data.length - 1);
        return (
          <text key={`${item.year}-label`} x={x} y={height - 10} textAnchor="middle" fontSize="10" fill="#475569">{item.year}</text>
        );
      })}
      <line x1="40" y1="20" x2="40" y2={height - 30} stroke="#cbd5e1" strokeWidth="1" />
      <line x1="40" y1={height - 30} x2={width - 15} y2={height - 30} stroke="#cbd5e1" strokeWidth="1" />
      {tooltip && (
        <g transform={`translate(${tooltipX}, ${tooltipY})`}>
          <rect x="0" y="0" width="130" height="44" rx="10" fill="#1e293b" opacity="0.95" />
          <text x="10" y="18" fill="#f8fafc" fontSize="11" fontWeight="700">{tooltip.label}</text>
          <text x="10" y="34" fill="#cbd5e1" fontSize="12">{tooltip.value}% contribution</text>
        </g>
      )}
    </svg>
  );
};

const BarChart = ({ data, width = 460, height = 180 }) => {
  const [tooltip, setTooltip] = useState(null);
  const maxValue = Math.max(...data.map((item) => item.value)) * 1.15;

  const tooltipX = tooltip ? Math.min(tooltip.x + 10, width - 140) : 0;
  const tooltipY = tooltip ? Math.max(tooltip.y - 55, 10) : 0;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={styles.chartSvg}>
      <rect x="40" y="20" width={width - 55} height={height - 55} fill="#f8fbff" rx="12" />
      {[0.25, 0.5, 0.75].map((step) => {
        const y = 20 + (height - 55) * step;
        return <line key={step} x1="40" y1={y} x2={width - 15} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      <line x1="40" y1="20" x2="40" y2={height - 30} stroke="#cbd5e1" strokeWidth="1" />
      <line x1="40" y1={height - 30} x2={width - 15} y2={height - 30} stroke="#cbd5e1" strokeWidth="1" />
      {data.map((item, index) => {
        const barWidth = (width - 80) / data.length;
        const barHeight = ((item.value) / maxValue) * (height - 70);
        const x = 40 + index * (barWidth + 10);
        const y = height - 30 - barHeight;
        return (
          <g key={item.activity}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="#2563eb"
              rx="8"
              onMouseEnter={() => setTooltip({ x: x + barWidth / 2, y, label: item.activity, value: item.value })}
              onMouseLeave={() => setTooltip(null)}
            />
            <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" fontSize="10" fill="#475569">{item.activity}</text>
          </g>
        );
      })}
      {tooltip && (
        <g transform={`translate(${tooltipX}, ${tooltipY})`}>
          <rect x="0" y="0" width="130" height="44" rx="10" fill="#1e293b" opacity="0.95" />
          <text x="10" y="18" fill="#f8fafc" fontSize="11" fontWeight="700">{tooltip.label}</text>
          <text x="10" y="34" fill="#cbd5e1" fontSize="12">{tooltip.value}% employment</text>
        </g>
      )}
    </svg>
  );
};

const SectorDetail = () => {
  const { sectorId } = useParams();
  const navigate = useNavigate();
  const [sector, setSector] = useState(null);
  const [sectorStats, setSectorStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareMessage, setShareMessage] = useState('');

  const handleResourceClick = (resource) => {
    const sectorQuery = `?sector=${encodeURIComponent(sector.sector_name || '')}`;
    switch (resource) {
      case 'statistics':
        navigate(`/statistics${sectorQuery}`);
        break;
      case 'vacancies':
        navigate(`/vacancies${sectorQuery}`);
        break;
      case 'training':
        navigate(`/education-training${sectorQuery}`);
        break;
      case 'career':
        navigate(`/career-advice${sectorQuery}`);
        break;
      default:
        navigate('/economic-sectors');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${sector.sector_name} - Eswatini LMIS`,
          text: `Learn more about ${sector.sector_name} on Eswatini LMIS.`,
          url
        });
        setShareMessage('Shared successfully');
      } else {
        await navigator.clipboard.writeText(url);
        setShareMessage('Link copied to clipboard');
      }
    } catch (err) {
      console.error('Share failed:', err);
      setShareMessage('Unable to share right now');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage('Link copied to clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
      setShareMessage('Failed to copy link');
    }
  };

  useEffect(() => {
    const fetchSectorDetail = async () => {
      try {
        let res;
        try {
          res = await fetch(`/api/economic-sectors/${sectorId}`);
        } catch {
          res = await fetch(`http://localhost:3001/api/economic-sectors/${sectorId}`);
        }
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setSector(data);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch sector detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSectorDetail();
  }, [sectorId]);

  useEffect(() => {
    const fetchSectorStatistics = async () => {
      if (!sector) return;
      try {
        let res;
        try {
          res = await fetch('/api/statistics/raw');
        } catch {
          res = await fetch('http://localhost:3001/api/statistics/raw');
        }

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const rows = await res.json();
        const matchingRows = Array.isArray(rows)
          ? rows.filter((row) => matchesSectorData(sector, row))
          : [];

        setSectorStats({
          rows: matchingRows,
          trend: matchingRows.length ? buildSectorTrend(matchingRows) : [],
          breakdown: matchingRows.length ? buildSectorBreakdown(matchingRows) : []
        });
      } catch (err) {
        console.error('Failed to fetch sector statistics:', err);
      }
    };

    fetchSectorStatistics();
  }, [sector]);

  if (loading) {
    return <PageLoader />;
  }

  if (error || !sector) {
    return (
      <div style={styles.page}>
        <header style={styles.topHeader}>
          <div style={styles.logoSection}>
            <img
              src="https://flagcdn.com/w80/sz.png"
              alt="Eswatini Flag"
              style={styles.flag}
            />
            <div>
              <h1 style={styles.brandTitle}>Eswatini LMIS</h1>
              <p style={styles.brandSub}>LABOUR MARKET INFORMATION SYSTEM</p>
            </div>
          </div>
        </header>
        <div style={styles.errorMessage}>
          <p>Error loading sector details. Please try again.</p>
          <button onClick={() => navigate('/economic-sectors')} style={styles.backBtn}>
            Back to Sectors
          </button>
        </div>
      </div>
    );
  }

  const performance = getSectorPerformance(sector, sectorStats?.rows || []);
  const overviewPoints = getSectorOverviewPoints(sector);
  const sectorRoles = getSectorJobRoles(sector);
  const sectorSkills = getSectorSkills(sector);
  const sectorGrowthNotes = getSectorGrowthNotes(sector);

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.topHeader}>
        <div style={styles.logoSection}>
          <img
            src="https://flagcdn.com/w80/sz.png"
            alt="Eswatini Flag"
            style={styles.flag}
          />
          <div>
            <h1 style={styles.brandTitle}>Eswatini LMIS</h1>
            <p style={styles.brandSub}>LABOUR MARKET INFORMATION SYSTEM</p>
          </div>
        </div>
      </header>

      {/* HERO SECTION with Sector Image */}
      <section 
        style={{
          ...styles.hero,
          backgroundImage: `url(${getSectorImage(sector.sector_name)})`
        }}
      >
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroInner}>
          <button 
            onClick={() => navigate('/economic-sectors')} 
            style={styles.backBtn}
          >
            ← Back to Sectors
          </button>
          <h1 style={styles.heroTitle}>{sector.sector_name}</h1>
          <p style={styles.heroSub}>{sector.description}</p>
        </div>
      </section>

      <style>{`
        .sector-card, .sector-info-card, .sector-actions-card, .sector-share-card, .sector-stats-card {
          border: 1px solid #e2e8f0;
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease, background .25s ease;
          text-align: left;
        }
        .sector-card:hover, .sector-info-card:hover, .sector-actions-card:hover, .sector-share-card:hover, .sector-stats-card:hover {
          border-color: #0ea5e9;
          box-shadow: 0 18px 40px rgba(14,165,233,0.18);
          transform: translateY(-3px);
        }
        .sector-action-btn:hover {
          background-color: #e0f2fe;
          border-color: #bae6fd;
          transform: translateY(-1px);
        }
        .sector-info-card .infoItem:hover {
          background-color: #f8fbff;
        }
      `}</style>

      {/* MAIN CONTENT */}
      <div style={styles.container}>
        <div style={styles.contentGrid}>
          {/* LEFT COLUMN - Overview */}
          <section style={styles.leftColumn}>
            <div className="sector-card" style={styles.card}>
              <h2 style={styles.cardTitle}>Sector Overview</h2>
              <p style={styles.cardText}>{sector.description}</p>
              <ul style={styles.overviewList}>
                {overviewPoints.map((point, index) => (
                  <li key={index} style={styles.overviewListItem}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="sector-card" style={styles.card}>
              <h2 style={styles.cardTitle}>Sector Performance</h2>
              <div style={styles.chartSection}>
                <div style={styles.performanceCard}>
                  <div style={styles.performanceIntro}>
                    <h3 style={styles.chartTitle}>Gross Domestic Product (GDP)</h3>
                    <p style={styles.performanceText}>
                      In terms of GDP contribution, this sector shows stability and gradual growth over time, reflecting its weighted role in national production.
                    </p>
                  </div>
                  <div style={styles.performanceGraphWrapper}>
                    <LineChart data={performance.gdpTrend} />
                  </div>
                </div>
                <div style={styles.performanceCard}>
                  <div style={styles.performanceIntro}>
                    <h3 style={styles.chartTitle}>{performance.source === 'actual' ? 'Sector Trend by Year' : 'Employment Contribution'}</h3>
                    <p style={styles.performanceText}>
                      {performance.source === 'actual'
                        ? 'This chart uses actual yearly statistics matched to this sector from the system dataset.'
                        : 'The employment breakdown highlights how labour is distributed across the sector’s economic activities and where demand is concentrated.'}
                    </p>
                  </div>
                  <div style={styles.performanceGraphWrapper}>
                    <BarChart data={performance.employmentBreakdown} />
                  </div>
                </div>
              </div>
            </div>

            {/* Key Statistics */}
            <div className="sector-stats-card" style={styles.statsContainer}>
              <h2 style={styles.cardTitle}>Key Statistics</h2>
              <div style={styles.statsGrid}>
                {sector.contribution_to_gdp && (
                  <div className="sector-card" style={styles.statBox}>
                    <div style={styles.statValue}>{sector.contribution_to_gdp}%</div>
                    <div style={styles.statLabel}>Contribution to GDP</div>
                  </div>
                )}
                {sector.employment_percentage && (
                  <div className="sector-card" style={styles.statBox}>
                    <div style={styles.statValue}>{sector.employment_percentage}%</div>
                    <div style={styles.statLabel}>Employment Share</div>
                  </div>
                )}
              </div>
            </div>

            {/* Key Industries */}
            {sector.key_industries && (
              <div className="sector-card" style={styles.card}>
                <h2 style={styles.cardTitle}>Key Industries</h2>
                <div style={styles.industriesList}>
                  {sector.key_industries.split(',').map((industry, index) => (
                    <div key={index} style={styles.industryItem}>
                      <span style={styles.industryBullet}>▪</span>
                      <span>{industry.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="sector-card" style={styles.card}>
              <h2 style={styles.cardTitle}>Typical Jobs in This Sector</h2>
              <ul style={styles.overviewList}>
                {sectorRoles.map((job, index) => (
                  <li key={index} style={styles.overviewListItem}>{job}</li>
                ))}
              </ul>
            </div>

            <div className="sector-card" style={styles.card}>
              <h2 style={styles.cardTitle}>In-Demand Skills & Training</h2>
              <ul style={styles.overviewList}>
                {sectorSkills.map((skill, index) => (
                  <li key={index} style={styles.overviewListItem}>{skill}</li>
                ))}
              </ul>
            </div>

            <div className="sector-card" style={styles.card}>
              <h2 style={styles.cardTitle}>Growth Drivers & Challenges</h2>
              <ul style={styles.overviewList}>
                {sectorGrowthNotes.map((note, index) => (
                  <li key={index} style={styles.overviewListItem}>{note}</li>
                ))}
              </ul>
            </div>

            {/* Additional Info if available */}
            {sector.employment_trends && (
              <div className="sector-card" style={styles.card}>
                <h2 style={styles.cardTitle}>Employment Trends</h2>
                <p style={styles.cardText}>{sector.employment_trends}</p>
              </div>
            )}

            {sector.growth_potential && (
              <div className="sector-card" style={styles.card}>
                <h2 style={styles.cardTitle}>Growth Potential</h2>
                <p style={styles.cardText}>{sector.growth_potential}</p>
              </div>
            )}

            {Object.keys(sector).filter((key) => !['id','sector_name','description','slug','created_at','contribution_to_gdp','employment_percentage','key_industries','employment_trends','growth_potential'].includes(key)).length > 0 && (
              <div className="sector-card" style={styles.card}>
                <h2 style={styles.cardTitle}>More Information</h2>
                {Object.entries(sector)
                  .filter(([key]) => !['id','sector_name','description','slug','created_at','contribution_to_gdp','employment_percentage','key_industries','employment_trends','growth_potential'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} style={styles.extraInfoItem}>
                      <strong style={styles.extraInfoLabel}>{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}:</strong>
                      <p style={styles.extraInfoValue}>{value}</p>
                    </div>
                  ))}
              </div>
            )}
          </section>

          {/* RIGHT COLUMN - Quick Info & Actions */}
          <aside style={styles.rightColumn}>
            <div className="sector-info-card" style={styles.infoCard}>
              <h3 style={styles.infoCardTitle}>Quick Information</h3>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Sector ID:</span>
                <span style={styles.infoValue}>{sector.id}</span>
              </div>
              {sector.contribution_to_gdp && (
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>GDP Contribution:</span>
                  <span style={styles.infoValue}>{sector.contribution_to_gdp}%</span>
                </div>
              )}
              {sector.employment_percentage && (
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Employment:</span>
                  <span style={styles.infoValue}>{sector.employment_percentage}%</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="sector-actions-card" style={styles.actionsCard}>
              <h3 style={styles.infoCardTitle}>Related Resources</h3>
              <p style={styles.resourceNote}>
                These links open the selected page with information tailored to {sector.sector_name} wherever available. If no matching data exists, the page will tell you and offer a way back.
              </p>
              <button className="sector-action-btn" style={styles.actionBtn} onClick={() => handleResourceClick('statistics')}>
                View Job Statistics
              </button>
              <button className="sector-action-btn" style={styles.actionBtn} onClick={() => handleResourceClick('vacancies')}>
                Browse Job Openings
              </button>
              <button className="sector-action-btn" style={styles.actionBtn} onClick={() => handleResourceClick('training')}>
                Training Programs
              </button>
              <button className="sector-action-btn" style={styles.actionBtn} onClick={() => handleResourceClick('career')}>
                Career Guidance
              </button>
            </div>

            {/* Share Section */}
            <div className="sector-share-card" style={styles.shareCard}>
              <h3 style={styles.infoCardTitle}>Share</h3>
              <div style={styles.shareButtons}>
                <button style={styles.shareBtn} onClick={handleShare}>Share Page</button>
                <button style={styles.shareBtn} onClick={handleCopyLink}>Copy Link</button>
              </div>
              {shareMessage && <p style={styles.shareMessage}>{shareMessage}</p>}
            </div>
          </aside>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <section style={styles.footerSection}>
        <div style={styles.footerContent}>
          <h2 style={styles.footerTitle}>Explore Other Sectors</h2>
          <button 
            onClick={() => navigate('/economic-sectors')}
            style={styles.exploreBtn}
          >
            View All Sectors →
          </button>
        </div>
      </section>
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
    padding: '80px 60px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#fff',
    minHeight: '350px',
    display: 'flex',
    alignItems: 'flex-start'
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
    maxWidth: '900px',
    width: '100%',
    textAlign: 'left'
  },
  heroTitle: {
    fontSize: '42px',
    margin: '20px 0 15px 0',
    fontWeight: 'bold'
  },
  heroSub: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: '1.6'
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '10px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    marginBottom: '20px'
  },
  container: {
    padding: '40px 60px',
    maxWidth: '1400px',
    margin: '0 0 0 60px'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    alignItems: 'start',
    gap: '30px'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  card: {
    backgroundColor: '#f8fafc',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
    textAlign: 'left'
  },
  cardTitle: {
    color: '#103063',
    margin: '0 0 15px 0',
    fontSize: '20px',
    fontWeight: 'bold'
  },
  cardText: {
    color: '#475569',
    lineHeight: '1.7',
    margin: 0
  },
  statsContainer: {
    backgroundColor: '#f8fafc',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
    textAlign: 'left'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  statBox: {
    background: 'linear-gradient(135deg, #103063 0%, #0ea5e9 100%)',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    color: '#fff'
  },
  overviewList: {
    marginTop: '18px',
    paddingLeft: '20px',
    color: '#475569',
    lineHeight: '1.8'
  },
  overviewListItem: {
    marginBottom: '12px'
  },
  chartSection: {
    display: 'grid',
    gap: '20px'
  },
  performanceCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 8px 22px rgba(15,23,42,0.08)',
    display: 'grid',
    gap: '18px'
  },
  performanceIntro: {
    display: 'grid',
    gap: '10px'
  },
  performanceText: {
    margin: 0,
    color: '#475569',
    lineHeight: '1.75',
    fontSize: '14px'
  },
  performanceGraphWrapper: {
    minHeight: '220px',
    display: 'flex',
    alignItems: 'center'
  },
  chartCard: {
    marginBottom: '20px'
  },
  chartTitle: {
    fontSize: '16px',
    color: '#0f172a',
    marginBottom: '12px'
  },
  chartSvg: {
    width: '100%',
    height: 'auto'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500'
  },
  industriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  industryItem: {
    display: 'flex',
    gap: '12px',
    color: '#475569',
    fontSize: '15px',
    lineHeight: '1.5'
  },
  industryBullet: {
    color: '#0ea5e9',
    fontWeight: 'bold',
    marginTop: '2px'
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
    textAlign: 'left'
  },
  infoCardTitle: {
    color: '#103063',
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '10px',
    marginBottom: '10px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '14px'
  },
  infoLabel: {
    color: '#64748b',
    fontWeight: '500'
  },
  infoValue: {
    color: '#103063',
    fontWeight: 'bold'
  },
  actionsCard: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
    textAlign: 'left'
  },
  actionBtn: {
    width: '100%',
    padding: '12px 15px',
    marginBottom: '10px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#103063',
    transition: 'all 0.3s ease'
  },
  resourceNote: {
    marginBottom: '18px',
    color: '#475569',
    lineHeight: '1.7',
    fontSize: '14px'
  },
  shareCard: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
    textAlign: 'left'
  },
  shareButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  shareBtn: {
    padding: '10px 12px',
    backgroundColor: '#0ea5e9',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  shareMessage: {
    marginTop: '12px',
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: '500'
  },
  extraInfoItem: {
    marginBottom: '16px',
    padding: '12px 14px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0'
  },
  extraInfoLabel: {
    display: 'block',
    marginBottom: '8px',
    color: '#0f172a',
    fontWeight: '700',
    fontSize: '14px'
  },
  extraInfoValue: {
    margin: 0,
    color: '#334155',
    lineHeight: '1.7'
  },
  footerSection: {
    backgroundColor: '#103063',
    padding: '50px 60px',
    color: '#fff',
    textAlign: 'center'
  },
  footerContent: {
    maxWidth: '600px',
    margin: '0 auto'
  },
  footerTitle: {
    fontSize: '28px',
    margin: '0 0 20px 0',
    fontWeight: 'bold'
  },
  exploreBtn: {
    backgroundColor: '#0ea5e9',
    color: '#fff',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  errorMessage: {
    padding: '40px',
    textAlign: 'center',
    color: '#dc2626'
  }
};

export default SectorDetail;
