import React from 'react';
import { useRouteError, isRouteErrorResponse, Link, useNavigate } from 'react-router-dom';
import { FaHome, FaExclamationTriangle, FaChevronLeft, FaRobot } from 'react-icons/fa';

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  // Determine error details
  let title = "Unexpected Error";
  let message = "Something went wrong on our end. Please try again later.";
  let icon = <FaExclamationTriangle style={{ fontSize: '80px', color: '#f59e0b' }} />;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "404 Page Not Found";
      message = "The page you are looking for doesn't exist, has been removed, or the route hasn't been registered yet.";
      icon = <FaRobot style={{ fontSize: '80px', color: '#0ea5e9' }} />;
    } else if (error.status === 401) {
      title = "401 Unauthorized";
      message = "You don't have the required permissions to access this section.";
    } else if (error.status === 503) {
      title = "503 Service Unavailable";
      message = "Our systems are currently undergoing maintenance. Please check back shortly.";
    }
  }

  const styles = {
    page: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f7fb',
      fontFamily: 'Inter, Arial, sans-serif',
      padding: '40px 20px',
      textAlign: 'center'
    },
    container: {
      maxWidth: '600px',
      backgroundColor: '#fff',
      padding: '50px 40px',
      borderRadius: '24px',
      boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
      border: '1px solid #e2e8f0'
    },
    title: {
      fontSize: '32px',
      color: '#103063',
      margin: '24px 0 12px 0',
      fontWeight: 800
    },
    subtitle: {
      fontSize: '17px',
      color: '#475569',
      marginBottom: '40px',
      lineHeight: '1.6'
    },
    buttonGroup: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      padding: '14px 28px',
      borderRadius: '12px',
      textDecoration: 'none',
      fontWeight: 700,
      fontSize: '15px',
      cursor: 'pointer',
      transition: 'transform 0.2s ease'
    },
    primaryBtn: { backgroundColor: '#0ea5e9', color: '#fff', border: 'none' },
    secondaryBtn: { backgroundColor: '#f1f5f9', color: '#103063', border: 'none' }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {icon}
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.subtitle}>{message}</p>
        
        <div style={styles.buttonGroup}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ ...styles.button, ...styles.secondaryBtn }}
          >
            <FaChevronLeft /> Go Back
          </button>
          <Link to="/" style={{ ...styles.button, ...styles.primaryBtn }}>
            <FaHome /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;