import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { cryptoService } from '../services/CryptoService.js';
import {
  DataSource,
  AgentIdentity,
  AIModel,
  ActionPolicy,
  ApprovalRequest,
  EvidenceAuditRecord,
  MaturityControl,
  RACIRow
} from '../types/governance.js';

interface DatabaseSchema {
  sources: DataSource[];
  agents: AgentIdentity[];
  models: AIModel[];
  policies: ActionPolicy[];
  approvals: ApprovalRequest[];
  auditRecords: EvidenceAuditRecord[];
  maturityControls: MaturityControl[];
  raciMatrix: RACIRow[];
  globalKillSwitch: boolean;
}

const resolveDataFile = (): { dir: string; file: string } => {
  const serverDataDir = path.resolve(process.cwd(), 'server', 'data');
  const rootDataDir = path.resolve(process.cwd(), 'data');

  if (fs.existsSync(path.join(serverDataDir, 'governance_data.json'))) {
    return { dir: serverDataDir, file: path.join(serverDataDir, 'governance_data.json') };
  }
  return { dir: rootDataDir, file: path.join(rootDataDir, 'governance_data.json') };
};

const { dir: DATA_DIR, file: DATA_FILE } = resolveDataFile();

const INITIAL_SOURCES: DataSource[] = [
  {
    id: 'src-airline-policy-01',
    name: 'Airline Official Tariff & Bereavement Policy',
    origin: 'Air Canada Legal & Tariffs Doc Repository',
    owner: 'Customer Relations Compliance Team',
    classification: 'PUBLIC',
    permittedPurposes: ['customer_support', 'public_faq', 'refund_inquiries'],
    qualityScore: 98,
    retentionDays: 730,
    slaHours: 4,
    lastUpdated: '2026-09-15T08:00:00Z',
    contentHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    sampleContent: 'Official Rule: Bereavement fares must be requested prior to travel completion. Retroactive bereavement fare refunds are NOT permitted under Rule 4.2.'
  },
  {
    id: 'src-crm-customers-02',
    name: 'Enterprise CRM Customers & Accounts',
    origin: 'Salesforce CRM Production Replica',
    owner: 'Sales Operations Data Owner',
    classification: 'CONFIDENTIAL',
    permittedPurposes: ['sales_analytics', 'customer_support', 'lead_routing'],
    qualityScore: 94,
    retentionDays: 1825,
    slaHours: 1,
    lastUpdated: '2026-10-27T10:30:00Z',
    contentHash: 'sha256-4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
  },
  {
    id: 'src-fin-ledger-03',
    name: 'Financial Ledger & Bank Accounts',
    origin: 'SAP ERP S/4HANA Finance Module',
    owner: 'Chief Financial Officer & Treasury',
    classification: 'RESTRICTED',
    permittedPurposes: ['treasury_reconciliation', 'approved_payouts'],
    qualityScore: 100,
    retentionDays: 3650,
    slaHours: 0.5,
    lastUpdated: '2026-10-28T09:00:00Z',
    contentHash: 'sha256-ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d'
  },
  {
    id: 'src-codebase-intel-04',
    name: 'Proprietary Semiconductor & Algorithm Codebase',
    origin: 'Git Enterprise Internal Monorepo (Samsung Tech)',
    owner: 'R&D Security Committee',
    classification: 'RESTRICTED',
    permittedPurposes: ['internal_code_review', 'automated_linting'],
    qualityScore: 96,
    retentionDays: 1095,
    slaHours: 2,
    lastUpdated: '2026-10-26T16:45:00Z',
    contentHash: 'sha256-ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
  },
  {
    id: 'src-property-val-05',
    name: 'Real Estate Valuation Models & Market Indices',
    origin: 'Automated Valuation Model (Zillow Engine)',
    owner: 'Risk & Algorithmic Trading Group',
    classification: 'INTERNAL',
    permittedPurposes: ['housing_estimates', 'risk_assessment'],
    qualityScore: 91,
    retentionDays: 1460,
    slaHours: 6,
    lastUpdated: '2026-10-28T06:15:00Z',
    contentHash: 'sha256-ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
  }
];

