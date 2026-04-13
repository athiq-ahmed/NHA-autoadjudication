# Visual Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │         Next.js 14 React Application                      │    │
│  │  ┌──────────┬────────────┬──────────────┬────────────┐   │    │
│  │  │Dashboard │  Claims    │  Analytics   │ Settings   │   │    │
│  │  │Page      │  List/     │  Page        │ Page       │   │    │
│  │  │          │  Detail    │              │            │   │    │
│  │  └──────────┴────────────┴──────────────┴────────────┘   │    │
│  │  ┌──────────────────────────────────────────────────┐    │    │
│  │  │  Components: Navbar, KPICard, Charts            │    │    │
│  │  │  Styling: Tailwind CSS + Fluent Design Colors   │    │    │
│  │  └──────────────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────────────┘    │
│                           │                                         │
│                    Axios HTTP Client                                │
│         (JSON over CORS-enabled HTTP/REST)                         │
│                                                                      │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │  Load Balancer or  │
                  │  Proxy (Optional)  │
                  └─────────┬──────────┘
                            │
┌───────────────────────────▼────────────────────────────────────────┐
│                    API GATEWAY LAYER                               │
├────────────────────────────────────────────────────────────────────┤
│  (Optional: Azure API Management, Kong, Nginx)                     │
│  - Rate Limiting                                                   │
│  - Request Throttling                                              │
│  - Analytics                                                       │
└───────────────────────────┬────────────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────────────┐
│              FastAPI Python Backend (Port 8000)                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │    Main Application (FastAPI)                           │    │
│  │  - CORS Middleware ✓                                   │    │
│  │  - Error Handling ✓                                    │    │
│  │  - Request Logging ✓                                   │    │
│  └──────────────────────────────────────────────────────────┘    │
│                          │                                         │
│     ┌────────────────────┼────────────────────┐                  │
│     ▼                    ▼                    ▼                   │
│  ┌────────────┐   ┌─────────────┐   ┌──────────────┐            │
│  │ Dashboard  │   │  Claims     │   │   Rules      │            │
│  │ Router     │   │  Router     │   │   Router     │            │
│  ├────────────┤   ├─────────────┤   ├──────────────┤            │
│  │ /metrics   │   │ /list       │   │ /stg-rules   │            │
│  │ /trends    │   │ /{id}       │   │ /categories  │            │
│  │ /status-.. │   │ /{id}/rule..│   │ /packages/.. │            │
│  └────────────┘   │ /queue/..   │   └──────────────┘            │
│                   └─────────────┘                                 │
│                                                                    │
│  ┌────────────────────────────────────────────────────────┐     │
│  │      Python Pipeline Module                           │     │
│  │  ┌──────────────────────────────────────────────┐     │     │
│  │  │  Validation Logic:                          │     │     │
│  │  │  • Temporal Validation (dates, LoS)        │     │     │
│  │  │  • STG Rules Engine (4 categories)         │     │     │
│  │  │  • Financial Consistency Checks            │     │     │
│  │  │  • Confidence Scoring                      │     │     │
│  │  └──────────────────────────────────────────────┘     │     │
│  └────────────────────────────────────────────────────────┘     │
│                          ▼                                        │
│  ┌────────────────────────────────────────────────────────┐     │
│  │        Data Layer                                      │     │
│  │  ┌──────────────────────────────────────────────┐     │     │
│  │  │  Mock Data Repository (In-Memory)           │     │     │
│  │  │  • 6 Healthcare Claims                      │     │     │
│  │  │  • 4 Medical Categories                     │     │     │
│  │  │  • STG Rules Definitions                    │     │     │
│  │  │  • Team & Performance Data                  │     │     │
│  │  └──────────────────────────────────────────────┘     │     │
│  │  (Future: PostgreSQL, MongoDB, Elasticsearch)        │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT OPTIONS                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Local:              Docker Desktop → docker-compose up         │
│  Development:        Direct Python/Node.js (no containers)      │
│  Azure:              App Service / Static Web App / AKS          │
│  AWS:                EC2 / Elastic Beanstalk / EKS               │
│  GCP:                Cloud Run / App Engine / GKE                │
│  On-Premise:         Kubernetes cluster / Docker Swarm           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Dashboard Load Sequence

