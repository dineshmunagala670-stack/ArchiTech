const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const ollama = require('ollama').default;
const { OpenAI } = require('openai');
const { GoogleGenAI } = require('@google/genai');

const { analyzePrompt } = require('./agents/architect');
const { generateCode } = require('./agents/codeWriter');

const app = express();
const PORT = process.env.PORT || 3002;
const PLAYGROUND_DIR = path.join(__dirname, 'playground');

let currentProjectId = null;

app.use(cors());
app.use(express.json());

if (!fs.existsSync(PLAYGROUND_DIR)) {
  fs.mkdirSync(PLAYGROUND_DIR, { recursive: true });
}

const SYSTEM_PROMPT = `You are ArchiTech, a professional software engineer generating production-ready project code.
You will receive a project description, and you must respond ONLY with a JSON object matching this exact schema:
{
  "language": "Next.js" | "Rust" | "C#/.NET" | "Node.js/Express" | "Python/FastAPI" | "C++/CMake",
  "projectName": "string-slug-name",
  "dependencies": ["array"],
  "database": "string",
  "directoryTree": { "paths": ["array"] },
  "sandboxTreeUi": [{"type": "folder" | "file", "name": "string", "children": []}],
  "fileContents": { "path/to/file.ext": "escaped file code string contents" }
}

RULES:
- NO markdown, NO code fences, NO extra text
- ONLY pure JSON
- Escape all quotes and newlines properly in fileContents strings
- Use real, complete, working code in fileContents
- Make sure to include all necessary project files (package.json, Dockerfile, docker-compose.yml, etc.)
`;

app.post('/api/scaffold', async (req, res) => {
  try {
    const { prompt, enableCloudLlm, apiKeyOverride } = req.body;
    let architecturalResult;

    // First, get a default fallback blueprint from architect agent
    const architectFallback = analyzePrompt(prompt);

    try {
      // Route 3: User supplied an OpenAI API Key Override
      if (apiKeyOverride && apiKeyOverride.trim().startsWith('sk-')) {
        console.log('🔑 Custom API Key Detected: Directing pipeline to OpenAI Engine...');
        const openai = new OpenAI({ apiKey: apiKeyOverride });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ]
        });
        let rawContent = completion.choices[0].message.content;
        // Clean markdown wrappers
        rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        architecturalResult = JSON.parse(rawContent);
      }
      // Route 2: Toggle is turned ON for Cloud Gemini
      else if (enableCloudLlm) {
        console.log('✨ Toggle ON: Routing payload parameters to Cloud Gemini Integration...');
        const ai = new GoogleGenAI();
        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          config: { responseMimeType: 'application/json' },
          contents: [
            { role: 'system', parts: SYSTEM_PROMPT },
            { role: 'user', parts: prompt }
          ]
        });
        let rawContent = result.text.trim();
        // Clean markdown wrappers
        rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        architecturalResult = JSON.parse(rawContent);
      }
      // Route 1: Default to Local Llama 3 via Ollama
      else {
        console.log('🦙 Toggle OFF: Intercepting prompt via Local Llama 3 (Ollama)...');
        const response = await ollama.chat({
          model: 'llama3',
          format: 'json',
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT
            },
            { role: 'user', content: prompt }
          ]
        });
        let rawContent = response.message.content.trim();
        // Clean markdown wrappers
        rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        architecturalResult = JSON.parse(rawContent);
      }
    } catch (llmError) {
      console.log('⚠️ LLM failed to generate valid JSON, falling back to default blueprints:', llmError.message);
      architecturalResult = architectFallback.schema;
    }

    res.status(200).json(architecturalResult);
  } catch (error) {
    console.error("❌ Generation pipeline encountered an error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate", async (req, res) => {
  const { 
    prompt, 
    useLLM = false, 
    apiKey = null,
    enableCloudLlm = false,
    apiKeyOverride = null
  } = req.body;
  
  const logs = [];

  try {
    const projectId = `project_${Date.now()}`;
    currentProjectId = projectId;
    const projectDir = path.join(PLAYGROUND_DIR, projectId);
    
    logs.push(`Step 1/3: Creating project directory: ${projectId}`);

    let finalSchema = null;

    logs.push('Step 1/3: Analyzing prompt with Architect Agent...');
    const architectResult = analyzePrompt(prompt);
    logs.push(architectResult.message);
    finalSchema = architectResult.schema;

    // Use LLM if enabled
    if (useLLM) {
      try {
        logs.push('🧠 Attempting LLM generation...');
        const llmResult = await fetch('http://localhost:3002/api/scaffold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, enableCloudLlm, apiKeyOverride })
        });
        
        if (llmResult.ok) {
          finalSchema = await llmResult.json();
          logs.push('✅ LLM generation successful!');
        }
      } catch (llmError) {
        logs.push(`⚠️ LLM generation failed: ${llmError.message} - falling back to default blueprints`);
      }
    }

    logs.push('Step 2/3: Scaffolding architecture...');
    await new Promise(resolve => setTimeout(resolve, 200));

    logs.push('Step 3/3: Generating code files with Code Writer Agent...');
    
    const codeResult = await generateCode(
      finalSchema, 
      projectDir, 
      finalSchema.language,
      false,
      null,
      prompt
    );
    
    logs.push(...codeResult.logs);
    logs.push(codeResult.message);

    logs.push('✅ All steps completed! Project is ready.');

    res.json({
      success: true,
      projectId,
      logs,
      schema: finalSchema,
      result: {
        architect: { ...architectResult, schema: finalSchema },
        codeWriter: codeResult
      }
    });
  } catch (error) {
    logs.push(`❌ Error: ${error.message}`);
    res.status(500).json({
      success: false,
      logs,
      error: error.message
    });
  }
});

app.post("/api/run-docker", async (req, res) => {
  const { projectId } = req.body;
  const logs = [];

  try {
    const targetProjectId = projectId || currentProjectId;
    if (!targetProjectId) {
      throw new Error('No project ID provided');
    }

    const projectDir = path.join(PLAYGROUND_DIR, targetProjectId);
    if (!fs.existsSync(projectDir)) {
      throw new Error(`Project directory not found: ${targetProjectId}`);
    }

    logs.push(`Starting Docker containers for project: ${targetProjectId}...`);

    const dockerProcess = spawn('docker-compose', ['up', '-d'], {
      cwd: projectDir,
      shell: true
    });

    dockerProcess.stdout.on('data', (data) => {
      logs.push(data.toString());
    });

    dockerProcess.stderr.on('data', (data) => {
      logs.push(data.toString());
    });

    dockerProcess.on('close', (code) => {
      if (code === 0) {
        logs.push('✅ Docker containers started successfully!');
        res.json({ success: true, logs });
      } else {
        logs.push(`❌ Docker process exited with code ${code}`);
        res.status(500).json({ success: false, logs });
      }
    });
  } catch (error) {
    logs.push(`❌ Error: ${error.message}`);
    res.status(500).json({
      success: false,
      logs,
      error: error.message
    });
  }
});

app.get("/api/download/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const projectDir = path.join(PLAYGROUND_DIR, projectId);

    if (!fs.existsSync(projectDir)) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${projectId}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    archive.directory(projectDir, false);
    await archive.finalize();
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Failed to create zip file' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ArchiTech Backend running on port ${PORT}`);
});