const INITIAL_AGENTS: AgentIdentity[] = [
  {
    id: 'agent-airline-support-01',
    name: 'Air Canada Customer Support Assistant',
    technicalIdentity: 'agent-svc-airline-faq',
    systemOwner: 'VP Customer Experience',
    processOwner: 'Passenger Rights & Helpdesk Director',
    department: 'TI Support America - Customer Helpdesk',
    riskTier: 'MEDIUM',
    scopes: ['support:read_policy', 'support:answer_inquiry'],
    allowedDataSources: ['src-airline-policy-01'],
    allowedTools: ['airline.lookup_fare_rules', 'airline.check_ticket_status'],
    environment: 'production',
    apiKeyHash: cryptoService.hashApiKey('aegis_live_aircan_key_9941a7c'),
    apiKeyPrefix: cryptoService.getApiKeyPrefix('aegis_live_aircan_key_9941a7c'),
    tokenExpiresAt: '2027-01-01T00:00:00Z',
    killSwitchActive: false,
    createdAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 'agent-fin-treasury-02',
    name: 'Autonomous Treasury & Payment Reconciler',
    technicalIdentity: 'agent-svc-sap-treasury',
    systemOwner: 'Corporate Comptroller',
    processOwner: 'Head of Treasury Operations',
    department: 'Corporate Treasury & Finance',
    riskTier: 'CRITICAL',
    scopes: ['erp:read_orders', 'erp:create_payment', 'financial:transfer_funds'],
    allowedDataSources: ['src-fin-ledger-03', 'src-crm-customers-02'],
    allowedTools: ['erp.create_payment', 'financial.transfer_funds', 'erp.read_orders'],
    environment: 'production',
    apiKeyHash: cryptoService.hashApiKey('aegis_live_fin_key_7718be8'),
    apiKeyPrefix: cryptoService.getApiKeyPrefix('aegis_live_fin_key_7718be8'),
    tokenExpiresAt: '2026-12-31T23:59:59Z',
    killSwitchActive: false,
    createdAt: '2026-02-14T09:30:00Z'
  },
  {
    id: 'agent-replit-coder-03',
    name: 'SaaS DevOps & Migration Agent (SaaStr Case)',
    technicalIdentity: 'agent-svc-devops-executor',
    systemOwner: 'Director of Infrastructure',
    processOwner: 'Lead DevOps Architect',
    department: 'DevOps & Cloud Infrastructure',
    riskTier: 'HIGH',
    scopes: ['db:read_replica', 'db:execute_migration', 'infra:provision'],
    allowedDataSources: ['src-codebase-intel-04'],
    allowedTools: ['db.execute_migration', 'db.execute_query', 'infra.restart_service'],
    environment: 'sandbox',
    apiKeyHash: cryptoService.hashApiKey('aegis_sandbox_devops_key_1192e4a'),
    apiKeyPrefix: cryptoService.getApiKeyPrefix('aegis_sandbox_devops_key_1192e4a'),
    tokenExpiresAt: '2026-11-30T00:00:00Z',
    killSwitchActive: false,
    createdAt: '2026-03-01T15:20:00Z'
  },
  {
    id: 'agent-samsung-copilot-04',
    name: 'Semiconductor Engineering Copilot',
    technicalIdentity: 'agent-svc-eng-assistant',
    systemOwner: 'Chief Technology Officer',
    processOwner: 'Hardware Architecture Group',
    department: 'Semiconductor R&D - Hardware',
    riskTier: 'MEDIUM',
    scopes: ['code:read_internal', 'code:propose_refactor'],
    allowedDataSources: ['src-codebase-intel-04'],
    allowedTools: ['code.summarize', 'code.run_tests'],
    environment: 'production',
    apiKeyHash: cryptoService.hashApiKey('aegis_live_samsung_copilot_5501fa3'),
    apiKeyPrefix: cryptoService.getApiKeyPrefix('aegis_live_samsung_copilot_5501fa3'),
    tokenExpiresAt: '2026-12-31T00:00:00Z',
    killSwitchActive: false,
    createdAt: '2026-03-10T11:00:00Z'
  }
];