```
User Opens http://localhost:3000
         │
         ▼
ReactDOM.render() → page.tsx
         │
         ▼
useEffect() Hook Fires
         │
    ┌────┴───┬─────────┬──────────────┐
    │         │         │              │
    ▼         ▼         ▼              ▼
GET          GET        GET           GET
/api/        /api/      /api/          /api/
dashboard/   dashboard/ dashboard/     claims/
metrics      trends     status-dist    queue/manual

    │         │         ▼              ▼
    │         │      (BarChart)    (Table)
    ▼         ▼
  (KPI)     (LineChart)
  Cards     Visualization

         ▼
    Render Complete
         │
    Dashboard Live ✓
```

### Claim Detail Drill-Down

```
Click "Open" on Claims Row
         │
         ▼
Navigate to /claims/[id]
         │
         ▼
[id]/page.tsx useEffect
         │
    ┌────┴────┬─────────┬─────────┐
    │          │         │         │
    ▼          ▼         ▼         ▼
GET          GET       GET        GET
/api/        /api/     /api/      /api/
claims/{id}  claims/   claims/    claims/
             {id}/     {id}/      {id}/
             timeline  rules      evidence

    │          │         │        │
    ▼          ▼         ▼        ▼
Patient &    Timeline   Rules    Evidence
Hospital     Events     Checks   Documents
Info         
    │          │         │        │
    └────────┬─┴─────────┴────────┘
             │
             ▼
        Render Tabs
             │
    ┌────┬──┴────┬────────┐
    │    │       │        │
Overview Timeline Rules  Notes
    
    ▼
Detail Page Live ✓
```

## API Endpoint Tree

```
/api/
├── /health                          [GET] Health check
│
├── /dashboard
│   ├── /metrics                     [GET] KPI aggregates
│   ├── /trends                      [GET] 7-day historical
│   └── /status-distribution         [GET] Pass/Fail/Conditional
│
├── /claims
│   ├── /list                        [GET] Paginated list + filters
│   ├── /{claim_id}                  [GET] Full claim detail
│   ├── /{claim_id}/timeline         [GET] Event history
│   ├── /{claim_id}/rules            [GET] Validation results
│   ├── /queue/manual-review         [GET] High-priority queue
│
├── /rules
│   ├── /stg-rules                   [GET] Complete rules repo
│   ├── /categories                  [GET] Medical categories
│   └── /packages/{category}         [GET] Category-specific rules
│
└── /analytics
    ├── /approval-rate               [GET] Historical trends
    ├── /team-performance            [GET] Adjudicator metrics
    ├── /complexity-distribution     [GET] Complexity breakdown
    └── /package-breakdown           [GET] Package type breakdown
```

## Component Hierarchy

```
App (Next.js)
│
├── layout.tsx (Root Layout)
│   └── Navbar             (Responsive sidebar)
│
├── page.tsx (Dashboard)
│   ├── Navbar
│   ├── KPICard (x5)       Components/KPICard.tsx
│   ├── LineChart          Recharts
│   ├── BarChart           Recharts
│   └── Manual Queue       Table
│
├── /claims/page.tsx
│   ├── Navbar
│   ├── SearchBar          Input
│   ├── FilterPanel        Selects/Inputs
│   ├── DataTable          Interactive table
│   │   └── Row → Link to [id]/page
│   │
│   └── /claims/[id]/page.tsx
│       ├── Navbar
│       ├── Header         (Breadcrumb, Status Badge)
│       ├── Tabs           (Overview, Validation, Timeline, Notes)
│       │   ├── Overview   (Patient, Hospital, Financials)
│       │   ├── Validation (Rule Cards)
│       │   ├── Timeline   (Event List)
│       │   └── Notes      (Textarea)
│       └── Action Buttons (Approve, Reject, Request Info)
│
├── /analytics/page.tsx
│   ├── Navbar
│   ├── DateRangePicker    Buttons
│   ├── LineChart          Approval Rate Trend
│   ├── BarChart           Team Performance
│   ├── PieChart (x2)      Complexity, Package Breakdown
│   └── Summary Stats      KPI cards
│
└── /settings/page.tsx
    ├── Navbar
    ├── Environment        Select dropdowns
    └── Settings Form      Checkboxes, Inputs, Sliders
```

