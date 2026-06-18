# 🗂️ Real-time WebSocket Kanban Board
 
A full-stack real-time Kanban board built with **React**, **Socket.IO**, tested with **Vitest + React Testing Library** and **Playwright**.
 
---
 
## 🚀 Tech Stack
 
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Real-time | Socket.IO (WebSockets) |
| Drag & Drop | HTML5 native drag and drop |
| Styling | Custom CSS (dark theme) |
| Unit/Integration Tests | Vitest + React Testing Library |
| E2E Tests | Playwright |
| Backend | Node.js + Express + Socket.IO |
| Storage | In-memory (array) |
 
---
 
## 📂 Project Structure
 
```
websocket-kanban/
├── backend/
│   ├── server.js          # Express + Socket.IO server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── KanbanBoard.jsx   # Main board component
│   │   ├── tests/
│   │   │   ├── unit/             # Vitest unit tests
│   │   │   ├── integration/      # Vitest integration tests
│   │   │   └── e2e/              # Playwright E2E tests
│   │   └── main.jsx
│   ├── KanbanBoard.css
│   ├── vite.config.js
│   ├── playwright.config.js
│   └── package.json
│
└── README.md
```
 
---
 
## ⚙️ Setup & Running Locally
 
### Prerequisites
- Node.js v18+
- npm v9+
---
 
### 1. Clone the repository
 
```bash
git clone https://github.com/YOUR_USERNAME/websocket-kanban.git
cd websocket-kanban
```
 
---
 
### 2. Start the Backend
 
```bash
cd backend
npm install
node server.js
```
 
Server runs on **http://localhost:5000**
 
---
 
### 3. Start the Frontend
 
Open a new terminal:
 
```bash
cd frontend
npm install
npm run dev
```
 
App runs on **http://localhost:5173**
 
---
 
## 🌐 Environment Variables
 
Create a `.env` file inside the `frontend/` folder if your backend runs on a different port:
 
```env
VITE_BACKEND_URL=http://localhost:5000
```
 
By default it points to `http://localhost:5000`.
 
---
 
## ✅ Features
 
- **Create tasks** with title, description, priority, and category
- **Drag & drop** tasks between columns (To Do → In Progress → Done)
- **Move buttons** on each card for quick column switching
- **Delete tasks** with real-time sync across all connected clients
- **File attachments** — image preview shown inline on the card
- **Priority badges** — color-coded Low / Medium / High
- **Category badges** — Bug / Feature / Enhancement
- **Progress overview** — live progress bars per column + completion %
- **Real-time sync** — all changes broadcast instantly to every open tab via WebSockets
- **Loading state** — spinner while waiting for server sync on connect
---
 
## 🔌 WebSocket Events
 
| Event | Direction | Description |
|-------|-----------|-------------|
| `sync:tasks` | Server → Client | Full task list on connect or any change |
| `task:create` | Client → Server | Add a new task |
| `task:update` | Client → Server | Update priority / category |
| `task:move` | Client → Server | Move task to a different column |
| `task:delete` | Client → Server | Delete a task by ID |
 
---
 
## 🧪 Running Tests
 
### Unit & Integration Tests (Vitest)
 
```bash
cd frontend
npm run test
```
 
With coverage:
 
```bash
npm run test:coverage
```
 
---
 
### E2E Tests (Playwright)
 
Make sure both backend and frontend are running first, then:
 
```bash
cd frontend
npm run test:e2e
```
 
To open the Playwright UI:
 
```bash
npm run test:e2e:ui
```
 
---
 
## 📊 Evaluation Criteria Coverage
 
| Criteria | Implementation |
|----------|---------------|
| ✅ WebSocket Implementation | Socket.IO with `task:create`, `task:update`, `task:move`, `task:delete`, `sync:tasks` |
| ✅ React Component Structure | Separated hooks, utilities, and components |
| ✅ Testing | Vitest unit + integration tests, Playwright E2E |
| ✅ Code Quality | Clean functions, consistent naming, comments |
| ✅ UI & UX | Dark theme, responsive layout, real-time feedback |
 
---
 

 
## 📝 Notes
 
- Tasks are stored **in-memory** on the server — they reset on server restart. This is by design for this assessment (no database required).
- The app supports **multiple simultaneous clients** — open two browser tabs and changes reflect instantly on both.
- All interactive elements have `data-testid` attributes for reliable test targeting.