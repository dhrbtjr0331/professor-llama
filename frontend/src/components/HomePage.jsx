import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Update online status when it changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleOnlineClick = () => {
    if (isOnline) {
      navigate('/upload-url');
    } else {
      setShowError(true);
      // Hide error after 3 seconds
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const colors = {
    background: '#f9f9f9',
    card: '#ffffff',
    text: '#333333',
    secondaryText: '#666666',
    accent: '#0064e0', // The coral/orange accent color from the asterisk
    buttonPrimary: '#f0f0f0',
    buttonHover: '#e8e8e8',
    borderColor: '#e0e0e0',
    errorBackground: '#ffebee',
    errorText: '#c62828',
    errorBorder: '#ef9a9a',
    statusColor: '#666' // Color for the online/offline status
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '4rem',
      backgroundColor: colors.background,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: colors.text,
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        fontWeight: '500'
      }}>
        <span style={{ color: colors.accent, marginRight: '0.5rem' }}>✻</span> 
        Professor LLaMA
      </h1>

      <div style={{ 
        display: 'flex', 
        gap: '3rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          maxWidth: '280px',
          padding: '1.5rem',
          backgroundColor: colors.card,
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}>
          <button
            onClick={() => navigate('/upload')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '8px',
              marginBottom: '1rem',
              width: '100%',
              backgroundColor: colors.buttonPrimary,
              border: `1px solid ${colors.borderColor}`,
              color: colors.text,
              fontWeight: '700',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = colors.buttonHover}
            onMouseOut={(e) => e.target.style.backgroundColor = colors.buttonPrimary}
          >
            Offline Version
          </button>
          <div style={{ textAlign: 'center', fontSize: '0.95rem', marginBottom: '1rem', color: colors.text }}>
            Process confidential documents privately on your device
          </div>
          <ul style={{ 
            fontSize: '0.85rem', 
            color: colors.secondaryText, 
            textAlign: 'left', 
            margin: 0, 
            paddingLeft: '1.2rem',
            lineHeight: '1.8' 
          }}>
            <li>Works without internet connection</li>
            <li>Ensures complete data privacy</li>
            <li>Perfect for sensitive information</li>
            <li>No data leaves your device</li>
          </ul>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          maxWidth: '280px',
          padding: '1.5rem',
          backgroundColor: colors.card,
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}>
          <button
            onClick={handleOnlineClick}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '8px',
              marginBottom: '1rem',
              backgroundColor: isOnline ? colors.buttonPrimary : '#f5f5f5',
              border: `1px solid ${colors.borderColor}`,
              opacity: isOnline ? 1 : 0.7,
              width: '100%',
              color: colors.text,
              fontWeight: '700',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              if (isOnline) e.target.style.backgroundColor = colors.buttonHover;
            }}
            onMouseOut={(e) => {
              if (isOnline) e.target.style.backgroundColor = colors.buttonPrimary;
            }}
          >
            Online Version
          </button>
          <div style={{ textAlign: 'center', fontSize: '0.95rem', marginBottom: '1rem', color: colors.text }}>
            Analyze content directly from any public URL
          </div>
          <ul style={{ 
            fontSize: '0.85rem', 
            color: colors.secondaryText, 
            textAlign: 'left', 
            margin: 0, 
            paddingLeft: '1.2rem',
            lineHeight: '1.8' 
          }}>
            <li>Quick access to web content</li>
            <li>No downloading required</li>
            <li>Optimized for articles and blogs</li>
            <li>Requires internet connection</li>
          </ul>
        </div>
      </div>

      {showError && (
        <div style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: colors.errorBackground,
          color: colors.errorText,
          borderRadius: '8px',
          border: `1px solid ${colors.errorBorder}`,
          fontSize: '0.9rem'
        }}>
          No internet connection. Please connect to WiFi to use the online version.
        </div>
      )}
      
      <div style={{
        marginTop: '1rem',
        fontSize: '0.9rem',
        color: colors.statusColor,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: colors.card,
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <span style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: isOnline ? '#4caf50' : '#f44336',
          display: 'inline-block',
          marginRight: '0.5rem'
        }}></span>
        Status: {isOnline ? 'Online' : 'Offline'}
      </div>
    </div>
  );
}