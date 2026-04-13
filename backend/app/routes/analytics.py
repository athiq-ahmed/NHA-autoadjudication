from fastapi import APIRouter
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../..'))
from src.pipeline import load_application_state, summarize_claim_portfolio
from src.models import ClaimMode, Decision

router = APIRouter()

@router.get("/approval-rate")
async def get_approval_rate(mode: str = "mock"):
    """Get approval rate and trends."""
    try:
        app_state = load_application_state(ClaimMode(mode))
        
        total = len(app_state.claims)
        passed = sum(1 for c in app_state.claims if c.status == Decision.PASS)
        failed = sum(1 for c in app_state.claims if c.status == Decision.FAIL)
        conditional = sum(1 for c in app_state.claims if c.status == Decision.CONDITIONAL)
        
        return {
            "total": total,
            "passed": passed,
            "failed": failed,
            "conditional": conditional,
            "approval_rate": (passed / total * 100) if total > 0 else 0,
            "rejection_rate": (failed / total * 100) if total > 0 else 0,
            "conditional_rate": (conditional / total * 100) if total > 0 else 0,
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/team-performance")
async def get_team_performance(mode: str = "mock"):
    """Get high-level team performance metrics."""
    try:
        app_state = load_application_state(ClaimMode(mode))
        portfolio = summarize_claim_portfolio(app_state.claims)
        
        total_processed = len(app_state.metrics)
        avg_daily_volume = sum(m.total_claims for m in app_state.metrics) / total_processed if total_processed > 0 else 0
        
        return {
            "auto_approval_pct": (portfolio["auto_adjudicated"] / portfolio["total_claims"] * 100) if portfolio["total_claims"] > 0 else 0,
            "manual_review_pct": (portfolio["manual_review"] / portfolio["total_claims"] * 100) if portfolio["total_claims"] > 0 else 0,
            "avg_confidence": portfolio["avg_confidence"],
            "avg_daily_volume": avg_daily_volume,
            "processing_time_hours": 2.4,
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/complexity-distribution")
async def get_complexity_distribution(mode: str = "mock"):
    """Get distribution of claim complexity."""
    try:
        app_state = load_application_state(ClaimMode(mode))
        
        low = sum(1 for c in app_state.claims if c.complexity_score < 40)
        medium = sum(1 for c in app_state.claims if 40 <= c.complexity_score < 75)
        high = sum(1 for c in app_state.claims if c.complexity_score >= 75)
        
        return {
            "low": low,
            "medium": medium,
            "high": high,
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/package-breakdown")
async def get_package_breakdown(mode: str = "mock"):
    """Get claims by package type."""
    try:
        app_state = load_application_state(ClaimMode(mode))
        
        packages = {}
        for claim in app_state.claims:
            pkg = claim.financials.package_name
            if pkg not in packages:
                packages[pkg] = {"count": 0, "total_claimed": 0, "total_approved": 0}
            packages[pkg]["count"] += 1
            packages[pkg]["total_claimed"] += claim.financials.claimed_amount
            packages[pkg]["total_approved"] += claim.financials.approved_amount
        
        return {"packages": packages}
    except Exception as e:
        return {"error": str(e)}
