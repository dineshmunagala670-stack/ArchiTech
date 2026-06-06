import { useState } from 'react';
import './index.css';
import FileExplorer from './components/FileExplorer';
import CodeSandbox from './components/CodeSandbox';

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [useLLM, setUseLLM] = useState(false);
  const [enableCloudLlm, setEnableCloudLlm] = useState(false);
  const [apiKeyOverride, setApiKeyOverride] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [schema, setSchema] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [dockerLoading, setDockerLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setLogs(['🚀 Starting project generation...']);
    
    try {
      const response = await fetch('http://localhost:3002/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          useLLM, 
          enableCloudLlm, 
          apiKeyOverride 
        })
      });

      const data = await response.json();
      
      // 🔥 THE CRITICAL WHITE-SCREEN SHIELD:
      // Safely handle any schema parsing issues
      try {
        setLogs(data.logs);
        setSchema(data.schema);
        setProjectId(data.projectId);
        
        // Safely find first file with fallbacks
        if (data.schema?.sandboxTreeUi && Array.isArray(data.schema.sandboxTreeUi)) {
          const firstFile = findFirstFile(data.schema.sandboxTreeUi);
          if (firstFile && firstFile.path) {
            setOpenFiles([firstFile.path]);
            setActiveFile(firstFile.path);
          } else {
            setOpenFiles([]);
            setActiveFile(null);
          }
        } else {
          setOpenFiles([]);
          setActiveFile(null);
        }
      } catch (schemaError) {
        console.error("🛑 Internal React Render Shield Intercepted a Crash:", schemaError.message);
        setLogs(prev => [...prev, "⚠️ Schema validation issue, displaying fallback UI"]);
        alert("Parsing mismatch: LLM returned dirty formatting characters. Fallback template loaded.");
      }
    } catch (error) {
      setLogs(prev => [...prev, `❌ Error: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!projectId) return;
    window.open(`http://localhost:3002/api/download/${projectId}`, '_blank');
  };

  const handleRunDocker = async () => {
    if (!projectId) return;
    setDockerLoading(true);
    setLogs(prev => [...prev, '🐳 Starting Docker containers...']);
    
    try {
      const response = await fetch('http://localhost:3002/api/run-docker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });

      const data = await response.json();
      setLogs(prev => [...prev, ...data.logs]);
    } catch (error) {
      setLogs(prev => [...prev, `❌ Docker Error: ${error.message}`]);
    } finally {
      setDockerLoading(false);
    }
  };

  const findFirstFile = (tree) => {
    for (const item of tree) {
      if (item.type === 'file') return item;
      if (item.type === 'folder' && item.children.length > 0) {
        const found = findFirstFile(item.children);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <div className="app">
      <main className="main-content-full">
        <header className="top-header">
          <div className="logo-header">
            <span className="logo-icon">🔧</span>
            <span className="logo-text">ArchiTech</span>
          </div>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search Frameworks..." />
          </div>
          <div className="header-actions">
            <button className="icon-btn">🔔</button>
            <div className="profile-badge">👤</div>
          </div>
        </header>

        <div className="operations-canvas">
          <section className="panel-left">
            <div className="panel-header">
              <h3>Interactive Prompts</h3>
            </div>
            <div className="prompt-area">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your project (e.g., 'Build a Next.js e-commerce site' or 'Create a Rust Axum API')"
                rows={6}
              />
              <div className="prompt-actions">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={useLLM}
                    onChange={(e) => setUseLLM(e.target.checked)}
                  />
                  <span className="slider"></span>
                  <span>Enable LLM Generation</span>
                </label>
                
                {useLLM && (
                  <>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={enableCloudLlm}
                        onChange={(e) => setEnableCloudLlm(e.target.checked)}
                      />
                      <span className="slider"></span>
                      <span>Use Cloud LLM (Gemini)</span>
                    </label>
                    
                    <input
                      type="password"
                      value={apiKeyOverride}
                      onChange={(e) => setApiKeyOverride(e.target.value)}
                      placeholder="Custom OpenAI API Key (sk-...)"
                      className="api-key-input"
                    />
                  </>
                )}
                
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="generate-btn"
                >
                  {loading ? 'Generating...' : '🚀 Generate Project'}
                </button>
              </div>
            </div>
          </section>

          <section className="panel-center">
            <div className="panel-header">
              <h3>architech.log</h3>
            </div>
            <div className="terminal">
              {logs.length === 0 ? (
                <div className="terminal-empty">Waiting for generation...</div>
              ) : (
                logs.map((log, i) => <div key={i} className="terminal-line">{log}</div>)
              )}
            </div>
            {projectId && (
              <div className="terminal-actions">
                <button onClick={handleDownload} className="download-btn">
                  📦 Download ZIP
                </button>
                <button onClick={handleRunDocker} disabled={dockerLoading} className="docker-btn">
                  {dockerLoading ? 'Starting...' : '🐳 Run Docker'}
                </button>
                <div className="docker-note">⚠️ Docker only works on local machine</div>
              </div>
            )}
          </section>

          <section className="panel-right">
            {schema ? (
              <div className="code-sandbox-container">
                <div className="panel-header">
                  <h3>Generated Code Sandbox</h3>
                </div>
                <div className="sandbox-content">
                  <FileExplorer
                    tree={schema.sandboxTreeUi}
                    openFiles={openFiles}
                    activeFile={activeFile}
                    onFileSelect={(filePath) => {
                      if (!openFiles.includes(filePath)) {
                        setOpenFiles([...openFiles, filePath]);
                      }
                      setActiveFile(filePath);
                    }}
                  />
                  <CodeSandbox
                    fileContents={schema.fileContents}
                    openFiles={openFiles}
                    activeFile={activeFile}
                    onFileSelect={setActiveFile}
                    onFileClose={(filePath) => {
                      const newOpenFiles = openFiles.filter(f => f !== filePath);
                      setOpenFiles(newOpenFiles);
                      if (activeFile === filePath) {
                        setActiveFile(newOpenFiles[newOpenFiles.length - 1] || null);
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="code-sandbox-empty">
                <div className="empty-icon">💻</div>
                <p>Generate a project to see files here</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;
