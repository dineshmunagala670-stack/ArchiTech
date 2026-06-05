const analyzePrompt = (prompt) => {
  let files = {};
  let folders = [];
  let projectType = 'unknown';

  if (prompt.toLowerCase().includes('python') || prompt.toLowerCase().includes('fastapi')) {
    projectType = 'python';
    folders = ['app', 'app/api', 'app/core'];
    files = {
      'app/main.py': true,
      'app/api/__init__.py': true,
      'app/core/config.py': true,
      'requirements.txt': true,
      '.env': true
    };
  } else if (prompt.toLowerCase().includes('node') || prompt.toLowerCase().includes('express')) {
    projectType = 'nodejs';
    folders = ['src', 'src/routes', 'src/controllers', 'src/middleware'];
    files = {
      'src/server.js': true,
      'src/routes/index.js': true,
      'package.json': true,
      '.env': true
    };
  } else if (prompt.toLowerCase().includes('react') || prompt.toLowerCase().includes('vite')) {
    projectType = 'react';
    folders = ['src', 'src/components', 'src/pages', 'public'];
    files = {
      'src/App.jsx': true,
      'src/main.jsx': true,
      'package.json': true,
      'index.html': true
    };
  } else if (prompt.toLowerCase().includes('c++') || prompt.toLowerCase().includes('cpp') || prompt.toLowerCase().includes('gcc')) {
    projectType = 'cpp';
    folders = ['src', 'include'];
    files = {
      'src/main.cpp': true,
      'Makefile': true,
      'README.md': true
    };
  } else {
    projectType = 'nodejs';
    folders = ['src'];
    files = {
      'src/index.js': true,
      'package.json': true,
      'README.md': true
    };
  }

  return {
    projectType,
    schema: {
      folders,
      files
    },
    message: 'Architect analyzed the prompt and generated project structure'
  };
};

module.exports = { analyzePrompt };
