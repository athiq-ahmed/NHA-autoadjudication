# Developer Quick Reference

## 🚀 Commands Cheat Sheet

### Startup

**All-in-One (Docker)**
```bash
docker-compose up --build
```

**Backend Only**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Only**
```bash
cd frontend
npm install
npm run dev
```

### Development URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Application UI |
| Backend API | http://localhost:8000 | REST API |
| API Docs | http://localhost:8000/docs | Swagger UI |
| API Redoc | http://localhost:8000/redoc | Alternative API docs |

### Build Commands

**Frontend**
```bash
npm run build      # Production build
npm run lint       # ESLint check
npm run dev        # Development mode
npm start          # Production start
```

**Backend**
```bash
python -m pytest                        # Run tests
python -m uvicorn app.main:app --reload # Dev mode
gunicorn app.main:app                   # Production (Gunicorn)
```

### Docker

```bash
# View running containers
docker ps

# View logs
docker logs container_name
docker-compose logs -f                  # Follow logs

# Stop
docker-compose down

# Clean up
docker system prune -a

# Rebuild
docker-compose up --build --force-recreate
```

### Git & Deploy

```bash
# Azure
az webapp deployment source config-zip

# AWS
eb deploy

# Kubernetes
kubectl apply -f deployment.yaml
kubectl rollout restart deployment/nha-claims-backend
```

---

## 🔍 API Testing

### Using cURL

```bash
# Health check
curl http://localhost:8000/health

# Dashboard metrics
curl http://localhost:8000/api/dashboard/metrics

# Claims list with filters
curl "http://localhost:8000/api/claims/list?status=pass&limit=10"

# Specific claim
curl http://localhost:8000/api/claims/CN001

# Claim timeline
curl http://localhost:8000/api/claims/CN001/timeline

# Rules for claim
curl http://localhost:8000/api/claims/CN001/rules

# Team performance
curl http://localhost:8000/api/analytics/team-performance
```

### Using Postman/Insomnia

1. **Base URL**: `http://localhost:8000/api`
2. **Headers** (if auth enabled):
   ```
   Authorization: Bearer YOUR_TOKEN
   Content-Type: application/json
   ```
3. **No auth required** for current mock mode

### Using Browser DevTools

1. Open DevTools (F12)
2. Network tab
3. Reload page
4. Inspect requests/responses
5. Filter by XHR to see API calls

---

## 📝 Common Code Patterns

### React Hook for API Call

```typescript
import { useState, useEffect } from 'react';

const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/claims/list`)
    .then(res => res.json())
    .then(data => {
      setData(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
}, []);
```

### FastAPI Endpoint

```python
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

@router.get("/claims/list")
def list_claims(
    status: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100)
):
    """Get paginated claims list"""
    # Fetch from mock_data or database
    claims = get_claims_filtered(status=status)
    return claims[:limit]
```

### Tailwind Component

```typescript
// components/Card.tsx
export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}

// Usage
<Card className="hover:shadow-lg transition-shadow">
  <h2>Title</h2>
</Card>
```

---

## 🐛 Debugging Checklist

### Frontend Issues

**Blank Page / Won't Load**
```bash
# Check errors
Open DevTools (F12) → Console → Red errors?

# Check API connectivity
Network tab → API requests → 200 status?

# Restart dev server
Ctrl+C in terminal
npm run dev
```

**Slow Performance**
```bash
# Check bundle size
npm run build
# View .next/static/ output

# Check Network tab
- Are requests throttled? (DevTools Settings)
- Are responses >1MB? (Optimize API)
```

**Styling Issues**
```bash
# Clear Tailwind cache
rm -rf .next node_modules
npm install
npm run dev

# Check tailwind.config.js is present
# Verify globals.css @tailwind imports exist
```

### Backend Issues

**504 Bad Gateway**
```bash
# Is Uvicorn running?
ps aux | grep uvicorn
lsof -i :8000

# Restart
python -m uvicorn app.main:app --reload
```

**Import Errors**
```bash
# Install dependencies
pip install -r requirements.txt

# Check Python version
python --version  # Should be 3.9+

# Check virtual environment
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
```

**CORS Error**
```bash
# Check backend .env
cat backend/.env | grep CORS_ORIGINS

# Should include localhost:3000
CORS_ORIGINS=http://localhost:3000

# Restart backend after editing
```

---

## 📐 Folder Navigation

```
# From project root to backend
cd backend/app/routes
# Edit dashboard.py

# Return to root
cd ../../..

# To frontend
cd frontend/app/claims
# Edit page.tsx

# Component development
cd ../../components
# Edit Navbar.tsx
```

---

## 🔑 Environment Variables

### Backend (.env)

```bash
# Required
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000

# Optional
DEBUG=True
ENV=development
MODE=mock
```

### Frontend (.env.local)

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional
NODE_ENV=development
```

---

## 📊 Data Structure Reference

### Claim Object

```javascript
{
  claim_id: "CN001",
  patient_name: "Rajesh Kumar",
  hospital: "Apollo Delhi",
  package: "Cardiac",
  status: "pass",           // "pass" | "conditional" | "fail"
  confidence: 0.95,         // 0.0 - 1.0
  complexity: 30,           // 1-100
  los_days: 6,
  claimed_amount: 250000,
  stg_amount: 250000
}
```

