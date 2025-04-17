import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { chatWithLlama } from '../api';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { summary, sessionId } = location.state || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const backgroundColor = '#f9f9f9';

  useEffect(() => {
    if (summary) {
      setMessages([{ role: 'assistant', content: formatResponse(summary) }]);
    }
  }, [summary]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatResponse = (text) => {
    if (!text || text === "No content was generated.") {
      console.log("Empty response detected - this might be an issue with the response extraction");
      return "No content was generated. Please try again.";
    }
    
    let cleanedText = text;
    
    cleanedText = cleanedText.replace(/\[knowledge_search\(query="[^"]+"\)\]/g, '');
    
    if (text.includes('knowledge_search tool found') || text.includes('BEGIN of knowledge_search tool results')) {
      const endMarker = "END of knowledge_search tool results.";
      const summaryIndex = text.indexOf(endMarker);
      
      if (summaryIndex !== -1) {
        cleanedText = text.substring(summaryIndex + endMarker.length);
      }
    }
    
    if (text.includes('inference>')) {
      const inferenceMarker = "inference>";
      const inferenceIndex = text.indexOf(inferenceMarker);
      
      if (inferenceIndex !== -1) {
        cleanedText = text.substring(inferenceIndex + inferenceMarker.length);
      }
    }
    
    cleanedText = cleanedText
      .replace(/^[\s\S]*?', type='text'\)\]/, '')
      .replace(/TextContentItem\(text='(.*?)',\s*type='text'\)/g, '$1')
      .replace(/\\n/g, '\n')
      .replace(/\\'/g, "'")
      .replace(/^\s*\]\s*/, '')
      .replace(/\[knowledge_search\(query="[^"]+"\)\]/g, '')
      .trim();
    
    return cleanedText;
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const enhancedInput = `${input}\n\nPlease format your response using Markdown for better readability. Use headings, lists, bold, italic, code blocks, and other formatting as appropriate.`;
      
      const response = await chatWithLlama(sessionId, enhancedInput);
      
      console.log("Raw API response:", response);
      
      let formattedResponse;
      if (response && response.response) {
        formattedResponse = formatResponse(response.response);
      } else {
        console.error("Invalid response format:", response);
        formattedResponse = "Error: Received an invalid response format from the server.";
      }
      
      if (!formattedResponse || formattedResponse.trim() === "") {
        formattedResponse = "No content was generated. The model might be having trouble processing your request.";
      }
      
      setMessages([...newMessages, { role: 'assistant', content: formattedResponse }]);
    } catch (err) {
      console.error('Error in chat:', err);
      setMessages([
        ...newMessages, 
        { role: 'assistant', content: `Error: ${err.message || 'Error processing your question. Please try again.'}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (content) => {
    const cleanedContent = content.replace(/\[knowledge_search\(query="[^"]+"\)\]/g, '');
    
    return (
      <ReactMarkdown
        components={{
          p: ({node, ...props}) => <p style={{ margin: '0.75rem 0' }} {...props} />,
          h1: ({node, ...props}) => <h1 style={{ margin: '1rem 0', fontSize: '1.5rem' }} {...props} />,
          h2: ({node, ...props}) => <h2 style={{ margin: '1rem 0', fontSize: '1.3rem' }} {...props} />,
          h3: ({node, ...props}) => <h3 style={{ margin: '0.75rem 0', fontSize: '1.1rem' }} {...props} />,
          ul: ({node, ...props}) => <ul style={{ margin: '0.75rem 0', paddingLeft: '2rem' }} {...props} />,
          ol: ({node, ...props}) => <ol style={{ margin: '0.75rem 0', paddingLeft: '2rem' }} {...props} />,
          li: ({node, ...props}) => <li style={{ margin: '0.25rem 0' }} {...props} />,
          code: ({node, inline, ...props}) => (
            inline ? 
              <code style={{ backgroundColor: '#f0f0f0', padding: '0.15rem 0.3rem', borderRadius: '3px', fontFamily: 'monospace' }} {...props} /> : 
              <pre style={{ backgroundColor: '#f0f0f0', padding: '0.75rem', borderRadius: '5px', overflowX: 'auto' }}>
                <code style={{ fontFamily: 'monospace' }} {...props} />
              </pre>
          ),
          blockquote: ({node, ...props}) => <blockquote style={{ borderLeft: '4px solid #e0e0e0', paddingLeft: '1rem', margin: '0.75rem 0', color: '#666' }} {...props} />,
          table: ({node, ...props}) => <table style={{ borderCollapse: 'collapse', width: '100%', margin: '1rem 0' }} {...props} />,
          th: ({node, ...props}) => <th style={{ border: '1px solid #e0e0e0', padding: '0.5rem', textAlign: 'left', backgroundColor: '#f5f5f5' }} {...props} />,
          td: ({node, ...props}) => <td style={{ border: '1px solid #e0e0e0', padding: '0.5rem' }} {...props} />,
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    );
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div style={{ 
      width: '100vw',
      height: '100vh',
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
        <button 
          onClick={handleGoBack}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            color: '#333'
          }}
        >
          🏠
        </button>
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
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '0',
            backgroundColor: backgroundColor
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                padding: '1.5rem 1.5rem',
                backgroundColor: backgroundColor,
                borderBottom: '1px solid #f0f0f0',
                display: 'flex'
              }}>
                <div style={{
                  marginRight: '12px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: 'transparent',
                  color: msg.role === 'user' ? '#333' : '#fff',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {msg.role === 'user' ? 'you' : '🦙'}
                </div>
                <div style={{
                  flex: 1
                }}>
                  <div style={{ 
                    lineHeight: '1.6',
                    color: '#333',
                    fontSize: '16px'
                  }}>
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ 
                padding: '1.5rem 1.5rem',
                backgroundColor: backgroundColor,
                display: 'flex',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div style={{
                  marginRight: '12px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#666666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  🦙
                </div>
                <div style={{
                  flex: 1,
                  color: '#666'
                }}>
                  Professor LLaMA is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div style={{ 
            borderTop: '1px solid #e0e0e0',
            padding: '1rem 1.5rem',
            backgroundColor: backgroundColor,
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask Professor LLaMA..."
              style={{ 
                flex: 1, 
                padding: '0.75rem 1rem',
                fontSize: '16px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                outline: 'none',
                boxShadow: 'none',
                backgroundColor: '#fff'
              }}
              disabled={loading}
            />
            <button 
              onClick={sendMessage} 
              disabled={loading || !input.trim()}
              style={{
                position: 'absolute',
                right: '2rem',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'transparent',
                color: '#0064e0',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.5 : 1,
                padding: '4px 12px'
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}