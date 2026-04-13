# Integration Testing Guide

## Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:3000`
- Mock mode enabled (default)

## Test Sequence

### 1. Backend Health Check
```bash
curl http://localhost:8000/health
# Expected: {"status": "ok"}

curl http://localhost:8000/docs
# Opens Swagger UI for interactive API testing
```

### 2. Dashboard Page (http://localhost:3000)
**Test Points:**
- [ ] Page loads without errors (check browser console)
- [ ] 5 KPI cards display metrics
- [ ] Daily trend chart renders with 7-day data
- [ ] Status distribution bar chart shows Pass/Conditional/Fail counts
- [ ] Manual review queue lists 2-3 claims
- [ ] "Switch to Live Mode" button visible
- [ ] All API calls succeed (Network tab shows 200 responses)

**Expected API Calls:**
```
GET /api/dashboard/metrics → 200
GET /api/dashboard/trends → 200
GET /api/dashboard/status-distribution → 200
GET /api/claims/queue/manual-review → 200
```

### 3. Claims List Page (http://localhost:3000/claims)
**Test Points:**
- [ ] Table loads with 6 mock claims
- [ ] Claim IDs: CN001, CLM-2026-0002, ..., CLM-2026-0006
- [ ] Status filter works (select "Pass", see 2 rows; select "Fail", see 2 rows)
- [ ] Search filter works (type "CN001", see 1 row)
- [ ] Complexity range slider filters correctly
- [ ] Pagination works if >20 rows
- [ ] Click "Open" button on any row → navigates to detail page

**Expected Filters to Test:**
1. Status = Pass → 2 claims (CN001, CLM-2026-0003)
2. Status = Fail → 2 claims (CLM-2026-0004, CLM-2026-0006)
3. Search = "Cardiac" → 2 claims (CN001, CLM-2026-0005)
4. Status = Conditional → 2 claims (CLM-2026-0002, CLM-2026-0005)

### 4. Claim Detail Page (http://localhost:3000/claims/CN001)
**Test Points:**
- [ ] Breadcrumb navigation: "Back to Claims" works
- [ ] Claim header shows: CN001, patient name, hospital, status badge
- [ ] Overview tab displays:
  - Patient info (name, age, gender, diagnosis)
  - Hospital details (admission/discharge dates, LoS)
  - Procedures list (cardiac bypass, valve replacement, etc.)
  - Financial summary (STG amount, claimed amount, confidence score)
  
- [ ] Validation tab shows:
  - Temporal validation rules (pass/fail indicators)
  - STG rules for Cardiac package
  - Extra document requirements
  
- [ ] Timeline tab shows:
  - Event history (submitted, auto-approved, etc.)
  - Timestamps and actor (system/user)
  
- [ ] Notes tab:
  - Textarea for adjudication notes
  - Save/Discard buttons functional
  
- [ ] Action buttons: Approve, Request More Info, Reject (visible on Overview tab)

**Expected API Calls:**
```
GET /api/claims/CN001 → 200 (ClaimDetail object)
GET /api/claims/CN001/timeline → 200 (Timeline array)
GET /api/claims/CN001/rules → 200 (ValidationRule array)
```

### 5. Analytics Page (http://localhost:3000/analytics)
**Test Points:**
- [ ] Page loads without errors
- [ ] Date range buttons (7, 30, 90 days) work
- [ ] Approval rate trend line chart renders
- [ ] Team performance bar chart shows adjudicator names (3-5 bars)
- [ ] Complexity distribution pie chart shows 5 segments
- [ ] Package breakdown pie chart shows Cardiac/Ortho/General/Trauma
- [ ] Summary stats display: Avg Approval Rate, Total Claims, Active Team Members

**Expected API Calls:**
```
GET /api/analytics/approval-rate?days=7 → 200
GET /api/analytics/team-performance → 200
GET /api/analytics/complexity-distribution → 200
GET /api/analytics/package-breakdown → 200
```

### 6. Settings Page (http://localhost:3000/settings)
**Test Points:**
- [ ] Mode selector (mock/live) loads
- [ ] Language dropdown (English, Hindi, Tamil)
- [ ] Dark mode toggle
- [ ] Rows per page selector
- [ ] Notification checkbox and toggle sub-options
- [ ] Confidence threshold slider (0-100%)
- [ ] Auto-approve checkbox with warning message
- [ ] Save Settings button → shows success message for 3 seconds
- [ ] Reset to Defaults button → resets form

**LocalStorage Persistence:**
- [ ] Change mode to "live"
- [ ] Save
- [ ] Refresh page → mode still "live"
- [ ] Change theme to "dark"
- [ ] Save
- [ ] Refresh page → theme persists

### 7. Navigation Tests
**Sidebar Links:**
- [ ] Dashboard → http://localhost:3000
- [ ] Claims → http://localhost:3000/claims
- [ ] Analytics → http://localhost:3000/analytics
- [ ] Settings → http://localhost:3000/settings
- [ ] Mobile menu toggle (on <1024px) collapses/expands

