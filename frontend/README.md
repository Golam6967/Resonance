# Nexus Research

A professional AI-native research workspace built with React + Vite. Manage research papers, search semantically via pgvector, and chat across your paper collection using Claude.

---

## Project Structure

```
nexus-research/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
└── src/
    ├── main.jsx                  # React entry point
    ├── App.jsx                   # Root component, state wiring
    ├── index.css                 # Global reset + DM Sans font
    │
    ├── lib/
    │   ├── theme.js              # Design tokens (colors, fonts, radii)
    │   └── api.js                # Anthropic API call helper
    │
    ├── hooks/
    │   ├── usePapers.js          # Paper CRUD state management
    │   └── useChat.js            # Chat messages + API state
    │
    ├── components/
    │   ├── Layout.jsx            # Shell: sidebar + topbar + content
    │   ├── Sidebar.jsx           # Left navigation
    │   ├── Topbar.jsx            # Top header with page title
    │   └── ui/
    │       ├── index.jsx         # Card, Badge, Tag, EmptyState, Input, Spinner, Divider
    │       └── Button.jsx        # Reusable button (primary/secondary/ghost/danger)
    │
    └── views/
        ├── Dashboard.jsx         # Stats, recent papers, setup checklist
        ├── PaperVault.jsx        # Paper list, upload modal, detail panel
        └── AIChat.jsx            # Chat interface wired to Claude API
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your API keys (see Environment Variables below).

### 3. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## Environment Variables

| Variable | Where to get it | Used for |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | console.anthropic.com → API Keys | AI Chat (Claude) |
| `VITE_CLOUDINARY_CLOUD_NAME` | cloudinary.com → Settings | PDF + diagram storage |
| `VITE_CLOUDINARY_API_KEY` | cloudinary.com → API Keys | PDF + diagram storage |
| `VITE_CLOUDINARY_API_SECRET` | cloudinary.com → API Keys | PDF + diagram storage |
| `DATABASE_URL` | Your PostgreSQL instance | Primary database |
| `OPENAI_API_KEY` | platform.openai.com → API Keys | Embedding model |
| `GOOGLE_API_KEY` | aistudio.google.com | Gemini vision (backend) |

---

## What's Implemented (Frontend)

- **Dashboard** — live stats derived from paper state, setup checklist, recent papers list
- **Paper Vault** — add/remove papers via modal, search/filter, status badges, detail panel
- **AI Chat** — full chat interface connected to `claude-sonnet-4-20250514` via the Anthropic API, streaming-ready, context bar showing vault status

---

## What Needs Backend Implementation

### Cloudinary PDF Upload
Replace the frontend `addPaper` mock with a real upload:
```js
// src/views/PaperVault.jsx → UploadModal
// POST /api/upload with FormData → Cloudinary → returns cloudinary_url
```

### FastAPI Parsing Worker
Install in a separate `backend/` directory:
```bash
pip install fastapi uvicorn cloudinary marker-pdf langchain-openai psycopg2-binary pgvector
```

Worker flow:
1. Receive `cloudinary_url` from frontend
2. Download PDF temporarily
3. Run `marker-pdf` → extract text + figures
4. Upload figures to `extracted_diagrams/{paper_id}/` on Cloudinary
5. Chunk text → generate embeddings via `text-embedding-3-large`
6. Store vectors in pgvector (`paper_chunks` table)
7. Run Claude/Gemini on intro+conclusion → extract `{problem, solution, drawbacks}`
8. Save to PostgreSQL, update paper status to `indexed`

### PostgreSQL + pgvector

```bash
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg15
    environment:
      POSTGRES_DB: nexus_research
      POSTGRES_USER: nexus
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports: ["5432:5432"]
```

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE papers (
  id             VARCHAR(30) PRIMARY KEY,
  title          TEXT NOT NULL,
  authors        TEXT,
  year           INTEGER,
  cloudinary_url TEXT,
  status         VARCHAR(20) DEFAULT 'queued',
  uploaded_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE paper_chunks (
  id          SERIAL PRIMARY KEY,
  paper_id    VARCHAR(30) REFERENCES papers(id),
  chunk_text  TEXT,
  chunk_index INTEGER,
  embedding   vector(1536)
);

CREATE INDEX ON paper_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Embedding Model

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large"
    # reads OPENAI_API_KEY from environment
    # output dimensions: 1536
)
```

Alternatives:
- `embed-english-v3.0` (Cohere) — 1024 dims, requires `COHERE_API_KEY`
- `BAAI/bge-large-en-v1.5` (HuggingFace, local, free) — 1024 dims

### Real Semantic Search in Chat
Currently the AI Chat sends the conversation to Claude with no retrieved context. Wire in retrieval:
```python
# backend/search.py
def semantic_search(query: str, top_k: int = 5) -> list[dict]:
    query_embedding = embeddings.embed_query(query)
    results = db.execute("""
        SELECT chunk_text, paper_id,
               1 - (embedding <=> %s::vector) AS similarity
        FROM paper_chunks
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """, (query_embedding, query_embedding, top_k))
    return results.fetchall()
```

Then prepend retrieved chunks as context in the system prompt before calling Claude.

---

## Design System

All design tokens live in `src/lib/theme.js`. Colors, radii, shadows, and the font stack are defined there and imported into every component — nothing is hardcoded.

Font: **DM Sans** (Google Fonts, loaded in `index.css`)
Color palette: deep charcoal backgrounds (`#0b0e0c`) with jade/emerald accents (`#22c55e`)
