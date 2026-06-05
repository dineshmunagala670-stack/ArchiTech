import { useState } from 'react';
import ProcessingPipeline from './components/ProcessingPipeline';
import Terminal from './components/Terminal';
import GeneratedCodeSandbox from './components/GeneratedCodeSandbox';

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [useCustomLLM, setUseCustomLLM] = useState(false);
  const [llmApiKey, setLlmApiKey] = useState('');
  const [llmModelName, setLlmModelName] = useState('openai/gpt-4o');
  const [humanizePrompt, setHumanizePrompt] = useState(false);
  const [generatedFileContent, setGeneratedFileContent] = useState('');

  const addLog = (message) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const humanizeInput = (rawPrompt) => {
    let cleaned = rawPrompt
      .replace(/\b(like|um|uh|so|yeah|basically|sort of|kind of)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    return cleaned;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    setCurrentStep(0);
    setLogs([]);
    setProjectId(null);
    setGeneratedFileContent('');
    addLog('🚀 Starting project generation...');

    try {
      const processedPrompt = humanizePrompt ? humanizeInput(prompt) : prompt;
      
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: processedPrompt,
          useCustomLLM,
          llmApiKey,
          llmModelName
        }),
      });

      const data = await response.json();
      
      if (data.projectId) {
        setProjectId(data.projectId);
      }

      if (data.previewFileContent) {
        setGeneratedFileContent(data.previewFileContent);
      }
      
      if (data.logs) {
        data.logs.forEach((log, index) => {
          setTimeout(() => {
            addLog(log);
            if (index < 4) {
              setCurrentStep(index + 1);
            }
          }, index * 300);
        });
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunDocker = async () => {
    addLog('🐳 Starting Docker containers...');
    
    try {
      const response = await fetch('http://localhost:3001/api/run-docker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();
      
      if (data.logs) {
        data.logs.forEach(log => addLog(log));
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  const handleDownload = () => {
    if (!projectId) {
      addLog('⚠️ No project to download yet!');
      return;
    }

    addLog('📥 Downloading codebase...');
    window.location.href = `http://localhost:3001/api/download/${projectId}`;
  };

  return (
    <div className="h-screen w-screen overflow-hidden p-4 bg-[#f0f2f5] flex flex-col gap-3 text-xs">
      <div className="max-w-[2000px] mx-auto w-full h-full flex flex-col gap-3">
        {/* Header */}
        <header className="bg-[#f0f2f5] rounded-xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] p-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#007aff] to-[#5856d6] rounded-lg shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] flex items-center justify-center text-lg font-bold text-white">
            A
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">
              ArchiTech
            </h1>
            <p className="text-[10px] text-gray-500">Autonomous Project & Docker Bootstrapper</p>
          </div>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-100px)] overflow-hidden">
          {/* Left Column - Input & Pipeline */}
          <div className="col-span-4 flex flex-col gap-3">
            {/* Input Panel */}
            <div className="bg-[#f0f2f5] rounded-xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">Describe Your Project</h2>
                <button
                  onClick={() => setHumanizePrompt(!humanizePrompt)}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all ${
                    humanizePrompt
                      ? 'bg-[#f0f2f5] text-[#007aff] shadow-[inset_1.5px_1.5px_4px_#cbd5e1,inset_-1.5px_-1.5px_4px_#ffffff]'
                      : 'bg-[#f0f2f5] text-gray-600 shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]'
                  }`}
                >
                  ✨ Humanize Input
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Build a Python FastAPI application with a Redis cache configuration"
                className="w-full h-24 bg-[#f0f2f5] shadow-[inset_2px_2px_5px_#cbd5e1,inset_-2px_-2px_5px_#ffffff] border-none rounded-lg p-2 text-gray-700 placeholder-gray-400 resize-none focus:outline-none font-mono text-xs"
                disabled={isProcessing}
              />

              {/* LLM Advanced Toggle */}
              <div>
                <button
                  onClick={() => setUseCustomLLM(!useCustomLLM)}
                  className="w-full bg-[#f0f2f5] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] p-2 text-left rounded-lg font-semibold text-gray-700 text-xs transition-all active:shadow-[inset_1.5px_1.5px_4px_#cbd5e1,inset_-1.5px_-1.5px_4px_#ffffff]"
                >
                  🧠 Inject Custom LLM Engine (Advanced) {useCustomLLM ? '▼' : '▶'}
                </button>
                
                {useCustomLLM && (
                  <div className="mt-2 p-2 bg-[#f0f2f5] shadow-[inset_2px_2px_5px_#cbd5e1,inset_-2px_-2px_5px_#ffffff] rounded-lg border-none">
                    <div className="mb-2">
                      <label className="block text-gray-600 font-semibold text-[10px] mb-1">API Key</label>
                      <input
                        type="password"
                        value={llmApiKey}
                        onChange={(e) => setLlmApiKey(e.target.value)}
                        className="w-full bg-[#f0f2f5] shadow-[inset_2px_2px_5px_#cbd5e1,inset_-2px_-2px_5px_#ffffff] border-none rounded-md p-1.5 text-gray-700 placeholder-gray-400 focus:outline-none font-mono text-[10px]"
                        placeholder="sk-..."
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-semibold text-[10px] mb-1">Model Name</label>
                      <input
                        type="text"
                        value={llmModelName}
                        onChange={(e) => setLlmModelName(e.target.value)}
                        className="w-full bg-[#f0f2f5] shadow-[inset_2px_2px_5px_#cbd5e1,inset_-2px_-2px_5px_#ffffff] border-none rounded-md p-1.5 text-gray-700 placeholder-gray-400 focus:outline-none font-mono text-[10px]"
                        placeholder="openai/gpt-4o"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={isProcessing || !prompt.trim()}
                  className="flex-1 bg-[#f0f2f5] text-[#007aff] font-bold py-1.5 px-3 rounded-lg shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] transition-all active:shadow-[inset_1.5px_1.5px_4px_#cbd5e1,inset_-1.5px_-1.5px_4px_#ffffff] disabled:opacity-50"
                >
                  {isProcessing ? 'Generating...' : '🚀 Generate'}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!projectId}
                  className="px-3 bg-[#f0f2f5] text-[#34c759] font-bold py-1.5 px-3 rounded-lg shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] transition-all active:shadow-[inset_1.5px_1.5px_4px_#cbd5e1,inset_-1.5px_-1.5px_4px_#ffffff] disabled:opacity-50"
                >
                  📥 Download
                </button>
                <button
                  onClick={handleRunDocker}
                  disabled={isProcessing || !projectId}
                  className="px-3 bg-[#f0f2f5] text-[#ff9500] font-bold py-1.5 px-3 rounded-lg shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] transition-all active:shadow-[inset_1.5px_1.5px_4px_#cbd5e1,inset_-1.5px_-1.5px_4px_#ffffff] disabled:opacity-50"
                >
                  🐳 Run Docker
                </button>
              </div>
            </div>

            {/* Pipeline Panel */}
            <ProcessingPipeline currentStep={currentStep} isProcessing={isProcessing} />
          </div>

          {/* Center Column - Terminal */}
          <div className="col-span-4">
            <Terminal logs={logs} />
          </div>

          {/* Right Column - Generated Code Sandbox */}
          <div className="col-span-4">
            <GeneratedCodeSandbox fileContent={generatedFileContent} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