### 8. API Integration Tests

**Test each backend endpoint individually:**

```bash
# Dashboard Metrics
curl -s http://localhost:8000/api/dashboard/metrics | jq '.'

# Dashboard Trends
curl -s http://localhost:8000/api/dashboard/trends | jq '.'

# Claims List (with filters)
curl -s "http://localhost:8000/api/claims/list?status=pass&limit=10" | jq '.'

# Claims Detail
curl -s http://localhost:8000/api/claims/CN001 | jq '.'

# Claim Timeline
curl -s http://localhost:8000/api/claims/CN001/timeline | jq '.'

# Claim Rules
curl -s http://localhost:8000/api/claims/CN001/rules | jq '.'

# STG Rules
curl -s http://localhost:8000/api/rules/stg-rules | jq '.'

# Analytics
curl -s http://localhost:8000/api/analytics/approval-rate | jq '.'
curl -s http://localhost:8000/api/analytics/team-performance | jq '.'
```

### 9. Error Handling Tests

**Test error scenarios:**
1. Invalid claim ID:
   - Navigate to: http://localhost:3000/claims/INVALID
   - Expected: "Claim Not Found" message

2. Stop backend API:
   - Kill FastAPI process
   - Try loading any page
   - Expected: Loading spinner, then error notice

3. Network throttling (Chrome DevTools):
   - Slow 3G throttling
   - Navigate to /claims
   - Expected: Loading state visible, eventual success

### 10. Performance Checks

**Lighthouse Audit (Chrome DevTools):**
- [ ] Performance > 80
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90

**Bundle Size:**
```bash
cd frontend
npm run build
# Check .next/static output size (should be <2MB total)
```

## Mock Data Validation

Expected 6 claims in all list views:

| Claim ID | Patient | Hospital | Status | Confidence | LoS |
|----------|---------|----------|--------|------------|-----|
| CN001 | Rajesh Kumar | Apollo Delhi | Pass | 95% | 6 |
| CLM-2026-0002 | Priya Singh | Max Health | Conditional | 72% | 8 |
| CLM-2026-0003 | Amit Patel | Fortis Bangalore | Pass | 91% | 3 |
| CLM-2026-0004 | Neha Verma | Columbia Asia | Fail | 45% | 12 |
| CLM-2026-0005 | Sanjay Gupta | Apollo Mumbai | Conditional | 68% | 4 |
| CLM-2026-0006 | Deepak Rao | Medanta | Fail | 38% | 1 |

## Success Criteria

✅ **All tests pass when:**
1. All 4 pages load without JavaScript errors
2. All API endpoints return 200 status with correct data
3. Filters and navigation work seamlessly
4. Settings persist across page reloads
5. No CORS errors in browser console
6. Charts render with real data
7. Mobile layout is responsive (<1024px)
8. Confidence threshold settings affect UI labels

## Troubleshooting

### Common Issues

**Issue**: CORS errors in browser console
```
Access-Control-Allow-Origin missing
```
**Solution**: Ensure backend `.env` has `CORS_ORIGINS=http://localhost:3000`

**Issue**: API returns 404 Not Found
**Solution**: Check backend is running on port 8000: `curl http://localhost:8000/health`

**Issue**: Charts not rendering
**Solution**: 
1. Open browser DevTools → Network tab
2. Check if Recharts CSS/JS loaded
3. Check for JavaScript errors in Console

**Issue**: Claim detail shows no data
**Solution**:
1. Verify claim ID exists in `/api/claims/list`
2. Check Network tab for 200/404 responses
3. Clear browser cache and reload

## Monitoring & Logs

**Backend Logs:**
```bash
# Terminal running Backend
# Will show: 
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

**Frontend Logs:**
```bash
# Terminal running Frontend
# Will show:
# ▲ Next.js 14.x
# - Local:        http://localhost:3000
```

**Browser Console (F12):**
- Should show NO errors
- May show some Next.js hydration warnings (acceptable)

## Final Validation

Run this script to verify all endpoints:

```bash
#!/bin/bash
echo "Testing all API endpoints..."

endpoints=(
  "http://localhost:8000/health"
  "http://localhost:8000/api/dashboard/metrics"
  "http://localhost:8000/api/dashboard/trends"
  "http://localhost:8000/api/claims/list"
  "http://localhost:8000/api/claims/CN001"
  "http://localhost:8000/api/rules/stg-rules"
  "http://localhost:8000/api/analytics/approval-rate"
)

for endpoint in "${endpoints[@]}"; do
  response=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint")
  if [ $response -eq 200 ]; then
    echo "✓ $endpoint"
  else
    echo "✗ $endpoint ($response)"
  fi
done
```

Expected output: All ✓

---

**Integration Testing Complete** when all tests pass! 🎉
