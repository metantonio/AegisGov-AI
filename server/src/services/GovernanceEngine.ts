import crypto from 'node:crypto';
import { db } from '../store/database.js';
import { dlpService } from './DlpService.js';
import { policyEvaluator } from './PolicyEvaluator.js';
import {
  ApprovalRequest,
  EvidenceAuditRecord,
  RiskLevel
} from '../types/governance.js';

export interface PromptGovernanceRequest {
  agentId: string;
  userPrompt: string;
  sourceIds?: string[];
  purpose?: string;
  targetModel?: string;
  userId?: string;
  department?: string;
}

export interface PromptGovernanceResponse {
  correlationId: string;
  status: 'ALLOWED' | 'BLOCKED' | 'FLAGGED';
  sanitizedPrompt: string;
  dlpEntitiesDetected: string[];
  groundedSources: Array<{ id: string; name: string; qualityScore: number; verified: boolean }>;
  modelDecision: {
    model: string;
    governanceVerdict: string;
    generatedResponse?: string;
    policyWarnings: string[];
  };
  stagesCompleted: string[];
  auditSignature: string;
}

export interface ToolActionRequest {
  agentId: string;
  toolName: string;
  parameters: Record<string, any>;
  environment?: 'sandbox' | 'production';
  sourceIds?: string[];
  system?: string;
  userId?: string;
  department?: string;
}

export interface ToolActionResponse {
  correlationId: string;
  status: 'EXECUTED' | 'PENDING_APPROVAL' | 'BLOCKED';
  approvalId?: string;
  riskTier: RiskLevel;
  rejectionReason?: string;
  sanitizedParameters: Record<string, any>;
  executionResult?: any;
  stagesCompleted: string[];
  auditSignature: string;
}

