# AegisGov AI - ISO/IEC 42001 & AI Data Governance Middleware

[![ISO/IEC 42001:2023](https://img.shields.io/badge/Standard-ISO%2FIEC%2042001%3A2023-blue.svg)](https://www.iso.org/standard/81230.html)
[![NIST AI RMF 1.0](https://img.shields.io/badge/Framework-NIST%20AI%20RMF%201.0-purple.svg)](https://www.nist.gov/itl/ai-risk-management-framework)
[![EU AI Act](https://img.shields.io/badge/Compliance-EU%20AI%20Act%20(2024%2F1689)-emerald.svg)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689)
[![GDPR Compliant](https://img.shields.io/badge/Privacy-GDPR%20%2F%20RGPD-cyan.svg)](https://gdpr-info.eu/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A robust, enterprise-grade Data & AI Governance Middleware Gateway built strictly upon the principles and controls defined in the **ISO/IEC 42001 Practical Guide for Data and AI Governance**. 

AegisGov AI acts as an intermediary **security and compliance gateway** that intercepts all LLM prompts, context retrievals, and autonomous agent tool actions before they interact with internal data sources or execute against enterprise APIs.

---

## 🏛️ System Architecture

### 1. The 6-Stage AI Governance Chain
The fundamental principle of the governance middleware is that **no subsequent stage can bypass the restrictions established in previous stages**:

```
[1. DATA & SOURCES]  -->  Origin · Quality · Owner · Classification · Retention
        ↓
[2. IDENTITY & ACCESS] -->  Technical Service Identity · Least Privilege · Expiring Tokens · Kill Switch
        ↓
[3. LINEAGE & CONTEXT] -->  DLP PII Scrubbing · Freshness SLA · Content Hash · Transformations
        ↓
[4. LLM MODEL]         -->  Grounding Verification · Hallucination Guards · Purpose Limitation
        ↓
[5. AGENT & EXECUTION] -->  Tool Whitelist · Environment Sandboxing · Exposure Limits · Human Approval
        ↓
[6. EVIDENCE & AUDIT]  -->  Correlated Trace · Cryptographic SHA-256 Chained Ledger · Forensics
```

### 2. Operational Cycle
```
OBSERVE  ──>  PROPOSE  ──>  VALIDATE  ──>  APPROVE  ──>  EXECUTE  ──>  VERIFY
(Source)     (Permissions)   (Context)      (Gate)        (Action)     (Audit)
```

### 3. The Three Architecture Planes
- **Control Plane**: Identity & API keys, action policies, risk thresholds, scopes, secrets vault, and global/per-agent kill switches.
- **Execution Plane**: Gateway proxy, DLP (Data Loss Prevention) regex/pattern scrubbing, sandbox environment isolation, and human-in-the-loop approval queues.
- **Evidence Plane**: Correlated audit traces linking all 6 stages, SHA-256 tamper-evident blockchain-style chaining, and incident replay forensics.

---

## 🛡️ Real-World Failure Mitigations Built-In

| Real Incident | Governance Dimension | What Happened | Enforced Middleware Mitigation |
| :--- | :--- | :--- | :--- |
| **Air Canada (2024)** | Context & Veracity | Chatbot invented retroactive bereavement fare policy. Airline held legally liable. | Mandatory grounded source verification. If official policy rules are unverified, request escalates to human specialist rather than hallucinating. |
| **Samsung (2023)** | Access & DLP | Employees pasted proprietary chip designs and source code into external generative AI. | Outbound DLP filter scrubs API keys, emails, IBANs, and blocks proprietary hardware architecture code snippets. |
| **Zillow Offers (2021)** | Model & Financial Risk | Algorithmic home buying model generated runaway financial exposure exceeding margins. | Hard policy exposure caps. Actions exceeding monetary thresholds (e.g. $10,000) are automatically rejected or gated for 2-person executive approval. |
| **Replit / SaaStr (2025)** | Permissions & Execution | Agent executed destructive code directly in production without guardrails. | Strict environment separation: destructive database operations (`DROP TABLE`, `UPDATE`, `DELETE`) are strictly forbidden in `production` and isolated to `sandbox`. |

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- Python >= 3.9 (optional, for Python SDK)

### Installation & Running

```bash
# 1. Install root dependencies
npm install

# 2. Run both Middleware Server and Web Dashboard concurrently
npm run dev
```

- **Web Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Middleware API**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **Interactive OpenAPI Explorer**: [http://localhost:4000/api/v1/docs](http://localhost:4000/api/v1/docs)
- **OpenAPI JSON Spec**: [http://localhost:4000/api/v1/docs/openapi.json](http://localhost:4000/api/v1/docs/openapi.json)

---

## 🔌 Connecting Any External App (Middleware SDKs)

### Python Integration
```python
from aegis_middleware import GovernanceMiddlewareClient

# Connect your agent or application to the governance gateway
client = GovernanceMiddlewareClient(
    endpoint_url="http://localhost:4000/api/v1",
    agent_id="agent-airline-support-01",
    api_key="aegis_live_aircan_key_9941a7c"
)

# Mode A: Route prompt with DLP and grounding checks
res = client.process_prompt(
    user_prompt="Can I get a bereavement fare refund?",
    source_ids=["src-airline-policy-01"]
)
print("Sanitized Prompt:", res["sanitizedPrompt"])
print("Audit Signature:", res["auditSignature"])

# Mode B: Intercept action tool call (enforces risk tier and approval gates)
action = client.execute_action(
    tool_name="financial.transfer_funds",
    parameters={"recipientIban": "GB82WEST12345678901234", "amount": 8500, "currency": "USD"},
    environment="production"
)
print("Status:", action["status"]) # Returns 'PENDING_APPROVAL' with approvalId ticket
```

### Node.js / TypeScript Integration
```typescript
import { GovernanceMiddlewareClient } from './aegis-middleware';

const client = new GovernanceMiddlewareClient({
  endpointUrl: 'http://localhost:4000/api/v1',
  agentId: 'agent-fin-treasury-02'
});

// Intercepts tool call, evaluates policies and triggers Human-In-The-Loop if required
const result = await client.executeAction({
  toolName: 'financial.transfer_funds',
  parameters: { recipientIban: 'GB82WEST12345678901234', amount: 8500, currency: 'USD' },
  environment: 'production'
});

console.log(result.status); // 'PENDING_APPROVAL'
```

### Raw REST / cURL Integration
```bash
# Process Prompt (LLM Guardrail)
curl -X POST http://localhost:4000/api/v1/gateway/process-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-airline-support-01",
    "userPrompt": "Can I claim a retroactive bereavement fare?",
    "sourceIds": ["src-airline-policy-01"]
  }'

# Intercept Tool Action
curl -X POST http://localhost:4000/api/v1/gateway/execute-action \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-fin-treasury-02",
    "toolName": "financial.transfer_funds",
    "parameters": {
      "recipientIban": "GB82WEST12345678901234",
      "amount": 8500,
      "currency": "USD"
    },
    "environment": "production"
  }'
```

---

## 🗄️ Connecting External Databases & Data Lakes (SQL, Snowflake, AWS, GCP)

AegisGov AI acts as a **Policy Enforcement Point (PEP)** and **Policy Decision Point (PDP)** in accordance with ISO/IEC 42001 and DAMA-DMBOK. It does not replace your storage engine; instead, it registers, inventories, and gates all queries and agent interactions before any bytes are retrieved or modified.

### 1. Data Source Registration (Control Plane)
Register any database, data warehouse, or cloud data lake via the REST API (`POST /api/v1/sources`) or the Data Catalog UI:

#### A. Relational SQL (PostgreSQL, MySQL, SQL Server)
```json
POST /api/v1/sources
{
  "name": "Production Customer Orders DB",
  "origin": "postgresql://postgres-primary.internal:5432/orders_db",
  "owner": "Data Engineering & Core Operations",
  "classification": "CONFIDENTIAL",
  "permittedPurposes": ["order_status_inquiries", "sales_analytics"],
  "qualityScore": 95,
  "retentionDays": 1095,
  "slaHours": 2,
  "sampleContent": "SCHEMA: orders(id UUID, customer_id UUID, amount DECIMAL, status VARCHAR)"
}
```

#### B. Snowflake Enterprise Data Warehouse
```json
POST /api/v1/sources
{
  "name": "Enterprise Data Warehouse - Financial Mart",
  "origin": "snowflake://xy12345.eu-west-1/FINANCE_DB/MART_REPORTING",
  "owner": "Treasury & Financial Planning",
  "classification": "RESTRICTED",
  "permittedPurposes": ["financial_audit", "quarterly_reporting"],
  "qualityScore": 99,
  "retentionDays": 3650,
  "slaHours": 1,
  "sampleContent": "TABLES: general_ledger, quarterly_revenues, tax_provisions"
}
```

#### C. AWS Data Lake (Amazon S3 / AWS Lake Formation / Athena)
```json
POST /api/v1/sources
{
  "name": "AWS Corporate Data Lake - Customer Telemetry",
  "origin": "arn:aws:s3:::corp-analytics-lake-eu-west-1/raw/telemetry/",
  "owner": "Cloud Architecture & Telemetry Team",
  "classification": "INTERNAL",
  "permittedPurposes": ["product_telemetry", "troubleshooting", "capacity_planning"],
  "qualityScore": 92,
  "retentionDays": 730,
  "slaHours": 6,
  "sampleContent": "PARQUET: user_id, event_type, session_duration, timestamp"
}
```

#### D. GCP Data Lake (Google Cloud Storage / BigQuery / Dataplex)
```json
POST /api/v1/sources
{
  "name": "BigQuery Customer 360 & Marketing Analytics",
  "origin": "gcp.bigquery://prj-data-platform-prod/analytics_eu/customer_360",
  "owner": "Customer Intelligence Team",
  "classification": "CONFIDENTIAL",
  "permittedPurposes": ["churn_prediction", "campaign_personalization"],
  "qualityScore": 94,
  "retentionDays": 1825,
  "slaHours": 4,
  "sampleContent": "DATASET: lifetime_value, last_login_date, engagement_tier"
}
```

---

### 2. Connection & Execution Architectural Patterns

To connect databases and data lakes to the governance workflow, you can choose between two main industry-standard patterns:

```
[ LLM Chat / AI Agent ]
           │
           │ 1. Request Tool / Prompt
           ▼
┌──────────────────────────────────────────────┐
│        AegisGov AI Governance Gateway        │
│  (Stages 1-6: DLP, RBAC/ABAC, Risk, Audit)   │
└──────────────────────┬───────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   [ Pattern A: Proxy ]      [ Pattern B: Broker ]
   AegisGov executes         AegisGov issues
   query with service role   short-lived scoped STS token
          │                         │
          └────────────┬────────────┘
                       ▼
    ┌──────────────────────────────────────┐
    │ SQL / Snowflake / AWS S3 / BigQuery  │
    └──────────────────────────────────────┘
```

1. **Pattern A: Governed Action Proxy (Recommended)**:
   - Your chat/agent application does **not** store direct connection strings or DB credentials.
   - The application registers a tool in AegisGov (e.g. `snowflake.query_financial_mart` or `s3.read_customer_telemetry`).
   - The application delegates execution to `POST /api/v1/gateway/execute-action`.
   - AegisGov verifies identity, scopes, DLP, and action policy. If approved, AegisGov runs the query using secure backend connectors and returns scrubbed results.
   
2. **Pattern B: JIT Scoped Credential Broker (STS / Workload Identity)**:
   - When an agent requests data access, it calls AegisGov's gateway.
   - Upon successful verification of the 6 stages, AegisGov's control plane uses AWS STS (`AssumeRole` with session policy), GCP Workload Identity / IAM Token Service, or Snowflake Scoped Access Tokens to generate a **time-limited (e.g. 15-minute), read-only token** restricted strictly to the authorized tables/buckets.
   - The agent executes its query directly against AWS Athena or BigQuery using that temporary token.

3. **Pattern C: Metadata & Schema Crawler Sync**:
   - Integrate data catalog metadata via scheduled sync jobs (e.g., AWS Glue Data Catalog, GCP Dataplex, Apache Atlas, or dbt).
   - Automatically sync column tags, PII classifications, and content hashes (`sha256`) directly into `POST /api/v1/sources`.

---

## 💬 LLM Chat Application Integration & Dynamic Access Decisioning

When building an external chat app powered by an LLM (e.g., LangChain, LlamaIndex, OpenAI Assistant, or custom Next.js/Streamlit chat), AegisGov AI acts as the **Gateway Intermediary** between the chat app, the LLM, and your enterprise data sources.

### 1. Communication Flow Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as End User
    participant Chat as LLM Chat App Backend
    participant Aegis as AegisGov AI Gateway
    participant LLM as External LLM (OpenAI / Claude / Gemini)
    participant Data as Databases / Data Lakes (Snowflake, AWS, GCP)

    User->>Chat: "Show me the last 5 transactions for client ACME Corp"
    
    rect rgb(235, 245, 255)
    Note over Chat,Aegis: Phase 1: Inbound Governance (DLP & Grounding Check)
    Chat->>Aegis: POST /gateway/process-prompt { agentId, userPrompt, sourceIds, purpose }
    Aegis->>Aegis: Scan DLP (PII), verify Kill Switch, check Source Whitelist
    Aegis-->>Chat: 200 OK { sanitizedPrompt, verifiedSources, correlationId }
    end

    Chat->>LLM: Dispatch sanitized prompt with grounding metadata
    LLM-->>Chat: Tool Call: db_query(target="snowflake", query="SELECT * FROM transactions WHERE client='ACME'")

    rect rgb(255, 245, 235)
    Note over Chat,Aegis: Phase 2: Action Policy & Access Decisioning
    Chat->>Aegis: POST /gateway/execute-action { agentId, toolName: "snowflake.query", parameters, environment }
    Aegis->>Aegis: Evaluate 6-Stage Governance Decision (Identity, Purpose, Risk, Limits)
    alt Action Exceeds Risk Threshold / Requires Human Review
        Aegis-->>Chat: 202 PENDING_APPROVAL { approvalId, riskTier: "HIGH" }
        Chat-->>User: "Your request requires Compliance Officer authorization. Ticket #approvalId created."
    else Action Forbidden (e.g. DROP TABLE or Unwhitelisted Source)
        Aegis-->>Chat: 403 BLOCKED { rejectionReason: "Source not permitted for agent scope" }
        Chat-->>User: "Access denied by enterprise AI governance policy."
    else Action Approved
        Aegis-->>Data: Execute audited query (or return approval signature)
        Data-->>Aegis: Query results
        Aegis-->>Chat: 200 EXECUTED { result: [...], auditSignature }
        Chat->>LLM: Synthesize final answer with query result
        LLM-->>Chat: Formatted response
        Chat-->>User: "Here are the last 5 transactions for ACME Corp..."
    end
    end
```

### 2. How AegisGov Decides Whether to Grant or Deny Access

When the chat application asks AegisGov for data access or tool execution, the middleware applies the **6-Stage Governance Chain** in strict sequential order:

| Stage | Verification Check | Decision Rule | Mitigation / Action |
| :--- | :--- | :--- | :--- |
| **Stage 1: Identity & Active Status** | `agentId`, API key, and token validity | Is the agent registered? Has the API token expired? Is the global or per-agent Kill Switch active? | Rejects with `401 Unauthorized` or `403 Kill Switch Active` if invalid. |
| **Stage 2: Source Whitelist** | `agent.allowedDataSources` | Is the requested SQL DB, Snowflake mart, or S3 bucket explicitly in the agent's allowed list? | Rejects with `403 Forbidden: Source not in agent whitelist`. |
| **Stage 3: Purpose Limitation (GDPR Art. 5)** | `req.purpose` vs `source.permittedPurposes` | Does the inquiry purpose (e.g. `customer_support`) match the legally declared purposes for that data source? | Blocks access if purpose does not align with compliance registration. |
| **Stage 4: Data Sensitivity Barrier** | `source.classification` vs `agent.riskTier` | If data source is `RESTRICTED`, does the calling agent possess `CRITICAL` risk tier clearance? | Lower-tier agents are barred from accessing restricted datasets. |
| **Stage 5: Action Policy & Risk Evaluation** | `policies.json` & parameter limits | 1. **Environment:** Are destructive operations (`DROP`, `DELETE`) blocked in `production`?<br>2. **Exposure:** Do requested parameters exceed monetary or volume limits?<br>3. **Human Gate:** Does this tool require Human-in-the-Loop review? | Escalates to `PENDING_APPROVAL` queue for human sign-off, or returns `BLOCKED`. |
| **Stage 6: Cryptographic Evidence Ledger** | SHA-256 Chained Hash | Has every request parameter, user prompt, and evaluation outcome been chained into the immutable audit trail? | Generates an immutable correlation ID and tamper-evident audit record. |

### 3. Example: Chat Application Integration Code (TypeScript / Express / FastAPI)

```typescript
// chat-backend/src/chatService.ts
import axios from 'axios';

const AEGIS_URL = process.env.AEGIS_GATEWAY_URL || 'http://localhost:4000/api/v1';
const AGENT_ID = 'agent-customer-support-chat';

export async function handleUserChatMessage(userId: string, userMessage: string) {
  // Step 1: Pre-prompt governance check & DLP sanitation
  const promptCheck = await axios.post(`${AEGIS_URL}/gateway/process-prompt`, {
    agentId: AGENT_ID,
    userPrompt: userMessage,
    sourceIds: ['src-crm-customers-02', 'src-airline-policy-01'],
    purpose: 'customer_support'
  });

  if (promptCheck.data.status === 'BLOCKED') {
    return { reply: "Operation halted by AI safety & governance controls." };
  }

  const sanitizedPrompt = promptCheck.data.sanitizedPrompt;

  // Step 2: Send sanitized prompt to your LLM (OpenAI, Claude, etc.)
  // ... LLM evaluates user prompt and returns a tool call to query client details ...
  const intendedTool = 'crm.query_account';
  const toolParams = { customerId: 'CUST-98421' };

  // Step 3: Intercept tool call before touching the database
  const actionDecision = await axios.post(`${AEGIS_URL}/gateway/execute-action`, {
    agentId: AGENT_ID,
    toolName: intendedTool,
    parameters: toolParams,
    environment: 'production',
    sourceIds: ['src-crm-customers-02']
  });

  if (actionDecision.status === 202) {
    // Action requires human authorization (e.g. sensitive VIP account access)
    return {
      reply: `Your request involves elevated data access. Authorization ticket #${actionDecision.data.approvalId} has been submitted for compliance review.`
    };
  }

  if (actionDecision.data.status === 'BLOCKED') {
    return {
      reply: `Access denied by policy: ${actionDecision.data.rejectionReason}`
    };
  }

  // Step 4: Execute query securely using the audited result
  return {
    reply: `Client details retrieved securely. Audit trace: ${actionDecision.data.auditSignature}`
  };
}
```

---

---

## 📊 Features & Views

1. **Executive Overview**: Real-time KPIs, 3 Architecture Planes summary, real-world failure mitigations status, and the 5 quarterly review questions from ISO 42001 Section 10.
2. **Middleware Simulator & Playground**: Live testing workbench with preloaded failure presets (Air Canada, Samsung DLP, Zillow Exposure, SaaStr DB Drop, Treasury Wire Transfer).
3. **Human-in-the-Loop Approvals**: Real-time queue for compliance officers to review and authorize high-impact/critical agent actions.
4. **Data Catalog & Lineage (Stage 1 & 3)**: Registered data sources, classification badges (Public, Internal, Confidential, Restricted), quality scores, and SHA-256 content hashes.
5. **Agent Identity & Access (Stage 2)**: Technical service identities, least privilege scopes, token expirations, and 1-click individual and global Emergency Kill Switches.
6. **Action Risk Matrix & Policies (Stage 5)**: Rules across CRM, ERP, Data Lake, Email, Production DB, and Financial APIs.
7. **Cryptographic Evidence & Audit Ledger (Stage 6)**: Correlated traces linking all 6 stages, SHA-256 sequential hashing, 1-click integrity verification, and incident replay forensics.
8. **ISO 42001 Maturity Diagnostic**: 20 interactive controls with live score calculation, gap analyzer, actionable remediation guidance, and the RACI Responsibility Matrix.
9. **Developer Docs & OpenAPI Explorer**: Full English documentation and copyable snippets.

---

## 📄 Standards Reference Mapping
- **ISO/IEC 42001:2023**: Artificial Intelligence Management System (AIMS) Clauses 6.1.2, 8.2, 9.1, 9.2, 10.1, and Annex A controls.
- **NIST AI RMF 1.0**: Govern, Map, Measure, Manage functions.
- **Regulation (EU) 2024/1689 (EU AI Act)**: Articles 9, 12, 14 (Human Oversight), and 50.
- **Regulation (EU) 2016/679 (GDPR / RGPD)**: Articles 5 (Purpose Limitation & Minimization) and 32 (Security of Processing).
- **DAMA-DMBOK**: Data Quality, Metadata, and Architecture practices.

---

## 🔐 Data Security & Cryptographic Storage Architecture

To meet stringent banking and regulatory standards (ISO/IEC 42001 Cl. 8.2 & GDPR Art. 32), AegisGov AI enforces a zero-plaintext credential model across all storage layers:

### 1. Irreversible Salted SHA-256 API Key Hashing
- **Zero Plaintext Storage**: Agent API keys (`aegis_live_...`) are **never** stored in plaintext on disk or in database records.
- **Salted Hash Generation**: Stored exclusively as one-way salted hashes (`sha256-<hash>`).
- **Timing-Attack Resistance**: API key authentication performs constant-time buffer validation (`crypto.timingSafeEqual`) to prevent side-channel timing attacks.
- **Display-Safe Prefixes**: The dashboard displays only non-sensitive prefixes (`apiKeyPrefix`, e.g. `aegis_live_9941...`) and a green `SHA-256 HASHED` badge.
- **One-Time Secret Reveal**: When an agent identity is registered, the raw API key is returned strictly **once** in the HTTP response. A security modal prompts the operator to save the secret immediately, as it cannot be recovered.

### 2. AES-256-GCM Secrets Vault & Connection String Masking
- **Automatic Password Redaction**: Database connection URIs (PostgreSQL, MySQL, Snowflake, etc.) are automatically parsed on ingestion. Any embedded credentials are stripped and masked into `***` (e.g. `postgresql://user:***@host:5432/db`).
- **Military-Grade Authenticated Encryption**: Extracted database passwords and secrets are encrypted with **AES-256-GCM** using a 96-bit initialization vector (IV) and authentication tag validation (`aes-256-gcm:iv:tag:ciphertext`).
- **Integrity Verification**: Generates a SHA-256 `credentialsHash` to verify configuration integrity without exposing decrypted values.

### 3. Automated Storage Migration & Repository Protection
- **Automatic Legacy Migration**: Upon startup, the persistence engine scans existing records. Any legacy plaintext keys or credentials are automatically converted to salted hashes and AES-256-GCM payloads, permanently purging the plaintext versions from disk.
- **Version Control Isolation**: The data storage directory (`data/governance_data.json`) is strictly excluded in `.gitignore` to prevent any inadvertent check-ins to source control.

---

## 📜 License

This project is licensed under the **MIT License**.

Copyright (c) 2026 **Qualex Consulting Services INC** and **Antonio Martínez**.

See the full license text in the [LICENSE](file:///c:/Repositorios/governance/LICENSE) file.