const INITIAL_MODELS: AIModel[] = [
  {
    id: 'model-claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet (Enterprise Cloud)',
    provider: 'Anthropic',
    type: 'EXTERNAL',
    endpointUrl: 'https://api.anthropic.com/v1',
    modelIdentifier: 'claude-3-5-sonnet-20241022',
    apiKeyPrefix: 'sk-ant-api03-***',
    maxContextTokens: 200000,
    dataClassificationClearance: 'CONFIDENTIAL',
    allowedRiskTiers: ['LOW', 'MEDIUM', 'HIGH'],
    enforceGrounding: true,
    status: 'ACTIVE',
    owner: 'VP of AI Platforms',
    department: 'Customer Experience & Enterprise AI',
    createdAt: '2026-01-15T00:00:00Z',
    lastUpdated: '2026-10-28T12:00:00Z'
  },
  {
    id: 'model-gpt-4o',
    name: 'GPT-4o Enterprise (Zero-Retention Cloud)',
    provider: 'OpenAI',
    type: 'EXTERNAL',
    endpointUrl: 'https://api.openai.com/v1',
    modelIdentifier: 'gpt-4o',
    apiKeyPrefix: 'sk-proj-live-***',
    maxContextTokens: 128000,
    dataClassificationClearance: 'CONFIDENTIAL',
    allowedRiskTiers: ['LOW', 'MEDIUM', 'HIGH'],
    enforceGrounding: true,
    status: 'ACTIVE',
    owner: 'Chief Technology Officer',
    department: 'Corporate Technology Group',
    createdAt: '2026-01-20T00:00:00Z',
    lastUpdated: '2026-10-28T12:00:00Z'
  },
  {
    id: 'model-local-llama3-ollama',
    name: 'Llama 3.2 8B / 70B (Local Ollama Air-Gapped)',
    provider: 'Ollama',
    type: 'LOCAL',
    endpointUrl: 'http://localhost:11434',
    modelIdentifier: 'llama3.2:latest',
    maxContextTokens: 128000,
    dataClassificationClearance: 'RESTRICTED',
    allowedRiskTiers: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    enforceGrounding: true,
    status: 'ACTIVE',
    owner: 'Director of CyberSecurity & Infrastructure',
    department: 'TI Security & On-Premises Compute',
    createdAt: '2026-02-01T00:00:00Z',
    lastUpdated: '2026-10-28T12:00:00Z'
  },
  {
    id: 'model-local-vllm-mistral',
    name: 'Mistral Large / NeMo (Local vLLM GPU Cluster)',
    provider: 'vLLM',
    type: 'LOCAL',
    endpointUrl: 'http://vllm-cluster.internal:8000/v1',
    modelIdentifier: 'mistralai/Mistral-Large-Instruct',
    maxContextTokens: 64000,
    dataClassificationClearance: 'RESTRICTED',
    allowedRiskTiers: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    enforceGrounding: false,
    status: 'ACTIVE',
    owner: 'Chief AI Research Scientist',
    department: 'R&D & High Performance Compute',
    createdAt: '2026-03-01T00:00:00Z',
    lastUpdated: '2026-10-28T12:00:00Z'
  }
];

