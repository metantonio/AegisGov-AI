import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../store/database.js';
import { cryptoService } from '../services/CryptoService.js';
import { AgentIdentity } from '../types/governance.js';

export const agentsRouter = Router();

agentsRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    agents: db.getAgents(),
    globalKillSwitch: db.getGlobalKillSwitch()
  });
});

agentsRouter.get('/:id', (req: Request, res: Response) => {
  const agent = db.getAgentById(req.params.id as string);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  return res.json({ agent });
});

agentsRouter.post('/', (req: Request, res: Response) => {
  const { name, technicalIdentity, systemOwner, processOwner, riskTier, scopes, allowedDataSources, allowedTools, environment } = req.body;
  if (!name || !technicalIdentity || !systemOwner || !processOwner) {
    return res.status(400).json({ error: 'Required fields: name, technicalIdentity, systemOwner, processOwner' });
  }

  const id = `agent-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
  const rawApiKey = `aegis_live_${crypto.randomBytes(16).toString('hex')}`;
  const apiKeyHash = cryptoService.hashApiKey(rawApiKey);
  const apiKeyPrefix = cryptoService.getApiKeyPrefix(rawApiKey);
  const tokenExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const newAgent: AgentIdentity = {
    id,
    name,
    technicalIdentity,
    systemOwner,
    processOwner,
    riskTier: riskTier || 'MEDIUM',
    scopes: scopes || ['support:read_policy'],
    allowedDataSources: allowedDataSources || [],
    allowedTools: allowedTools || [],
    environment: environment || 'sandbox',
    apiKeyHash,
    apiKeyPrefix,
    tokenExpiresAt,
    killSwitchActive: false,
    createdAt: new Date().toISOString()
  };

  db.addAgent(newAgent);
  return res.status(201).json({
    agent: newAgent,
    rawApiKey,
    notice: 'SAVE THIS KEY NOW: For compliance (ISO/IEC 42001 & SOC 2), API keys are stored only as one-way cryptographic SHA-256 hashes and cannot be retrieved later.'
  });
});

agentsRouter.put('/:id', (req: Request, res: Response) => {
  const {
    name,
    technicalIdentity,
    systemOwner,
    processOwner,
    department,
    riskTier,
    scopes,
    allowedDataSources,
    allowedTools,
    environment
  } = req.body;

  const updates: Partial<AgentIdentity> = {};
  if (name !== undefined) updates.name = name;
  if (technicalIdentity !== undefined) updates.technicalIdentity = technicalIdentity;
  if (systemOwner !== undefined) updates.systemOwner = systemOwner;
  if (processOwner !== undefined) updates.processOwner = processOwner;
  if (department !== undefined) updates.department = department;
  if (riskTier !== undefined) updates.riskTier = riskTier;
  if (scopes !== undefined) updates.scopes = scopes;
  if (allowedDataSources !== undefined) updates.allowedDataSources = allowedDataSources;
  if (allowedTools !== undefined) updates.allowedTools = allowedTools;
  if (environment !== undefined) updates.environment = environment;

  const updated = db.updateAgent(req.params.id as string, updates);
  if (!updated) return res.status(404).json({ error: 'Agent not found' });
  return res.json({ success: true, agent: updated });
});

agentsRouter.patch('/:id/kill-switch', (req: Request, res: Response) => {
  const { active } = req.body;
  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: '`active` boolean parameter required' });
  }
  const updated = db.setAgentKillSwitch(req.params.id as string, active);
  if (!updated) return res.status(404).json({ error: 'Agent not found' });
  return res.json({ success: true, agent: updated });
});

agentsRouter.post('/global-kill-switch', (req: Request, res: Response) => {
  const { active } = req.body;
  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: '`active` boolean parameter required' });
  }
  const result = db.setGlobalKillSwitch(active);
  return res.json({ success: true, globalKillSwitch: result });
});
