# 🚀 Research Analyst

<div align="center">

```
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║         🔬 INTELLIGENT RESEARCH ANALYSIS PLATFORM 🤖      ║
  ║                                                           ║
  ║    Powered by AI | Built for Researchers | Optimized      ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
```

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Node](https://img.shields.io/badge/Node.js-18%2B-green)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![License](https://img.shields.io/badge/License-MIT-yellow)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [💻 Usage](#-usage)
- [🤝 Contributing](#-contributing)

---

## Overview

**Research Analyst** is a comprehensive platform that combines **AI-powered analysis**, **PDF document processing**, and **collaborative chat** capabilities. It's designed to help researchers, students, and professionals efficiently manage, analyze, and discuss academic papers and research documents.

> _Transforming how researchers interact with documents through intelligent analysis and collaborative conversations._

---

## ✨ Features

| Feature                  | Description                                                | Status    |
| ------------------------ | ---------------------------------------------------------- | --------- |
| 🤖 **AI Chat**           | Intelligent conversational analysis with context awareness | ✅ Active |
| 📄 **PDF Viewer**        | Advanced PDF viewing with annotation capabilities          | ✅ Active |
| 💾 **Paper Vault**       | Organized repository for research documents                | ✅ Active |
| 🌐 **Global Chat**       | Community-wide discussion threads                          | ✅ Active |
| ⚡ **Real-time Updates** | Live chat synchronization                                  | ✅ Active |
| 🎨 **Modern UI**         | Responsive and intuitive interface                         | ✅ Active |

---

## 🛠 Tech Stack

### Frontend

```
┌─────────────────────────────────┐
│     FRONTEND STACK              │
├─────────────────────────────────┤
│ ⚛️  React 18                    │
│ ⚡ Vite (Build Tool)            │
│ 🎨 CSS3 (Modern Styling)        │
│ 🔗 Axios (API Client)           │
└─────────────────────────────────┘
```

### Backend

```
┌─────────────────────────────────┐
│     BACKEND STACK               │
├─────────────────────────────────┤
│ 🟢 Node.js + Express            │
│ 🗄️  Prisma ORM                  │
│ 📦 PostgreSQL/SQLite            │
│ ☁️  Cloudinary (File Storage)    │
└─────────────────────────────────┘
```

### AI & Analysis

```
┌─────────────────────────────────┐
│     AI STACK                    │
├─────────────────────────────────┤
│ 🐍 Python 3.8+                  │
│ 🧠 Chroma (Vector DB)           │
│ 🤖 LLM Integration               │
│ 📚 Advanced Chunking             │
└─────────────────────────────────┘
```

---

## 📁 Project Structure

```
research-analyst/
│
├── 📁 frontend/                    # React/Vite Application
│   ├── src/
│   │   ├── 🔧 components/         # Reusable UI components
│   │   ├── 🎣 hooks/              # Custom React hooks
│   │   ├── 📚 lib/                # Utilities & helpers
│   │   ├── 🖼️  views/             # Page components
│   │   ├── 🎨 App.jsx             # Main app component
│   │   └── 📍 main.jsx            # Entry point
│   ├── 📦 package.json
│   └── ⚙️  vite.config.js
│
├── 📁 backend/                     # Node.js/Express API
│   ├── 🤖 Bot/                    # Python AI Module
│   │   ├── 🧠 agent.py            # AI Agent logic
│   │   ├── ✂️  chunking.py         # Document chunking
│   │   ├── 🔐 config.py           # Configuration
│   │   ├── 💾 database.py         # DB operations
│   │   ├── 🚀 main.py             # Bot entry point
│   │   ├── 💬 prompts.py          # AI Prompts
│   │   └── 🗄️  chroma_db/         # Vector database
│   ├── ⚙️  config/                # Configuration files
│   ├── 🎮 controllers/            # Request handlers
│   ├── 📊 models/                 # Data models
│   ├── 📡 routes/                 # API routes
│   ├── 🗄️  prisma/               # Database schema & migrations
│   ├── 🚀 app.js                  # Express app
│   ├── 🔗 server.js               # Server entry point
│   └── 📦 package.json
│
└── 📄 README.md                    # You are here!
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (3.8 or higher)
- **npm** or **yarn**
- **PostgreSQL** or **SQLite** database

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-repo/research-analyst.git
cd research-analyst
```

#### 2️⃣ Setup Backend

```bash
cd backend

# Install Node dependencies
npm install

# Setup Python environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
cd Bot
pip install -r requirements.txt
cd ..

# Setup Prisma
npx prisma migrate dev
```

#### 3️⃣ Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install
```

#### 4️⃣ Environment Configuration

Create `.env` files in both `backend/` and `frontend/`:

**backend/.env**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/research_analyst"
CLOUDINARY_NAME="your_cloudinary_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
PORT=5000
```

**frontend/.env**

```env
VITE_API_URL="http://localhost:5000"
```

---

## 💻 Usage

### Start Development Environment

**Terminal 1 - Backend:**

```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

**Terminal 3 - Python Bot (Optional):**

```bash
cd backend/Bot
python main.py
```

### Features in Action

#### 🤖 AI Chat

- Ask questions about your research documents
- Get intelligent responses powered by LLMs
- Context-aware conversations

#### 📄 PDF Viewer

- Upload and view PDF documents
- Smooth navigation and controls
- Full-screen reading mode

#### 💾 Paper Vault

- Organize your research papers
- Tag and categorize documents
- Quick search and filter

#### 🌐 Global Chat

- Engage with community discussions
- Share insights and findings
- Real-time message updates

---

## 🏗️ API Endpoints

### Chat Endpoints

```
POST   /api/chat/send          - Send a chat message
GET    /api/chat/history/:id   - Get chat history
DELETE /api/chat/:id           - Delete chat
```

### Upload Endpoints

```
POST   /api/upload/document    - Upload a document
GET    /api/uploads/:id        - Get upload details
DELETE /api/uploads/:id        - Delete upload
```

### Global Chat Endpoints

```
POST   /api/globalchat/message - Post to global chat
GET    /api/globalchat         - Get all global messages
PUT    /api/globalchat/:id     - Update message
```

---

## 🔧 Configuration

### Database Setup

Edit `backend/prisma/schema.prisma` to configure your database connection and models.

### AI Model Configuration

Update `backend/Bot/config.py` to:

- Set API keys for your LLM provider
- Configure chunking parameters
- Adjust temperature and model settings

### Theme Customization

Modify `frontend/src/lib/theme.js` to customize the UI theme and colors.

---

## 📚 Project Features Explained

### 🧠 Intelligent Chunking

The Python bot intelligently splits documents into manageable chunks for better AI analysis and retrieval.

### 🗂️ Vector Database

Chroma DB stores document embeddings for fast semantic search and context retrieval.

### 🔄 Real-time Synchronization

WebSocket connections ensure instant updates across all users in the platform.

### 🎨 Responsive Design

Built with modern CSS3 and React hooks for smooth, responsive user experience.

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Use **ESLint** for JavaScript
- Follow **PEP 8** for Python
- Write meaningful commit messages

---

## 📝 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 🙋 Support & Contact

Have questions or need help? Reach out!

- 📧 **Email**: support@research-analyst.dev
- 💬 **Discord**: [Join our community](#)
- 🐛 **Issues**: [Report a bug](#)
- 💡 **Discussions**: [Start a discussion](#)

---

<div align="center">

### ⭐ If you find this project helpful, please give it a star!

```
🎉 Made with ❤️ by the Research Analyst Team 🎉
```

**Happy Researching! 📚🚀**

</div>

---

_Last Updated: 2026-06-06 | Current Version: 1.0.0_
