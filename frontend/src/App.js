import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  // --- STATE INITIALIZATION (Load from LocalStorage immediately) ---
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('pca_session_id') || null);
  const [sessions, setSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pca_sessions')) || [];
    } catch { return []; }
  });
  
  // Persist UI state so it survives reload instantly
  const [userInput, setUserInput] = useState('');
  const [workingFolder, setWorkingFolder] = useState(() => localStorage.getItem('pca_working_folder') || '');
  
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pca_chat_history')) || [];
    } catch { return []; }
  });

  const [plan, setPlan] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pca_plan')) || null;
    } catch { return null; }
  });

  const [lastResult, setLastResult] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pca_last_result')) || null;
    } catch { return null; }
  });

  const [isRisky, setIsRisky] = useState(false); // Can be derived or defaulted
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const bottomRef = useRef(null);

  // --- PERSISTENCE EFFECTS ---
  // Whenever critical state changes, save it to LocalStorage
  useEffect(() => { localStorage.setItem('pca_sessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('pca_chat_history', JSON.stringify(chatHistory)); }, [chatHistory]);
  useEffect(() => { 
    if (plan) localStorage.setItem('pca_plan', JSON.stringify(plan)); 
    else localStorage.removeItem('pca_plan');
  }, [plan]);
  useEffect(() => { 
    if (lastResult !== null) localStorage.setItem('pca_last_result', JSON.stringify(lastResult));
    else localStorage.removeItem('pca_last_result');
  }, [lastResult]);
  useEffect(() => { localStorage.setItem('pca_working_folder', workingFolder); }, [workingFolder]);
  useEffect(() => { 
    if (sessionId) localStorage.setItem('pca_session_id', sessionId);
    else localStorage.removeItem('pca_session_id');
  }, [sessionId]);


  // --- BACKEND SYNC (On Mount) ---
  useEffect(() => {
    const syncWithBackend = async () => {
      if (sessionId) {
        try {
          // Verify session exists on backend
          await axios.get(`${API_BASE_URL}/session/${sessionId}/state`);
          // If successful, we assume our local state is good or could be refreshed
          // Optional: Force refresh from backend to be safe
          // const state = res.data;
          // setChatHistory(state.chat_history);
        } catch (err) {
          console.warn("Session not found on backend (server restart?), creating new.");
          await handleNewTask();
        }
      } else {
        await handleNewTask();
      }
    };
    
    // Only sync if we don't have local history (optimization) or to validate session
    if (!sessionId) {
      syncWithBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, plan, lastResult, loading]);


  // --- HANDLERS ---

  const handleNewTask = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/session/init`);
      const newId = response.data.session_id;
      
      setSessionId(newId);
      
      // Reset State
      setChatHistory([]);
      setPlan(null);
      setLastResult(null);
      setUserInput('');
      setError('');
      
      // Fetch default folder
      const stateResponse = await axios.get(`${API_BASE_URL}/session/${newId}/state`);
      setWorkingFolder(stateResponse.data.working_folder);

    } catch (error) {
      console.error('Init failed:', error);
      setError('Failed to connect to backend.');
    }
  };

  const loadSession = async (session) => {
    // 1. Switch ID immediately
    setSessionId(session.id);
    
    // 2. Load data from the session object (Fast switch)
    setChatHistory(session.history || []);
    setWorkingFolder(session.folder || '');
    setPlan(null); // Clear pending plans when switching
    setLastResult(null);
    setError('');

    // 3. (Optional) Fetch fresh state from backend if needed
    try {
        const stateResponse = await axios.get(`${API_BASE_URL}/session/${session.id}/state`);
        // If backend has more data, update it
        if (stateResponse.data.chat_history && stateResponse.data.chat_history.length > 0) {
             setChatHistory(stateResponse.data.chat_history);
        }
    } catch (e) {
        console.warn("Could not sync session with backend");
    }
  };

  // Update Sessions List Logic
  useEffect(() => {
    if (!sessionId || chatHistory.length === 0) return;

    setSessions(prevSessions => {
      const existingIndex = prevSessions.findIndex(s => s.id === sessionId);
      
      const firstMessage = chatHistory[0];
      const promptText = (firstMessage && firstMessage.user_input) ? firstMessage.user_input : "New Task";
      const title = promptText.substring(0, 30) + (promptText.length > 30 ? "..." : "");
      
      const updatedSession = {
        id: sessionId,
        title: title,
        history: chatHistory, // Save history inside session list
        folder: workingFolder,
        timestamp: Date.now()
      };

      if (existingIndex >= 0) {
        const newSessions = [...prevSessions];
        newSessions[existingIndex] = updatedSession;
        newSessions.sort((a, b) => b.timestamp - a.timestamp); 
        return newSessions;
      } else {
        return [updatedSession, ...prevSessions];
      }
    });
  }, [chatHistory, workingFolder, sessionId]);

  const deleteSession = (e, idToDelete) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== idToDelete);
    setSessions(updated);
    if (idToDelete === sessionId) handleNewTask(); 
  };

  const handleGeneratePlan = async (promptText = userInput) => {
    if (!promptText.trim() || !sessionId) return;
    setLoading(true);
    setPlan(null);
    setLastResult(null);
    setError('');

    try {
      // Optimistic update
      const newHistory = [...chatHistory, { user_input: promptText }];
      setChatHistory(newHistory);
      setUserInput(''); 

      const response = await axios.post(`${API_BASE_URL}/plan/generate`, {
        session_id: sessionId,
        user_input: promptText
      });
      setPlan(response.data.plan);
      setIsRisky(!response.data.is_safe);
      setMessage(response.data.message);
      
    } catch (error) {
      setError('Error generating plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/command/execute`, {
        session_id: sessionId,
        user_input: userInput 
      });
      
      const executionResult = response.data.result;
      
      setChatHistory(prev => {
        const newHistory = [...prev];
        const lastIndex = newHistory.length - 1;
        if (lastIndex >= 0) {
          newHistory[lastIndex] = {
            ...newHistory[lastIndex],
            command: plan,
            result: executionResult
          };
        }
        return newHistory;
      });

      setPlan(null);
      setLastResult(null);
      
    } catch (error) {
      setError('Execution failed.');
    } finally {
      setExecuting(false);
    }
  };

  const handleFolderChange = () => {
    const path = prompt('Enter target folder path:', workingFolder);
    if (path && sessionId) {
      axios.post(`${API_BASE_URL}/session/${sessionId}/folder`, { folder_path: path })
        .then(res => res.data.success && setWorkingFolder(res.data.working_folder))
        .catch(() => setError('Failed to change folder.'));
    }
  };

  const handleClearMemory = async () => {
    if (window.confirm('Clear all memory for this session?')) {
      try {
        await axios.post(`${API_BASE_URL}/session/${sessionId}/clear`);
        setChatHistory([]);
        setPlan(null);
        setLastResult(null);
        setError('');
      } catch (err) {
        setError('Failed to clear memory.');
      }
    }
  };

  const suggestions = [
    { label: "Create 3 files", prompt: "Create three text files named a.txt, b.txt, and c.txt" },
    { label: "List all files", prompt: "List all files in the current directory including hidden ones" },
    { label: "Find large files", prompt: "Find all files larger than 10MB in this folder" },
    { label: "Create folder", prompt: "Create a new folder named 'Backup'" }
  ];

  return (
    <div className="app">
      {/* --- Sidebar --- */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="new-task-btn" onClick={handleNewTask}>
            <span className="plus-icon">+</span>
            <span>New Task</span>
          </button>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-group">
            <div className="group-label">Recent Tasks</div>
            <div className="session-list">
              {sessions.length === 0 && (
                <div style={{padding:'10px', color:'var(--text-secondary)', fontSize:'0.8rem', fontStyle:'italic'}}>
                  No history yet
                </div>
              )}
              {sessions.map(session => (
                <div 
                  key={session.id} 
                  className={`session-item ${session.id === sessionId ? 'active' : ''}`}
                  onClick={() => loadSession(session)}
                >
                  <span className="session-title">{session.title}</span>
                  <button 
                    className="delete-btn" 
                    onClick={(e) => deleteSession(e, session.id)}
                    title="Delete Chat"
                  >✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="sidebar-group">
              <div className="group-label">System</div>
              <div className="status-row">
                <span className="status-dot active"></span>
                <span className="status-text">LLM Engine (Phi-3)</span>
              </div>
              <div className="status-row">
                <span className="status-dot ready"></span>
                <span className="status-text">Docker Sandbox</span>
              </div>
            </div>

            <div className="sidebar-group">
              <div className="group-label">Config</div>
              <div className="path-widget" title={workingFolder}>
                <span className="path-icon">📂</span>
                <span className="path-text">{workingFolder || 'No folder selected'}</span>
              </div>
              <button className="sidebar-link" onClick={handleFolderChange}>
                Change Folder
              </button>
              <button className="sidebar-link danger" onClick={handleClearMemory}>
                Reset Memory
              </button>
            </div>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">A</div>
            <div className="user-info">
              <div className="user-name">Abbas</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="main-content">
        <div className="main-header">
          <div className="header-title">PCA Praxis</div>
        </div>

        <div className="chat-feed">
          <div className="feed-wrapper">
            
            {error && (
              <div className="alert error">
                ⚠️ {error}
                <button onClick={() => setError('')} style={{marginLeft: 'auto', background:'none', border:'none', color:'inherit', cursor:'pointer'}}>✕</button>
              </div>
            )}
            
            {/* Empty State */}
            {chatHistory.length === 0 && !plan && !loading && !error && (
              <div className="empty-state">
                <div className="empty-logo-wrapper">
                  <span className="empty-logo">🛡️</span>
                </div>
                <div className="empty-greeting">Hello, Abbas</div>
                <div className="empty-subtext">I can execute secure Bash commands in your sandbox.</div>
                
                <div className="suggestions-grid">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i} 
                      className="suggestion-card"
                      onClick={() => handleGeneratePlan(s.prompt)}
                    >
                      <span className="suggestion-label">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat History Loop */}
            {chatHistory.map((msg, i) => (
              <div key={i} className="message-group">
                <div className="message-row user-row">
                  <div className="avatar user">A</div>
                  <div className="message-content user-text">{msg.user_input}</div>
                </div>
                
                {msg.command && (
                  <div className="message-row ai-row">
                    <div className="avatar ai">🤖</div>
                    <div className="message-content">
                      <div className="plan-card">
                        <div className="card-header">
                          <span className="card-label">Executed Command</span>
                        </div>
                        <pre className="code-display">{msg.command}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {msg.result !== undefined && (
                  <div className="message-row ai-row">
                    <div className="avatar ai">🤖</div>
                    <div className="message-content">
                      <div className="result-box">
                        <div className="result-header">Terminal Output</div>
                        <pre>
                          {msg.result === '' ? '✅ Success (Silent execution)' : msg.result}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Active Plan */}
            {plan && (
              <div className="message-row ai-row">
                <div className="avatar ai">🤖</div>
                <div className="message-content">
                  <div className={`plan-card`}>
                    <div className="card-header">
                      <span className="card-label">Proposed Plan</span>
                      {isRisky && <span className="badge-risky">⚠️ Risky</span>}
                    </div>
                    <pre className="code-display">{plan}</pre>
                    
                    {isRisky && (
                      <div className="risk-warning">
                        {message}
                      </div>
                    )}

                    <div className="card-actions">
                      <button 
                        className={isRisky ? 'btn-danger' : 'btn-primary'}
                        onClick={handleExecute}
                        disabled={executing}
                      >
                        {executing ? 'Running...' : (isRisky ? 'Force Execute' : 'Execute')}
                      </button>
                      <button className="btn-secondary" onClick={() => setPlan(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="message-row ai-row">
                <div className="avatar ai">🤖</div>
                <div className="message-content loading-text">
                  Thinking...
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="input-area">
          <div className="input-container">
            <input 
              className="main-input"
              placeholder="Describe your task..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleGeneratePlan(userInput)}
              disabled={loading || executing || plan}
            />
            <button 
              className="send-btn" 
              onClick={() => handleGeneratePlan(userInput)}
              disabled={!userInput.trim() || loading || executing || plan}
            >
              ➤
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;