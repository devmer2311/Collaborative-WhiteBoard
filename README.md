```markdown
# 🎨 Real-time Collaborative Whiteboard

A real-time collaborative whiteboard built with React, Node.js, and Socket.io. Draw with friends, see their cursors live, and collaborate instantly!

---

## ✨ Features

- 🖌 Real-time drawing with multiple users
- 🧑‍🤝‍🧑 Live user cursors with unique colors
- 🎚 Adjustable brush size and colors
- 🔄 Auto-sync on page load
- 🧼 Canvas clear option
- 📱 Responsive design (desktop + mobile)
- ⚡ Low-latency via WebSockets

---

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS (Vite)
- **Backend**: Node.js + Express + Socket.io
- **Database**: MongoDB (MongoDB Atlas)
- **Deployment**: Frontend on Vercel, Backend on Render

---

## 🚀 Getting Started Locally

### Prerequisites

- Node.js v16+
- MongoDB (Atlas or local)

### Installation

```bash
git clone https://github.com/devmer2311/Collaborative-WhiteBoard.git
cd Collaborative-WhiteBoard

npm install
cd client && npm install
cd ../server && npm install
```

### Environment Variables

Create `.env` in `server/`:

```env
MONGODB_URI=mongodb://localhost:27017/whiteboard
PORT=3001
```

And in `client/.env`:

```env
VITE_SERVER_URL=http://localhost:3001
```

---

### Run Locally

```bash
npm run dev
```

Frontend: [http://localhost:5173](http://localhost:5173)  
Backend: [http://localhost:3001](http://localhost:3001)

---

## 🌐 Deployment Guide

### 🔹 Frontend → Vercel

1. Push the project to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import the repository
4. In settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable in Vercel:
   ```env
   VITE_SERVER_URL=https://your-backend.onrender.com
   ```
6. Deploy!

---

### 🔹 Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Set root directory to `server`
4. Use these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add Environment Variable in Render:
   ```env
   MONGODB_URI=your_mongodb_atlas_url
   PORT=3001
   ```

> ⚠ Make sure Render’s backend URL is used in `VITE_SERVER_URL` in both `client/.env` and Vercel.

---

## 📁 Folder Structure

```
Collaborative-WhiteBoard/
├── client/         # Vite React frontend
│   └── .env        # Contains VITE_SERVER_URL
├── server/         # Express + Socket.io backend
│   └── .env        # Contains MONGODB_URI, PORT
├── package.json    # Root script for dev/build
```

---

<div align="center">

**Made with ❤️ by [Dev Mer](https://github.com/devmer2311)**

[⭐ Star this repo](https://github.com/devmer2311/Collaborative-WhiteBoard) • [🐛 Report Bug](https://github.com/devmer2311/Collaborative-WhiteBoard/issues) • [✨ Request Feature](https://github.com/devmer2311/Collaborative-WhiteBoard/issues)

</div>
```

---