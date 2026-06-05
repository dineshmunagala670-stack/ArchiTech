const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const { analyzePrompt } = require('./agents/architect');
const { generateCode } = require('./agents/codeWriter');

const app = express();
const PORT = process.env.PORT || 3001;
const PLAYGROUND_DIR = path.join(__dirname, 'playground');

let currentProjectId = null;

app.use(cors());
app.use(express.json());

if (!fs.existsSync(PLAYGROUND_DIR)) {
  fs.mkdirSync(PLAYGROUND_DIR, { recursive: true });
}

app.post("/api/generate", async (req, res) => {
  const { 
    prompt, 
    useLLM = false, 
    apiKey = null 
  } = req.body;
  
  const logs = [];

  try {
    const projectId = `project_${Date.now()}`;
    currentProjectId = projectId;
    const projectDir = path.join(PLAYGROUND_DIR, projectId);
    
    logs.push(`Step 1/3: Creating project directory: ${projectId}`);

    // Step 1: Analyze prompt with Architect
    logs.push('Step 1/3: Analyzing prompt with Architect Agent...');
    const architectResult = analyzePrompt(prompt);
    logs.push(architectResult.message);

    // Step 2: Scaffold architecture
    logs.push('Step 2/3: Scaffolding architecture...');
    await new Promise(resolve => setTimeout(resolve, 200));

    // Step 3: Generate code files with Code Writer (including optional LLM)
    logs.push('Step 3/3: Generating code files with Code Writer Agent...');
    if (useLLM && apiKey) {
      logs.push('🧠 LLM mode enabled - will attempt Gemini injection for files');
    }
    
    const codeResult = await generateCode(
      architectResult.schema, 
      projectDir, 
      architectResult.language,
      useLLM,
      apiKey,
      prompt
    );
    
    logs.push(...codeResult.logs);
    logs.push(codeResult.message);

    logs.push('✅ All steps completed! Project is ready.');

    res.json({
      success: true,
      projectId,
      logs,
      previewFileContent: codeResult.previewFileContent,
      result: {
        architect: architectResult,
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

// Download endpoint
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
