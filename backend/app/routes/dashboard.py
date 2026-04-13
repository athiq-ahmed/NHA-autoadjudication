from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../..'))
from src.pipeline import load_application_state, summarize_claim_portfolio, rank_manual_queue
from src.models import ClaimMode, Decision

router = APIRouter()

class DashboardMetrics(BaseModel):
    total_claims: int
    auto_adjudicated: int
    manual_review: int
    avg_confidence: float
    pass_count: int
    fail_count: int
    conditional_count: int
    processing_time_hours: float

class DailyTrend(BaseModel):
    date: str
    total_claims: int
    auto_adjudicated: int
    manual_review: int

@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(mode: str = "mock"):
    try:
        app_state = load_application_state(ClaimMode(mode))
        portfolio = summarize_claim_portfolio(app_state.claims)
        
        pass_count = sum(1 for c in app_state.claims if c.status == Decision.PASS)
        fail_count = sum(1 for c in app_state.claims if c.status == Decision.FAIL)
        conditional_count = sum(1 for c in app_state.claims if c.status == Decision.CONDITIONAL)
        
        return DashboardMetrics(
            total_claims=portfolio["total_claims"],
            auto_adjudicated=portfolio["auto_adjudicated"],
            manual_review=portfolio["manual_review"],
            avg_confidence=portfolio["avg_confidence"],
            pass_count=pass_count,
            fail_count=fail_count,
            conditional_count=conditional_count,
            processing_time_hours=2.4,
        )
    except Exception as e:
        return DashboardMetrics(
            total_claims=0,
            auto_adjudicated=0,
            manual_review=0,
            avg_confidence=0.0,
            pass_count=0,
            fail_count=0,
            conditional_count=0,
            processing_time_hours=0.0,
        )

@router.get("/trends")
async def get_trends(mode: str = "mock"):
    try:
        app_state = load_application_state(ClaimMode(mode))
        trends = []
        for metric in app_state.metrics:
            trends.append({
                "date": metric.metric_date.isoformat(),
                "total_claims": metric.total_claims,
                "auto_adjudicated": metric.auto_adjudicated,
                "manual_review": metric.manual_review,
            })
        return {"trends": trends}
    except Exception as e:
        return {"trends": [], "error": str(e)}

@router.get("/status-distribution")
async def get_status_distribution(mode: str = "mock"):
    try:
        app_state = load_application_state(ClaimMode(mode))
        return {
            "pass": sum(1 for c in app_state.claims if c.status == Decision.PASS),
            "conditional": sum(1 for c in app_state.claims if c.status == Decision.CONDITIONAL),
            "fail": sum(1 for c in app_state.claims if c.status == Decision.FAIL),
        }
    except Exception as e:
        return {"pass": 0, "conditional": 0, "fail": 0, "error": str(e)}
