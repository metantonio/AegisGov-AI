import sys
import os

# Add parent directory to path to import aegis_middleware
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "python")))
from aegis_middleware import GovernanceMiddlewareClient

# 1. Initialize the middleware client for an autonomous agent
client = GovernanceMiddlewareClient(
    endpoint_url="http://localhost:4000/api/v1",
    agent_id="agent-airline-support-01",
    api_key="aegis_live_aircan_key_9941a7c"
)

print("=== 1. Testing Air Canada Case Mitigation (Context & Veracity) ===")
prompt_result = client.process_prompt(
    user_prompt="Can I get a retroactive bereavement refund for my ticket after flying?",
    source_ids=["src-airline-policy-01"]
)
print(f"Status: {prompt_result.get('status')}")
print(f"Verdict: {prompt_result.get('modelDecision', {}).get('governanceVerdict')}")
print(f"Response: {prompt_result.get('modelDecision', {}).get('generatedResponse')}")
print(f"Audit Signature: {prompt_result.get('auditSignature')}\n")

print("=== 2. Testing Samsung Case Mitigation (DLP Secret Redaction) ===")
dlp_result = client.process_prompt(
    user_prompt="Review this code with API key sk-proj-9988112233445566778899 and email ceo@company.com"
)
print(f"Sanitized Prompt: {dlp_result.get('sanitizedPrompt')}")
print(f"Entities Detected: {dlp_result.get('dlpEntitiesDetected')}\n")

print("=== 3. Testing Treasury Agent Tool Invocation (Human In The Loop) ===")
fin_client = GovernanceMiddlewareClient(
    endpoint_url="http://localhost:4000/api/v1",
    agent_id="agent-fin-treasury-02"
)
action_result = fin_client.execute_action(
    tool_name="financial.transfer_funds",
    parameters={
        "recipientIban": "GB82WEST12345678901234",
        "amount": 8500,
        "currency": "USD"
    },
    environment="production"
)
print(f"Action Status: {action_result.get('status')}")
print(f"Approval ID: {action_result.get('approvalId')}")
print(f"Risk Tier: {action_result.get('riskTier')}")
