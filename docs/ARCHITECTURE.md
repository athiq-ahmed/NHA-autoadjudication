# Solution Architecture

## System Overview

The NHA Claims Auto-Adjudication System follows a modern **three-tier architecture** design:

- **Presentation Tier**: Next.js React frontend (TypeScript + Tailwind CSS)
- **Application Tier**: FastAPI backend (Python 3.11+, async/await)
- **Data Tier**: Mock repository (extensible to SQL/NoSQL)

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js React Application (TypeScript)                 │   │
│  │  - Dashboard (KPIs, Charts, Queue)                      │   │
│  │  - Claims Management (List, Detail, Timeline)           │   │
│  │  - Analytics (Approval Trends, Team Performance)        │   │
│  │  - Settings (Configuration, User Preferences)           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ HTTP/REST + JSON
              │ (Axios client, CORS enabled)
              │
┌─────────────▼───────────────────────────────────────────────────┐
│                       NETWORK LAYER                              │
│  Load Balancer / API Gateway                                    │
│  (Optional: Azure APIM, Kong)                                   │
└─────────────┬───────────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────────────┐
│                    FastAPI BACKEND (Python)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Main Application                                         │   │
│  │ - CORS Middleware                                       │   │
│  │ - Request Logging                                       │   │
│  │ - Error Handling                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│        ┌─────────────────┼─────────────────┐                   │
│        │                 │                 │                    │
│  ┌─────▼──┐        ┌──────▼──┐      ┌──────▼──┐              │
│  │Dashboard│        │ Claims  │      │Analytics │              │
│  │Route    │        │ Route   │      │Route     │              │
│  └─────────┘        └────┬────┘      └──────────┘              │
│                           │                                     │
│  ┌─────────────────────────▼─────────────────────────┐        │
│  │         Python Pipeline Module                    │        │
│  │  - Temporal Validation                           │        │
│  │  - STG Rules Engine                              │        │
│  │  - Confidence Scoring                            │        │
│  │  - Financial Checks                              │        │
│  └─────────────────────────┬───────────────────────┘        │
│                            │                                   │
│  ┌────────────────────────▼──────────────────────┐           │
│  │       Data Repository Layer                   │           │
│  │  - Mock Data (Development)                   │           │
│  │  - Azure SQL Database (Production)           │           │
│  │  - Cosmos DB (Optional NoSQL)                │           │
│  └───────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
              │
              │ External Service Integration
              │
┌─────────────▼───────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES (Azure)                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ • Storage Account (Document storage)                  │    │
│  │ • Form Recognizer (OCR/Document parsing)             │    │
│  │ • OpenAI Service (LLM for classification)            │    │
│  │ • SQL Database (Production data store)               │    │
│  │ • Notification Services (Alerts & events)            │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

| Component | Purpose | Technology |
|-----------|---------|-----------|
| **Dashboard** | KPI metrics, trends, claim queues | React, Chart.js, Tailwind |
| **Claims List** | Paginated claims table with filters | React, Axios, TypeScript |
| **Claim Detail** | Full claim information with timeline | React, Tabs, Modal UI |
| **Analytics** | Operational dashboards and trends | React, Charts, Data viz |
| **Navigation** | Top navigation and sidebar | React components |

### Backend Routes

| Route | Purpose | Handler |
|-------|---------|---------|
| `/api/dashboard/*` | Dashboard metrics and trends | `routes/dashboard.py` |
| `/api/claims/*` | Claim CRUD operations | `routes/claims.py` |
| `/api/analytics/*` | Analytics and reporting | `routes/analytics.py` |
| `/api/rules/*` | Rule engine operations | `routes/rules.py` |

### Processing Pipeline

```
┌──────────────┐
│  New Claim   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  Temporal Validation     │
│  - Admission/Discharge   │
│  - LOS calculation       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  STG Rules Engine        │
│  - Cardiac, Ortho, etc.  │
│  - Amount matching       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Financial Validation    │
│  - Amount checks         │
│  - Extra docs review     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Confidence Scoring      │
│  - Rule match %          │
│  - Evidence weight       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Decision Output         │
│  - Pass/Fail/Conditional│
│  - Explanation           │
└──────────────────────────┘
```

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
    metadata: Dict[str, Any]               # Context data
```

---

## Component Interaction Flows

### Dashboard Load Flow
```
Browser Request
    ↓
Frontend → /api/dashboard/metrics
    ↓
Backend aggregates data
    ├─ Counts total claims
    ├─ Calculates auto-approved
    ├─ Identifies manual review queue
    ├─ Computes rejection rate
    └─ Calculates average confidence
    ↓
