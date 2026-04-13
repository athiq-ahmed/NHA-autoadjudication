from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Decision(str, Enum):
    PASS = "Pass"
    CONDITIONAL = "Conditional"
    FAIL = "Fail"


class ClaimMode(str, Enum):
    MOCK = "Mock"
    LIVE = "Live"


class Evidence(BaseModel):
    source_doc_id: str
    page_number: int
    bounding_box: str
    snippet: str
    confidence: float


class DocumentArtifact(BaseModel):
    doc_id: str
    file_name: str
    page_number: int
    doc_type: str
    language: str
    quality: str
    required: bool = True
    extra_document: bool = False
    summary: str


class TimelineEvent(BaseModel):
    sequence: int
    label: str
    event_date: str
    source_doc_id: str
    source_label: str
    temporal_validity: str
    confidence: float


class RuleResult(BaseModel):
    rule_id: str
    title: str
    passed: bool
    severity: str
    rationale: str
    evidence: list[Evidence] = Field(default_factory=list)


class PatientInfo(BaseModel):
    patient_name: str
    patient_id: str
    age: int
    gender: str


class ProviderInfo(BaseModel):
    hospital_name: str
    treating_doctor: str
    state: str


class Financials(BaseModel):
    claimed_amount: float
    approved_amount: float
    package_code: str
    package_name: str


class ClaimRecord(BaseModel):
    claim_id: str
    mode: ClaimMode
    status: Decision
    confidence: float
    complexity_score: int
    patient: PatientInfo
    provider: ProviderInfo
    payer: str
    tpa: str
    diagnosis: str
    procedures: list[str]
    admission_date: Optional[date] = None
    discharge_date: Optional[date] = None
    length_of_stay_days: int
    documents: list[DocumentArtifact]
    timeline: list[TimelineEvent]
    rules: list[RuleResult]
    financials: Financials
    extracted_fields: dict[str, str]
    notes: list[str]
    recommended_action: str
    scoring_summary: dict[str, str] = Field(default_factory=dict)
    escalation_reason: Optional[str] = None


class DailyMetric(BaseModel):
    metric_date: date
    total_claims: int
    auto_adjudicated: int
    manual_review: int
    pass_count: int
    conditional_count: int
    fail_count: int


class ChatMessage(BaseModel):
    role: str
    content: str
