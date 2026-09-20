# ComicScrape ⚡ — Resource Discovery & Scraper Hub

> **Centralized Discovery Engine for GitHub & Authorized Telegram Sources in a Modern Tech Comic Aesthetic.**

ComicScrape is a full-stack web application designed to automatically discover, index, normalize, deduplicate, classify, and organize useful developer resources—including GitHub repositories, code snippets, documentation, releases, Telegram posts, PDFs, ebooks, cheat sheets, and architectural mindmaps.

---

## 🚀 Key Highlights & Architectural Features

- **Comic Design System**: Built with clean modern SaaS standards styled as a clean comic book dashboard: halftone dot accents, solid ink drop-shadows, speech bubbles (`"SCANNING THE GITHUB GALAXY..."`), comic badges (`[POW! RUNNING]`, `[DONE!]`), and dark mode ("Dark Comic Ink").
- **Modular Connectors**:
  - `GitHubConnector`: Official GitHub REST API (v3) search, repo metadata, README viewer, releases, language, stars, forks, and automatic rate-limit backoff.
  - `TelegramConnector`: Official public preview reader (`t.me/s/<channel>`) and Bot API extraction for authorized public channels, parsing documents, PDFs, file sizes, and post links.
- **Deduplication Engine**:
  - URL tracking parameter stripping (`utm_*`, `ref`, `fbclid`, etc.).
  - Canonical URL generation (`github.com/owner/repo`, `t.me/channel/msgId`).
  - SHA-256 content hashing and Sorensen-Dice similarity confidence scoring.
- **Standardized Resource Taxonomy**:
  - Extensible classification into: `REPOSITORY`, `CODE`, `DOCUMENTATION`, `TUTORIAL`, `ARTICLE`, `PDF`, `EBOOK`, `COURSE`, `VIDEO`, `DATASET`, `TOOL`, `LIBRARY`, `TEMPLATE`, `ZIP`, `FILE`, `OTHER`.
