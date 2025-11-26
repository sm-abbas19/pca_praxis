import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [plan, setPlan] = useState(null);
  const [isRisky, setIsRisky] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [workingFolder, setWorkingFolder] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showChatHistory, setShowChatHistory] = useState(true);
  const chatEndRef = useRef(null);
  const resultEndRef = useRef(null);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/session/init`);
        const newSessionId = response.data.session_id;
        setSessionId(newSessionId);
        
        // Get initial state
        const stateResponse = await axios.get(`${API_BASE_URL}/session/${newSessionId}/state`);
        setWorkingFolder(stateResponse.data.working_folder);
        setChatHistory(stateResponse.data.chat_history || []);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setError('Failed to connect to backend. Please ensure the backend server is running.');
      }
    };
    initSession();
  }, []);

  // Auto-scroll chat history
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Auto-scroll results
  useEffect(() => {
    if (resultEndRef.current && lastResult !== null) {
      resultEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lastResult]);

  const handleGeneratePlan = async () => {
    if (!userInput.trim() || !sessionId) return;

    setLoading(true);
    setError('');
    setMessage('');
    setPlan(null);
    setLastResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/plan/generate`, {
        session_id: sessionId,
        user_input: userInput
      });

      setPlan(response.data.plan);
      setIsRisky(!response.data.is_safe);
      setMessage(response.data.message);
      
      // Refresh chat history
      const stateResponse = await axios.get(`${API_BASE_URL}/session/${sessionId}/state`);
      setChatHistory(stateResponse.data.chat_history || []);
    } catch (error) {
      console.error('Failed to generate plan:', error);
      setError(error.response?.data?.error || 'Error generating plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!sessionId || !plan) return;

    setExecuting(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/command/execute`, {
        session_id: sessionId,
        user_input: userInput
      });

      setLastResult(response.data.result);
      setPlan(null);
      setUserInput('');

      // Refresh state
      const stateResponse = await axios.get(`${API_BASE_URL}/session/${sessionId}/state`);
      setChatHistory(stateResponse.data.chat_history || []);
    } catch (error) {
      console.error('Failed to execute command:', error);
      setError(error.response?.data?.error || 'Error executing command. Please try again.');
    } finally {
      setExecuting(false);
    }
  };

  const handleCancel = async () => {
    if (!sessionId) return;

    try {
      await axios.post(`${API_BASE_URL}/plan/cancel`, {
        session_id: sessionId
      });
      setPlan(null);
      setMessage('');
      setError('');
    } catch (error) {
      console.error('Failed to cancel plan:', error);
    }
  };

  const handleClearMemory = async () => {
    if (!sessionId) return;

    if (!window.confirm('Are you sure you want to clear the agent memory? This will remove all chat history.')) {
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/session/${sessionId}/clear`);
      setChatHistory([]);
      setLastResult(null);
      setPlan(null);
      setMessage('');
      setError('');
    } catch (error) {
      console.error('Failed to clear memory:', error);
      setError('Failed to clear memory');
    }
  };

  const handleFolderChange = () => {
    const folderPath = prompt('Enter the full path to the target folder:', workingFolder || '');
    if (folderPath && sessionId) {
      axios.post(`${API_BASE_URL}/session/${sessionId}/folder`, {
        folder_path: folderPath
      }).then(response => {
        if (response.data.success) {
          setWorkingFolder(response.data.working_folder);
        } else {
          setError('Invalid folder path');
        }
      }).catch(error => {
        console.error('Failed to set folder:', error);
        setError('Failed to set folder path');
      });
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <h1 className="title">
              <span className="title-icon">🛡️</span>
              PCA-Praxis
              <span className="title-subtitle">Secure CLI Agent</span>
            </h1>
            <div className="header-badge">Powered by Phi-3</div>
          </div>
        </header>

        <div className="layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-section">
              <h2 className="sidebar-title">
                <span className="icon">📊</span>
                System Status
              </h2>
              <div className="status-grid">
                <div className="status-item success">
                  <span className="status-dot"></span>
                  <div>
                    <div className="status-label">LLM Engine</div>
                    <div className="status-value">Phi-3 Active</div>
                  </div>
                </div>
                <div className="status-item success">
                  <span className="status-dot"></span>
                  <div>
                    <div className="status-label">Docker Sandbox</div>
                    <div className="status-value">Ready</div>
                  </div>
                </div>
                <div className="status-item info">
                  <span className="status-dot"></span>
                  <div>
                    <div className="status-label">Security</div>
                    <div className="status-value">Active</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            <div className="sidebar-section">
              <h2 className="sidebar-title">
                <span className="icon">⚙️</span>
                Settings
              </h2>
              <button 
                className="btn btn-secondary btn-full" 
                onClick={handleFolderChange}
                title="Change the target directory for commands"
              >
                <span className="btn-icon">📂</span>
                Change Target Folder
              </button>
              <div className="folder-display">
                <div className="folder-label">Target Directory</div>
                <div className="folder-path" title={workingFolder || 'Not set'}>
                  {workingFolder || <span className="not-set">Not set</span>}
                </div>
              </div>
              <button 
                className="btn btn-secondary btn-full" 
                onClick={handleClearMemory}
                title="Clear chat history and agent memory"
              >
                <span className="btn-icon">🗑️</span>
                Clear Memory
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            {/* Chat History */}
            {showChatHistory && chatHistory.length > 0 && (
              <div className="chat-section">
                <div className="section-header">
                  <h2>
                    <span className="icon">💬</span>
                    Chat History
                  </h2>
                  <button 
                    className="btn-toggle"
                    onClick={() => setShowChatHistory(false)}
                    title="Hide chat history"
                  >
                    ▲
                  </button>
                </div>
                <div className="chat-container">
                  {chatHistory.map((entry, index) => (
                    <div key={index} className="chat-message">
                      <div className="chat-message-user">
                        <span className="chat-avatar">👤</span>
                        <div className="chat-bubble user-bubble">
                          {entry.user_input}
                        </div>
                      </div>
                      {entry.command && (
                        <div className="chat-message-assistant">
                          <span className="chat-avatar">🤖</span>
                          <div className="chat-bubble assistant-bubble">
                            <div className="chat-command-label">Command:</div>
                            <code className="chat-command">{entry.command}</code>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}

            {!showChatHistory && chatHistory.length > 0 && (
              <div className="chat-toggle-bar">
                <button 
                  className="btn-toggle"
                  onClick={() => setShowChatHistory(true)}
                >
                  <span className="icon">💬</span>
                  Show Chat History ({chatHistory.length} messages)
                </button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="message error animate-in">
                <span className="message-icon">⚠️</span>
                {error}
                <button 
                  className="message-close"
                  onClick={() => setError('')}
                  title="Dismiss"
                >
                  ×
                </button>
              </div>
            )}

            {/* Task Input */}
            <div className="section task-section">
              <h2 className="section-title">
                <span className="section-number">1</span>
                Enter Your Task
              </h2>
              <div className="input-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="text-input"
                    placeholder="e.g., List all Python files in the current directory"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && !executing && handleGeneratePlan()}
                    disabled={loading || executing}
                  />
                  {loading && (
                    <div className="input-loading">
                      <div className="spinner"></div>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-primary btn-generate"
                  onClick={handleGeneratePlan}
                  disabled={!userInput.trim() || loading || executing}
                >
                  {loading ? (
                    <>
                      <span className="spinner-small"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✨</span>
                      Generate Plan
                    </>
                  )}
                </button>
              </div>
              {message && (
                <div className={`message ${isRisky ? 'warning' : 'info'} animate-in`}>
                  <span className="message-icon">{isRisky ? '⚠️' : 'ℹ️'}</span>
                  {message}
                </div>
              )}
            </div>

            {/* Plan Verification */}
            {plan && (
              <div className="section plan-section animate-in">
                <h2 className="section-title">
                  <span className="section-number">2</span>
                  Review Command
                </h2>
                <div className="code-block">
                  <div className="code-header">
                    <span className="code-label">Generated Command</span>
                    <button 
                      className="code-copy"
                      onClick={() => {
                        navigator.clipboard.writeText(plan);
                        alert('Command copied to clipboard!');
                      }}
                      title="Copy to clipboard"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <pre className="code-content">{plan}</pre>
                </div>
                {isRisky && (
                  <div className="message error animate-in">
                    <span className="message-icon">🚨</span>
                    <strong>WARNING:</strong> This command is blocked by default policy. Proceed with caution!
                  </div>
                )}
                <div className="button-group">
                  <button
                    className={`btn ${isRisky ? 'btn-danger' : 'btn-primary'} btn-execute`}
                    onClick={handleExecute}
                    disabled={executing}
                  >
                    {executing ? (
                      <>
                        <span className="spinner-small"></span>
                        Executing...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">{isRisky ? '💀' : '✅'}</span>
                        {isRisky ? 'Force Execute (Risky)' : 'Execute Now'}
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={executing}
                  >
                    <span className="btn-icon">❌</span>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Execution Result */}
            {lastResult !== null && (
              <div className="section result-section animate-in" ref={resultEndRef}>
                <h2 className="section-title">
                  <span className="section-number">3</span>
                  Execution Result
                </h2>
                {lastResult.trim() === '' ? (
                  <div className="message success animate-in">
                    <span className="message-icon">✅</span>
                    <strong>Success!</strong> Command executed successfully. (No output returned)
                  </div>
                ) : (
                  <div className="code-block result-block">
                    <div className="code-header">
                      <span className="code-label">Command Output</span>
                    </div>
                    <pre className="code-content">{lastResult}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!plan && !lastResult && chatHistory.length === 0 && !loading && (
              <div className="empty-state">
                <div className="empty-icon">🤖</div>
                <h3>Ready to Assist</h3>
                <p>Enter a task above to get started. I'll help you execute commands safely in a Docker sandbox.</p>
                <div className="empty-examples">
                  <div className="example-tag">List files</div>
                  <div className="example-tag">Search text</div>
                  <div className="example-tag">Create files</div>
                  <div className="example-tag">Analyze data</div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
