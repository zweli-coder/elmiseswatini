import React, { useEffect, useState } from 'react';
import heroImage from '../assets/education.jpg';
import PageLoader from '../components/common/PageLoader';
import { FaSearch, FaFilter } from 'react-icons/fa';
import API, { API_ENDPOINT } from '../services/api';

const isRequestCanceled = (err) => {
    const message = err?.message || '';
    return (
        err?.name === 'AbortError' ||
        err?.name === 'CanceledError' ||
        err?.code === 'ERR_CANCELED' ||
        /canceled|cancelled|aborted/i.test(message)
    );
};

const getEducationImage = (category, title) => {
    const search = ((category || "") + " " + (title || "")).toLowerCase();
    if (search.includes('vocation') || search.includes('skill') || search.includes('train') || search.includes('technic'))
        return 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=60';
    if (search.includes('univers') || search.includes('univetsity') || search.includes('higher') || search.includes('college') || search.includes('academic'))
        return 'https://images.unsplash.com/photo-1523050853064-8ed39275cb96?auto=format&fit=crop&w=800&q=60';
    if (search.includes('school') || search.includes('primary') || search.includes('secondary'))
        return 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=60';
    if (search.includes('health') || search.includes('nurse') || search.includes('medical'))
        return 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=60';
    if (search.includes('agri') || search.includes('farm'))
        return 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=60';
    if (search.includes('tech') || search.includes('digital') || search.includes('coding') || search.includes('software'))
        return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=60';
    if (search.includes('business') || search.includes('entrepreneur') || search.includes('management'))
        return 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=60';
    return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=60';
};

