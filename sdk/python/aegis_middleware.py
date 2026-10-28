"""
AegisGov AI - Python Middleware SDK
ISO/IEC 42001 & AI Data Governance Client Library

Allows any Python application, LangChain agent, LlamaIndex pipeline, or custom bot
to connect through the governance middleware for automated guardrails, DLP, and audit trails.
"""

import json
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List


class GovernanceMiddlewareClient:
    """
    Middleware client to route LLM prompts and agent actions through the AegisGov AI gateway.
    """

    def __init__(self, endpoint_url: str = "http://localhost:4000/api/v1", agent_id: str = "agent-airline-support-01", api_key: Optional[str] = None):
        self.endpoint_url = endpoint_url.rstrip("/")
        self.agent_id = agent_id
        self.api_key = api_key

    def _post(self, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.endpoint_url}/{path.lstrip('/')}"
        data = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "AegisGov-Python-SDK/1.0"
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            raw_err = e.read().decode("utf-8")
            try:
                err_json = json.loads(raw_err)
                return err_json
            except Exception:
                raise RuntimeError(f"HTTP {e.code}: {raw_err}")

    def process_prompt(
        self,
        user_prompt: str,
        source_ids: Optional[List[str]] = None,
        purpose: str = "customer_support",
        target_model: str = "claude-3-5-sonnet"
    ) -> Dict[str, Any]:
        """
        Pass a user prompt through the 6-stage AI governance chain.
        Performs DLP (PII/Secret masking), verifies grounded sources, and returns a verified decision.
        """
        payload = {
            "agentId": self.agent_id,
            "userPrompt": user_prompt,
            "sourceIds": source_ids,
            "purpose": purpose,
            "targetModel": target_model
        }
        return self._post("gateway/process-prompt", payload)

    def execute_action(
        self,
        tool_name: str,
        parameters: Dict[str, Any],
        environment: str = "production",
        source_ids: Optional[List[str]] = None,
        system: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Intercept and govern agent tool actions.
        Enforces least privilege, sandbox isolation, exposure caps, and triggers Human-In-The-Loop approval when required.
        """
        payload = {
            "agentId": self.agent_id,
            "toolName": tool_name,
            "parameters": parameters,
            "environment": environment,
            "sourceIds": source_ids,
            "system": system
        }
        return self._post("gateway/execute-action", payload)

    def check_approval_status(self, approval_id: str) -> Optional[Dict[str, Any]]:
        """
        Polls or checks the status of an approval ticket.
        """
        url = f"{self.endpoint_url}/gateway/approvals"
        req = urllib.request.Request(url, headers={"User-Agent": "AegisGov-Python-SDK/1.0"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for item in data.get("approvals", []):
                if item.get("id") == approval_id:
                    return item
        return None
