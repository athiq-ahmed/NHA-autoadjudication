from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from src.mock_data import build_daily_metrics, build_mock_claims
from src.models import ChatMessage, ClaimMode, ClaimRecord, DailyMetric, Decision
from src.services import AzureOCRService, AzureSettings, MockOCRService, NotificationService, OCRService


@dataclass
class AppState:
    mode: ClaimMode
    claims: list[ClaimRecord]
    metrics: list[DailyMetric]
    ocr_description: str


def load_application_state(mode: ClaimMode) -> AppState:
    settings = AzureSettings()
    claims = build_mock_claims()
    metrics = build_daily_metrics()
    ocr_service: OCRService

    if mode == ClaimMode.LIVE:
        ocr_service = AzureOCRService(settings)
        live_claims = [claim.model_copy(update={"mode": ClaimMode.LIVE}) for claim in claims]
        return AppState(mode=mode, claims=live_claims, metrics=metrics, ocr_description=ocr_service.describe())

    ocr_service = MockOCRService()
    return AppState(mode=mode, claims=claims, metrics=metrics, ocr_description=ocr_service.describe())


def summarize_claim_portfolio(claims: list[ClaimRecord]) -> dict[str, float]:
    total = len(claims)
    auto = sum(1 for claim in claims if claim.confidence >= 0.85 and claim.status == Decision.PASS)
    manual = total - auto
    avg_confidence = round(sum(claim.confidence for claim in claims) / total, 2) if total else 0.0
    return {
        "total_claims": total,
        "auto_adjudicated": auto,
        "manual_review": manual,
        "avg_confidence": avg_confidence,
    }


def rank_manual_queue(claims: list[ClaimRecord]) -> list[ClaimRecord]:
    manual_claims = [claim for claim in claims if claim.status != Decision.PASS or claim.confidence < 0.85]
    return sorted(manual_claims, key=lambda claim: (claim.status != Decision.FAIL, -claim.complexity_score, claim.confidence))


def claim_chat_response(claim: ClaimRecord, prompt: str) -> ChatMessage:
    prompt_lower = prompt.lower()

    if "status" in prompt_lower:
        return ChatMessage(
            role="assistant",
            content=(
                f"Claim {claim.claim_id} is `{claim.status.value}` with confidence {claim.confidence:.0%}. "
                f"Recommended action: {claim.recommended_action}"
            ),
        )
    if "why" in prompt_lower or "reason" in prompt_lower:
        failed_rules = [rule for rule in claim.rules if not rule.passed]
        if failed_rules:
            top_rule = failed_rules[0]
            return ChatMessage(
                role="assistant",
                content=f"Primary issue: {top_rule.title}. Rationale: {top_rule.rationale}",
            )
    if "timeline" in prompt_lower or "date" in prompt_lower:
        timeline = ", ".join(f"{event.sequence}. {event.label} on {event.event_date}" for event in claim.timeline)
        return ChatMessage(role="assistant", content=f"Episode timeline: {timeline}.")
    if "document" in prompt_lower or "extra" in prompt_lower:
        extras = [f"{doc.file_name} page {doc.page_number}" for doc in claim.documents if doc.extra_document]
        if extras:
            return ChatMessage(role="assistant", content=f"Extra or non-required documents: {', '.join(extras)}.")
        return ChatMessage(role="assistant", content="No extra or non-required documents were flagged.")
    if "score" in prompt_lower or "marking" in prompt_lower:
        summary = "; ".join(f"{key}: {value}" for key, value in claim.scoring_summary.items())
        return ChatMessage(role="assistant", content=f"Evaluation rubric reference: {summary}.")

    return ChatMessage(
        role="assistant",
        content="Ask about claim status, rules, timeline, extra documents, or the scoring rubric.",
    )


def build_notification_preview(claim: ClaimRecord) -> str:
    return NotificationService().build_summary(claim.claim_id, claim.status.value, claim.recommended_action)


# Temporal Validation
def validate_chronological_order(claim: ClaimRecord) -> bool:
    """Check if timeline events are in proper chronological order."""
    if not claim.timeline:
        return True
    
    for i in range(len(claim.timeline) - 1):
        try:
            current_date = _parse_event_date(claim.timeline[i].event_date)
            next_date = _parse_event_date(claim.timeline[i + 1].event_date)
            if current_date > next_date:
                return False
        except (ValueError, AttributeError):
            continue
    return True


def validate_admission_discharge(claim: ClaimRecord) -> bool:
    """Check if discharge date >= admission date."""
    if not claim.admission_date or not claim.discharge_date:
        return True
    return claim.discharge_date >= claim.admission_date


def _parse_event_date(date_str: str) -> datetime:
    """Parse date strings in DD-MMM-YY or DD-MMM-YYYY format."""
    for fmt in ["%d-%b-%y", "%d-%b-%Y"]:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    raise ValueError(f"Could not parse date: {date_str}")


# Standard Treatment Guidelines (STG) Rules Engine
STG_RULES = {
    "CARDIAC": {
        "CARD-401": {"max_los": 7, "min_procedures": 1, "required_docs": ["Discharge summary", "ECG", "Echocardiography"]},
        "CARD-501": {"max_los": 3, "min_procedures": 1, "required_docs": ["Echocardiography", "Procedure Note"]},
    },
    "ORTHO": {
        "ORTHO-201": {"max_los": 4, "min_procedures": 1, "required_docs": ["Discharge summary", "Operative Report"]},
        "ORTHO-315": {"max_los": 10, "min_procedures": 1, "required_docs": ["Operative Note", "Implant Sticker"]},
    },
    "GENERAL": {
        "GEN-101": {"max_los": 2, "min_procedures": 1, "required_docs": ["Discharge summary"]},
    },
    "TRAUMA": {
        "TRAUMA-901": {"max_los": 20, "min_procedures": 1, "required_docs": ["Trauma Assessment", "OR Log", "Implant Sticker"]},
    },
}


def validate_stg_rules(claim: ClaimRecord) -> tuple[bool, list[str]]:
    """Validate claim against STG rules based on package code."""
    failures = []
    package_code = claim.financials.package_code
    
    # Determine category from package code
    category = None
    for cat, packages in STG_RULES.items():
        if package_code in packages:
            category = cat
            break
    
    if not category:
        return True, []
    
    rules = STG_RULES[category][package_code]
    
    # Check length of stay
    if claim.length_of_stay_days > rules["max_los"]:
        failures.append(f"LoS {claim.length_of_stay_days} exceeds limit {rules['max_los']}")
    
    # Check required documents presence
    claim_doc_types = [doc.doc_type for doc in claim.documents]
    for required_doc in rules["required_docs"]:
        if not any(required_doc.lower() in doc.lower() for doc in claim_doc_types):
            failures.append(f"Missing required document: {required_doc}")
    
    return len(failures) == 0, failures


def validate_financial_consistency(claim: ClaimRecord) -> tuple[bool, list[str]]:
    """Validate financial amounts make sense."""
    failures = []
    
    if claim.financials.claimed_amount <= 0:
        failures.append("Claimed amount must be positive")
    
    if claim.financials.claimed_amount > 1000000:
        failures.append("Claimed amount exceeds reasonable limits")
    
    return len(failures) == 0, failures
