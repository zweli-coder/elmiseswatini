import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import heroImage from '../assets/advice.jpg';
import {
  FaBriefcase,
  FaGraduationCap,
  FaHandsHelping,
  FaLightbulb,
  FaChartLine,
  FaCompass
} from 'react-icons/fa';
import './CareerAdvice.css';

const getAdviceImage = (title) => {
  const lowerTitle = (title || "").toLowerCase();
  if (lowerTitle.includes('plan') || lowerTitle.includes('strateg')) return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=60'; // Black professionals planning together
  if (lowerTitle.includes('skill') || lowerTitle.includes('grow') || lowerTitle.includes('literacy')) return 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=60'; // Black professional using laptop
  if (lowerTitle.includes('insight') || lowerTitle.includes('market') || lowerTitle.includes('data')) return 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=60'; // Black professional reviewing data
  if (lowerTitle.includes('experience') || lowerTitle.includes('practical') || lowerTitle.includes('work')) return 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=60'; // Black professional in workplace
  return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=60'; // Professional default
};

const CareerAdvice = () => {

  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const { slug } = useParams();

  const staticAdvice = [
    {
      id: '1',
      title: 'Plan your career strategically',
      summary: 'Identify growing sectors and align your skills with labour demand.',
      category: 'Career Planning',
      icon: 'compass'
    },
    {
      id: '2',
      title: 'Develop in-demand skills',
      summary: 'Digital literacy and communication are essential in all industries.',
      category: 'Skills Growth',
      icon: 'lightbulb'
    },
    {
      id: '3',
      title: 'Use labour market insights',
      summary: 'Data-driven decisions improve your chances of employment success.',
      category: 'Market Insight',
      icon: 'growth'
    },
    {
      id: '4',
      title: 'Gain practical experience',
      summary: 'Internships and volunteering build strong employability.',
      category: 'Experience',
      icon: 'briefcase'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/career-advice');
        const data = await res.json();
        setContent(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const data = content.length > 0 ? content : staticAdvice;
  const categories = Array.from(new Set(data.map(d => d.category))).filter(Boolean);

  // remove filters: show all advice cards
  const filteredData = data;

  const slugify = (s = '') => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // If a slug param exists, render a detail view
  if (slug) {
    const article = data.find(d => slugify(d.title) === slug);
    if (!article) {
      return <div style={{ padding: 40 }}>Article not found.</div>;
    }
    // Detailed static content for specific known articles (upgrade with backend content if available)
    const otherTopics = data.filter(d => slugify(d.title) !== slug).slice(0, 8);

    // Provide a richer default for Growing your Career slug
    const detailContent = slug === 'growing-your-career' || slug === 'growing_your_career' || slugify(article.title) === 'growing-your-career'
      ? (
        <>
          <p>Growing your career is a continuous and dynamic process that involves intentional development, learning, and adaptability. It begins with a clear understanding of your long-term goals and aspirations, as well as a willingness to explore new opportunities and challenges. Embracing a growth mindset is essential, as it allows you to view setbacks as learning experiences and motivates you to seek continuous improvement. Taking initiative to acquire new skills, whether through formal education, workshops, or on-the-job training, is vital to stay relevant in an ever-changing professional landscape. Networking and building meaningful connections within your industry can open doors to exciting prospects and collaborations. Additionally, seeking out mentorship and feedback from experienced professionals can provide valuable insights and guidance on your career journey. Embracing change, being adaptable, and seizing opportunities with confidence can lead to a fulfilling and upward trajectory in your career, enabling you to realize your full potential and make a lasting impact in your chosen field.</p>

          <h3>Here are some tips to help you grow your career:</h3>
          <ol className="advice-tips">
            <li><strong>Set Clear Goals:</strong> Define your long-term career objectives and break them down into smaller, achievable milestones. Having a clear vision will guide your efforts and keep you focused.</li>
            <li><strong>Continuous Learning:</strong> Commit to lifelong learning and skill development. Attend workshops, seminars, webinars, and pursue relevant certifications to stay updated with industry trends and advancements.</li>
            <li><strong>Seek Feedback:</strong> Actively seek feedback from colleagues, supervisors, or mentors. Constructive criticism can help you identify areas for improvement and refine your skills.</li>
            <li><strong>Expand Your Network:</strong> Build and maintain a strong professional network. Attend industry events, conferences, and use social media platforms like LinkedIn to connect with peers and potential mentors.</li>
            <li><strong>Take Initiative:</strong> Don't be afraid to take on new challenges or volunteer for projects outside your comfort zone. Taking initiative demonstrates your eagerness to learn and grow.</li>
            <li><strong>Embrace Change:</strong> Be adaptable to change and open to new opportunities. A willingness to embrace change and uncertainty can lead to exciting career advancements.</li>
            <li><strong>Be a Team Player:</strong> Cultivate good working relationships with your colleagues. Being a team player and demonstrating strong interpersonal skills can lead to opportunities for collaboration and advancement.</li>
            <li><strong>Develop Leadership Skills:</strong> Whether you are in a formal leadership role or not, developing leadership qualities such as effective communication, problem-solving, and decision-making will make you stand out.</li>
            <li><strong>Work on Soft Skills:</strong> Along with technical skills, soft skills like communication, empathy, and emotional intelligence are highly valued in the workplace. Cultivate these skills to enhance your overall effectiveness.</li>
            <li><strong>Find a Mentor:</strong> Seek guidance from experienced professionals who can offer valuable insights and career advice. A mentor can provide support and help you navigate challenges.</li>
          </ol>

          <h3>Other Topics</h3>
          <div className="other-topics">
            {otherTopics.map(t => (
              <div key={t.id} className="other-topic" onClick={() => navigate(`/career-advice/${slugify(t.title)}`)}>
                {t.title}
              </div>
            ))}
          </div>
        </>
      )
      : (
        <div>{article.content || article.summary}</div>
      );

    return (
      <div className="career-page">
        <div className="breadcrumb" style={{ padding: '18px 40px', background: '#f8fafc' }}>
          <a href="/">Home</a>
          <span>›</span>
          <a href="/career-advice">Career Advice</a>
          <span>›</span>
          <span style={{ fontWeight: 700 }}>{article.title}</span>
        </div>

        <div className="detail-hero" style={{ backgroundImage: `url(${getAdviceImage(article.title)})` }}>
          <div className="detail-hero-overlay"></div>
          <div className="detail-hero-inner">
            <h1>{article.title}</h1>
            <p className="detail-subtitle">{article.summary}</p>
            <button className="hero-btn" onClick={() => navigate('/career-advice')}>Back to advice</button>
          </div>
        </div>

        <div className="detail-body" style={{ padding: '32px 40px', maxWidth: 980, margin: '0 auto' }}>
          {detailContent}
        </div>
      </div>
    );
  }

  const getIcon = (icon) => {
    switch (icon) {
      case 'briefcase': return <FaBriefcase />;
      case 'graduation': return <FaGraduationCap />;
      case 'growth': return <FaChartLine />;
      case 'lightbulb': return <FaLightbulb />;
      case 'support': return <FaHandsHelping />;
      case 'compass': return <FaCompass />;
      default: return <FaLightbulb />;
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading career insights...</p>
      </div>
    );
  }

  return (
    <div className="career-page">

      {/* HERO */}
      <div
        className="hero-section"
        style={{
          backgroundImage: `linear-gradient(rgba(2,6,23,0.45), rgba(2,6,23,0.55)), url(${heroImage})`
        }}
      >

        <div className="hero-overlay"></div>

        <div className="hero-content">
          <h1>Build Your Future Career</h1>
          <p>
            Explore insights, skills, and opportunities in Eswatini’s labour market.
          </p>

          <button className="hero-btn">
            Explore Opportunities
          </button>
        </div>

      </div>

      <div className="advice-container">

        <aside className="advice-sidebar">
          <div className="search-box">
            <input
              placeholder="Search advice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="categories">
            <h4>Categories</h4>
            <ul>
              <li
                className={!selectedCategory ? 'active' : ''}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </li>
              {categories.map(cat => (
                <li
                  key={cat}
                  className={selectedCategory === cat ? 'active' : ''}
                  onClick={() => setSelectedCategory(cat)}
                >{cat}</li>
              ))}
            </ul>
            <button className="clear-filters" onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}>
              Clear filters
            </button>
          </div>

          <div className="featured">
            <h4>Featured</h4>
            {data[0] && (
              <div className="featured-card" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="featured-title">{data[0].title}</div>
                <div className="featured-summary">{data[0].summary}</div>
              </div>
            )}
          </div>
        </aside>

        <main className="advice-main">
          <div className="card-grid">

            {filteredData.map((item, index) => (
              <div
                key={item.id}
                className="career-card upgraded"
                style={{
                  backgroundImage: `linear-gradient(rgba(2,6,23,0.28), rgba(2,6,23,0.45)), url(${getAdviceImage(item.title)})`
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigate(`/career-advice/${slugify(item.title)}`)}
              >

                <div className="icon">{getIcon(item.icon)}</div>

                <h3>{item.title}</h3>

                <p>{item.summary}</p>

                <span className="tag">{item.category}</span>

                {hoveredCard === index && (
                  <div className="popup">
                    💡 Click to explore more career guidance
                  </div>
                )}

              </div>
            ))}

          </div>
        </main>

      </div>

    </div>
  );
};

export default CareerAdvice;