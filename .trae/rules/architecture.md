# ArchiTech Core Architecture Rule
You are building ArchiTech, an autonomous repository and Docker environment bootstrapper.
The application consists of:
1. Backend (Node.js/Express) which orchestrates the multi-agent system.
2. Agents framework using a lightweight modular JavaScript architecture.
3. Frontend UI (React/Vite with Tailwind CSS) allowing users to input text prompts and watch files get built dynamically.

Technical Constraints:
- Use Node.js `fs` module to dynamically write file trees.
- Use `child_process` to execute docker-compose workflows safely.
- Provide a responsive, beautiful dark-themed interface for hackers.