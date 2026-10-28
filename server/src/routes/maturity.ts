import { Router, Request, Response } from 'express';
import { db } from '../store/database.js';

export const maturityRouter = Router();

maturityRouter.get('/', (_req: Request, res: Response) => {
  const controls = db.getMaturityControls();
  const raci = db.getRACI();

  const total = controls.length;
  const implemented = controls.filter((c) => c.status === 'YES').length;
  const partial = controls.filter((c) => c.status === 'PARTIAL').length;
  const absent = controls.filter((c) => c.status === 'NO').length;

  const scorePercentage = Math.round(((implemented * 1 + partial * 0.5) / total) * 100);

  let readinessLevel = 'Emerging';
  if (scorePercentage >= 85) readinessLevel = 'Optimized (ISO 42001 Ready)';
  else if (scorePercentage >= 65) readinessLevel = 'Managed & Monitored';
  else if (scorePercentage >= 40) readinessLevel = 'Defined';

  return res.json({
    summary: {
      totalControls: total,
      implemented,
      partial,
      absent,
      scorePercentage,
      readinessLevel
    },
    controls,
    raci
  });
});

maturityRouter.patch('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  const { status } = req.body;

  if (!['YES', 'PARTIAL', 'NO'].includes(status)) {
    return res.status(400).json({ error: 'Status must be YES, PARTIAL, or NO' });
  }

  const updated = db.updateMaturityControl(id, status);
  if (!updated) return res.status(404).json({ error: 'Control not found' });
  return res.json({ control: updated });
});
