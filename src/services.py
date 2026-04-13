from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass
class AzureSettings:
    storage_account_url: str = os.getenv("AZURE_STORAGE_ACCOUNT_URL", "")
    storage_container: str = os.getenv("AZURE_STORAGE_CONTAINER", "")
    form_recognizer_endpoint: str = os.getenv("AZURE_FORM_RECOGNIZER_ENDPOINT", "")
    form_recognizer_key: str = os.getenv("AZURE_FORM_RECOGNIZER_KEY", "")
    openai_endpoint: str = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    openai_deployment: str = os.getenv("AZURE_OPENAI_DEPLOYMENT", "")

    @property
    def is_live_ready(self) -> bool:
        return all(
            [
                self.storage_account_url,
                self.storage_container,
                self.form_recognizer_endpoint,
                self.form_recognizer_key,
                self.openai_endpoint,
                self.openai_deployment,
            ]
        )


class OCRService:
    def describe(self) -> str:
        raise NotImplementedError


class MockOCRService(OCRService):
    def describe(self) -> str:
        return "Mock OCR using seeded extraction and evidence artifacts."


class AzureOCRService(OCRService):
    def __init__(self, settings: AzureSettings):
        self.settings = settings

    def describe(self) -> str:
        if self.settings.is_live_ready:
            return "Azure AI Document Intelligence is configured for live processing."
        return "Azure configuration is incomplete. Live mode is running with placeholder behavior."


class NotificationService:
    def build_summary(self, claim_id: str, status: str, action: str) -> str:
        return f"Claim {claim_id} finished with status {status}. Next action: {action}"
