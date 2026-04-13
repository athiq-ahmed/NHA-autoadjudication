# NHA Claims Auto-Adjudication MVP

This repo now runs as a FastAPI backend with a Next.js frontend for a two-mode claims auto-adjudication MVP shaped for Azure deployment.

## Included

- `Mock` and `Live` modes
- Dashboard KPIs and daily trends
- Human-readable document classification table
- Claim clinical rule checks with provenance
- Episode timeline sequence output
- Extra or non-required document flagging
- Reviewer chatbot for claim-specific Q&A

## Core Agentic Patterns Followed

A few core ones included are:

- Prompt chaining
- Routing
- Parallelization
- Reflection
- Tool use
- Planning
- Multi-agent coordination

## How These Map To This App

- `Prompt chaining`: the workflow is intentionally staged as intake -> OCR/layout extraction -> document classification -> field extraction -> timeline construction -> rule evaluation -> decision explanation.
- `Routing`: claims are routed by confidence into auto-adjudication or manual review, and the UI supports `Mock` versus `Live` operating paths.
- `Parallelization`: the design expects document OCR, visual cue detection, and per-document classification to run independently before aggregation.
- `Reflection`: low-confidence or contradictory results are surfaced for review, especially chronology conflicts, STG mismatches, and invoice ambiguity.
- `Tool use`: the live-mode service layer is designed to call Azure OCR, storage, notification, and LLM-backed services.
- `Planning`: the app structure separates models, pipeline orchestration, services, and UI so claim processing can be expanded step-by-step without collapsing into one monolithic flow.
- `Multi-agent coordination`: the target production design supports specialist agents for OCR review, policy/rule reasoning, document research, and reviewer assistance.

## Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- Docker & Docker Compose (optional, for containerized deployment)

## How to Run the Application

### Option 1: Quick Start (Recommended - Windows)

```bash
# From the root directory, run:
start.bat
```

This will automatically:
- Start the FastAPI backend on port 8000
- Start the Next.js frontend on port 3000
- Open the frontend in your default browser

### Option 2: Manual Setup (Cross-Platform)

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a Python virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will start on: `http://localhost:8000`

#### Frontend Setup (in a new terminal)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will start on: `http://localhost:3000`

### Option 3: Docker Deployment

```bash
# From the root directory, build and run with Docker Compose
docker-compose up --build

# To run in background
docker-compose up -d --build

# To stop
docker-compose down
```

## App Access

Once running, access the application at:

| Component | URL |
|-----------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Documentation** | http://localhost:8000/docs |
| **Alternative API Docs** | http://localhost:8000/redoc |

## Stopping the Application

- **Windows (start.bat)**: Close the command prompt windows
- **Manual setup**: Press `Ctrl+C` in each terminal
- **Docker**: Run `docker-compose down`

## Documentation

Complete project documentation is available in the [docs/](docs/) folder:

| Document | Purpose |
|----------|---------|
| [TECHNICAL.md](docs/TECHNICAL.md) | Complete system architecture, design patterns, Azure services integration, and solution design |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System components, interactions, data models, and API reference |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment guides for local, staging, and production environments |
| [INTEGRATION_TESTING.md](docs/INTEGRATION_TESTING.md) | Testing procedures and validation steps |
| [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) | Command cheat sheet and quick lookup guide |

**Quick Links:**
- 📋 [View all documentation](docs/README.md)
- 🏗️ [Architecture details](docs/ARCHITECTURE.md)
- 🚀 [Deployment guide](docs/DEPLOYMENT.md)
- 💻 [API Documentation](http://localhost:8000/docs) (when running)

## Live Mode

The app includes Azure-ready service interfaces and environment variables for later integration:

- `AZURE_STORAGE_ACCOUNT_URL`
- `AZURE_STORAGE_CONTAINER`
- `AZURE_FORM_RECOGNIZER_ENDPOINT`
- `AZURE_FORM_RECOGNIZER_KEY`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_DEPLOYMENT`
