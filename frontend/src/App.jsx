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
  const [useLLM, setUseLLM] = useState(false);
  const [apiKey, setApiKey] = useState('');
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
          useLLM,
          apiKey,
          humanizePrompt
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
        <header className="bg-[#f0f2f5] rounded-xl shadow-[3px_3px_6px_#cbd5e1,-3px_-3px_6px_#ffffff] p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#007aff] to-[#5856d6] rounded-lg shadow-[2px_2px_4px_#cbd5e1,-2px_-2px_4px_#ffffff] flex items-center justify-center text-base font-bold text-white">
            A
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">
              ArchiTech
            </h1>
            <p className="text-[9px] text-gray-500">Expanded Scaffolder with Gemini Injection</p>
          </div>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-100px)] overflow-hidden">
          {/* Left Column - Input & Pipeline */}
          <div className="col-span-4 flex flex-col gap-3">
            {/* Input Panel */}
            <div className="bg-[#f0f2f5] rounded-xl shadow-[3px_3px_6px_#cbd5e1,-3px_-3px_6px_#ffffff] p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">Describe Your Project</h2>
                <button
                  onClick={() => setHumanizePrompt(!humanizePrompt)}
                  className={`px-2 py-0.5 text-[9px] font-semibold rounded-md transition-all ${
                    humanizePrompt
                      ? 'bg-[#f0f2f5] text-[#007aff] shadow-[inset_1px_1px_3px_#cbd5e1,inset_-1px_-1px_3px_#ffffff]'
                      : 'bg-[#f0f2f5] text-gray-600 shadow-[2px_2px_4px_#cbd5e1,-2px_-2px_4px_#ffffff]'
                  }`}
                >
                  ✨ Humanize Input
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Build a Python FastAPI application with a Redis cache configuration"
                className="w-full h-20 bg-[#f0f2f5] shadow-[inset_1.5px_1.5px_4px_#cbd5e1,inset_-1.5px_-1.5px_4px_#ffffff] border-none rounded-lg p-2 text-gray-700 placeholder-gray-400 resize-none focus:outline-none font-mono text-xs"
                disabled={isProcessing}
              />

              {/* Gemini LLM Toggle */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700 text-xs">
                    🧠 Enable Dynamic LLM Injection
                  </span>
                  <button
                    onClick={() => setUseLLM(!useLLM)}
                    className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${
                      useLLM ? 'bg-gradient-to-r from-[#007aff] to-[#5856d6]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-md transition-all ${
                        useLLM ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {useLLM && (
                  <div className="p-2 bg-[#f0f2f5] shadow-[inset_1.5px_1.5px_4px_#cbd5e1,inset_-1.5px_-1.5px_4px_#ffffff] rounded-md">
                    <label className="block text-gray-600 font-semibold text-[9px] mb-1">
                      Enter Gemini API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-[#f0f2f5] shadow-[inset_1px_1px_3px_#cbd5e1,inset_-1px_-1px_3px_#ffffff] border-none rounded-md p-1.5 text-gray-700 placeholder-gray-400 focus:outline-none font-mono text-[9px]"
                      placeholder="AIza..."
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={isProcessing || !prompt.trim()}
                  className="flex-1 bg-[#f0f2f5] text-[#007aff] font-bold py-1.5 px-3 rounded-md shadow-[2px_2px_4px_#cbd5e1,-2px_-2px_4px_#ffffff] transition-all active:shadow-[inset_1px_1px_3px_#cbd5e1,inset_-1px_-1px_3px_#ffffff] disabled:opacity-50"
                >
                  {isProcessing ? 'Generating...' : '🚀 Generate'}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!projectId}
                  className="px-3 bg-[#f0f2f5] text-[#34c759] font-bold py-1.5 px-3 rounded-md shadow-[2px_2px_4px_#cbd5e1,-2px_-2px_4px_#ffffff] transition-all active:shadow-[inset_1px_1px_3px_#cbd5e1,inset_-1px_-1px_3px_#ffffff] disabled:opacity-50"
                >
                  📥 Download
                </button>
                <button
                  onClick={handleRunDocker}
                  disabled={isProcessing || !projectId}
                  className="px-3 bg-[#f0f2f5] text-[#ff9500] font-bold py-1.5 px-3 rounded-md shadow-[2px_2px_4px_#cbd5e1,-2px_-2px_4px_#ffffff] transition-all active:shadow-[inset_1px_1px_3px_#cbd5e1,inset_-1px_-1px_3px_#ffffff] disabled:opacity-50"
                >
                  🐳 Run
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
