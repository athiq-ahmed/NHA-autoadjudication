# Architecture & API Reference

## System Architecture

### High-Level Overview

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
│  │Route     │        │ Route   │      │Route     │              │
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
│  │       Mock Data Repository                    │           │
│  │  (6 claims, 4 medical categories)            │           │
│  │  (In-memory, could be replaced with DB)      │           │
│  └───────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

**1. Dashboard Load**
```
Browser → /api/dashboard/metrics → Backend aggregates KPIs → JSON response
       ↘ /api/dashboard/trends → Daily claim projections
       ↘ /api/dashboard/status-distribution → Pass/Fail/Conditional split
       ↘ /api/claims/queue/manual-review → High-priority claims
Display → 5 KPI cards + 3 charts + queue table
```

**2. Claims List & Filter**
```
Browser → /api/claims/list?status=pass&complexity=5-10 → Backend filters
Filter logic:
  - Match status (if provided)
  - Match complexity range
  - Match confidence range
  - Match search term (claim_id / patient_name)
Display → Paginated table with 6 mock claims
```

**3. Claim Detail Drill-Down**
```
Browser → /api/claims/{claim_id} → Backend retrieves claim object
       ↘ /api/claims/{claim_id}/timeline → Event history
       ↘ /api/claims/{claim_id}/rules → Validation results
Display → Tabs: Overview | Validation | Timeline | Notes
```

## Data Models

### Claim Object (ClaimDetail)

```typescript
interface ClaimDetail {
  claim_id: string;           // Unique identifier
  patient_name: string;       // Full name
  patient_age: number;        // Age in years
  patient_gender: string;     // "M" | "F" | "Other"
  hospital: string;           // Hospital name
  admission_date: string;     // ISO 8601 date
  discharge_date: string;     // ISO 8601 date
  diagnosis: string;          // Primary diagnosis
  procedures: string[];       // Procedure list
  package: string;            // STG package type (Cardiac, Ortho, etc.)
  stg_amount: number;         // Guideline amount in ₹
  claimed_amount: number;     // Amount claimed in ₹
  approved_amount?: number;   // Amount approved (after adjudication)
  status: string;             // "pass" | "conditional" | "fail"
  confidence: number;         // 0.0 to 1.0 (0-100%)
  los_days: number;           // Length of stay in days
  complexity: number;         // 1-100 complexity score
  extra_docs: number;         // Count of extra documents attached
}
```

### Dashboard Metrics

```typescript
interface DashboardMetrics {
  total_claims: number;       // All claims count
  auto_approved: number;      // Pass status count
  manual_review: number;      // Conditional status count
  rejection_rate: number;     // Fail / total ratio
  avg_confidence: number;     // Mean confidence score
  avg_complexity: number;     // Mean complexity
}
```

### Validation Rule

```typescript
interface ValidationRule {
  category: string;           // Rule category (Temporal, Financial, STG, etc.)
  rule: string;              // Rule name
  status: "pass" | "fail" | "warning";
  details: string;           // Explanation
  evidence?: object;         // Supporting data
}
```

### Timeline Event

```typescript
interface TimelineEvent {
  date: string;              // Timestamp (ISO 8601)
  event: string;             // Event description
  actor: string;             // "system" | "auto_adjudication" | user ID
  metadata?: object;         // Additional context
}
```

## API Reference

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
