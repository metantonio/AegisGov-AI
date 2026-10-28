export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type GovernanceStage =
  | 'DATA_SOURCES'
  | 'IDENTITY_ACCESS'
  | 'LINEAGE_CONTEXT'
  | 'LLM_MODEL'
  | 'AGENT_EXECUTION'
  | 'EVIDENCE_AUDIT';

export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export type EnvironmentType = 'sandbox' | 'production';

export interface DataSource {
  id: string;
  name: string;
  origin: string;
  owner: string;
  classification: DataClassification;
  permittedPurposes: string[];
  qualityScore: number; // 0 - 100
  retentionDays: number;
  slaHours: number;
  lastUpdated: string;
  contentHash: string;
  sampleContent?: string;
}

export interface AgentIdentity {
  id: string;
  name: string;
  technicalIdentity: string;
  systemOwner: string;
  processOwner: string;
  riskTier: RiskLevel;
  scopes: string[];
  allowedDataSources: string[];
  allowedTools: string[];
  environment: EnvironmentType;
  apiKey: string;
  tokenExpiresAt: string;
  killSwitchActive: boolean;
  createdAt: string;
}

export interface ActionPolicy {
  id: string;
  system: string;
  toolName: string;
  description: string;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  dualApprovalRequired: boolean;
  maxMonetaryLimit?: number;
  disallowedInProduction: boolean;
  allowedParameters: string[];
  rateLimitPerMinute: number;
}

export interface ApprovalRequest {
  id: string;
  correlationId: string;
  agentId: string;
  agentName: string;
  toolName: string;
  parameters: Record<string, any>;
  riskLevel: RiskLevel;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionRationale?: string;
  system: string;
  environment: EnvironmentType;
}

export interface EvidenceAuditRecord {
  correlationId: string;
  timestamp: string;
  environment: EnvironmentType;
  sourceEvidence: {
    sourceIds: string[];
    hash: string;
    freshnessVerified: boolean;
    dlpTriggered: boolean;
    sourcesCount: number;
  };
  identityEvidence: {
    agentId: string;
    technicalIdentity: string;
    scopesChecked: string[];
    killSwitchActive: boolean;
    isAuthorized: boolean;
  };
  contextEvidence: {
    inputTokensApprox: number;
    dlpSanitized: boolean;
    redactedTokensCount: number;
    entitiesDetected: string[];
  };
  decisionEvidence: {
    actionType: 'PROMPT' | 'TOOL_INVOCATION';
    toolName?: string;
    model: string;
    groundedSources: string[];
    riskScore: number;
    riskTier: RiskLevel;
  };
  approvalEvidence: {
    required: boolean;
    status: 'AUTO_APPROVED' | 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: string;
    policyRuleId?: string;
    rationale?: string;
  };
  executionEvidence: {
    status: 'SUCCESS' | 'BLOCKED' | 'PENDING_APPROVAL' | 'FAILED';
    latencyMs: number;
    outputSummary?: string;
    reversible: boolean;
  };
  signatureHash: string;
  previousHash: string;
}

export interface MaturityControl {
  id: number;
  dimension: 'Data' | 'Agents & Access' | 'Evidence' | 'Responsibility' | 'Scale';
  controlName: string;
  description: string;
  isoReference: string;
  status: 'YES' | 'PARTIAL' | 'NO';
  remediationGuidance: string;
}

export interface RACIRow {
  activity: string;
  data: 'A/R' | 'A' | 'R' | 'C' | 'I';
  security: 'A/R' | 'A' | 'R' | 'C' | 'I';
  itPlatform: 'A/R' | 'A' | 'R' | 'C' | 'I';
  business: 'A/R' | 'A' | 'R' | 'C' | 'I';
  legalCompliance: 'A/R' | 'A' | 'R' | 'C' | 'I';
}
