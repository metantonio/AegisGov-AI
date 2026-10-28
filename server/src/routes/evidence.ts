import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../store/database.js';

export const evidenceRouter = Router();

evidenceRouter.get('/', (req: Request, res: Response) => {
  const { limit, agentId, riskTier, status } = req.query;
  let records = db.getAuditRecords();

  if (agentId) {
    records = records.filter((r) => r.identityEvidence.agentId === agentId);
  }
  if (riskTier) {
    records = records.filter((r) => r.decisionEvidence.riskTier === riskTier);
  }
  if (status) {
    records = records.filter((r) => r.executionEvidence.status === status);
  }

  const parsedLimit = limit ? parseInt(limit as string, 10) : 50;
  return res.json({
    total: records.length,
    records: records.slice(0, parsedLimit)
  });
});

evidenceRouter.get('/verify-chain', (_req: Request, res: Response) => {
  const records = db.getAuditRecords();
  if (records.length === 0) {
    return res.json({
      valid: true,
      message: 'Audit ledger is empty. Genesis state intact.',
      totalBlocks: 0
    });
  }

  let intact = true;
  const verificationLog: Array<{ correlationId: string; valid: boolean; signatureHash: string }> = [];

  for (let i = 0; i < records.length; i++) {
    const current = records[i];
    const { signatureHash, previousHash, ...payload } = current;
    const computedPayload = JSON.stringify({ ...payload, previousHash });
    const computedHash = crypto.createHash('sha256').update(computedPayload).digest('hex');

    const matches = computedHash === signatureHash;
    if (!matches) {
      intact = false;
    }
    verificationLog.push({
      correlationId: current.correlationId,
      valid: matches,
      signatureHash
    });
  }

  return res.json({
    valid: intact,
    status: intact ? 'VERIFIED_TAMPER_EVIDENT' : 'INTEGRITY_COMPROMISED',
    totalBlocksChecked: records.length,
    timestamp: new Date().toISOString(),
    details: verificationLog.slice(0, 10)
  });
});

evidenceRouter.get('/:correlationId', (req: Request, res: Response) => {
  const records = db.getAuditRecords().filter((r) => r.correlationId === req.params.correlationId);
  if (records.length === 0) {
    return res.status(404).json({ error: `Correlation ID '${req.params.correlationId}' not found in audit trail.` });
  }

  return res.json({
    correlationId: req.params.correlationId,
    traceCount: records.length,
    traces: records
  });
});
