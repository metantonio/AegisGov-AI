import React, { useState } from 'react';
import { BookOpen, ExternalLink, Copy, Check, Terminal, Code2 } from 'lucide-react';

export const DocsView: React.FC = () => {
  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  const copyCode = (code: string, lang: string) => {
    navigator.clipboard.writeText(code);
    setCopiedLang(lang);
    setTimeout(() => setCopiedLang(null), 2000);
  };

  const pythonSnippet = `# Install requirement: No third-party deps needed (uses standard urllib)
# or pip install aegis-governance

from aegis_middleware import GovernanceMiddlewareClient

# 1. Connect external app / agent to middleware
client = GovernanceMiddlewareClient(
    endpoint_url="http://localhost:4000/api/v1",
    agent_id="agent-airline-support-01",
    api_key="aegis_live_aircan_key_9941a7c"
)

# 2. Route prompt through 6-stage governance (DLP, Grounding, Policy)
response = client.process_prompt(
    user_prompt="Can I get a retroactive bereavement refund after flight completion?",
    source_ids=["src-airline-policy-01"]
)
print("Sanitized Prompt:", response["sanitizedPrompt"])
print("Model Decision:", response["modelDecision"]["generatedResponse"])
print("Cryptographic Audit Signature:", response["auditSignature"])

# 3. Intercept sensitive agent tool action (Evaluates risk & triggers human approval)
action_resp = client.execute_action(
    tool_name="financial.transfer_funds",
    parameters={"recipientIban": "GB82WEST12345678901234", "amount": 8500, "currency": "USD"},
    environment="production"
)
print("Status:", action_resp["status"]) # Returns 'PENDING_APPROVAL' with approvalId ticket`;

  const nodeSnippet = `// TypeScript / Node.js SDK
import { GovernanceMiddlewareClient } from './aegis-middleware';

const client = new GovernanceMiddlewareClient({
  endpointUrl: 'http://localhost:4000/api/v1',
  agentId: 'agent-fin-treasury-02',
  apiKey: 'aegis_live_fin_key_7718be8'
});

// Mode A: Process Prompt (LLM Guardrail)
const promptResult = await client.processPrompt({
  userPrompt: 'Review contract with user email jane@corp.com',
  sourceIds: ['src-crm-customers-02']
});
console.log(promptResult.sanitizedPrompt); // PII automatically masked by DLP

// Mode B: Intercept Action
const toolResult = await client.executeAction({
  toolName: 'financial.transfer_funds',
  parameters: { recipientIban: 'GB82WEST12345678901234', amount: 8500, currency: 'USD' },
  environment: 'production'
});
console.log(toolResult.status); // PENDING_APPROVAL`;

  const curlSnippet = `# 1. Process Prompt (Mode A: LLM Guardrail / Proxy)
curl -X POST http://localhost:4000/api/v1/gateway/process-prompt \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "agent-airline-support-01",
    "userPrompt": "Can I claim a retroactive bereavement fare?",
    "sourceIds": ["src-airline-policy-01"]
  }'

# 2. Execute Action (Mode B: Tool Gateway Interceptor)
curl -X POST http://localhost:4000/api/v1/gateway/execute-action \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "agent-fin-treasury-02",
    "toolName": "financial.transfer_funds",
    "parameters": {
      "recipientIban": "GB82WEST12345678901234",
      "amount": 8500,
      "currency": "USD"
    },
    "environment": "production"
  }'`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              Developer API Documentation & Integration SDK
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Any external application, autonomous agent, or LangChain / LlamaIndex workflow can connect to AegisGov AI as a middleware proxy.
            </p>
          </div>

          <a 
            href="http://localhost:4000/api/v1/docs" 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <span>Interactive OpenAPI Swagger Explorer</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Middleware Pattern Explanation */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
          How to Use as a Middleware
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Rather than letting your application connect directly to raw LLM APIs or execute tools without boundaries, route your calls through <code>http://localhost:4000/api/v1/gateway</code>. The middleware intercepts every input, enforces technical identity, filters proprietary secrets with DLP, validates parameter schemas, guards sandbox boundaries, triggers human approvals for high-risk actions, and records a cryptographically signed SHA-256 audit block for ISO 42001 certification.
        </p>
      </div>

      {/* Code Snippets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Python */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={18} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Python Middleware SDK</span>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '4px 8px' }} onClick={() => copyCode(pythonSnippet, 'python')}>
              {copiedLang === 'python' ? <><Check size={12} color="var(--accent-emerald)" /> Copied</> : <><Copy size={12} /> Copy Code</>}
            </button>
          </div>
          <pre className="code-container" style={{ fontSize: '0.8rem' }}>
            {pythonSnippet}
          </pre>
        </div>

        {/* Node.js */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={18} color="var(--accent-purple)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Node.js & TypeScript Middleware SDK</span>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '4px 8px' }} onClick={() => copyCode(nodeSnippet, 'node')}>
              {copiedLang === 'node' ? <><Check size={12} color="var(--accent-emerald)" /> Copied</> : <><Copy size={12} /> Copy Code</>}
            </button>
          </div>
          <pre className="code-container" style={{ fontSize: '0.8rem' }}>
            {nodeSnippet}
          </pre>
        </div>

        {/* cURL */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} color="var(--accent-emerald)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>cURL Raw HTTP REST API</span>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '4px 8px' }} onClick={() => copyCode(curlSnippet, 'curl')}>
              {copiedLang === 'curl' ? <><Check size={12} color="var(--accent-emerald)" /> Copied</> : <><Copy size={12} /> Copy Code</>}
            </button>
          </div>
          <pre className="code-container" style={{ fontSize: '0.8rem' }}>
            {curlSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
