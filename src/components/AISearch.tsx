import React, { useState, useRef, useEffect } from 'react';
import { getAIResponse } from '../utils/nlp';

interface AISearchProps {
  onSelectConstellation: (name: string) => void;
  stars: any[];
  constellationLines: any[];
}

const AISearch: React.FC<AISearchProps> = ({ onSelectConstellation, stars, constellationLines }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ query: string; response: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const result = await getAIResponse(query, stars, constellationLines);
      
      // Add to chat history
      setChatHistory(prev => [...prev, { query, response: result.result }]);
      
      setResponse(result.result);

      // Handle actions
      if (result.action === 'selectConstellation' && result.data?.constellation) {
        setTimeout(() => {
          onSelectConstellation(result.data.constellation);
        }, 500);
      }
    } catch (error) {
      setResponse('Sorry, I encountered an error. Please try again!');
    }

    setIsLoading(false);
    setQuery('');
  };

  const exampleQueries = [
    "Show me Orion",
    "What constellations are visible in December?",
    "What's the brightest star in Leo?",
    "Find the Big Dipper",
    "Tell me about Andromeda",
  ];

  const handleExampleClick = (example: string) => {
    setQuery(example);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Collapsed Chat Icon */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6b6bff, #a06bff)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 20px rgba(107, 107, 255, 0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            zIndex: 1000,
            transition: 'all 0.3s ease',
            animation: 'pulse 2s infinite',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(107, 107, 255, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(107, 107, 255, 0.5)';
          }}
          title="Ask AI about the night sky"
        >
          🤖
        </button>
      )}

      {/* Expanded Chat Panel */}
      {isExpanded && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 400,
            maxWidth: '90vw',
            maxHeight: '80vh',
            background: 'rgba(15, 15, 25, 0.98)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
            border: '1px solid rgba(100, 100, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideIn 0.3s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(100, 100, 255, 0.15), rgba(200, 100, 255, 0.15))',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <h3 style={{ margin: 0, color: '#fff', fontSize: 16, fontWeight: 600 }}>
                AI Sky Assistant
              </h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#fff',
                borderRadius: 6,
                width: 28,
                height: 28,
                cursor: 'pointer',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 100, 100, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              title="Close chat"
            >
              ×
            </button>
          </div>

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                maxHeight: 300,
              }}
            >
              {chatHistory.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      background: 'rgba(100, 100, 255, 0.2)',
                      padding: '8px 12px',
                      borderRadius: 8,
                      marginBottom: 8,
                      color: '#fff',
                    }}
                  >
                    <strong>You:</strong> {item.query}
                  </div>
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '8px 12px',
                      borderRadius: 8,
                      color: '#ddd',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {item.response}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Search Form */}
          <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me about the night sky..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: isLoading || !query.trim() 
                    ? 'rgba(100, 100, 255, 0.3)' 
                    : 'linear-gradient(135deg, #6b6bff, #a06bff)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {isLoading ? '⏳' : '🔍'}
              </button>
            </div>
          </form>

          {/* Response Display */}
          {response && !chatHistory.length && (
            <div
              style={{
                padding: '0 16px 16px',
                color: '#ddd',
                fontSize: 14,
                lineHeight: 1.5,
                maxHeight: 200,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {response}
            </div>
          )}

          {/* Example Queries */}
          {chatHistory.length === 0 && !response && (
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Try asking:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {exampleQueries.slice(0, 3).map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(example)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#aaf',
                      fontSize: 11,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add pulsing animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(107, 107, 255, 0.5);
          }
          50% {
            box-shadow: 0 4px 30px rgba(107, 107, 255, 0.8);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default AISearch;