## Database Schema (Future - PostgreSQL)

```sql
claims
├── id (UUID PK)
├── claim_id (VARCHAR UNIQUE)
├── patient_id (FK)
├── hospital_id (FK)
├── admission_date (DATE)
├── discharge_date (DATE)
├── diagnosis (TEXT)
├── package (VARCHAR)
├── stg_amount (DECIMAL)
├── claimed_amount (DECIMAL)
├── status (ENUM: pass, conditional, fail)
├── confidence (FLOAT 0-1)
├── complexity (INT 1-100)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── metadata (JSONB)

procedures
├── id (UUID PK)
├── claim_id (FK)
├── procedure_name (VARCHAR)
└── procedure_date (DATE)

validation_results
├── id (UUID PK)
├── claim_id (FK)
├── category (VARCHAR)
├── rule_name (VARCHAR)
├── status (ENUM: pass, fail, warning)
├── details (TEXT)
└── timestamp (TIMESTAMP)

users
├── id (UUID PK)
├── email (VARCHAR UNIQUE)
├── role (ENUM: adjudicator, admin)
├── created_at (TIMESTAMP)

audit_log
├── id (UUID PK)
├── user_id (FK)
├── claim_id (FK)
├── action (VARCHAR)
├── details (JSONB)
└── timestamp (TIMESTAMP)
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CDN / Edge Network                           │
│              (CloudFlare, Azure CDN, CloudFront)               │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                   Load Balancer                                 │
│        (Azure LB, AWS ALB, Nginx, HAProxy)                     │
└────┬────────────────────────────────────────┬───────────────────┘
     │                                        │
┌────▼─────────────┐              ┌──────────▼────────────────┐
│   Frontend Pods  │              │   Backend Pods           │
│ (Next.js × 3)    │              │ (FastAPI × 3)            │
├──────────────────┤              ├──────────────────────────┤
│ Pod 1 (3000)     │              │ Pod 1 (8000)            │
│ Pod 2 (3000)     │              │ Pod 2 (8000)            │
│ Pod 3 (3000)     │              │ Pod 3 (8000)            │
└────┬─────────────┘              └──────────┬───────────────┘
     │                                       │
     │ ┌─────────────────────────────────────┘
     │ │
     ▼ ▼
┌──────────────────────────┐
│   Data Layer             │
├──────────────────────────┤
│ PostgreSQL (Primary)     │
│ PostgreSQL (Replica)     │
│ Redis Cache              │
│ Elasticsearch            │
└──────────────────────────┘
```

## CI/CD Pipeline

```
Git Push
  │
  ▼
GitHub Actions / Azure DevOps / Jenkins
  │
  ├─ Checkout Code
  │
  ├─ Test Backend
  │  ├─ pytest
  │  └─ lint (pylint, flake8)
  │
  ├─ Test Frontend
  │  ├─ npm test (Jest)
  │  ├─ lint (ESLint)
  │  └─ type check (TypeScript)
  │
  ├─ Build Images
  │  ├─ docker build backend
  │  └─ docker build frontend
  │
  ├─ Push to Registry
  │  ├─ Docker Hub
  │  ├─ Azure Container Registry
  │  └─ AWS ECR
  │
  ├─ Deploy to Staging
  │  ├─ Update Kubernetes (if K8s)
  │  └─ Or update App Service
  │
  ├─ Integration Tests (Staging)
  │  ├─ End-to-end tests
  │  └─ Performance tests
  │
  └─ Deploy to Production
     ├─ Blue-Green Deployment
     └─ Or Canary Release (gradual rollout)
```

---

**Architecture designed for scale, reliability, and maintainability** ✓
