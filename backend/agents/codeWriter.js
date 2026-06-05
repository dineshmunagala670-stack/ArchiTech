const fs = require('fs');
const path = require('path');

const generateCode = async (schema, outputDir, language, useLLM = false, apiKey = null, userPrompt = '') => {
  const logs = [];
  let previewFileContent = '';
  let fileContentMap = { ...schema.fileContents }; // Start with default boilerplate

  try {
    // Step 1: Create all directories from file paths
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      logs.push(`Created root directory: ${outputDir}`);
    }

    // Create directories for each file path
    const files = Object.keys(fileContentMap);
    files.forEach((file) => {
      const dir = path.dirname(path.join(outputDir, file));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logs.push(`Created directory: ${path.relative(outputDir, dir)}`);
      }
    });

    // Step 2: If LLM enabled, make a single Gemini API call
    if (useLLM && apiKey) {
      try {
        logs.push('Making single Gemini API call for all files...');
        const llmResult = await callGeminiForAllFiles(schema, language, userPrompt, apiKey);
        if (llmResult) {
          fileContentMap = { ...fileContentMap, ...llmResult };
          logs.push('Successfully generated content via Gemini!');
        }
      } catch (llmError) {
        logs.push(`Gemini API failed: ${llmError.message} - falling back to default boilerplate`);
      }
    }

    // Step 3: Write all files to disk
    for (const file of Object.keys(fileContentMap)) {
      const filePath = path.join(outputDir, file);
      const content = fileContentMap[file] || '';
      
      fs.writeFileSync(filePath, content);
      logs.push(`Created file: ${file}`);

      // Set preview file content (main file)
      if (
        file === 'src/server.js' ||
        file === 'main.py' ||
        file === 'src/main.cpp' ||
        file === 'src/main.rs' ||
        file === 'ArchiTechDotnetApi/Program.cs' ||
        file === 'src/app/page.tsx'
      ) {
        previewFileContent = content;
      }
    }

    return {
      success: true,
      logs,
      previewFileContent,
      message: 'Code Writer generated all files successfully'
    };
  } catch (error) {
    logs.push(`Error: ${error.message}`);
    return {
      success: false,
      logs,
      error: error.message,
      message: 'Code Writer encountered an error'
    };
  }
};

// Single Gemini API call to generate all files
const callGeminiForAllFiles = async (schema, language, userPrompt, apiKey) => {
  const filePaths = Object.keys(schema.fileContents);
  
  const systemPrompt = `You are a senior software engineer generating production-ready code.

USER PROJECT REQUIREMENTS: ${userPrompt}
LANGUAGE/FRAMEWORK: ${language}

YOU MUST RETURN A JSON OBJECT ONLY! NO OTHER TEXT!
THE JSON KEYS MUST BE EXACT FILE PATHS, and the VALUES MUST BE THE FULL SOURCE CODE FOR EACH FILE.

FILE PATHS TO GENERATE:
${JSON.stringify(filePaths, null, 2)}

IMPORTANT:
- Return ONLY a valid JSON object, no other text
- Do NOT include any markdown, no code block fences, no explanations
- Use the EXACT file paths from the list above as keys
- Make sure the code is complete and valid for the project type
- No conversational text, just raw JSON!`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: systemPrompt }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API HTTP error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
    throw new Error('Invalid response structure from Gemini API');
  }

  let rawText = data.candidates[0].content.parts[0].text.trim();
  
  // Clean up any potential markdown fences
  if (rawText.startsWith('```json')) {
    rawText = rawText.slice(7);
  }
  if (rawText.startsWith('```')) {
    rawText = rawText.slice(3);
  }
  if (rawText.endsWith('```')) {
    rawText = rawText.slice(0, -3);
  }
  rawText = rawText.trim();
  
  // Parse the JSON
  const result = JSON.parse(rawText);
  return result;
};

module.exports = { generateCode };
