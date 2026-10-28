import { Router, Request, Response } from 'express';
import { db } from '../store/database.js';
import { cryptoService } from '../services/CryptoService.js';
import { AIModel } from '../types/governance.js';

export const modelsRouter = Router();

modelsRouter.get('/', (_req: Request, res: Response) => {
  res.json({ models: db.getModels() });
});

modelsRouter.get('/:id', (req: Request, res: Response) => {
  const model = db.getModelById(req.params.id as string);
  if (!model) return res.status(404).json({ error: 'Model not found' });
  return res.json({ model });
});

modelsRouter.post('/', (req: Request, res: Response) => {
  const {
    name,
    provider,
    type,
    endpointUrl,
    modelIdentifier,
    apiKey,
    maxContextTokens,
    dataClassificationClearance,
    allowedRiskTiers,
    enforceGrounding,
    owner,
    department
  } = req.body;

  if (!name || !provider || !type || !modelIdentifier) {
    return res.status(400).json({ error: 'Required fields: name, provider, type, modelIdentifier' });
  }

  const id = `model-${provider.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${modelIdentifier.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

  let encryptedApiKey: string | undefined;
  let apiKeyPrefix: string | undefined;

  if (apiKey) {
    encryptedApiKey = cryptoService.encryptSecret(apiKey);
    apiKeyPrefix = cryptoService.getApiKeyPrefix(apiKey);
  }

  const newModel: AIModel = {
    id,
    name,
    provider,
    type: type === 'LOCAL' ? 'LOCAL' : 'EXTERNAL',
    endpointUrl: endpointUrl || (type === 'LOCAL' ? 'http://localhost:11434' : 'https://api.openai.com/v1'),
    modelIdentifier,
    encryptedApiKey,
    apiKeyPrefix,
    maxContextTokens: Number(maxContextTokens) || 128000,
    dataClassificationClearance: dataClassificationClearance || (type === 'LOCAL' ? 'RESTRICTED' : 'CONFIDENTIAL'),
    allowedRiskTiers: allowedRiskTiers || ['LOW', 'MEDIUM', 'HIGH'],
    enforceGrounding: enforceGrounding !== undefined ? Boolean(enforceGrounding) : true,
    status: 'ACTIVE',
    owner: owner || 'AI Engineering & Governance Group',
    department: department || (type === 'LOCAL' ? 'TI Security & On-Prem Compute' : 'Enterprise AI Cloud'),
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  db.addModel(newModel);
  return res.status(201).json({ model: newModel });
});

modelsRouter.put('/:id', (req: Request, res: Response) => {
  const updates = { ...req.body };

  if (updates.apiKey) {
    updates.encryptedApiKey = cryptoService.encryptSecret(updates.apiKey);
    updates.apiKeyPrefix = cryptoService.getApiKeyPrefix(updates.apiKey);
    delete updates.apiKey;
  }

  const updated = db.updateModel(req.params.id as string, updates);
  if (!updated) return res.status(404).json({ error: 'Model not found' });
  return res.json({ model: updated });
});

modelsRouter.patch('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
    return res.status(400).json({ error: 'Status must be ACTIVE or SUSPENDED' });
  }

  const updated = db.updateModel(req.params.id as string, { status });
  if (!updated) return res.status(404).json({ error: 'Model not found' });
  return res.json({ model: updated });
});

modelsRouter.delete('/:id', (req: Request, res: Response) => {
  const success = db.deleteModel(req.params.id as string);
  if (!success) return res.status(404).json({ error: 'Model not found' });
  return res.json({ success: true, message: 'Model deleted' });
});