- **Asynchronous Worker Queue & Live Progress**:
  - Background scraper jobs (`QUEUED`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED`).
  - Real-time hunt interface with dual progress bars (GitHub + Telegram) and step-by-step activity logs.
- **Search & Filtering**:
  - Full-text search across titles, descriptions, tags, channels, and authors.
  - Granular filters by source platform, resource type, programming language, minimum stars, and file format.
- **Database Architecture**:
  - Zero-config local execution out-of-the-box using **Prisma ORM with SQLite** (`dev.db`).
  - Seamless production switch to **PostgreSQL** by changing `DATABASE_URL` in `.env`.
- **Zero-Bypass Policy**:
  - Adheres strictly to platform security, official APIs, rate limits, and access controls. Secrets are never exposed to the client.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti |
| **Backend** | Node.js (v24 LTS), Express, TypeScript, Axios, Cheerio |
| **Database** | Prisma ORM with SQLite (local) / PostgreSQL (production) |
| **Background Processing** | Asynchronous in-memory JobQueue with scheduler runner (Redis ready) |
| **Testing** | Vitest test suite |

---

## 📁 Monorepo Project Structure

```
comicscrape/
├── package.json               # Root dev, build, and test scripts
├── docker-compose.yml         # Multi-container Postgres + Redis + App deployment
├── Dockerfile                 # Multi-stage production container build
├── .env.example               # Environment variable templates
├── README.md
│
├── server/                    # Backend API & Scraper Engine
│   ├── src/
│   │   ├── index.ts           # Express server & API routing
│   │   ├── db/
│   │   │   ├── schema.prisma  # Unified Prisma schema
│   │   │   ├── client.ts      # Prisma Client instance
│   │   │   └── seed.ts        # 41 realistic resources, 12 tags, 5 collections, 5 jobs
│   │   ├── connectors/
│   │   │   ├── types.ts       # IConnector & NormalizedResource interfaces
│   │   │   ├── github.connector.ts   # Official GitHub REST API
│   │   │   └── telegram.connector.ts # Telegram channel post & media reader
│   │   ├── services/
│   │   │   ├── normalizer.ts  # URL canonicalization & tracking strip
│   │   │   ├── deduplicator.ts# SHA-256 fingerprinting & Sorensen-Dice similarity
│   │   │   ├── classifier.ts  # Taxonomy classification & importance ranking
│   │   │   ├── search.ts      # Full-text and multi-filter database queries
│   │   │   ├── queue.ts       # Asynchronous background job worker
│   │   │   └── scheduler.ts   # Periodic runner for saved searches & cron jobs
│   │   ├── routes/            # REST API endpoints (/resources, /discover, /jobs, etc.)
│   │   └── tests/             # Vitest test suite
│
└── client/                    # Frontend Single-Page Application
    ├── src/
    │   ├── App.tsx            # State orchestration & modal management
    │   ├── types.ts           # Shared frontend types
    │   ├── api/
    │   │   ├── client.ts      # Typed fetch client with demo fallback
    │   │   └── demoData.ts    # Rich demo catalog (20+ GitHub, 20+ Telegram)
    │   ├── styles/
    │   │   ├── index.css      # Design tokens
    │   │   └── comic.css      # Halftone backgrounds, speech bubbles, comic drop-shadows
    │   ├── components/
    │   │   ├── comic/         # ComicBadge, SpeechBubble
    │   │   ├── common/        # StatsCard, SourceBadge, Tag, SearchBar, Modal, EmptyState
    │   │   ├── layout/        # AppShell, TopNav, Sidebar, MobileDrawer
    │   │   └── resources/     # ResourceCard, ResourceGrid, FilterPanel, ResourceDetailModal
    │   └── pages/
    │       ├── DashboardPage.tsx     # Resource Command Center
    │       ├── DiscoverPage.tsx      # "WHAT ARE WE HUNTING TODAY?" + Live Progress Hunt
    │       ├── ResourcesPage.tsx     # Filter sidebar, search, grid/list view
    │       ├── JobsPage.tsx          # Scraper jobs monitor ([POW! RUNNING], [DONE!])
    │       ├── CollectionsPage.tsx   # Comic folder cards
    │       ├── SavedSearchesPage.tsx # Automated alert schedules
    │       ├── SourcesPage.tsx       # Connection configurations & health check
    │       ├── AnalyticsPage.tsx     # Ingestion metrics & visual charts
    │       └── AdminHealthPage.tsx   # System diagnostics & queue manager
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: v18+ (tested on Node.js v24 LTS)
- **npm**: v9+

### 1. Install Dependencies
```powershell
# From root directory:
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Configure Environment
Create `.env` inside `server/` (or copy from `.env.example`):
```bash
cp .env.example server/.env
```
Default contents for zero-config local run:
```env
DATABASE_URL="file:./dev.db"
PORT=3001
APP_URL="http://localhost:5173"
GITHUB_TOKEN=""
TELEGRAM_BOT_TOKEN=""
SESSION_SECRET="comic-scrape-super-secret-key"
```

### 3. Initialize & Seed Database
```powershell
# Generate Prisma Client & push schema to SQLite:
npm run db:push

# Seed the database with 41+ pre-categorized resources and sample jobs:
npm run db:seed
```

### 4. Launch Development Server
```powershell
# Starts both Express API (:3001) and Vite Frontend (:5173) concurrently:
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 🧪 Running Automated Tests

Run the full test suite via Vitest:
```powershell
npm test
```
Covers:
- **Deduplication**: SHA-256 content hashing, canonical URL collision, and Sorensen-Dice word similarity.
- **Normalization**: Stripping tracking query params (`utm_*`, `ref`), canonicalizing GitHub & Telegram links, slugification.
- **Classification**: Automatic MIME & extension mapping to `PDF`, `ZIP`, `REPOSITORY`, `TOOL`, etc., and importance scoring.
- **Connectors**: GitHub and Telegram connector validation and header parsing.

---

## 🐳 Docker Deployment

To launch the complete production stack (PostgreSQL + Redis + App):
```powershell
docker compose up --build -d
```
The application will be accessible at `http://localhost:3001`.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/resources` | Query resources with filters, search, sorting & pagination |
| `GET` | `/api/resources/:id` | Get single resource with README markdown or media metadata |
| `POST` | `/api/resources/:id/save` | Save resource to a curated collection folder |
| `POST` | `/api/discover` | Dispatch an asynchronous discovery job across target collectors |
| `GET` | `/api/jobs` | List recent background scraper jobs |
| `GET` | `/api/jobs/:id` | Detailed job status, progress percentage, and step logs |
| `POST` | `/api/jobs/:id/retry` | Retry a failed discovery job |
| `DELETE` | `/api/jobs/:id` | Cancel and delete a job |
| `GET` | `/api/collections` | List all curated collection folders with counts |
| `POST` | `/api/collections` | Create a new collection folder |
| `GET` | `/api/saved-searches` | List automated recurring searches |
| `POST` | `/api/saved-searches` | Schedule an automated search alert |
| `GET` | `/api/sources` | View connected source statuses and quotas |
| `PUT` | `/api/sources/:id` | Update credentials or monitored channels |
| `POST` | `/api/sources/:id/test` | Test connectivity to GitHub or Telegram APIs |
| `GET` | `/api/analytics` | Telemetry on total resources, deduplication rate, and distributions |
| `GET` | `/api/notifications` | List user and system notifications |

---

## 🛡️ Security & Compliance

1. **No Scraping Bypasses**: The application adheres strictly to platform terms of service. It does not attempt to bypass private channel restrictions, CAPTCHAs, or rate limits.
2. **Credential Isolation**: GitHub Personal Access Tokens and Telegram tokens are strictly loaded in backend environment variables or stored securely in backend configuration tables; they are **never exposed** in client responses.
3. **Graceful Throttling**: The connectors monitor rate-limit headers (`x-ratelimit-remaining`) and apply exponential backoff when encountering rate limit responses.
