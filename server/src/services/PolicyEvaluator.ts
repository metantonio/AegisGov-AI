import {
  AgentIdentity,
  ActionPolicy,
  DataSource,
  RiskLevel
} from '../types/governance.js';
import { db } from '../store/database.js';

export interface EvaluationResult {
  allowed: boolean;
  requiresApproval: boolean;
  dualApprovalRequired: boolean;
  riskTier: RiskLevel;
  rejectionReason?: string;
  policyApplied?: ActionPolicy;
}

export class PolicyEvaluator {
  evaluateToolAction(
    agent: AgentIdentity,
    toolName: string,
    parameters: Record<string, any>,
    targetEnvironment: 'sandbox' | 'production'
  ): EvaluationResult {
    // 1. Check Global Kill Switch
    if (db.getGlobalKillSwitch()) {
      return {
        allowed: false,
        requiresApproval: false,
        dualApprovalRequired: false,
        riskTier: 'CRITICAL',
        rejectionReason: 'GLOBAL EMERGENCY KILL SWITCH IS ACTIVE. All AI actions are suspended.'
      };
    }

    // 2. Check Agent Kill Switch
    if (agent.killSwitchActive) {
      return {
        allowed: false,
        requiresApproval: false,
        dualApprovalRequired: false,
        riskTier: 'CRITICAL',
        rejectionReason: `Agent '${agent.name}' (${agent.id}) is locked down under active Kill Switch.`
      };
    }

    // 3. Check Token Expiry
    if (new Date(agent.tokenExpiresAt) < new Date()) {
      return {
        allowed: false,
        requiresApproval: false,
        dualApprovalRequired: false,
        riskTier: 'HIGH',
        rejectionReason: `Agent API token expired on ${agent.tokenExpiresAt}. Renewal required.`
      };
    }

    // 4. Check Agent Allowed Tools
    if (!agent.allowedTools.includes(toolName) && !agent.allowedTools.includes('*')) {
      return {
        allowed: false,
        requiresApproval: false,
        dualApprovalRequired: false,
        riskTier: 'HIGH',
        rejectionReason: `Tool '${toolName}' is not in the whitelist of permitted tools for agent '${agent.name}'.`
      };
    }

    // 5. Look up Action Policy
    const policy = db.getPolicyByTool(toolName);
    if (!policy) {
      // Default fallback: if no explicit policy, flag as HIGH risk requiring approval
      return {
        allowed: true,
        requiresApproval: true,
        dualApprovalRequired: false,
        riskTier: 'HIGH',
        rejectionReason: undefined
      };
    }

    // 6. Check Environment Separation (Replit / SaaStr prevention)
    if (targetEnvironment === 'production' && policy.disallowedInProduction) {
      return {
        allowed: false,
        requiresApproval: false,
        dualApprovalRequired: false,
        riskTier: 'CRITICAL',
        rejectionReason: `Policy Violation: Action '${toolName}' is strictly prohibited in PRODUCTION environments. Must be run in SANDBOX.`
      };
    }

    // 7. Check Monetary / Exposure Limits (Zillow Offers prevention)
    if (policy.maxMonetaryLimit && typeof parameters.amount === 'number') {
      if (parameters.amount > policy.maxMonetaryLimit) {
        return {
          allowed: false,
          requiresApproval: false,
          dualApprovalRequired: false,
          riskTier: 'CRITICAL',
          rejectionReason: `Exposure Limit Exceeded: Requested amount ($${parameters.amount.toLocaleString()}) exceeds the maximum policy threshold of $${policy.maxMonetaryLimit.toLocaleString()}.`
        };
      }
    }

    // 8. Determine Approval Requirements
    return {
      allowed: true,
      requiresApproval: policy.requiresApproval,
      dualApprovalRequired: policy.dualApprovalRequired,
      riskTier: policy.riskLevel,
      policyApplied: policy
    };
  }

  evaluateDataSourceAccess(
    agent: AgentIdentity,
    dataSource: DataSource,
    purpose: string
  ): { allowed: boolean; reason?: string } {
    // 1. Kill switches
    if (db.getGlobalKillSwitch() || agent.killSwitchActive) {
      return { allowed: false, reason: 'Kill switch active.' };
    }

    // 2. Check Whitelist
    if (!agent.allowedDataSources.includes(dataSource.id) && !agent.allowedDataSources.includes('*')) {
      return {
        allowed: false,
        reason: `Agent does not have access permissions for Data Source '${dataSource.name}' (${dataSource.id}).`
      };
    }

    // 3. Purpose Limitation (GDPR Art. 5(1)(b))
    if (!dataSource.permittedPurposes.includes(purpose) && !dataSource.permittedPurposes.includes('*')) {
      return {
        allowed: false,
        reason: `Requested purpose '${purpose}' is not authorized for Data Source '${dataSource.name}'. Authorized purposes: ${dataSource.permittedPurposes.join(', ')}.`
      };
    }

    // 4. Sensitivity Barrier
    if (dataSource.classification === 'RESTRICTED' && agent.riskTier !== 'CRITICAL') {
      return {
        allowed: false,
        reason: `Data Source is RESTRICTED. Only CRITICAL-tier audited agents with specialized governance clearance may query it.`
      };
    }

    return { allowed: true };
  }
}

export const policyEvaluator = new PolicyEvaluator();
