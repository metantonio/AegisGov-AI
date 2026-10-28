import { Router, Request, Response } from 'express';
import { governanceEngine } from '../services/GovernanceEngine.js';
import { db } from '../store/database.js';

export const gatewayRouter = Router();

/**
 * @route   POST /api/v1/gateway/process-prompt
 * @desc    Pass user prompts through the 6-stage AI governance chain (DLP, Identity, Context Lineage, Model Grounds)
 */
gatewayRouter.post('/process-prompt', (req: Request, res: Response) => {
  try {
    const { agentId, userPrompt, sourceIds, purpose, targetModel, userId, department } = req.body;
    if (!agentId || !userPrompt) {
      return res.status(400).json({
        error: 'Missing required parameters: `agentId` and `userPrompt` are mandatory.'
      });
    }

    const result = governanceEngine.processPrompt({
      agentId,
      userPrompt,
      sourceIds,
      purpose,
      targetModel,
      userId,
      department
    });

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/gateway/execute-action
 * @desc    Intercept and govern agent tool actions (Least privilege, Risk Tiering, Human-in-the-loop approvals)
 */
gatewayRouter.post('/execute-action', (req: Request, res: Response) => {
  try {
    const { agentId, toolName, parameters, environment, sourceIds, system, userId, department } = req.body;
    if (!agentId || !toolName || !parameters) {
      return res.status(400).json({
        error: 'Missing required parameters: `agentId`, `toolName`, and `parameters` are mandatory.'
      });
    }

    const result = governanceEngine.executeAction({
      agentId,
      toolName,
      parameters,
      environment,
      sourceIds,
      system,
      userId,
      department
    });

    const statusCode = result.status === 'BLOCKED' ? 403 : result.status === 'PENDING_APPROVAL' ? 202 : 200;
    return res.status(statusCode).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/v1/gateway/approvals
 * @desc    List all human-in-the-loop authorization tickets
 */
gatewayRouter.get('/approvals', (_req: Request, res: Response) => {
  return res.json({ approvals: db.getApprovals() });
});

/**
 * @route   POST /api/v1/gateway/approvals/:id/decide
 * @desc    Approve or reject a pending agent action
 */
gatewayRouter.post('/approvals/:id/decide', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decision, decidedBy, rationale } = req.body;

    if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ error: '`decision` must be either APPROVED or REJECTED.' });
    }
    if (!decidedBy) {
      return res.status(400).json({ error: '`decidedBy` (name or email of authorizer) is required.' });
    }

    const updated = governanceEngine.decideApproval(id as string, decision, decidedBy, rationale || 'Governance review completed.');
    return res.json({ success: true, approval: updated });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/v1/gateway/system/reset
 * @desc    Reset system state to BLANK (empty enterprise start) or DEMO (preset incident cases)
 */
gatewayRouter.post('/system/reset', (req: Request, res: Response) => {
  try {
    const { mode } = req.body;
    if (mode === 'DEMO') {
      const data = db.resetToDemo();
      return res.json({ success: true, message: 'System restored to demo state.', counts: { sources: data.sources.length, agents: data.agents.length, models: data.models.length } });
    } else {
      const data = db.resetToBlank();
      return res.json({ success: true, message: 'System reset to clean blank state.', counts: { sources: 0, agents: 0, models: 0 } });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
