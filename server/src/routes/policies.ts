import { Router, Request, Response } from 'express';
import { db } from '../store/database.js';

export const policiesRouter = Router();

policiesRouter.get('/', (_req: Request, res: Response) => {
  res.json({ policies: db.getPolicies() });
});

policiesRouter.put('/:id', (req: Request, res: Response) => {
  const updated = db.updatePolicy(req.params.id as string, req.body);
  if (!updated) return res.status(404).json({ error: 'Policy not found' });
  return res.json({ policy: updated });
});
