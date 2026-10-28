import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../store/database.js';
import { cryptoService } from '../services/CryptoService.js';
import { DataSource } from '../types/governance.js';

export const sourcesRouter = Router();

sourcesRouter.get('/', (_req: Request, res: Response) => {
  res.json({ sources: db.getSources() });
});

sourcesRouter.get('/:id', (req: Request, res: Response) => {
  const source = db.getSourceById(req.params.id as string);
  if (!source) return res.status(404).json({ error: 'Source not found' });
  return res.json({ source });
});

sourcesRouter.post('/', (req: Request, res: Response) => {
  const { name, origin, owner, classification, permittedPurposes, qualityScore, retentionDays, slaHours, sampleContent, password } = req.body;
  if (!name || !origin || !owner || !classification) {
    return res.status(400).json({ error: 'Required fields: name, origin, owner, classification' });
  }

  // Cryptographic masking and AES-256-GCM encryption of database passwords
  const { maskedUri, extractedPassword } = cryptoService.maskConnectionString(origin);
  const secretToProtect = password || extractedPassword;

  let encryptedCredentials: string | undefined;
  let credentialsHash: string | undefined;

  if (secretToProtect) {
    encryptedCredentials = cryptoService.encryptSecret(secretToProtect);
    credentialsHash = cryptoService.hashSecret(secretToProtect);
  }

  const id = `src-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
  const contentHash = crypto.createHash('sha256').update(sampleContent || name).digest('hex');

  const newSource: DataSource = {
    id,
    name,
    origin: maskedUri,
    owner,
    classification: classification || 'INTERNAL',
    permittedPurposes: permittedPurposes || ['general_analytics'],
    qualityScore: qualityScore ?? 90,
    retentionDays: retentionDays ?? 365,
    slaHours: slaHours ?? 24,
    lastUpdated: new Date().toISOString(),
    contentHash: `sha256-${contentHash}`,
    sampleContent,
    encryptedCredentials,
    credentialsHash
  };

  db.addSource(newSource);
  return res.status(201).json({ source: newSource });
});

sourcesRouter.put('/:id', (req: Request, res: Response) => {
  const updates = { ...req.body };

  if (updates.origin) {
    const { maskedUri, extractedPassword } = cryptoService.maskConnectionString(updates.origin);
    updates.origin = maskedUri;
    const secretToProtect = updates.password || extractedPassword;
    if (secretToProtect) {
      updates.encryptedCredentials = cryptoService.encryptSecret(secretToProtect);
      updates.credentialsHash = cryptoService.hashSecret(secretToProtect);
    }
  }

  delete updates.password;

  const updated = db.updateSource(req.params.id as string, {
    ...updates,
    lastUpdated: new Date().toISOString()
  });
  if (!updated) return res.status(404).json({ error: 'Source not found' });
  return res.json({ source: updated });
});