const EducationTraining = () => {

    const [data, setData] = useState([]);
    const [allData, setAllData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');

                // Use centralized axios API instance for consistent headers and error handling
                const url = `/education-training`;
                console.debug('Fetching education data from', `${API_ENDPOINT}${url}`);
                const axiosRes = await API.get(url, { signal });

                if (!isMounted) return;

                const result = axiosRes.data;
                let items = [];
                if (Array.isArray(result)) items = result;
                else if (result && Array.isArray(result.value)) items = result.value;

                setAllData(items);
                setData(items);

                // Extract unique categories
                const uniqueCategories = [...new Set(items.map(item => item.category))];
                setCategories(uniqueCategories.sort());
            } catch (err) {
                if (!isMounted || isRequestCanceled(err)) return;

                // Axios errors have response/status
                if (err?.response) {
                    console.error('Education fetch failed', err.response.status, err.response.data);
                    setError(`Error: ${err.response.status} ${err.response.statusText || ''}`);
                } else {
                    console.error('Education fetch failed', err);
                    setError(`Failed to load education data: ${err.message || err}`);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    // Handle filtering
    useEffect(() => {
        let filtered = allData;

        // Filter by search term
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(lowerSearch) ||
                item.description.toLowerCase().includes(lowerSearch) ||
                item.category.toLowerCase().includes(lowerSearch)
            );
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        setData(filtered);
    }, [searchTerm, selectedCategory, allData]);

    const handleReset = () => {
        setSearchTerm('');
        setSelectedCategory('');
    };

    if (loading) {
        return <PageLoader />;
    }

    if (error) {
        return <div style={styles.errorMessage}>Error: {error}</div>;
    }

    return (

        <div style={styles.page}>

            {/* HERO SECTION */}
            <section style={styles.hero}>
                <div style={styles.heroImageWrapper}>
                   <img
  src={heroImage}
  alt="Education and training"
  style={styles.heroImage}
/>
                </div>
                <div style={styles.heroOverlay}></div>
                <div style={styles.heroInner}>
                    <p style={styles.heroMini}>Kingdom of Eswatini</p>
                    <h1 style={styles.heroTitle}>Education & Training</h1>
                    <p style={styles.heroSub}>
                        Explore skills development, vocational pathways, and educational opportunities 
                        driving innovation and economic growth across the nation.
                    </p>
                </div>
            </section>

            {/* FILTER SECTION */}
            <div style={styles.filterSection}>
                <div style={styles.filterContainer}>
                    <div style={styles.searchBox}>
                        <FaSearch style={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search programs, skills, keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.categoryFilter}>
                        <FaFilter style={styles.filterIcon} />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={styles.categorySelect}
                        >
                            <option value="">All Categories ({allData.length})</option>
                            {categories.map(cat => {
                                const count = allData.filter(item => item.category === cat).length;
                                return <option key={cat} value={cat}>{cat} ({count})</option>;
                            })}
                        </select>
                    </div>

                    {(searchTerm || selectedCategory) && (
                        <button onClick={handleReset} style={styles.resetBtn}>Clear Filters</button>
                    )}
                </div>

                <div style={styles.resultsInfo}>
                    <p style={styles.resultsText}>
                        Showing <strong>{data.length}</strong> program{data.length !== 1 ? 's' : ''} 
                        {selectedCategory && ` in ${selectedCategory}`}
                        {searchTerm && ` matching "${searchTerm}"`}
                    </p>
                </div>
            </div>

                  

            {/* PROGRAMS GRID */}
            {data.length === 0 ? (
                <div style={styles.noResults}>
                    <p style={styles.noResultsText}>
                        No programs found matching your criteria. Try adjusting your filters or search terms.
                    </p>
                    <button onClick={handleReset} style={styles.resetBtn}>Clear Filters</button>
                </div>
            ) : (
                <div style={styles.grid}>
                    {data.map(item => (
                        <div 
                            key={item.id} 
                            style={{
                                ...styles.card,
                                backgroundImage: `url(${getEducationImage(item.category, item.title)})`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 20px 30px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            }}
                        >
                            <div style={styles.categoryBadge}>
                                {item.category}
                            </div>

                            <h2 style={styles.cardTitle}>{item.title}</h2>
                            <p style={styles.cardDesc}>{item.description}</p>
                        </div>
                    ))}
                </div>
            )}

        </div>

    );

};

const styles = {

    page: {
        backgroundColor: '#f4f7f6',
        minHeight: '100vh',
        fontFamily: 'sans-serif'
    },

    hero: {
        position: 'relative',
        padding: '100px 60px',
        backgroundColor: '#0f172a',
        color: '#fff',
        minHeight: '420px',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '40px',
        overflow: 'hidden'
    },
    heroImageWrapper: {
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0
    },
    heroImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: 'brightness(0.55) contrast(1.05)'
    },

    heroOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(15,23,42,0.45), rgba(15,23,42,0.75))',
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

    // Filter Section Styles
    filterSection: {
        padding: '30px 60px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e9f0',
        marginBottom: '30px'
    },

    filterContainer: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '20px'
    },

    searchBox: {
        flex: 1,
        minWidth: '250px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f8f9fb',
        borderRadius: '8px',
        border: '2px solid #e5e9f0',
        transition: 'border-color 0.3s'
    },

    searchIcon: {
        position: 'absolute',
        left: '12px',
        color: '#667085',
        fontSize: '16px',
        pointerEvents: 'none'
    },

    searchInput: {
        width: '100%',
        padding: '12px 12px 12px 40px',
        border: 'none',
        backgroundColor: 'transparent',
        fontSize: '15px',
        outline: 'none',
        fontFamily: 'inherit'
    },

    categoryFilter: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },

    filterIcon: {
        position: 'absolute',
        left: '12px',
        color: '#667085',
        fontSize: '16px',
        pointerEvents: 'none',
        zIndex: 2
    },

    categorySelect: {
        padding: '12px 12px 12px 40px',
        borderRadius: '8px',
        border: '2px solid #e5e9f0',
        backgroundColor: '#f8f9fb',
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'border-color 0.3s',
        appearance: 'none',
        minWidth: '200px'
    },

    resetBtn: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#dc2626',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
    },

    resultsInfo: {
        padding: '10px 0',
        borderTop: '1px solid #e5e9f0',
        marginTop: '15px'
    },

    resultsText: {
        color: '#667085',
        fontSize: '14px',
        margin: 0
    },

    // Info Banner Styles
    infoBanner: {
        backgroundColor: '#ecf0ff',
        borderLeft: '4px solid #0369a1',
        padding: '20px 60px',
        marginBottom: '40px'
    },

    bannerContent: {
        maxWidth: '1200px'
    },

    bannerTitle: {
        color: '#0a1930',
        fontSize: '18px',
        fontWeight: '700',
        margin: '0 0 10px 0'
    },

    bannerText: {
        color: '#0a1930',
        fontSize: '15px',
        lineHeight: '1.6',
        margin: '0 0 15px 0'
    },

    lmisLink: {
        display: 'inline-flex',
        alignItems: 'center',
        color: '#0369a1',
        fontSize: '14px',
        fontWeight: '600',
        textDecoration: 'none',
        transition: 'color 0.3s',
        cursor: 'pointer'
    },

    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '30px',
        padding: '0 60px 60px 60px'
    },

    card: {
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#103063',
        color: '#fff',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
        minHeight: '260px',
        display: 'flex',
        flexDirection: 'column'
    },

    categoryBadge: {
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#7dd3fc',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '15px'
    },

    cardTitle: {
        fontSize: '22px',
        marginBottom: '15px',
        fontWeight: 'bold',
        textShadow: '2px 2px 6px rgba(0,0,0,0.9)'
    },

    cardDesc: {
        fontSize: '15px',
        color: 'rgba(255,255,255,0.9)',
        lineHeight: '1.6',
        textShadow: '1px 1px 4px rgba(0,0,0,0.9)',
        flex: 1
    },

    noResults: {
        textAlign: 'center',
        padding: '60px 30px',
        backgroundColor: '#f8f9fb',
        borderRadius: '12px',
        margin: '0 60px 60px 60px'
    },

    noResultsText: {
        color: '#667085',
        fontSize: '16px',
        marginBottom: '20px'
    },

    errorMessage: {
        color: '#dc2626',
        padding: '20px',
        textAlign: 'center',
        fontSize: '16px'
    }

};

export default EducationTraining;