const INITIAL_POLICIES: ActionPolicy[] = [
  {
    id: 'pol-crm-read',
    system: 'CRM',
    toolName: 'crm.read_customer',
    description: 'Read assigned customer fields with field-level masking of PII',
    riskLevel: 'LOW',
    requiresApproval: false,
    dualApprovalRequired: false,
    disallowedInProduction: false,
    allowedParameters: ['customerId', 'fields'],
    rateLimitPerMinute: 60
  },
  {
    id: 'pol-crm-export',
    system: 'CRM',
    toolName: 'crm.export_customers',
    description: 'Bulk customer export. Limited to 100 rows per call to prevent data exfiltration',
    riskLevel: 'HIGH',
    requiresApproval: true,
    dualApprovalRequired: false,
    disallowedInProduction: false,
    allowedParameters: ['segment', 'limit', 'format'],
    rateLimitPerMinute: 5
  },
  {
    id: 'pol-erp-read-orders',
    system: 'ERP',
    toolName: 'erp.read_orders',
    description: 'Query status of orders and vendor invoices (financial data minimized)',
    riskLevel: 'LOW',
    requiresApproval: false,
    dualApprovalRequired: false,
    disallowedInProduction: false,
    allowedParameters: ['orderId', 'vendorId'],
    rateLimitPerMinute: 120
  },
  {
    id: 'pol-erp-payment',
    system: 'ERP',
    toolName: 'erp.create_payment',
    description: 'Create outgoing vendor disbursement or purchase approval',
    riskLevel: 'CRITICAL',
    requiresApproval: true,
    dualApprovalRequired: true,
    maxMonetaryLimit: 50000,
    disallowedInProduction: false,
    allowedParameters: ['vendorId', 'amount', 'currency', 'invoiceId', 'memo'],
    rateLimitPerMinute: 10
  },
  {
    id: 'pol-fin-transfer',
    system: 'Financial APIs',
    toolName: 'financial.transfer_funds',
    description: 'Direct wire or ACH bank transfer. Strict vault secrets, idempotency & human approval',
    riskLevel: 'CRITICAL',
    requiresApproval: true,
    dualApprovalRequired: true,
    maxMonetaryLimit: 10000,
    disallowedInProduction: false,
    allowedParameters: ['recipientIban', 'amount', 'currency', 'idempotencyKey'],
    rateLimitPerMinute: 2
  },
  {
    id: 'pol-db-write',
    system: 'Production Database',
    toolName: 'db.execute_migration',
    description: 'Execute DDL, UPDATE, or DELETE on database. Disallowed on production by default',
    riskLevel: 'CRITICAL',
    requiresApproval: true,
    dualApprovalRequired: false,
    disallowedInProduction: true,
    allowedParameters: ['sqlStatement', 'targetSchema', 'rollbackSql'],
    rateLimitPerMinute: 2
  },
  {
    id: 'pol-email-send',
    system: 'Email System',
    toolName: 'email.send_external',
    description: 'Dispatch external emails to customers or vendors. Prevents unauthorized broadcasts',
    riskLevel: 'HIGH',
    requiresApproval: true,
    dualApprovalRequired: false,
    disallowedInProduction: false,
    allowedParameters: ['recipientEmail', 'subject', 'body'],
    rateLimitPerMinute: 20
  }
];

