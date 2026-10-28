import { Router, Request, Response } from 'express';

export const docsRouter = Router();

const OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'AegisGov AI - ISO/IEC 42001 AI & Data Governance Middleware API',
    version: '1.0.0',
    description: `A comprehensive AI & Data Governance Middleware Gateway adhering to ISO/IEC 42001:2023, NIST AI RMF 1.0, EU AI Act, and GDPR.

Any client application or autonomous agent can route prompts and tool invocations through this middleware to guarantee:
1. Data Sources Catalog & Purpose Verification (ISO 42001 Cl. 6.1.2)
2. Technical Identity, Scopes & Kill Switches (ISO 42001 Cl. A.7.2)
3. Lineage, Context Grounding & DLP PII Masking (DAMA-DMBOK & GDPR Art. 5)
4. Model Guardrails & Hallucination Prevention (Air Canada Case Mitigation)
5. Agent Execution Sandbox & Human-in-the-Loop Approvals (EU AI Act Art. 14)
6. Immutable SHA-256 Correlated Audit Trail (ISO 42001 Cl. 9.1 & 9.2)`,
    contact: {
      name: 'AI Governance Office',
      email: 'governance@aegis-ai.local'
    }
  },
  servers: [
    {
      url: 'http://localhost:4000/api/v1',
      description: 'Local Governance Middleware Gateway'
    }
  ],
  paths: {
    '/gateway/process-prompt': {
      post: {
        summary: 'Process Prompt through 6-Stage Governance Pipeline (Mode A: LLM Guardrail / Proxy)',
        description: 'Sanitizes inputs using DLP, verifies grounded data sources, and generates compliant model responses with audit signature.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['agentId', 'userPrompt'],
                properties: {
                  agentId: { type: 'string', example: 'agent-airline-support-01' },
                  userPrompt: { type: 'string', example: 'Can a customer get a retroactive refund for bereavement fares?' },
                  sourceIds: { type: 'array', items: { type: 'string' }, example: ['src-airline-policy-01'] },
                  purpose: { type: 'string', example: 'customer_support' },
                  targetModel: { type: 'string', example: 'claude-3-5-sonnet' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Prompt safely processed and evaluated by governance engine' },
          '403': { description: 'Blocked by emergency kill switch or DLP violation' }
        }
      }
    },
    '/gateway/execute-action': {
      post: {
        summary: 'Execute Agent Tool Action with Policy Gatekeeper (Mode B: Action Interceptor)',
        description: 'Intercepts tool execution, enforces environment separation (sandbox vs prod), monetary limits, and human-in-the-loop approvals.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['agentId', 'toolName', 'parameters'],
                properties: {
                  agentId: { type: 'string', example: 'agent-fin-treasury-02' },
                  toolName: { type: 'string', example: 'financial.transfer_funds' },
                  parameters: {
                    type: 'object',
                    example: {
                      recipientIban: 'GB82WEST12345678901234',
                      amount: 8500,
                      currency: 'USD',
                      idempotencyKey: 'tx-2026-9901'
                    }
                  },
                  environment: { type: 'string', enum: ['sandbox', 'production'], default: 'production' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Action auto-approved and executed' },
          '202': { description: 'Action held in PENDING_APPROVAL status for human signoff' },
          '403': { description: 'Action blocked by policy or kill switch' }
        }
      }
    },
    '/gateway/approvals': {
      get: {
        summary: 'List Pending Human-in-the-Loop Approvals',
        description: 'Returns all action execution tickets awaiting governance or human supervisor sign-off.'
      }
    },
    '/gateway/approvals/{id}/decide': {
      post: {
        summary: 'Authorize or Reject a Pending Agent Action',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['decision', 'decidedBy'],
                properties: {
                  decision: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
                  decidedBy: { type: 'string', example: 'sarah.connor@enterprise.com' },
                  rationale: { type: 'string', example: 'Invoice verified with accounting manager.' }
                }
              }
            }
          }
        }
      }
    },
    '/evidence': {
      get: {
        summary: 'Query Correlated Audit Trail Records',
        description: 'Retrieves immutable audit records linking sources, identity, context, decision, approval, and execution.'
      }
    },
    '/evidence/verify-chain': {
      get: {
        summary: 'Verify Cryptographic Tamper-Evident SHA-256 Ledger',
        description: 'Verifies blockchain-style sequential hashes from genesis to latest record to guarantee evidence integrity.'
      }
    },
    '/sources': {
      get: { summary: 'List Data Catalog Sources' },
      post: { summary: 'Register a New Data Source' }
    },
    '/agents': {
      get: { summary: 'List Registered AI Agents' },
      post: { summary: 'Register a New AI Agent' }
    },
    '/agents/{id}/kill-switch': {
      patch: {
        summary: 'Activate or Deactivate Emergency Kill Switch for Agent',
        description: 'Immediately cuts off an agent from all prompts, data sources, and tools.'
      }
    },
    '/maturity': {
      get: {
        summary: 'Get 20-Point ISO/IEC 42001 Maturity Diagnostic',
        description: 'Returns status across Data, Agents & Access, Evidence, Responsibility, and Scale.'
      }
    }
  }
};

docsRouter.get('/openapi.json', (_req: Request, res: Response) => {
  res.json(OPENAPI_SPEC);
});

docsRouter.get('/', (_req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>AegisGov AI - API Reference</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; background: #0f172a; }
    .topbar { display: none; }
    .swagger-ui .info .title { color: #38bdf8 !important; }
    .swagger-ui { background: #0f172a; filter: invert(88%) hue-rotate(180deg); }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/v1/docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;
  res.send(html);
});