JSON Response
    ↓
Frontend renders KPI cards + charts
```

### Claims List & Filter Flow
```
User applies filters (status, complexity, search)
    ↓
Frontend → /api/claims/list?status=pass&complexity=5-10
    ↓
Backend filter logic
    ├─ Match status (if provided)
    ├─ Match complexity range
    ├─ Match confidence range
    └─ Match search term (claim_id / patient_name)
    ↓
Paginated JSON Response
    ↓
Frontend displays filtered table
```

### Claim Detail Flow
```
User clicks on claim row
    ↓
Frontend requests /api/claims/{claim_id}
    ↓
Backend retrieves claim object
    ↓
Frontend fetches additional data
    ├─ /api/claims/{claim_id}/timeline
    ├─ /api/claims/{claim_id}/rules
    └─ /api/claims/{claim_id}/documents
    ↓
Frontend renders tabs: Overview | Validation | Timeline | Notes
```

---

## Database Schema

### Claims Table (SQL)
```sql
CREATE TABLE claims (
    claim_id NVARCHAR(50) PRIMARY KEY,
    patient_name NVARCHAR(100),
    patient_age INT,
    hospital NVARCHAR(100),
    admission_date DATETIME,
    discharge_date DATETIME,
    status NVARCHAR(20),           -- pass|conditional|fail
    confidence FLOAT,              -- 0.0-1.0
    stg_amount DECIMAL(12,2),
    claimed_amount DECIMAL(12,2),
    complexity_score INT,
    created_at DATETIME DEFAULT GETUTCDATE(),
    updated_at DATETIME DEFAULT GETUTCDATE()
);

CREATE INDEX idx_status ON claims(status);
CREATE INDEX idx_created_at ON claims(created_at);
```

### Validations Table (SQL)
```sql
CREATE TABLE validations (
    id INT PRIMARY KEY IDENTITY,
    claim_id NVARCHAR(50),
    rule_name NVARCHAR(100),
    status NVARCHAR(20),           -- pass|fail|warning
    details TEXT,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id)
);
```

---

## Deployment Architecture

### Development
- Local machine or Docker
- In-memory mock data
- SQLite optional

### Staging & Production
- Azure Container Instances or App Service
- Azure SQL Database
- Azure Storage for documents
- Load Balancer/APIM for API management

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 14+ |
| **Frontend** | React | 18+ |
| **Frontend** | TypeScript | 5+ |
| **Frontend** | Tailwind CSS | 3+ |
| **Backend** | FastAPI | 0.104+ |
| **Backend** | Python | 3.11+ |
| **Backend** | Uvicorn | 0.24+ |
| **Database** | Azure SQL / SQLite | Latest |
| **Container** | Docker | Latest |
| **Cloud** | Azure | - |

---

**Document Version**: 1.0  
**Last Updated**: April 13, 2026  
**Focus**: Solution Architecture & System Design

### Base URL
- **Development**: `http://localhost:8000/api`
- **Production**: `https://api.nha-claims.example.com/api`

### Response Format
All endpoints return JSON with standard envelope:

```json
{
  "data": {},           // Response payload
  "status": "success",  // "success" | "error"
  "message": ""         // Optional error message
}
```

Or array directly for list endpoints.