const INITIAL_MATURITY_CONTROLS: MaturityControl[] = [
  // 1-4 Data
  {
    id: 1,
    dimension: 'Data',
    controlName: 'Data Source & Owner Inventory',
    description: 'An authoritative catalog of data sources, schemas, and assigned data owners exists.',
    isoReference: 'ISO/IEC 42001:2023 Cl. 6.1.2 & Annex A.6',
    status: 'YES',
    remediationGuidance: 'Ensure all newly connected vector databases and CRM replicas register an active data owner.'
  },
  {
    id: 2,
    dimension: 'Data',
    controlName: 'Data Classification by Sensitivity & Purpose',
    description: 'Data sets are tagged with sensitivity levels (Public/Internal/Confidential/Restricted) and purpose limitations.',
    isoReference: 'ISO/IEC 42001:2023 Cl. 8.2 & GDPR Art. 5(1)(b)',
    status: 'YES',
    remediationGuidance: 'Verify that DLP checks enforce classification tags at the prompt injection stage.'
  },
  {
    id: 3,
    dimension: 'Data',
    controlName: 'Lineage & Freshness Verification',
    description: 'Provenance, content hash, transformation history, and freshness timestamps are tracked.',
    isoReference: 'DAMA-DMBOK Ch. 13 & NIST AI RMF Map 1.5',
    status: 'YES',
    remediationGuidance: 'Reject RAG chunks whose freshness exceeds SLA without human escalation.'
  },
  {
    id: 4,
    dimension: 'Data',
    controlName: 'Quality, Retention & Deletion Lifecycle',
    description: 'Data retention periods, quality scoring metrics, and safe disposal policies are enforced.',
    isoReference: 'ISO/IEC 42001 Cl. A.6.3 & GDPR Art. 5(1)(e)',
    status: 'PARTIAL',
    remediationGuidance: 'Automate weekly purging of intermediate scratch embeddings beyond the 90-day window.'
  },
  // 5-8 Agents & Access
  {
    id: 5,
    dimension: 'Agents & Access',
    controlName: 'Unique Technical Identity per Agent',
    description: 'Agents use dedicated technical service identities, never inheriting raw end-user credentials.',
    isoReference: 'ISO/IEC 42001 Cl. A.7.2 & NIST AI RMF Govern 1.2',
    status: 'YES',
    remediationGuidance: 'Audit token issuance to guarantee agents cannot impersonate human executives.'
  },
  {
    id: 6,
    dimension: 'Agents & Access',
    controlName: 'Least Privilege & Expiring Credentials',
    description: 'Permissions are scoped per task, resource, and time window with automatic credential rotation.',
    isoReference: 'ISO/IEC 42001 Cl. A.7.3 & Zero Trust Architecture',
    status: 'YES',
    remediationGuidance: 'Configure token TTL to a maximum of 24 hours for autonomous background workers.'
  },
  {
    id: 7,
    dimension: 'Agents & Access',
    controlName: 'Approved Tool Gateway & Parameter Validation',
    description: 'Tool executions route through a gateway that checks schemas, whitelists, and rate limits.',
    isoReference: 'ISO/IEC 42001 Cl. A.8.4 & OWASP Top 10 for LLM',
    status: 'YES',
    remediationGuidance: 'Block direct external HTTP sockets from inside LLM execution containers.'
  },
  {
    id: 8,
    dimension: 'Agents & Access',
    controlName: 'Human-in-the-Loop for High/Critical Actions',
    description: 'Irreversible or high-consequence operations require human approval outside the model.',
    isoReference: 'EU AI Act Art. 14 & ISO/IEC 42001 Cl. A.9.4',
    status: 'YES',
    remediationGuidance: 'Enforce two-person dual authorization for transactions exceeding $10,000.'
  },
  // 9-12 Evidence
  {
    id: 9,
    dimension: 'Evidence',
    controlName: 'Grounded Source & Model Version Logging',
    description: 'Prompts, grounded source references, model versions, and response metadata are recorded.',
    isoReference: 'EU AI Act Art. 12 & ISO/IEC 42001 Cl. 9.1',
    status: 'YES',
    remediationGuidance: 'Store cryptographic hashes of reference materials alongside generated text.'
  },
  {
    id: 10,
    dimension: 'Evidence',
    controlName: 'Tool Invocations & Outcome Tracing',
    description: 'All tool calls, arguments, status codes, and reversal payloads are logged.',
    isoReference: 'ISO/IEC 42001 Cl. A.9.2',
    status: 'YES',
    remediationGuidance: 'Ensure structured JSON parameters are preserved in execution logs.'
  },
  {
    id: 11,
    dimension: 'Evidence',
    controlName: 'Protected Logs with Secret Redaction (DLP)',
    description: 'Audit logs have restricted access, defined retention, and automated PII/secret scrubbing.',
    isoReference: 'GDPR Art. 32 & ISO/IEC 27001 Cl. A.12.4',
    status: 'YES',
    remediationGuidance: 'Run DLP regex filter on audit output before writing to immutable storage.'
  },
  {
    id: 12,
    dimension: 'Evidence',
    controlName: 'Correlated Incident Reconstruction',
    description: 'Every interaction carries a unique correlation ID to rebuild the entire decision chain.',
    isoReference: 'ISO/IEC 42001 Cl. 9.2 & NIST AI RMF Manage 2.4',
    status: 'YES',
    remediationGuidance: 'Validate that correlation IDs span across source retrieval, LLM call, and tool execution.'
  },
  // 13-16 Responsibility
  {
    id: 13,
    dimension: 'Responsibility',
    controlName: 'Assigned Business & Technical Owners',
    description: 'Each AI system has a named business process owner and a technical platform owner.',
    isoReference: 'ISO/IEC 42001 Cl. 5.3',
    status: 'YES',
    remediationGuidance: 'Review ownership roster during quarterly AI governance board meetings.'
  },
  {
    id: 14,
    dimension: 'Responsibility',
    controlName: 'Pre-Deployment Risk Assessment',
    description: 'Formal risk assessments (impact, reversibility, bias, safety) are conducted prior to production.',
    isoReference: 'ISO/IEC 42001 Cl. 6.1.2 & EU AI Act Art. 9',
    status: 'PARTIAL',
    remediationGuidance: 'Standardize adversarial red-teaming checklist for all customer-facing agents.'
  },
  {
    id: 15,
    dimension: 'Responsibility',
    controlName: 'User Transparency & Escalation Channels',
    description: 'End users are notified of AI interaction and provided clear human escalation pathways.',
    isoReference: 'EU AI Act Art. 50 & ISO/IEC 42001 Cl. 7.4',
    status: 'YES',
    remediationGuidance: 'Display prominent disclaimers and immediate fallback button in chat widgets.'
  },
  {
    id: 16,
    dimension: 'Responsibility',
    controlName: 'Incident Response & Rollback Procedures',
    description: 'Documented playbook for AI anomalies, automated rollback, and rapid containment.',
    isoReference: 'NIST AI RMF Manage 3.1 & ISO/IEC 42001 Cl. 10.1',
    status: 'PARTIAL',
    remediationGuidance: 'Test the 1-click Agent Kill Switch monthly with simulated rogue tool requests.'
  },
  // 17-20 Scale
  {
    id: 17,
    dimension: 'Scale',
    controlName: 'Periodic Regression & Evaluation Suites',
    description: 'Continuous benchmarking against golden datasets to detect performance drift.',
    isoReference: 'ISO/IEC 42001 Cl. 9.1 & NIST AI RMF Measure 2.1',
    status: 'PARTIAL',
    remediationGuidance: 'Run weekly automated evaluation of retrieval precision against legal policies.'
  },
  {
    id: 18,
    dimension: 'Scale',
    controlName: 'Real-Time Monitoring of Failures & Anomalies',
    description: 'Telemetry captures tool failure spikes, refusal rates, and latency anomalies.',
    isoReference: 'ISO/IEC 42001 Cl. 9.1',
    status: 'YES',
    remediationGuidance: 'Alert on-call engineers if tool rejection rate exceeds 5% in a 15-minute window.'
  },
  {
    id: 19,
    dimension: 'Scale',
    controlName: 'Periodic Access & Scope Reviews',
    description: 'Periodic re-certification of agent scopes and database connection credentials.',
    isoReference: 'ISO/IEC 42001 Cl. A.7.4',
    status: 'PARTIAL',
    remediationGuidance: 'Automate 90-day scope expiration prompting system owners to re-authorize.'
  },
  {
    id: 20,
    dimension: 'Scale',
    controlName: 'Safe Retirement & Decommissioning Process',
    description: 'Formal checklist for retiring models: revoking keys, purging memory, archiving logs.',
    isoReference: 'ISO/IEC 42001 Cl. A.8.5 & GDPR Right to be Forgotten',
    status: 'YES',
    remediationGuidance: 'Verify that retired agent API keys immediately yield HTTP 403 Forbidden.'
  }
];

