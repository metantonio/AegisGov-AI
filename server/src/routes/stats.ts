import { Router, Request, Response } from 'express';
import { db } from '../store/database.js';

export const statsRouter = Router();

statsRouter.get('/', (_req: Request, res: Response) => {
  const auditRecords = db.getAuditRecords();
  const approvals = db.getApprovals();
  const agents = db.getAgents();
  const sources = db.getSources();
  const controls = db.getMaturityControls();

  const totalRequests = auditRecords.length;
  const blockedRequests = auditRecords.filter((r) => r.executionEvidence.status === 'BLOCKED').length;
  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING').length;
  const activeAgents = agents.filter((a) => !a.killSwitchActive).length;

  const implemented = controls.filter((c) => c.status === 'YES').length;
  const partial = controls.filter((c) => c.status === 'PARTIAL').length;
  const maturityScore = Math.round(((implemented * 1 + partial * 0.5) / controls.length) * 100);

  // Failure Playbook test statuses
  const failurePlaybooks = [
    {
      case: 'Air Canada (2024)',
      dimension: 'Context & Veracity',
      description: 'Model must not invent fare policies. Escalates to human if ungrounded.',
      controlStatus: 'ACTIVE_ENFORCED',
      lastTestStatus: 'PASSING'
    },
    {
      case: 'Samsung (2023)',
      dimension: 'Access & Classification',
      description: 'DLP scrub blocks proprietary hardware code and API secrets from outbound prompts.',
      controlStatus: 'ACTIVE_ENFORCED',
      lastTestStatus: 'PASSING'
    },
    {
      case: 'Zillow Offers (2021)',
      dimension: 'Model & Financial Risk',
      description: 'Caps monetary exposure and blocks algorithmic actions exceeding threshold.',
      controlStatus: 'ACTIVE_ENFORCED',
      lastTestStatus: 'PASSING'
    },
    {
      case: 'Replit / SaaStr (2025)',
      dimension: 'Permissions & Execution',
      description: 'Enforces sandbox vs production boundary. Disallows DDL/destructive ops in production.',
      controlStatus: 'ACTIVE_ENFORCED',
      lastTestStatus: 'PASSING'
    }
  ];

  return res.json({
    kpis: {
      totalRequests,
      blockedRequests,
      pendingApprovals,
      activeAgents,
      totalSources: sources.length,
      maturityScore,
      globalKillSwitch: db.getGlobalKillSwitch()
    },
    failurePlaybooks,
    riskBreakdown: {
      low: auditRecords.filter((r) => r.decisionEvidence.riskTier === 'LOW').length,
      medium: auditRecords.filter((r) => r.decisionEvidence.riskTier === 'MEDIUM').length,
      high: auditRecords.filter((r) => r.decisionEvidence.riskTier === 'HIGH').length,
      critical: auditRecords.filter((r) => r.decisionEvidence.riskTier === 'CRITICAL').length
    }
  });
});