export class GovernanceEngine {
  /**
   * Mode A: Process Prompt (LLM Guardrail / Proxy)
   * Enforces Stages 1 -> 2 -> 3 -> 4 -> 6
   */
  processPrompt(req: PromptGovernanceRequest): PromptGovernanceResponse {
    const startTime = Date.now();
    const correlationId = `corr-prompt-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const stagesCompleted: string[] = [];

    // Stage 2: IDENTITY & ACCESS
    const agent = db.getAgentById(req.agentId);
    if (!agent) {
      throw new Error(`Authentication Failed: Agent '${req.agentId}' not recognized in AI Inventory.`);
    }

    if (db.getGlobalKillSwitch() || agent.killSwitchActive) {
      this.recordBlockedAudit(correlationId, agent.id, 'PROMPT', 'Kill switch active');
      return {
        correlationId,
        status: 'BLOCKED',
        sanitizedPrompt: '[ACTION BLOCKED BY EMERGENCY KILL SWITCH]',
        dlpEntitiesDetected: [],
        groundedSources: [],
        modelDecision: {
          model: req.targetModel || 'gpt-4o',
          governanceVerdict: 'BLOCKED_BY_KILL_SWITCH',
          policyWarnings: ['All operations halted by emergency kill switch.']
        },
        stagesCompleted: ['IDENTITY_ACCESS'],
        auditSignature: 'BLOCKED'
      };
    }
    stagesCompleted.push('IDENTITY_ACCESS');

    // Stage 1: DATA & SOURCES
    const verifiedSources: Array<{ id: string; name: string; qualityScore: number; verified: boolean }> = [];
    const requestedSources = req.sourceIds || agent.allowedDataSources;

    for (const srcId of requestedSources) {
      const src = db.getSourceById(srcId);
      if (src) {
        const accessCheck = policyEvaluator.evaluateDataSourceAccess(agent, src, req.purpose || 'customer_support');
        if (accessCheck.allowed) {
          verifiedSources.push({
            id: src.id,
            name: src.name,
            qualityScore: src.qualityScore,
            verified: true
          });
        }
      }
    }
    stagesCompleted.push('DATA_SOURCES');

    // Stage 3: LINEAGE & CONTEXT (DLP & Secret Masking)
    const dlpResult = dlpService.scanAndSanitize(req.userPrompt);
    stagesCompleted.push('LINEAGE_CONTEXT');

    // Stage 4: LLM MODEL & VERACITY (Mitigating Air Canada Hallucinations)
    const warnings: string[] = [];
    let governanceVerdict = 'COMPLIANT';
    let mockResponse = '';

    const lowerPrompt = req.userPrompt.toLowerCase();
    if (lowerPrompt.includes('bereavement') || lowerPrompt.includes('retroactive') || lowerPrompt.includes('refund')) {
      const policySource = verifiedSources.find((s) => s.id.includes('airline-policy'));
      if (policySource) {
        mockResponse =
          'According to official Airline Tariff Rule 4.2: Bereavement fares must be requested prior to departure. Retroactive refund claims for bereavement after travel completion cannot be granted.';
      } else {
        warnings.push('Warning: Insufficient grounded evidence in approved data sources for fare exception policy.');
        governanceVerdict = 'ESCALATE_TO_HUMAN';
        mockResponse =
          'Your inquiry regarding bereavement refunds requires human specialist review according to ISO 42001 veracity controls.';
      }
    } else if (dlpResult.hasSensitiveData) {
      warnings.push(`DLP Guardrail triggered: Redacted entities (${dlpResult.detectedEntities.join(', ')})`);
      mockResponse = `Request processed safely. Sanitized contextual query dispatched to model.`;
    } else {
      mockResponse = `Response generated securely under ISO 42001 AIMS governance standards for agent '${agent.name}'.`;
    }
    stagesCompleted.push('LLM_MODEL');

    // Stage 6: EVIDENCE & AUDIT (Chained block)
    const auditRecord = db.addAuditRecord({
      correlationId,
      timestamp: new Date().toISOString(),
      environment: agent.environment,
      sourceEvidence: {
        sourceIds: verifiedSources.map((s) => s.id),
        hash: crypto.createHash('sha256').update(JSON.stringify(verifiedSources)).digest('hex'),
        freshnessVerified: true,
        dlpTriggered: dlpResult.hasSensitiveData,
        sourcesCount: verifiedSources.length
      },
      identityEvidence: {
        agentId: agent.id,
        agentName: agent.name,
        technicalIdentity: agent.technicalIdentity,
        userId: req.userId || 'usr-support-operator',
        department: req.department || agent.department || agent.processOwner || 'IT Support Operations',
        scopesChecked: agent.scopes,
        killSwitchActive: agent.killSwitchActive,
        isAuthorized: true
      },
      contextEvidence: {
        inputTokensApprox: Math.ceil(req.userPrompt.length / 4),
        dlpSanitized: dlpResult.hasSensitiveData,
        redactedTokensCount: dlpResult.redactedCount,
        entitiesDetected: dlpResult.detectedEntities
      },
      decisionEvidence: {
        actionType: 'PROMPT',
        model: req.targetModel || 'claude-3-5-sonnet',
        groundedSources: verifiedSources.map((s) => s.name),
        riskScore: dlpResult.hasSensitiveData ? 65 : 15,
        riskTier: dlpResult.hasSensitiveData ? 'MEDIUM' : 'LOW'
      },
      approvalEvidence: {
        required: false,
        status: 'AUTO_APPROVED',
        rationale: 'Read-only contextual prompt with compliant grounded sources.'
      },
      executionEvidence: {
        status: 'SUCCESS',
        latencyMs: Date.now() - startTime,
        outputSummary: mockResponse.substring(0, 80) + '...',
        reversible: true
      }
    });
    stagesCompleted.push('EVIDENCE_AUDIT');

    return {
      correlationId,
      status: governanceVerdict === 'ESCALATE_TO_HUMAN' ? 'FLAGGED' : 'ALLOWED',
      sanitizedPrompt: dlpResult.sanitizedText,
      dlpEntitiesDetected: dlpResult.detectedEntities,
      groundedSources: verifiedSources,
      modelDecision: {
        model: req.targetModel || 'claude-3-5-sonnet',
        governanceVerdict,
        generatedResponse: mockResponse,
        policyWarnings: warnings
      },
      stagesCompleted,
      auditSignature: auditRecord.signatureHash
    };
  }

  /**
   * Mode B: Execute Action (Tool Gateway & Action Interceptor)
   * Pattern: OBSERVE -> PROPOSE -> VALIDATE -> APPROVE -> EXECUTE -> VERIFY
   */
  executeAction(req: ToolActionRequest): ToolActionResponse {
    const startTime = Date.now();
    const correlationId = `corr-action-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const stagesCompleted: string[] = [];

    // Stage 2: IDENTITY & ACCESS
    const agent = db.getAgentById(req.agentId);
    if (!agent) {
      throw new Error(`Authentication Failed: Agent '${req.agentId}' not recognized.`);
    }
    stagesCompleted.push('IDENTITY_ACCESS');

    // Stage 1: DATA & SOURCES
    stagesCompleted.push('DATA_SOURCES');

    // Stage 3: LINEAGE & CONTEXT (DLP on tool parameters)
    const dlpParams = dlpService.scanObjectAndSanitize(req.parameters);
    stagesCompleted.push('LINEAGE_CONTEXT');

    // Stage 5: AGENT & EXECUTION (Policy & Risk Evaluation)
    const env = req.environment || agent.environment;
    const evaluation = policyEvaluator.evaluateToolAction(agent, req.toolName, req.parameters, env);

    if (!evaluation.allowed) {
      this.recordBlockedAudit(correlationId, agent.id, 'TOOL_INVOCATION', evaluation.rejectionReason || 'Policy block', req.toolName);
      return {
        correlationId,
        status: 'BLOCKED',
        riskTier: evaluation.riskTier,
        rejectionReason: evaluation.rejectionReason,
        sanitizedParameters: dlpParams.sanitizedObj,
        stagesCompleted: ['IDENTITY_ACCESS', 'AGENT_EXECUTION'],
        auditSignature: 'BLOCKED'
      };
    }

    stagesCompleted.push('AGENT_EXECUTION');

    // Check Human-In-The-Loop Approval Requirement
    if (evaluation.requiresApproval) {
      const approval = db.addApproval({
        id: `appr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        correlationId,
        agentId: agent.id,
        agentName: agent.name,
        toolName: req.toolName,
        parameters: dlpParams.sanitizedObj,
        riskLevel: evaluation.riskTier,
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
        system: evaluation.policyApplied?.system || 'Core System',
        environment: env
      });

      const auditRecord = db.addAuditRecord({
        correlationId,
        timestamp: new Date().toISOString(),
        environment: env,
        sourceEvidence: {
          sourceIds: req.sourceIds || [],
          hash: 'action-request',
          freshnessVerified: true,
          dlpTriggered: dlpParams.detectedEntities.length > 0,
          sourcesCount: 0
        },
        identityEvidence: {
          agentId: agent.id,
          agentName: agent.name,
          technicalIdentity: agent.technicalIdentity,
          userId: req.userId || 'usr-support-operator',
          department: req.department || agent.department || agent.processOwner || 'IT Support Operations',
          scopesChecked: agent.scopes,
          killSwitchActive: agent.killSwitchActive,
          isAuthorized: true
        },
        contextEvidence: {
          inputTokensApprox: 20,
          dlpSanitized: dlpParams.detectedEntities.length > 0,
          redactedTokensCount: dlpParams.detectedEntities.length,
          entitiesDetected: dlpParams.detectedEntities
        },
        decisionEvidence: {
          actionType: 'TOOL_INVOCATION',
          toolName: req.toolName,
          model: 'aegis-policy-engine-v2',
          groundedSources: [],
          riskScore: evaluation.riskTier === 'CRITICAL' ? 95 : 75,
          riskTier: evaluation.riskTier
        },
        approvalEvidence: {
          required: true,
          status: 'PENDING',
          policyRuleId: evaluation.policyApplied?.id,
          rationale: `Action requires human authorization: ${evaluation.policyApplied?.description}`
        },
        executionEvidence: {
          status: 'PENDING_APPROVAL',
          latencyMs: Date.now() - startTime,
          outputSummary: `Awaiting authorization ticket ${approval.id}`,
          reversible: true
        }
      });
      stagesCompleted.push('EVIDENCE_AUDIT');

      return {
        correlationId,
        status: 'PENDING_APPROVAL',
        approvalId: approval.id,
        riskTier: evaluation.riskTier,
        sanitizedParameters: dlpParams.sanitizedObj,
        stagesCompleted,
        auditSignature: auditRecord.signatureHash
      };
    }

    // Direct execution (Low / Auto-authorized risk)
    const executionOutcome = {
      success: true,
      executedAt: new Date().toISOString(),
      tool: req.toolName,
      details: `Successfully executed '${req.toolName}' within authorized sandbox bounds.`
    };

    const auditRecord = db.addAuditRecord({
      correlationId,
      timestamp: new Date().toISOString(),
      environment: env,
      sourceEvidence: {
        sourceIds: req.sourceIds || [],
        hash: 'action-auto-approved',
        freshnessVerified: true,
        dlpTriggered: dlpParams.detectedEntities.length > 0,
        sourcesCount: 0
      },
      identityEvidence: {
        agentId: agent.id,
        agentName: agent.name,
        technicalIdentity: agent.technicalIdentity,
        userId: req.userId || 'usr-support-operator',
        department: req.department || agent.department || agent.processOwner || 'IT Support Operations',
        scopesChecked: agent.scopes,
        killSwitchActive: agent.killSwitchActive,
        isAuthorized: true
      },
      contextEvidence: {
        inputTokensApprox: 15,
        dlpSanitized: dlpParams.detectedEntities.length > 0,
        redactedTokensCount: dlpParams.detectedEntities.length,
        entitiesDetected: dlpParams.detectedEntities
      },
      decisionEvidence: {
        actionType: 'TOOL_INVOCATION',
        toolName: req.toolName,
        model: 'aegis-policy-engine-v2',
        groundedSources: [],
        riskScore: evaluation.riskTier === 'LOW' ? 10 : 35,
        riskTier: evaluation.riskTier
      },
      approvalEvidence: {
        required: false,
        status: 'AUTO_APPROVED',
        policyRuleId: evaluation.policyApplied?.id,
        rationale: 'Action within authorized low-friction policy limits.'
      },
      executionEvidence: {
        status: 'SUCCESS',
        latencyMs: Date.now() - startTime,
        outputSummary: `Auto-executed ${req.toolName}`,
        reversible: true
      }
    });
    stagesCompleted.push('EVIDENCE_AUDIT');

    return {
      correlationId,
      status: 'EXECUTED',
      riskTier: evaluation.riskTier,
      sanitizedParameters: dlpParams.sanitizedObj,
      executionResult: executionOutcome,
      stagesCompleted,
      auditSignature: auditRecord.signatureHash
    };
  }

  /**
   * Decide on a Pending Approval (Human In The Loop)
   */
  decideApproval(
    approvalId: string,
    decision: 'APPROVED' | 'REJECTED',
    decidedBy: string,
    rationale: string
  ): ApprovalRequest {
    const approval = db.getApprovalById(approvalId);
    if (!approval) {
      throw new Error(`Approval ticket '${approvalId}' not found.`);
    }

    if (approval.status !== 'PENDING') {
      throw new Error(`Approval ticket '${approvalId}' has already been finalized as '${approval.status}'.`);
    }

    const updated = db.updateApproval(approvalId, decision, decidedBy, rationale);
    if (!updated) {
      throw new Error(`Failed to update approval.`);
    }

    // Append resolution to audit trail
    db.addAuditRecord({
      correlationId: approval.correlationId,
      timestamp: new Date().toISOString(),
      environment: approval.environment,
      sourceEvidence: {
        sourceIds: [],
        hash: 'approval-decision',
        freshnessVerified: true,
        dlpTriggered: false,
        sourcesCount: 0
      },
      identityEvidence: {
        agentId: approval.agentId,
        agentName: approval.agentName,
        technicalIdentity: 'human-governance-officer',
        userId: decidedBy,
        department: 'Governance & Compliance Committee',
        scopesChecked: ['governance:authorize_action'],
        killSwitchActive: false,
        isAuthorized: true
      },
      contextEvidence: {
        inputTokensApprox: 10,
        dlpSanitized: false,
        redactedTokensCount: 0,
        entitiesDetected: []
      },
      decisionEvidence: {
        actionType: 'TOOL_INVOCATION',
        toolName: approval.toolName,
        model: 'human-officer-decision',
        groundedSources: [],
        riskScore: approval.riskLevel === 'CRITICAL' ? 90 : 50,
        riskTier: approval.riskLevel
      },
      approvalEvidence: {
        required: true,
        status: decision,
        approvedBy: decidedBy,
        rationale: rationale
      },
      executionEvidence: {
        status: decision === 'APPROVED' ? 'SUCCESS' : 'BLOCKED',
        latencyMs: 120,
        outputSummary: `${decision} by ${decidedBy}: ${rationale}`,
        reversible: decision !== 'APPROVED'
      }
    });

    return updated;
  }

  private recordBlockedAudit(
    correlationId: string,
    agentId: string,
    actionType: 'PROMPT' | 'TOOL_INVOCATION',
    reason: string,
    toolName?: string
  ): void {
    const agent = db.getAgentById(agentId);
    db.addAuditRecord({
      correlationId,
      timestamp: new Date().toISOString(),
      environment: 'production',
      sourceEvidence: {
        sourceIds: [],
        hash: 'blocked',
        freshnessVerified: false,
        dlpTriggered: false,
        sourcesCount: 0
      },
      identityEvidence: {
        agentId,
        agentName: agent?.name || agentId,
        technicalIdentity: agent?.technicalIdentity || 'blocked-subject',
        userId: 'unauthorized-caller',
        department: agent?.department || agent?.processOwner || 'Security Operations',
        scopesChecked: [],
        killSwitchActive: true,
        isAuthorized: false
      },
      contextEvidence: {
        inputTokensApprox: 0,
        dlpSanitized: false,
        redactedTokensCount: 0,
        entitiesDetected: []
      },
      decisionEvidence: {
        actionType,
        toolName,
        model: 'aegis-security-barrier',
        groundedSources: [],
        riskScore: 100,
        riskTier: 'CRITICAL'
      },
      approvalEvidence: {
        required: true,
        status: 'REJECTED',
        rationale: reason
      },
      executionEvidence: {
        status: 'BLOCKED',
        latencyMs: 5,
        outputSummary: reason,
        reversible: true
      }
    });
  }
}

export const governanceEngine = new GovernanceEngine();
