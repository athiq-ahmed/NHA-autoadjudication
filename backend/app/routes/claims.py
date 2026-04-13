from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../..'))
from src.pipeline import load_application_state, rank_manual_queue
from src.models import ClaimMode, Decision

router = APIRouter()

class ClaimSummary(BaseModel):
    claim_id: str
    patient_name: str
    hospital: str
    package: str
    claimed_amount: float
    status: str
    confidence: float
    los_days: int
    complexity: int
    extra_docs: int

class ClaimDetail(BaseModel):
    claim_id: str
    patient_name: str
    patient_id: str
    age: int
    gender: str
    diagnosis: str
    procedures: List[str]
    hospital: str
    doctor: str
    state: str
    claimed_amount: float
    approved_amount: float
    package_code: str
    package_name: str
    status: str
    confidence: float
    los_days: int
    complexity: int
    recommended_action: str
    escalation_reason: Optional[str]
    admission_date: Optional[str]
    discharge_date: Optional[str]

@router.get("/list", response_model=List[ClaimSummary])
async def get_claims_list(
    mode: str = "mock",
    status: Optional[str] = None,
    min_complexity: int = 0,
    max_complexity: int = 100,
    min_confidence: float = 0.0,
    max_confidence: float = 1.0,
    page: int = 0,
    limit: int = 20,
):
    try:
        app_state = load_application_state(ClaimMode(mode))
        
        # Filter claims
        filtered = []
        for claim in app_state.claims:
            if status and claim.status.value != status:
                continue
            if not (min_complexity <= claim.complexity_score <= max_complexity):
                continue
            if not (min_confidence <= claim.confidence <= max_confidence):
                continue
            
            extra_docs = sum(1 for doc in claim.documents if doc.extra_document)
            filtered.append(ClaimSummary(
                claim_id=claim.claim_id,
                patient_name=claim.patient.patient_name,
                hospital=claim.provider.hospital_name,
                package=claim.financials.package_name,
                claimed_amount=claim.financials.claimed_amount,
                status=claim.status.value,
                confidence=claim.confidence,
                los_days=claim.length_of_stay_days,
                complexity=claim.complexity_score,
                extra_docs=extra_docs,
            ))
        
        # Paginate
        start = page * limit
        return filtered[start:start + limit]
    except Exception as e:
        return []

@router.get("/{claim_id}", response_model=ClaimDetail)
async def get_claim_detail(claim_id: str, mode: str = "mock"):
    try:
        app_state = load_application_state(ClaimMode(mode))
        claim = next((c for c in app_state.claims if c.claim_id == claim_id), None)
        
        if not claim:
            return {"error": "Claim not found"}, 404
        
        extra_docs = sum(1 for doc in claim.documents if doc.extra_document)
        return ClaimDetail(
            claim_id=claim.claim_id,
            patient_name=claim.patient.patient_name,
            patient_id=claim.patient.patient_id,
            age=claim.patient.age,
            gender=claim.patient.gender,
            diagnosis=claim.diagnosis,
            procedures=claim.procedures,
            hospital=claim.provider.hospital_name,
            doctor=claim.provider.treating_doctor,
            state=claim.provider.state,
            claimed_amount=claim.financials.claimed_amount,
            approved_amount=claim.financials.approved_amount,
            package_code=claim.financials.package_code,
            package_name=claim.financials.package_name,
            status=claim.status.value,
            confidence=claim.confidence,
            los_days=claim.length_of_stay_days,
            complexity=claim.complexity_score,
            recommended_action=claim.recommended_action,
            escalation_reason=claim.escalation_reason,
            admission_date=claim.admission_date.isoformat() if claim.admission_date else None,
            discharge_date=claim.discharge_date.isoformat() if claim.discharge_date else None,
        )
    except Exception as e:
        return {"error": str(e)}, 500

@router.get("/{claim_id}/timeline")
async def get_claim_timeline(claim_id: str, mode: str = "mock"):
    try:
        app_state = load_application_state(ClaimMode(mode))
        claim = next((c for c in app_state.claims if c.claim_id == claim_id), None)
        
        if not claim:
            return {"error": "Claim not found"}, 404
        
        timeline = []
        for event in claim.timeline:
            timeline.append({
                "sequence": event.sequence,
                "label": event.label,
                "date": event.event_date,
                "source_doc": event.source_label,
                "validity": event.temporal_validity,
                "confidence": event.confidence,
            })
        return {"timeline": timeline}
    except Exception as e:
        return {"error": str(e)}, 500

@router.get("/{claim_id}/rules")
async def get_claim_rules(claim_id: str, mode: str = "mock"):
    try:
        app_state = load_application_state(ClaimMode(mode))
        claim = next((c for c in app_state.claims if c.claim_id == claim_id), None)
        
        if not claim:
            return {"error": "Claim not found"}, 404
        
        rules = []
        for rule in claim.rules:
            evidence_items = []
            for ev in rule.evidence:
                evidence_items.append({
                    "source_doc": ev.source_doc_id,
                    "page": ev.page_number,
                    "box": ev.bounding_box,
                    "snippet": ev.snippet,
                    "confidence": ev.confidence,
                })
            
            rules.append({
                "rule_id": rule.rule_id,
                "title": rule.title,
                "passed": rule.passed,
                "severity": rule.severity,
                "rationale": rule.rationale,
                "evidence": evidence_items,
            })
        return {"rules": rules}
    except Exception as e:
        return {"error": str(e)}, 500

@router.get("/queue/manual-review")
async def get_manual_review_queue(mode: str = "mock"):
    try:
        app_state = load_application_state(ClaimMode(mode))
        queue = rank_manual_queue(app_state.claims)
        
        result = []
        for claim in queue[:10]:
            result.append({
                "claim_id": claim.claim_id,
                "patient": claim.patient.patient_name,
                "status": claim.status.value,
                "confidence": claim.confidence,
                "complexity": claim.complexity_score,
                "issue": claim.escalation_reason or claim.recommended_action,
            })
        return {"queue": result}
    except Exception as e:
        return {"queue": [], "error": str(e)}
