# Nifty AI Meeting Analyzer

> Turn meeting transcripts into actionable outcomes—AI-generated tasks, a searchable knowledge base, and clear visibility into decisions and follow-ups.

## Overview

Nifty AI Meeting Analyzer is a React single-page application (SPA) that connects to a remote backend API to process meeting transcripts from Zoom and other sources. The app extracts action items, assigns owners, and syncs tasks to ClickUp—helping teams turn conversations into structured work without extra admin.

## Features

- **Meeting Processing** — Upload transcript files or select from existing recordings; AI analyzes content to extract tasks, assignees, and deadlines
- **Task Management** — View AI-generated tasks grouped by meeting and assignee, with transcript snippet highlighting for context
- **Knowledge Base** — Upload project documentation (PDF/TXT) to improve AI project matching via Pinecone semantic search
- **ClickUp Integration** — Configure API credentials and sync tasks to your ClickUp workspace hierarchy
- **Meeting History** — Browse and search past meeting transcripts
- **Settings & Data Management** — Configure integrations and manage stored data (meetings, logs, tasks, Pinecone context)

## Tech Stack

| Category      | Technology                              |
| ------------- | --------------------------------------- |
| Framework     | React 19, TypeScript                    |
| Build         | Vite 7                                  |
| State         | Redux Toolkit, RTK Query, Redux Persist |
| Styling       | Tailwind CSS 4                          |
| UI Components | Radix UI, shadcn/ui                     |
| Routing       | React Router 7                          |
| HTTP          | Axios                                   |

## Prerequisites

- Node.js 20+
- npm or pnpm

> **Note:** The backend API is already deployed at `https://meet.hub.niftyai.net/api`. You don't need to run a local backend server.

## Installation

```bash
# Clone the repository
git clone https://github.com/pranto131/qa-test-nifty-it-solution.git
cd qa-test-nifty-it-solution

# Install dependencies
npm install
```

The app is ready to use immediately—it connects to the deployed backend at `https://meet.hub.niftyai.net/api`.

## Configuration

The app uses environment variables to configure the backend API connection. Three environment files are available:

- `.env.example` — Template with example values (committed to Git)
- `.env.production` — Production backend URL (used in CI, committed to Git)
- `.env` — Local overrides (gitignored, create if needed)

**For local development:**

The app will automatically use the production backend at `https://meet.hub.niftyai.net/api`. No `.env` file is needed unless you want to override the default.

To create a local `.env` file (optional):

```env
# API Configuration
VITE_API_BASE_URL=https://meet.hub.niftyai.net/api
# VITE_API_KEY=your_api_key_here  # Optional
```

**Environment Variables:**

| Variable            | Description                                     | Default                                    |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| `VITE_API_BASE_URL` | Backend API base URL                            | `http://localhost:5001/api` (development) |
| `VITE_API_KEY`      | Optional API key for authenticated API requests | Empty                                      |

> **Tip:** The `.env.production` file ensures CI/CD pipelines use the deployed backend automatically.

## Usage

```bash
# Development server (http://localhost:5004)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Route-level pages
├── store/           # Redux store, slices, RTK Query APIs
├── services/        # Axios API client and endpoints
├── utils/           # Transcript parsing, highlighting
└── lib/             # Shared utilities
```

## Key Routes

| Route             | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| `/`               | Landing page                                                   |
| `/signin`         | Authentication                                                 |
| `/dashboard`      | Three-step workflow (upload → project → destination → analyze) |
| `/tasks`          | AI-generated tasks by meeting                                  |
| `/history`        | Meeting transcripts                                            |
| `/knowledge-base` | Document upload and management                                 |
| `/settings`       | ClickUp config, data management                                |

## API Integration

The frontend communicates with the backend at `VITE_API_BASE_URL`. Authentication uses JWT tokens stored in `localStorage`. Key API domains:

- **Auth** — Login
- **Recordings** — Upload, list, analyze
- **Meetings** — Status, transcripts
- **Tasks** — List by meeting
- **Knowledge Base** — Upload, list, delete documents
- **Settings** — ClickUp config, data deletion

## Testing

End-to-end tests are maintained in a separate repository: [Playwright-repository-by-pranto](https://github.com/pranto131/Playwright-repository-by-pranto)

The test suite uses Playwright to verify critical user flows:
- Authentication (login, logout, invalid credentials)
- Meeting analysis workflow (upload → project selection → task generation)
- Dashboard navigation and state management

**Running Tests Locally:**

1. Clone the Playwright repository:
   ```bash
   git clone https://github.com/pranto131/Playwright-repository-by-pranto.git
   cd Playwright-repository-by-pranto
   ```

2. Clone this frontend repo into the `frontend` directory:
   ```bash
   git clone https://github.com/pranto131/qa-test-nifty-it-solution.git frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   npx playwright install --with-deps chromium
   ```

4. Run tests:
   ```bash
   npx playwright test
   ```

Playwright's `webServer` config automatically starts the frontend dev server and waits for it to be ready before running tests.

## CI/CD Pipeline

Every push to the `master` branch triggers a GitHub Actions workflow:

1. **Build Job** — TypeScript type-checking + Vite production build
2. **E2E Test Job** — Runs Playwright tests against the live production backend

The pipeline ensures:
- ✅ No TypeScript errors
- ✅ Production build succeeds
- ✅ All E2E tests pass against the deployed backend
- ❌ **Deployment is blocked if any test fails**

**Workflow files:**
- `.github/workflows/frontend-ci.yml` (this repo) — Orchestrates build + E2E tests
- `.github/workflows/playwright.yml` (test repo) — Can be triggered independently

**Environment:**
- Frontend runs on `http://localhost:5004` during tests
- Backend API: `https://meet.hub.niftyai.net/api` (production)
- Test credentials: `admin` / `0000` (from `LOGIN_USER` / `LOGIN_PASSWORD` env vars)

> **Note:** Tests run against the **real production backend**, not mocks. This ensures full end-to-end validation.

## License

Proprietary. © Nifty Ai.
