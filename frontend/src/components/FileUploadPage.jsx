import { useState } from 'react';
import { summarizePDF, uploadPDF } from '../api';
import { useNavigate } from 'react-router-dom';
import useServerStatus from '../hooks/useServerStatus';

export default function FileUploadPage() {
  const serversReady = useServerStatus();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Define a consistent background color for all elements
  const backgroundColor = '#f9f9f9';

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSummarize = async () => {
    if (!file) return;
    setLoading(true);

    let filePath = '';

    try {
      filePath = await uploadPDF(file);
    } catch (err) {
      alert('Error uploading the file');
      setLoading(false);
      return;
    }

    try {
      const data = await summarizePDF(filePath);
      navigate('/chat', { state: { summary: data.summary, sessionId: data.session_id } });
    } catch (err) {
      alert('Error summarizing the file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      width: '100vw',  // Full viewport width
      height: '100vh', // Full viewport height
      backgroundColor: backgroundColor,
      margin: 0,
      padding: 0,
      position: 'absolute',
      top: 0,
      left: 0,
      fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: backgroundColor,
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 10
      }}>
        <h1 
          onClick={() => navigate('/')} 
          style={{ 
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: '600',
            margin: 0,
            color: '#333'
          }}
        >
          🏠
        </h1>
      </div>

      <div style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '8rem 1rem 1rem 1rem',
        height: 'calc(100vh - 9rem)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          backgroundColor: backgroundColor,
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          {!serversReady ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
            }}>
              <p style={{
                fontSize: '16px',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⏳ Warming up backend... please wait
                It may take a little longer if it is your first time...
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '500',
                color: '#333',
                marginTop: 0,
                marginBottom: '24px'
              }}>
                Upload PDF to Summarize
              </h2>
              
              <div style={{
                width: '100%',
                marginBottom: '24px'
              }}>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileChange}
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '12px',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                />
              </div>
              
              <button 
                onClick={handleSummarize} 
                disabled={!file || loading}
                style={{
                  backgroundColor: !file || loading ? '#e0e0e0' : '#0064e0',
                  color: !file || loading ? '#666' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: !file || loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  marginTop: '8px'
                }}
              >
                {loading ? 'Summarizing...' : 'Summarize with LLaMA'}
              </button>
              
              {file && (
                <div style={{
                  marginTop: '16px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  Selected file: {file.name}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}