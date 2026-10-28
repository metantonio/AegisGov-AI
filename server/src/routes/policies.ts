import { Router, Request, Response } from 'express';
import { db } from '../store/database.js';

export const policiesRouter = Router();

policiesRouter.get('/', (_req: Request, res: Response) => {
  res.json({ policies: db.getPolicies() });
});

policiesRouter.post('/', (req: Request, res: Response) => {
  const {
    system,
    toolName,
    description,
    riskLevel,
    requiresApproval,
    dualApprovalRequired,
    maxMonetaryLimit,
    disallowedInProduction,
    allowedParameters,
    rateLimitPerMinute
  } = req.body;

  if (!system || !toolName || !description) {
    return res.status(400).json({ error: 'Required fields: system, toolName, description' });
  }

  const id = `pol-${system.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${toolName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

  const newPolicy = {
    id,
    system,
    toolName,
    description,
    riskLevel: riskLevel || 'MEDIUM',
    requiresApproval: requiresApproval !== undefined ? Boolean(requiresApproval) : true,
    dualApprovalRequired: Boolean(dualApprovalRequired),
    maxMonetaryLimit: maxMonetaryLimit !== undefined ? Number(maxMonetaryLimit) : undefined,
    disallowedInProduction: Boolean(disallowedInProduction),
    allowedParameters: Array.isArray(allowedParameters) ? allowedParameters : (allowedParameters ? String(allowedParameters).split(',').map((s) => s.trim()).filter(Boolean) : []),
    rateLimitPerMinute: Number(rateLimitPerMinute) || 30
  };

  db.addPolicy(newPolicy);
  return res.status(201).json({ policy: newPolicy });
});

policiesRouter.put('/:id', (req: Request, res: Response) => {
  const updated = db.updatePolicy(req.params.id as string, req.body);
  if (!updated) return res.status(404).json({ error: 'Policy not found' });
  return res.json({ policy: updated });
});

policiesRouter.delete('/:id', (req: Request, res: Response) => {
  const success = db.deletePolicy(req.params.id as string);
  if (!success) return res.status(404).json({ error: 'Policy not found' });
  return res.json({ success: true, message: 'Policy deleted' });
});
