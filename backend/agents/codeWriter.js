const fs = require('fs');
const path = require('path');

const generateCode = async (schema, outputDir, language, useLLM = false, apiKey = null, prompt = '') => {
  const logs = [];
  
  try {
    // Step 1: Create all directories from file paths
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      logs.push(`Created root directory: ${outputDir}`);
    }

    // Step 2: Write files
    const fileContents = schema.fileContents;
    for (const [filePath, content] of Object.entries(fileContents)) {
      const fullPath = path.join(outputDir, filePath);
      const dir = path.dirname(fullPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logs.push(`Created directory: ${path.relative(outputDir, dir)}`);
      }

      fs.writeFileSync(fullPath, content || '');
      logs.push(`Created file: ${filePath}`);
    }

    return {
      success: true,
      logs,
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

module.exports = { generateCode };