const INITIAL_RACI: RACIRow[] = [
  { activity: 'Classify sources & define quality standards', data: 'A/R', security: 'C', itPlatform: 'C', business: 'C', legalCompliance: 'I' },
  { activity: 'Define technical identity & access scopes', data: 'C', security: 'A', itPlatform: 'R', business: 'C', legalCompliance: 'I' },
  { activity: 'Approve AI use case & risk tiering', data: 'C', security: 'C', itPlatform: 'C', business: 'A/R', legalCompliance: 'C' },
  { activity: 'Design audit logs, DLP & retention rules', data: 'C', security: 'A', itPlatform: 'R', business: 'C', legalCompliance: 'C' },
  { activity: 'Validate model & conduct regression tests', data: 'C', security: 'C', itPlatform: 'R', business: 'A', legalCompliance: 'C' },
  { activity: 'Authorize high-impact & critical actions', data: 'I', security: 'C', itPlatform: 'R', business: 'A', legalCompliance: 'C' },
  { activity: 'Manage AI incidents & regulatory notice', data: 'C', security: 'R', itPlatform: 'R', business: 'A', legalCompliance: 'C' },
  { activity: 'Quarterly governance review & improvement', data: 'C', security: 'C', itPlatform: 'R', business: 'A', legalCompliance: 'C' }
];