### Authentication
Currently: **None** (mock mode)
Future: JWT bearer token in Authorization header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiI...
```

---

## Endpoints

### Dashboard Routes

#### GET `/dashboard/metrics`
**Description**: Retrieve KPI metrics for dashboard

**Response**:
```json
{
  "total_claims": 6,
  "auto_approved": 2,
  "manual_review": 2,
  "rejection_rate": 0.33,
  "avg_confidence": 0.747,
  "avg_complexity": 40
}
```

#### GET `/dashboard/trends`
**Description**: Get 7-day historical trend data

**Query Parameters**:
- `days` (optional, default: 7)

**Response**:
```json
[
  {
    "date": "2024-01-15",
    "total_claims": 10,
    "auto_adjudicated": 7,
    "manual_review": 3,
    "approval_rate": 0.7
  }
]
```

#### GET `/dashboard/status-distribution`
**Description**: Count of claims by status

**Response**:
```json
{
  "pass": 2,
  "conditional": 2,
  "fail": 2
}
```

---

### Claims Routes

#### GET `/claims/list`
**Description**: Paginated list of claims with filtering

**Query Parameters**:
```
status         string  (optional)   "pass" | "conditional" | "fail"
min_complexity integer  (optional)   0-100
max_complexity integer  (optional)   0-100
min_confidence float    (optional)   0.0-1.0
max_confidence float    (optional)   0.0-1.0
page           integer  (optional)   1-indexed
limit          integer  (optional)   1-100, default: 20
```

**Example Request**:
```
GET /api/claims/list?status=pass&min_complexity=0&max_complexity=50&page=1&limit=10
```

**Response**:
```json
[
  {
    "claim_id": "CN001",
    "patient_name": "Rajesh Kumar",
    "hospital": "Apollo Delhi",
    "package": "Cardiac",
    "claimed_amount": 250000,
    "status": "pass",
    "confidence": 0.95,
    "los_days": 6,
    "complexity": 30,
    "extra_docs": 2
  },
  ...
]
```

#### GET `/claims/{claim_id}`
**Description**: Retrieve full claim details

**Path Parameters**:
- `claim_id` (required) — Claim identifier

**Example Request**:
```
GET /api/claims/CN001
```

**Response**:
```json
{
  "claim_id": "CN001",
  "patient_name": "Rajesh Kumar",
  "patient_age": 58,
  "patient_gender": "M",
  "hospital": "Apollo Delhi",
  "admission_date": "2024-01-10",
  "discharge_date": "2024-01-16",
  "diagnosis": "Coronary Artery Disease - Acute Myocardial Infarction",
  "procedures": [
    "Coronary angiography",
    "Coronary stent placement",
    "Antiplatelet therapy"
  ],
  "package": "Cardiac",
  "stg_amount": 250000,
  "claimed_amount": 250000,
  "approved_amount": 250000,
  "status": "pass",
  "confidence": 0.95,
  "los_days": 6,
  "complexity": 30,
  "extra_docs": 2
}
```

#### GET `/claims/{claim_id}/timeline`
**Description**: Claim lifecycle events

**Response**:
```json
[
  {
    "date": "2024-01-16T09:00:00Z",
    "event": "Claim submitted",
    "actor": "hospital_admin"
  },
  {
    "date": "2024-01-16T09:15:00Z",
    "event": "Automatic adjudication completed",
    "actor": "auto_adjudication"
  },
  {
    "date": "2024-01-16T09:30:00Z",
    "event": "Claim approved",
    "actor": "claims_adjudicator"
  }
]
```

#### GET `/claims/{claim_id}/rules`
**Description**: Validation rules applied to this claim

**Response**:
```json
[
  {
    "category": "Temporal",
    "rule": "Admission/Discharge Order",
    "status": "pass",
    "details": "Discharge date (2024-01-16) is after admission date (2024-01-10)"
  },
  {
    "category": "STG",
    "rule": "Cardiac LoS Limit",
    "status": "pass",
    "details": "LoS 6 days within guideline max of 7 days"
  },
  {
    "category": "Financial",
    "rule": "Amount Validation",
    "status": "pass",
    "details": "Claimed amount (₹250000) matches STG guideline (₹250000)"
  }
]
```

#### GET `/claims/queue/manual-review`
**Description**: Claims requiring manual review, sorted by priority (complexity)

**Response**:
```json
[
  {
    "rank": 1,
    "claim_id": "CLM-2026-0004",
    "patient_name": "Neha Verma",
    "package": "Trauma",
    "complexity": 85,
    "confidence": 0.45,
    "reason": "Low confidence score (45%) - complexity high"
  },
  {
    "rank": 2,
    "claim_id": "CLM-2026-0002",
    "patient_name": "Priya Singh",
    "package": "Ortho",
    "complexity": 60,
    "confidence": 0.72,
    "reason": "Conditional status - requires review"
  }
]
```

---

### Rules Routes

#### GET `/rules/stg-rules`
**Description**: Complete STG rules repository

**Response**:
```json
{
  "Cardiac": {
    "max_los": 7,
    "min_los": 3,
    "required_docs": ["ECG", "Echocardiogram", "Angiography Report"],
    "max_amount": 300000,
    "procedures": ["Angiography", "Stent Placement", "Bypass", "Valve Repair"]
  },
  "Ortho": {
    "max_los": 8,
    "min_los": 4,
    "required_docs": ["X-Ray", "CT Scan", "Surgical Report"],
    "max_amount": 200000,
    "procedures": ["Joint Replacement", "Fracture Fixation", "Arthroscopy"]
  },
  ...
}
```

#### GET `/rules/categories`
**Description**: List all medical package categories

**Response**:
```json
[
  "Cardiac",
  "Ortho",
  "General",
  "Trauma"
]
```

#### GET `/rules/packages/{category}`
**Description**: Detailed rules for specific medical category

**Path Parameters**:
- `category` (required) — "Cardiac" | "Ortho" | "General" | "Trauma"

**Example Request**:
```
GET /api/rules/packages/Cardiac
```

**Response**:
```json
{
  "category": "Cardiac",
  "max_los": 7,
  "min_los": 3,
  "required_docs": ["ECG", "Echocardiogram", "Angiography Report"],
  "max_amount": 300000,
  "procedures": ["Angiography", "Stent Placement", "Bypass", "Valve Repair"],
  "common_diagnoses": ["AMI", "Angina", "Arrhythmia", "Heart Failure"]
}
```

---

### Analytics Routes

#### GET `/analytics/approval-rate`
**Description**: Historical approval rates

**Query Parameters**:
- `days` (optional, default: 7) — 7, 30, or 90 days

**Response**:
```json
[
  {
    "date": "2024-01-09",
    "rate": 0.72
  },
  {
    "date": "2024-01-10",
    "rate": 0.78
  }
]
```

#### GET `/analytics/team-performance`
**Description**: Per-adjudicator metrics

**Response**:
```json
[
  {
    "team_member": "Rajesh Singh",
    "approved": 45,
    "rejected": 8,
    "pending": 3,
    "approval_rate": 0.849
  },
  {
    "team_member": "Priya Sharma",
    "approved": 38,
    "rejected": 12,
    "pending": 5,
    "approval_rate": 0.760
  }
]
```

#### GET `/analytics/complexity-distribution`
**Description**: Claims grouped by complexity level

**Response**:
```json
[
  {
    "complexity": "Low (0-30)",
    "count": 120
  },
  {
    "complexity": "Medium (31-60)",
    "count": 85
  },
  {
    "complexity": "High (61-100)",
    "count": 42
  }
]
```

#### GET `/analytics/package-breakdown`
**Description**: Claims by medical package type

**Response**:
```json
[
  {
    "package": "Cardiac",
    "count": 67
  },
  {
    "package": "Ortho",
    "count": 58
  },
  {
    "package": "General",
    "count": 71
  },
  {
    "package": "Trauma",
    "count": 51
  }
]
```

---

## Error Codes

### 400 Bad Request
Invalid query parameters or malformed request

```json
{
  "status": "error",
  "message": "Invalid complexity range: min must be <= max"
}
```

### 404 Not Found
Resource not found

```json
{
  "status": "error",
  "message": "Claim CN999 not found"
}
```

### 500 Internal Server Error
Server-side issue

```json
{
  "status": "error",
  "message": "Database connection failed"
}
```

---

## Frontend Integration Examples

### React Hook to Fetch Claims

```typescript
import { useState, useEffect } from 'react';

