const generateDockerFiles = (projectType, prompt) => {
  let dockerfile = '';
  let dockerCompose = '';

  switch (projectType) {
    case 'python':
      dockerfile = `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`;

      dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"`;
      break;

    case 'nodejs':
    case 'react':
      dockerfile = `FROM node:20-slim

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .

EXPOSE ${projectType === 'react' ? '5173' : '3000'}
CMD ["npm", "${projectType === 'react' ? 'run dev' : 'start'}"]`;

      dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "${projectType === 'react' ? '5173:5173' : '3000:3000'}"
    volumes:
      - .:/app
      - /app/node_modules`;
      break;

    case 'cpp':
      dockerfile = `FROM gcc:latest
RUN apt-get update && apt-get install -y cmake
COPY . /usr/src/myapp
WORKDIR /usr/src/myapp
RUN cmake . && make
CMD ["./ArchiTechCppApp"]`;

      dockerCompose = `version: '3.8'

services:
  app:
    build: .
    volumes:
      - .:/usr/src/myapp`;
      break;

    default:
      // Default to nodejs, but ensure we don't use node for unknown
      dockerfile = `FROM node:20-slim

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]`;

      dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules`;
  }

  return {
    dockerfile,
    dockerCompose,
    message: 'DevOps generated Docker configurations'
  };
};

module.exports = { generateDockerFiles };
