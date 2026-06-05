/**
 * ArchiTech Client-Side Multi-Agent Orchestrator
 * Uses Google Gen AI SDK (@google/genai)
 */

import { GoogleGenAI } from '@google/genai';

/**
 * Core Orchestrator Class
 */
export class ArchiTechOrchestrator {
  constructor(userApiKey) {
    if (!userApiKey) {
      throw new Error('API key is required to initialize ArchiTech');
    }
    
    this.apiKey = userApiKey;
    this.ai = null;
    this.lifecycleCallbacks = {};
  }

  /**
   * Register lifecycle callbacks
   * @param {Object} callbacks - { onPhaseChange, onLog, onError, onComplete }
   */
  registerCallbacks(callbacks = {}) {
    this.lifecycleCallbacks = { ...callbacks };
  }

  /**
   * Emit log to registered callback
   * @param {string} message 
   */
  log(message) {
    if (this.lifecycleCallbacks.onLog) {
      this.lifecycleCallbacks.onLog(message);
    }
  }

  /**
   * Update current phase
   * @param {string} phaseName
   * @param {number} phaseNumber
   */
  setPhase(phaseName, phaseNumber) {
    this.log(`Phase ${phaseNumber}: ${phaseName}`);
    if (this.lifecycleCallbacks.onPhaseChange) {
      this.lifecycleCallbacks.onPhaseChange(phaseName, phaseNumber);
    }
  }

  /**
   * Main orchestration pipeline
   * @param {string} userProjectPrompt
   */
  async run(userProjectPrompt) {
    try {
      // --- Phase 1: Core Engine Initialization ---
      this.setPhase('Core Engine Initialization', 1);
      this.log('Initializing Google Gen AI client...');
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
      this.log('Google Gen AI client initialized successfully');

      // --- Phase 2: Architect + DevOps Combined (Single Call) ---
      this.setPhase('Architect Agent Evaluation (Structural Schema Mapping)', 2);
      const combinedResult = await this._callGemini(userProjectPrompt);

      // --- Phase 3: DevOps Agent Compilation ---
      this.setPhase('DevOps Agent Compilation (Container Manifest Calculation)', 3);
      // (Already handled in single call, but we validate devops content exists)
      if (!combinedResult.devops?.dockerfile || !combinedResult.devops?.dockerCompose) {
        throw new Error('Missing required DevOps content from response');
      }

      // --- Phase 4: Payload Ready ---
      this.setPhase('Payload Ready (Parsing Completed Response Back to Application Context)', 4);
      
      if (this.lifecycleCallbacks.onComplete) {
        this.lifecycleCallbacks.onComplete(combinedResult);
      }
      
      return combinedResult;
      
    } catch (error) {
      this.log(`ERROR: ${error.message}`);
      if (this.lifecycleCallbacks.onError) {
        this.lifecycleCallbacks.onError(error);
      }
      throw error;
    }
  }

  /**
   * Single Gemini call for both architecture and devops
   * @param {string} userPrompt
   * @private
   */
  async _callGemini(userPrompt) {
    const systemInstruction = `You are ArchiTech, a senior software engineer and DevOps specialist.
You must generate complete, production-ready project scaffolding.

USER PROJECT REQUIREMENTS:
${userPrompt}

YOU MUST RETURN VALID JSON ONLY! NO MARKDOWN, NO CODE FENCES, NO EXPLANATIONS!

RESPONSE JSON SCHEMA:
{
  "architecture": {
    "folders": ["array", "of", "required", "directories"],
    "files": { "path/to/file.ext": "Complete string content of the file" }
  },
  "devops": {
    "dockerfile": "Dockerfile configuration string",
    "dockerCompose": "docker-compose.yml configuration string"
  }
}

IMPORTANT:
- Return ONLY the JSON object, no other text before or after!
- Make sure all generated files have valid, working source code!
- The Dockerfile and docker-compose.yml must be valid and complete!`;

    this.log('Calling Google Gen AI (gemini-2.5-flash)...');

    const result = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemInstruction }]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const rawResponseText = result.text;
    this.log('Raw response received, parsing JSON...');
    
    let parsed;
    try {
      parsed = JSON.parse(rawResponseText);
    } catch (parseErr) {
      this.log('JSON parsing failed, attempting to clean up...');
      let cleaned = rawResponseText.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
      if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
      parsed = JSON.parse(cleaned.trim());
    }
    
    this.log('JSON parsed successfully');
    return parsed;
  }
}

export default ArchiTechOrchestrator;