export class GovernanceDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(raw);

        // Security Migration: Convert any legacy plaintext apiKeys to salted SHA-256 hashes
        let migrated = false;
        if (Array.isArray(parsed.agents)) {
          parsed.agents = parsed.agents.map((agent: any) => {
            if (agent.apiKey && !agent.apiKeyHash) {
              agent.apiKeyHash = cryptoService.hashApiKey(agent.apiKey);
              agent.apiKeyPrefix = cryptoService.getApiKeyPrefix(agent.apiKey);
              delete agent.apiKey;
              migrated = true;
            }
            if (!agent.department) {
              const init = INITIAL_AGENTS.find((ia) => ia.id === agent.id);
              if (init?.department) {
                agent.department = init.department;
                migrated = true;
              }
            }
            return agent;
          });
        }

        // Audit Trail Enrichment: Ensure all historical audit records have agentName, department, and userId
        if (Array.isArray(parsed.auditRecords)) {
          parsed.auditRecords = parsed.auditRecords.map((record: any) => {
            if (!record.identityEvidence.department || !record.identityEvidence.userId || !record.identityEvidence.agentName) {
              const agent = parsed.agents.find((a: any) => a.id === record.identityEvidence.agentId);
              record.identityEvidence.agentName = record.identityEvidence.agentName || agent?.name || record.identityEvidence.agentId;
              record.identityEvidence.department = record.identityEvidence.department || agent?.department || agent?.processOwner || 'Enterprise Operations';
              record.identityEvidence.userId = record.identityEvidence.userId || (record.identityEvidence.technicalIdentity === 'human-governance-officer' ? (record.approvalEvidence?.approvedBy || 'governance-officer') : 'operator-user');
              migrated = true;
            }
            return record;
          });
        }

        // Security Migration: Mask and encrypt any plaintext passwords in data sources
        if (Array.isArray(parsed.sources)) {
          parsed.sources = parsed.sources.map((source: any) => {
            if (source.origin) {
              const { maskedUri, extractedPassword } = cryptoService.maskConnectionString(source.origin);
              if (extractedPassword && maskedUri !== source.origin) {
                source.origin = maskedUri;
                source.encryptedCredentials = cryptoService.encryptSecret(extractedPassword);
                source.credentialsHash = cryptoService.hashSecret(extractedPassword);
                migrated = true;
              }
            }
            return source;
          });
        }

        // Initialize AI Models registry if missing in existing local stores
        if (!parsed.models || !Array.isArray(parsed.models) || parsed.models.length === 0) {
          parsed.models = INITIAL_MODELS;
          migrated = true;
        }

        if (migrated) {
          this.saveData(parsed);
        }
        return parsed;
      } catch (err) {
        console.error('Failed to parse database file, initializing defaults:', err);
      }
    }

    const initialData: DatabaseSchema = {
      sources: INITIAL_SOURCES,
      agents: INITIAL_AGENTS,
      models: INITIAL_MODELS,
      policies: INITIAL_POLICIES,
      approvals: [],
      auditRecords: [],
      maturityControls: INITIAL_MATURITY_CONTROLS,
      raciMatrix: INITIAL_RACI,
      globalKillSwitch: false
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(data: DatabaseSchema): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- Sources ---
  getSources(): DataSource[] {
    return this.data.sources;
  }

  getSourceById(id: string): DataSource | undefined {
    return this.data.sources.find((s) => s.id === id);
  }

  addSource(source: DataSource): DataSource {
    this.data.sources.push(source);
    this.saveData(this.data);
    return source;
  }

  updateSource(id: string, updates: Partial<DataSource>): DataSource | undefined {
    const idx = this.data.sources.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.data.sources[idx] = { ...this.data.sources[idx], ...updates };
    this.saveData(this.data);
    return this.data.sources[idx];
  }

  // --- Agents ---
  getAgents(): AgentIdentity[] {
    return this.data.agents;
  }

  getAgentById(id: string): AgentIdentity | undefined {
    return this.data.agents.find((a) => a.id === id);
  }

  getAgentByApiKey(apiKey: string): AgentIdentity | undefined {
    return this.data.agents.find((a) => cryptoService.verifyApiKey(apiKey, a.apiKeyHash));
  }

  addAgent(agent: AgentIdentity): AgentIdentity {
    this.data.agents.push(agent);
    this.saveData(this.data);
    return agent;
  }

  updateAgent(id: string, updates: Partial<AgentIdentity>): AgentIdentity | undefined {
    const idx = this.data.agents.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.data.agents[idx] = { ...this.data.agents[idx], ...updates };
    this.saveData(this.data);
    return this.data.agents[idx];
  }

  setAgentKillSwitch(id: string, active: boolean): AgentIdentity | undefined {
    return this.updateAgent(id, { killSwitchActive: active });
  }

  // --- Policies ---
  getPolicies(): ActionPolicy[] {
    return this.data.policies;
  }

  getPolicyByTool(toolName: string): ActionPolicy | undefined {
    return this.data.policies.find((p) => p.toolName === toolName);
  }

  updatePolicy(id: string, updates: Partial<ActionPolicy>): ActionPolicy | undefined {
    const idx = this.data.policies.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.policies[idx] = { ...this.data.policies[idx], ...updates };
    this.saveData(this.data);
    return this.data.policies[idx];
  }

  // --- Approvals ---
  getApprovals(): ApprovalRequest[] {
    return this.data.approvals;
  }

  getApprovalById(id: string): ApprovalRequest | undefined {
    return this.data.approvals.find((a) => a.id === id);
  }

  addApproval(approval: ApprovalRequest): ApprovalRequest {
    this.data.approvals.unshift(approval);
    this.saveData(this.data);
    return approval;
  }

  updateApproval(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    decidedBy: string,
    rationale: string
  ): ApprovalRequest | undefined {
    const idx = this.data.approvals.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.data.approvals[idx].status = status;
    this.data.approvals[idx].decidedAt = new Date().toISOString();
    this.data.approvals[idx].decidedBy = decidedBy;
    this.data.approvals[idx].decisionRationale = rationale;
    this.saveData(this.data);
    return this.data.approvals[idx];
  }

  // --- Evidence & Audit ---
  getAuditRecords(): EvidenceAuditRecord[] {
    return this.data.auditRecords;
  }

  addAuditRecord(record: Omit<EvidenceAuditRecord, 'signatureHash' | 'previousHash'>): EvidenceAuditRecord {
    const previousRecord = this.data.auditRecords[0];
    const previousHash = previousRecord ? previousRecord.signatureHash : 'GENESIS_BLOCK_00000000000000000000';

    const payloadToHash = JSON.stringify({ ...record, previousHash });
    const signatureHash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

    const completeRecord: EvidenceAuditRecord = {
      ...record,
      signatureHash,
      previousHash
    };

    this.data.auditRecords.unshift(completeRecord);
    // Keep max 1000 records in local demo store
    if (this.data.auditRecords.length > 1000) {
      this.data.auditRecords = this.data.auditRecords.slice(0, 1000);
    }
    this.saveData(this.data);
    return completeRecord;
  }

  // --- Maturity Controls ---
  getMaturityControls(): MaturityControl[] {
    return this.data.maturityControls;
  }

  updateMaturityControl(id: number, status: 'YES' | 'PARTIAL' | 'NO'): MaturityControl | undefined {
    const idx = this.data.maturityControls.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.maturityControls[idx].status = status;
    this.saveData(this.data);
    return this.data.maturityControls[idx];
  }

  // --- RACI Matrix ---
  getRACI(): RACIRow[] {
    return this.data.raciMatrix;
  }

  // --- Global Kill Switch ---
  getGlobalKillSwitch(): boolean {
    return this.data.globalKillSwitch;
  }

  setGlobalKillSwitch(active: boolean): boolean {
    this.data.globalKillSwitch = active;
    this.saveData(this.data);
    return this.data.globalKillSwitch;
  }
}

export const db = new GovernanceDatabase();
