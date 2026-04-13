# Technical Architecture & Solution Design

## Executive Summary

The **NHA Claims Auto-Adjudication System** is a modern, cloud-native, full-stack web application designed to automate the adjudication of healthcare insurance claims using AI-driven agentic patterns. The solution uses a **FastAPI backend** with **Next.js frontend**, containerized for Azure deployment.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Core Design Patterns](#core-design-patterns)
4. [Data Models](#data-models)
5. [API Structure](#api-structure)
6. [Azure Services Integration](#azure-services-integration)
7. [Deployment Strategy](#deployment-strategy)
8. [Security Design](#security-design)
9. [Scalability & Performance](#scalability--performance)
10. [Development Workflow](#development-workflow)

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js React Application (TypeScript + Tailwind)      │   │
│  │  • Dashboard (KPIs, Trends, Queues)                     │   │
│  │  • Claims Management (List, Detail, Edit)              │   │
│  │  • Analytics & Reporting                                │   │
│  │  • Professional Dashboard                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ REST API (HTTP/JSON)
              │ Axios client with CORS
              │
┌─────────────▼───────────────────────────────────────────────────┐
│                   API GATEWAY LAYER (Optional)                   │
│  • Azure API Management (Production)                            │
│  • Request throttling & authentication                          │
│  • API versioning & monitoring                                  │
└─────────────┬───────────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────────┐
│                 APPLICATION TIER (FastAPI)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ FastAPI Application (Python 3.11+)                      │   │
│  │ • Async request handling                                │   │
│  │ • CORS Middleware                                       │   │
│  │ • Request logging & tracing                             │   │
│  │ • Error handling & validation                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                       │
│        ┌────────────────┼────────────────┐                     │
│        │                │                │                      │
│  ┌─────▼──────┐  ┌──────▼──────┐  ┌──────▼────────┐          │
│  │ Dashboard  │  │   Claims    │  │  Analytics   │          │
│  │   Route    │  │   Route     │  │   Route      │          │
│  └────────────┘  └──────┬──────┘  └──────────────┘          │
│        │                │                │                     │
│        └────────┬───────┴────────┬──────┘                     │
│                 │                │                             │
│  ┌──────────────▼────────────────▼──────────────────┐        │
│  │      Claims Processing Pipeline (Python)        │        │
│  │  ┌──────────────────────────────────────────┐   │        │
│  │  │ • Temporal Validation                    │   │        │
│  │  │ • STG Rules Engine                       │   │        │
│  │  │ • Financial Rule Checks                  │   │        │
│  │  │ • Confidence Scoring                     │   │        │
│  │  │ • Document Classification (Ready for AI) │   │        │
│  │  │ • Field Extraction (OCR Integration)     │   │        │
│  │  │ • Timeline Construction                  │   │        │
│  │  │ • Decision Explanation                   │   │        │
│  │  └──────────────────────────────────────────┘   │        │
│  └──────────────────────────────────────────────────┘        │
│                         │                                     │
│  ┌──────────────────────▼─────────────────────────┐          │
│  │      Data Layer (Extensible)                  │          │
│  │  • Mock Data Repository (Development)         │          │
│  │  • Azure SQL Database (Production)            │          │
│  │  • Cosmos DB (NoSQL Alternative)              │          │
│  └───────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
              │
              │ File Operations
              │
┌─────────────▼───────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│  • Azure Storage Account (Document storage)                    │
│  • Azure Form Recognizer (OCR/Document parsing)                │
│  • Azure OpenAI (LLM for intelligent processing)               │
│  • Azure Cognitive Services (Classifications)                  │
│  • Azure Notification Services (Alerts)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Purpose | Technology |
|-----------|---------|-----------|
| **Frontend** | User interface, visualization, state management | Next.js, TypeScript, Tailwind CSS, Axios |
| **Backend API** | Business logic, data orchestration, rule engine | FastAPI, Python 3.11, Pydantic |
| **Pipeline Module** | Claims processing, validation, scoring | Python, Pandas, NumPy |
| **Data Layer** | Persistence (mock/SQL/NoSQL) | In-memory (dev), Azure SQL (prod) |
| **Azure Services** | OCR, storage, LLM, messaging | Azure Cognitive, Storage, OpenAI |

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Build Tools**: Webpack (via Next.js), PostCSS
- **Node.js Version**: 18+

### Backend
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.11+
- **ASGI Server**: Uvicorn
- **Validation**: Pydantic v2
- **Production Server**: Gunicorn + Uvicorn workers
- **Dependencies**:
  - `fastapi`: REST framework
  - `uvicorn`: ASGI server
  - `pydantic`: Data validation
  - `python-multipart`: Form handling
  - `python-dotenv`: Environment config
  - `azure-storage-blob`: Azure Storage integration
  - `azure-cognitiveservices-vision-computervision`: OCR
  - `openai`: Azure OpenAI LLM

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Cloud Platform**: Azure (primary), AWS/GCP compatible
- **CI/CD**: GitHub Actions (future)
- **Container Registry**: Azure Container Registry

### Development Tools
- **Version Control**: Git + GitHub
- **IDE**: VS Code (recommended)
- **Package Manager**: pip (Python), npm (Node.js)
- **Logging**: Python logging + application logs
- **Testing**: pytest (Python), Jest (JavaScript, future)

---

## Core Design Patterns

### 1. **Agentic Workflow Patterns**

The solution implements multiple AI agentic patterns for intelligent claim processing:

#### Prompt Chaining
Claims are processed through a staged pipeline:
```
Intake → OCR/Layout → Classification → Field Extraction → Timeline → Rule Evaluation → Decision
```

#### Routing
Claims are routed based on confidence:
- **High Confidence (>0.85)**: Auto-approval
- **Medium Confidence (0.5-0.85)**: Manual review queue
- **Low Confidence (<0.5)**: Rejection or escalation

#### Parallelization
Independent operations run concurrently:
- Document OCR, visual analysis, and classification
- Multiple rule evaluations
- Parallel financial and temporal checks

#### Reflection
Low-confidence or conflicting results trigger:
- Contradictory result detection
- Evidence reassessment
- Escalation to human reviewer

#### Tool Use
The pipeline integrates with:
- Azure OCR for document parsing
- Azure OpenAI for intelligent classification
- Azure Storage for document management
- Custom business rule engine

### 2. **REST API Design**

Follows RESTful conventions:
- Resource-based URLs (`/api/claims`, `/api/analytics`)
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent JSON response envelope
- Proper HTTP status codes

### 3. **Separation of Concerns**

Architecture layers:
- **Presentation**: Frontend UI (Next.js)
- **API**: REST endpoints (FastAPI routes)
- **Business Logic**: Pipeline module (Python)
- **Data Access**: Repository pattern (mock/SQL)
- **External Services**: Service interfaces (Azure)

### 4. **Configuration Management**

Environment-based configuration:
```python
# Development
ENV=development
DEBUG=True
DATABASE_URL=sqlite:///app.db

# Production
ENV=production
DEBUG=False
DATABASE_URL=<azure-sql-connection-string>
AZURE_* environment variables
```

### 5. **Error Handling & Logging**

- Structured logging with context
- Graceful error responses
- Exception specificity (validation vs. server errors)
- Request/response logging for debugging

---

## Data Models

### Core Entities

#### Claim
```python
class Claim(BaseModel):
    claim_id: str                          # Unique identifier
    patient_name: str                      # Full name
    patient_age: int                       # Age
    patient_gender: str                    # M/F/Other
    hospital: str                          # Hospital name
    admission_date: datetime               # Admission timestamp
    discharge_date: datetime               # Discharge timestamp
    diagnosis: str                         # Primary diagnosis
    procedures: List[str]                  # Procedure codes
    package: str                           # STG package (Cardiac, Ortho, etc.)
    stg_amount: float                      # Guideline amount (₹)
    claimed_amount: float                  # Claimed amount (₹)
    los_days: int                          # Length of stay
    complexity_score: int                  # Complexity (1-100)
    status: str                            # pass|conditional|fail
    confidence: float                      # Confidence (0.0-1.0)
    extra_docs: int                        # Extra document count
    created_at: datetime                   # Submission timestamp
    updated_at: datetime                   # Last update timestamp
```

#### ValidationRule
```python
class ValidationRule(BaseModel):
    category: str                          # Rule category (Temporal, Financial, etc.)
    rule_name: str                         # Rule identifier
    status: str                            # pass|fail|warning
    details: str                           # Human-readable explanation
    evidence: Dict[str, Any]               # Supporting data
    severity: str                          # critical|warning|info
```

#### Dashboard Metrics
```python
class DashboardMetrics(BaseModel):
    total_claims: int
    auto_approved: int
    manual_review: int
    rejection_rate: float
    avg_confidence: float
    avg_los: int
    pending_since_days: int
```

#### TimelineEvent
```python
class TimelineEvent(BaseModel):
    timestamp: datetime
    event_type: str                        # submitted|auto_approved|reviewed|updated
    description: str
    actor: str                             # system|user_id|ai_agent
    metadata: Dict[str, Any]
```

---

## API Structure

### Base URLs
- **Development**: `http://localhost:8000`
- **Production**: `https://api.nha-claims.azurewebsites.net`

### API Response Envelope
```json
{
  "data": {},
  "status": "success",
  "message": "Optional message",
  "timestamp": "2026-04-13T10:30:00Z"
}
```

### Main Routes

#### Dashboard (`/api/dashboard`)
- `GET /metrics` - KPI metrics
- `GET /trends` - Daily trends (7/30/90 days)
- `GET /status-distribution` - Pass/Fail/Conditional breakdown

#### Claims (`/api/claims`)
- `GET /list` - List all claims (filterable, paginated)
- `GET /{claim_id}` - Claim detail
- `GET /{claim_id}/timeline` - Claim timeline
- `GET /{claim_id}/rules` - Validation results
- `POST /{claim_id}/approve` - Approve claim
- `POST /{claim_id}/reject` - Reject claim
- `POST /{claim_id}/request-review` - Request review
- `GET /queue/manual-review` - Manual review queue

#### Analytics (`/api/analytics`)
- `GET /approval-rate` - Approval trends
- `GET /team-performance` - Team metrics
- `GET /complexity-distribution` - Claim complexity stats
- `GET /package-breakdown` - Package type distribution

#### Rules (`/api/rules`)
- `GET /engine` - Rule engine status
- `GET /list` - Active rules
- `POST /validate/{claim_id}` - Validate claim against rules

---

## Azure Services Integration

### Current Mock Implementation

The application is designed to work in **two modes**:

#### **Mock Mode (Development)**
- Uses in-memory data store
- Simulated Azure service responses
- No external dependencies
- Ideal for local development and testing

#### **Live Mode (Production-Ready)**
Integrates with real Azure services:

### 1. **Azure Storage Account**
**Purpose**: Store claim documents, OCR results, and audit logs

**Configuration**:
```python
AZURE_STORAGE_ACCOUNT_URL=https://<account>.blob.core.windows.net
AZURE_STORAGE_CONTAINER=claims-documents
AZURE_STORAGE_KEY=<account-key>
```

**Usage**:
- Upload claim documents (PDF, images)
- Store OCR output
- Archive historical claims
- Maintain audit trail

**Operations**:
```python
from azure.storage.blob import BlobClient

# Upload document
blob = BlobClient.from_connection_string(
    conn_str=connection_string,
    container_name="claims-documents",
    blob_name=f"claim_{claim_id}/document.pdf"
)
blob.upload_blob(document_data)

# Download and retrieve
blob = BlobClient.from_connection_string(...)
document_data = blob.download_blob().readall()
```

### 2. **Azure Form Recognizer (Document Intelligence)**
**Purpose**: Extract text, layout, and structured data from claim documents

**Configuration**:
```python
AZURE_FORM_RECOGNIZER_ENDPOINT=https://<region>.api.cognitive.microsoft.com/
AZURE_FORM_RECOGNIZER_KEY=<api-key>
```

**Usage**:
- OCR text extraction from documents
- Layout detection (tables, forms, page structure)
- Named Entity Recognition (dates, amounts, patient names)
- Structured field extraction

**Example Implementation**:
```python
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

client = DocumentAnalysisClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(key)
)

# Analyze document
response = client.begin_analyze_document("prebuilt-invoice", document)
result = response.result()

# Extract fields
for page in result.pages:
    for table in page.tables:
        # Process table data
        pass
```

### 3. **Azure OpenAI Service**
**Purpose**: Intelligent document classification, field extraction, and decision reasoning

**Configuration**:
```python
AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=<deployment-name>
AZURE_OPENAI_API_VERSION=2024-02-01
AZURE_OPENAI_API_KEY=<api-key>
```

**Usage**:
- Classify document types (invoice, prescription, discharge summary)
- Extract structured fields using few-shot learning
- Generate decision explanations
- Perform semantic similarity matching
- Rule interpretation and adaptation

**Example**:
```python
from openai import AzureOpenAI

client = AzureOpenAI(
    api_key=api_key,
    api_version="2024-02-01",
    azure_endpoint=endpoint
)

response = client.chat.completions.create(
    model=deployment_name,
    messages=[
        {"role": "system", "content": "You are a claim adjudication expert."},
        {"role": "user", "content": f"Classify this claim: {claim_data}"}
    ],
    temperature=0.3
)

classification = response.choices[0].message.content
```

### 4. **Azure SQL Database** (Production Data Store)
**Purpose**: Persistent storage for claims, validations, and audit logs

**Configuration**:
```python
DATABASE_URL=mssql+pyodbc://user:pass@server.database.windows.net/dbname
```

**Schema Design**:
```sql
-- Claims table
CREATE TABLE claims (
    claim_id NVARCHAR(50) PRIMARY KEY,
    patient_name NVARCHAR(100),
    status NVARCHAR(20),
    confidence FLOAT,
    created_at DATETIME,
    updated_at DATETIME,
    -- ... other fields
);

-- Validation results table
CREATE TABLE validations (
    id INT PRIMARY KEY IDENTITY,
    claim_id NVARCHAR(50),
    rule_name NVARCHAR(100),
    status NVARCHAR(20),
    details TEXT,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id)
);

-- Audit log
CREATE TABLE audit_logs (
    id INT PRIMARY KEY IDENTITY,
    claim_id NVARCHAR(50),
    action NVARCHAR(50),
    actor NVARCHAR(100),
    timestamp DATETIME,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id)
);
```

### 5. **Azure Cognitive Services** (Extensions)
**Optional services for advanced capabilities**:

- **Computer Vision**: Receipt scanning, table detection
- **Text Analytics**: Sentiment analysis, language detection
- **Translator**: Multi-language support
- **Bot Service**: Chatbot for reviewer assistance

### 6. **Azure Notification Services** (Alerts)
**Purpose**: Real-time alerts for claim status changes

**Configuration**:
```python
NOTIFICATION_HUB_CONNECTION_STR=<connection-string>
```

**Implementation**:
```python
from azure.notificationhubs import NotificationHubsClient, NotificationMessage

hub_client = NotificationHubsClient.from_connection_string(connection_string)

# Send notification
message = NotificationMessage(
    body={
        "claim_id": claim_id,
        "status": "approved",
        "timestamp": datetime.now()
    }
)
hub_client.send_notification(message)
```

---

## Deployment Strategy

### Development Environment
```bash
# Docker Compose for full stack
docker-compose up --build

# Access
Frontend: http://localhost:3000
Backend:  http://localhost:8000
Docs:     http://localhost:8000/docs
```

### Staging Environment (Azure)
```bash
# Resource Group
az group create --name nha-claims-staging --location eastus

# App Service Plan
az appservice plan create \
  --name nha-app-plan-staging \
  --resource-group nha-claims-staging \
  --sku B2 --is-linux

# Backend Container Instance
az webapp create \
  --resource-group nha-claims-staging \
  --plan nha-app-plan-staging \
  --name nha-claims-api-staging \
  --deployment-container-image-name <registry>/nha-backend:latest
```

### Production Environment (Azure)
```bash
# High-availability setup
# - Premium App Service Plan (P2V2)
# - Multiple instances with autoscaling
# - Azure SQL Database (Standard or Premium)
# - CDN for static frontend
# - Application Insights for monitoring
```

### CI/CD Pipeline (GitHub Actions - Future)
```yaml
# Deploy on push to main
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build backend container
        run: docker build -t $ACR_REGISTRY/nha-backend:latest ./backend
      
      - name: Push to Azure Container Registry
        run: docker push $ACR_REGISTRY/nha-backend:latest
      
      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: nha-claims-api
          images: ${{ env.ACR_REGISTRY }}/nha-backend:latest
```

---

## Security Design

### Authentication & Authorization
- **Current**: Open mode (development)
- **Future Implementation**:
  - Azure Entra ID (formerly AAD)
  - JWT bearer tokens
  - Role-based access control (RBAC)
  - Claim adjudicator vs. reviewer roles

### Data Protection
- **In Transit**: HTTPS/TLS 1.3
- **At Rest**: 
  - Azure Storage encryption
  - Azure SQL Transparent Data Encryption (TDE)
  - Database backup encryption
  
### API Security
```python
# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://nha-claims.azurewebsites.net"],  # Production
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# Rate limiting (future)
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
@app.get("/api/claims")
@limiter.limit("100/minute")
async def list_claims(...): pass

# Input validation with Pydantic
class ClaimQuery(BaseModel):
    status: str = Field(..., regex="^(pass|fail|conditional)$")
    complexity_min: int = Field(1, ge=1, le=100)
    complexity_max: int = Field(100, ge=1, le=100)
```

### Audit & Logging
```python
# All operations logged with context
import logging

logger = logging.getLogger(__name__)
logger.info(
    "Claim approved",
    extra={
        "claim_id": claim_id,
        "actor": user_id,
        "confidence": confidence_score,
        "timestamp": datetime.now().isoformat()
    }
)
```

---

## Scalability & Performance

### Frontend Optimization
- **Code Splitting**: Next.js automatic route-based splitting
- **Image Optimization**: Built-in Next.js Image component
- **Caching**: HTTP caching headers + CDN
- **Lazy Loading**: On-demand analytics data loading

### Backend Optimization
- **Async I/O**: FastAPI async handlers
- **Connection Pooling**: SQLAlchemy connection pool
- **Caching Layer**: Redis (future)
- **Pagination**: Limit/offset for large datasets

### Database Optimization
- **Indexes**: Claim ID, status, date range queries
- **Partitioning**: By date for historical data
- **Archival**: Move old claims to cold storage

### Horizontal Scaling
```bash
# Azure Container Instances (ACI) - Auto-scaling
az containerapp create \
  --name nha-claims-api \
  --resource-group nha-claims \
  --image $ACR_REGISTRY/nha-backend:latest \
  --cpu 1.0 \
  --memory 2.0 \
  --min-replicas 2 \
  --max-replicas 10
```

### Performance Metrics
- **Target Response Time**: <500ms (p95)
- **Throughput**: 100+ claims/minute
- **Database Query**: <100ms
- **Frontend Load Time**: <3s (Lighthouse score >85)

---

## Development Workflow

### Local Setup
```bash
# Clone repository
git clone https://github.com/athiq-ahmed/NHA-autoadjudication.git
cd NHA-autoadjudication

# Run full stack
./start.sh          # macOS/Linux
start.bat           # Windows

# Or manually
docker-compose up --build
```

### File Structure
```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry
│   │   └── routes/          # API routes
│   │       ├── claims.py
│   │       ├── dashboard.py
│   │       ├── rules.py
│   │       └── analytics.py
│   └── requirements.txt
│
├── frontend/
│   ├── app/                 # Next.js pages
│   │   ├── page.tsx         # Dashboard
│   │   ├── claims/
│   │   ├── analytics/
│   │   └── settings/
│   ├── components/          # Reusable components
│   └── package.json
│
├── src/                     # Shared Python modules
│   ├── pipeline.py          # Claims processing
│   ├── models.py            # Data models
│   ├── services.py          # Azure integration
│   └── mock_data.py         # Test data
│
├── docs/                    # Documentation
│   ├── TECHNICAL.md         # This file
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── API.md
│
├── docker-compose.yml       # Local orchestration
├── README.md                # Quick start
└── .github/workflows/       # CI/CD pipelines (future)
```

### Testing Strategy
```python
# Backend tests (pytest)
pytest backend/tests/
pytest backend/tests/test_claims.py::test_validate_cardiac_claim

# Frontend tests (Jest - future)
npm run test --prefix frontend

# Integration tests
# Manual: http://localhost:3000 → verify UI flows
# Automated: Postman/pytest for API endpoints
```

### Contribution Guidelines
1. Create feature branch: `git checkout -b feature/new-rule-engine`
2. Make changes following PEP 8 (Python) and Prettier (TypeScript)
3. Write tests for new functionality
4. Commit with descriptive messages
5. Push and create Pull Request
6. Code review and merge to main

---

## Future Enhancements

### Phase 2 (Q3 2026)
- [ ] Advanced OCR integration (Azure Form Recognizer)
- [ ] LLM-driven document classification
- [ ] Multi-agent coordination for complex cases
- [ ] Real-time notifications via SignalR
- [ ] User authentication (Azure Entra ID)

### Phase 3 (Q4 2026)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Explainable AI for decisions
- [ ] Batch processing API
- [ ] Integration with legacy claim systems

### Phase 4 (2027+)
- [ ] Federated learning for privacy
- [ ] Blockchain audit trail
- [ ] Multi-tenant SaaS model
- [ ] Industry partnerships

---

## Support & Resources

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Architecture Diagrams**: See `ARCHITECTURE_DIAGRAMS.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Regular Testing**: See `INTEGRATION_TESTING.md`
- **Quick Reference**: See `QUICK_REFERENCE.md`

---

**Document Version**: 1.0  
**Last Updated**: April 13, 2026  
**Maintained By**: NHA Development Team