### API Response Format

```javascript
// Lists (claims, analytics)
[
  { claim_id: "CN001", ... },
  { claim_id: "CLM-2026-0002", ... }
]

// Single objects (dashboard metrics)
{
  total_claims: 6,
  auto_approved: 2,
  manual_review: 2,
  rejection_rate: 0.33,
  avg_confidence: 0.747
}

// Errors
{
  status: "error",
  message: "Claim not found"
}
```

---

## 🚨 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ModuleNotFoundError: No module named 'fastapi'` | Dependencies not installed | `pip install -r requirements.txt` |
| `npm ERR! 404` | NPM registry issue | `npm cache clean --force && npm install` |
| `Address already in use :8000` | Port occupied | Change PORT in .env or kill process |
| `CORS error in browser` | Backend CORS not configured | Update CORS_ORIGINS in .env |
| `Blank page on localhost:3000` | Frontend not running | `npm run dev` in frontend dir |
| `TypeError: Cannot read property 'map'` | Data not loaded | Check API response in Network tab |
| `next: command not found` | Next.js not installed | `npm install` in frontend dir |
| `python: command not found` | Python not in PATH | Install Python 3.9+ or check PATH |

---

## 🔑 Key Files to Know

**Backend Entry Point**
```
backend/app/main.py         ← FastAPI app setup
```

**Frontend Entry Point**
```
frontend/app/page.tsx       ← Dashboard homepage
frontend/app/layout.tsx     ← Root layout
```

**Configuration**
```
backend/.env                ← Backend config
frontend/.env.local         ← Frontend config
docker-compose.yml          ← Docker setup
```

**UI Components**
```
frontend/components/Navbar.tsx
frontend/components/KPICard.tsx
```

**API Routes**
```
backend/app/routes/dashboard.py   ← Dashboard endpoints
backend/app/routes/claims.py      ← Claims endpoints
backend/app/routes/rules.py       ← Rules endpoints
backend/app/routes/analytics.py   ← Analytics endpoints
```

---

## 🧪 Testing Quick Guide

### Manual Testing

```bash
# 1. Start both servers
docker-compose up

# 2. Test dashboard
curl http://localhost:8000/api/dashboard/metrics

# 3. Test claims list
curl http://localhost:8000/api/claims/list

# 4. Visit frontend
open http://localhost:3000
```

### Automated Testing

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test
```

### API Testing

```bash
# Import Postman collection
# Or use Swagger UI at http://localhost:8000/docs
```

---

## 📈 Performance Tips

### Frontend
- Use React.lazy() for code splitting
- Implement image optimization
- Use SWR or React Query for smart caching
- Profile with DevTools → Performance tab

### Backend
- Add Redis caching for endpoints
- Use pagination (default: 20/page)
- Add database indexing
- Monitor with /metrics endpoint

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Update all environment variables (.env files)
- [ ] Run `npm run build` (frontend)
- [ ] Run tests: `pytest` (backend)
- [ ] Check all API endpoints: Swagger UI
- [ ] Test mobile responsiveness
- [ ] Verify CORS settings match domain
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Create database backup strategy
- [ ] Document rollback procedure

---

## 📚 Reference Documentation

| Resource | Link |
|----------|------|
| FastAPI Docs | https://fastapi.tiangolo.com |
| Next.js Docs | https://nextjs.org/docs |
| React Hooks | https://react.dev/reference/react/hooks |
| Tailwind CSS | https://tailwindcss.com/docs |
| Recharts | https://recharts.org |
| Docker Compose | https://docs.docker.com/compose |
| Kubernetes | https://kubernetes.io/docs |

---

## 💡 Pro Tips

1. **Use VS Code REST Client Extension** for API testing without Postman
2. **Use Next.js built-in debugging** with `next/script` component
3. **Enable Dark Mode** in browser DevTools for easier debugging at night
4. **Use `?_debug=true`** on backend endpoints (if enabled) for detailed logs
5. **Keep `.env` files in `.gitignore`** - never commit secrets
6. **Use `git diff`** before commits to catch unintended changes
7. **Make small, focused commits** rather than large batches
8. **Test on mobile** early and often

---

## ⚡ Quick Wins

### Add a New Page

1. Create `/frontend/app/newpage/page.tsx`
2. Add route to Navbar
3. Import Navbar component
4. Fetch data from API
5. Render with Tailwind classes

### Add a New API Endpoint

1. Create route in `/backend/app/routes/newroute.py`
2. Define Pydantic model for request/response
3. Implement endpoint logic
4. Import route in `/backend/app/main.py`
5. Test with curl or Swagger UI

### Add a New Visualization

1. Component → Recharts import
2. Feed it data from state/API
3. Wrap in ResponsiveContainer
4. Style with Tailwind className

---

**You're all set! Happy coding! 🎉**

For detailed help, see:
- INTEGRATION_TESTING.md (Step-by-step testing)
- ARCHITECTURE.md (API reference)
- DEPLOYMENT.md (Production deployment)