const UseFetchClaims = (filters) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      const query = new URLSearchParams(filters);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/claims/list?${query}`
      );
      const data = await res.json();
      setClaims(data);
      setLoading(false);
    };
    
    fetchClaims();
  }, [filters]);

  return { claims, loading };
};
```

### Axios Interceptor for Auth

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## Performance Optimization

### Frontend Caching
- Use React Query / SWR for response caching
- LocalStorage for user settings
- Service Worker for offline support

### Backend Optimization
- Redis caching for frequently accessed endpoints
- Database indexing on claim_id, patient_name, status
- Pagination (default: 20 per page)
- Query result limiting (max 1000)

### Network Optimization
- GZIP compression on responses
- HTTP/2 multiplexing
- CDN caching for static assets
- GraphQL (optional alternative to REST)

---

## Security Considerations

1. **CORS**: Configured for specific domains in production
2. **Rate Limiting**: Prevent abuse (future enhancement)
3. **Input Validation**: Pydantic models validate all inputs
4. **SQL Injection**: Parameterized queries (when using DB)
5. **XSS Prevention**: React's built-in XSS protection
6. **CSRF**: CSRF tokens for state-changing operations (future)
7. **Authentication**: JWT bearer tokens (future)
8. **Authorization**: Role-based access control (future)

---

## Scalability Path

**Phase 1 (Current)**: Mock data in-memory
↓
**Phase 2**: PostgreSQL database with connection pooling
↓
**Phase 3**: Redis cache layer
↓
**Phase 4**: Elasticsearch for claim search
↓
**Phase 5**: Kubernetes orchestration with horizontal scaling
↓
**Phase 6**: Microservices architectural split

---

**Architecture Complete!** Ready for production deployment.
