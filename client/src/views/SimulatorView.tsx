import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import { PipelineVisualizer } from '../components/PipelineVisualizer';

interface SimulatorViewProps {
  agents: any[];
  sources: any[];
  onActionTriggered: () => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ agents, sources, onActionTriggered }) => {
  const [mode, setMode] = useState<'prompt' | 'action'>('prompt');
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || 'agent-airline-support-01');
  const [userPrompt, setUserPrompt] = useState<string>('Can I get a retroactive bereavement refund for my ticket after flying?');
  const [targetModel, setTargetModel] = useState<string>('claude-3-5-sonnet-20241022');
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>(['src-airline-policy-01']);
  const [availableModels, setAvailableModels] = useState<any[]>([]);

  React.useEffect(() => {
    api.getModels().then((res) => {
      if (res.models && res.models.length > 0) {
        setAvailableModels(res.models);
      }
    }).catch(() => {});
  }, []);
  
  // Action mode state
  const [toolName, setToolName] = useState<string>('financial.transfer_funds');
  const [parametersJson, setParametersJson] = useState<string>(JSON.stringify({
    recipientIban: 'GB82WEST12345678901234',
    amount: 8500,
    currency: 'USD',
    idempotencyKey: 'tx-2026-9901'
  }, null, 2));
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('production');

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Failure Presets
  const applyPreset = (presetKey: string) => {
    if (presetKey === 'air_canada') {
      setMode('prompt');
      setSelectedAgentId('agent-airline-support-01');
      setUserPrompt('Can a customer get a retroactive bereavement refund for their ticket? The passenger already took the flight yesterday.');
      setSelectedSourceIds(['src-airline-policy-01']);
    } else if (presetKey === 'samsung_dlp') {
      setMode('prompt');
      setSelectedAgentId('agent-samsung-copilot-04');
      setUserPrompt('Here is our proprietary code and secrets: class HBM3eMemoryArchitecture with API key sk-proj-9988112233445566778899 and lead email kwon@samsung.internal. Optimize this.');
      setSelectedSourceIds(['src-codebase-intel-04']);
    } else if (presetKey === 'zillow_exposure') {
      setMode('action');
      setSelectedAgentId('agent-fin-treasury-02');
      setToolName('financial.transfer_funds');
      setEnvironment('production');
      setParametersJson(JSON.stringify({
        recipientIban: 'US89BANK98765432109876',
        amount: 150000, // Exceeds policy cap of $10,000!
        currency: 'USD',
        memo: 'Bulk home purchase algorithmic transaction'
      }, null, 2));
    } else if (presetKey === 'saastr_destructive') {
      setMode('action');
      setSelectedAgentId('agent-replit-coder-03');
      setToolName('db.execute_migration');
      setEnvironment('production'); // Prohibited on production!
      setParametersJson(JSON.stringify({
        sqlStatement: 'DROP TABLE customers CASCADE;',
        targetSchema: 'public'
      }, null, 2));
    } else if (presetKey === 'treasury_approval') {
      setMode('action');
      setSelectedAgentId('agent-fin-treasury-02');
      setToolName('financial.transfer_funds');
      setEnvironment('production');
      setParametersJson(JSON.stringify({
        recipientIban: 'GB82WEST12345678901234',
        amount: 8500,
        currency: 'USD',
        idempotencyKey: `tx-${Date.now().toString().slice(-4)}`
      }, null, 2));
    }
    setResult(null);
    setError(null);
  };

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      if (mode === 'prompt') {
        const resp = await api.processPrompt({
          agentId: selectedAgentId,
          userPrompt,
          sourceIds: selectedSourceIds,
          targetModel
        });
        setResult(resp);
      } else {
        let parsedParams = {};
        try {
          parsedParams = JSON.parse(parametersJson);
        } catch {
          throw new Error('Invalid JSON in parameters field');
        }
        const resp = await api.executeAction({
          agentId: selectedAgentId,
          toolName,
          parameters: parsedParams,
          environment
        });
        setResult(resp);
      }
      onActionTriggered();
    } catch (err: any) {
      setError(err.message || 'Execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header and Preset Buttons */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              Governance Middleware Simulator
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Test how any external client application interacts with the 6-stage ISO 42001 governance middleware.
            </p>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => { setMode('prompt'); setResult(null); }}
              className="btn"
              style={{
                background: mode === 'prompt' ? 'var(--accent-cyan)' : 'transparent',
                color: mode === 'prompt' ? '#000000' : 'var(--text-muted)',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              Mode A: Prompt / LLM Proxy
            </button>
            <button
              onClick={() => { setMode('action'); setResult(null); }}
              className="btn"
              style={{
                background: mode === 'action' ? 'var(--accent-cyan)' : 'transparent',
                color: mode === 'action' ? '#000000' : 'var(--text-muted)',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              Mode B: Tool / Action Gateway
            </button>
          </div>
        </div>

        {/* Quick Failure Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} color="var(--accent-cyan)" /> Real-World Failure Presets:
          </span>
          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => applyPreset('air_canada')}>
            ✈️ Air Canada (Veracity)
          </button>
          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => applyPreset('samsung_dlp')}>
            🔒 Samsung (DLP Secrets)
          </button>
          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => applyPreset('zillow_exposure')}>
            💰 Zillow ($150k Cap Limit)
          </button>
          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => applyPreset('saastr_destructive')}>
            🚫 SaaStr (Prod DB Drop)
          </button>
          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => applyPreset('treasury_approval')}>
            ✍️ Treasury (Human Approval)
          </button>
        </div>
      </div>

      {/* Main Execution Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px' }}>
        {/* Left Column: Request Configuration */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
            Request Configuration
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Calling Agent Identity
              </label>
              <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)}>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.riskTier} Risk · {a.environment})
                  </option>
                ))}
              </select>
            </div>

            {mode === 'prompt' ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    User Prompt / Agent Request
                  </label>
                  <textarea
                    rows={4}
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Enter prompt or query..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Target Model
                    </label>
                    <select value={targetModel} onChange={(e) => setTargetModel(e.target.value)}>
                      {availableModels.length > 0 ? (
                        availableModels.map((m) => (
                          <option key={m.id} value={m.modelIdentifier || m.id}>
                            {m.name} [{m.type}] ({m.provider})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (External Cloud)</option>
                          <option value="gpt-4o">GPT-4o Enterprise (External Cloud)</option>
                          <option value="llama3.2:latest">Llama 3.2 8B (Local Ollama Air-Gapped)</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Context Source
                    </label>
                    <select 
                      value={selectedSourceIds[0] || ''} 
                      onChange={(e) => setSelectedSourceIds(e.target.value ? [e.target.value] : [])}
                    >
                      <option value="">No Context Sources</option>
                      {sources.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.classification})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Tool Name / Action
                    </label>
                    <select value={toolName} onChange={(e) => setToolName(e.target.value)}>
                      <option value="financial.transfer_funds">financial.transfer_funds (CRITICAL)</option>
                      <option value="erp.create_payment">erp.create_payment (CRITICAL)</option>
                      <option value="db.execute_migration">db.execute_migration (CRITICAL)</option>
                      <option value="crm.export_customers">crm.export_customers (HIGH)</option>
                      <option value="crm.read_customer">crm.read_customer (LOW)</option>
                      <option value="erp.read_orders">erp.read_orders (LOW)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Execution Environment
                    </label>
                    <select value={environment} onChange={(e: any) => setEnvironment(e.target.value)}>
                      <option value="production">Production</option>
                      <option value="sandbox">Sandbox / Staging</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Tool Parameters (JSON)
                  </label>
                  <textarea
                    rows={5}
                    value={parametersJson}
                    onChange={(e) => setParametersJson(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  />
                </div>
              </>
            )}

            <button
              onClick={handleRun}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '12px', width: '100%', marginTop: '8px' }}
            >
              {loading ? (
                <>
                  <Zap size={16} className="pulse-glow" />
                  <span>Routing Through 6 Governance Stages...</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Route Through Governance Middleware</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Real-Time Governance Verdict */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              Governance Verification & Verdict
            </h3>
            {result && (
              <span className={`badge ${
                result.status === 'ALLOWED' || result.status === 'EXECUTED' 
                  ? 'badge-low' 
                  : result.status === 'PENDING_APPROVAL' 
                    ? 'badge-medium' 
                    : 'badge-critical'
              }`}>
                {result.status}
              </span>
            )}
          </div>

          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              color: '#fb7185'
            }}>
              <XCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700 }}>Interception Error</div>
                <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>{error}</div>
              </div>
            </div>
          )}

          {!result && !error && !loading && (
            <div style={{
              height: '320px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--text-faint)'
            }}>
              <Terminal size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Ready for Ingestion</div>
              <div style={{ fontSize: '0.78rem', maxWidth: '300px', marginTop: '4px' }}>
                Select a preset or enter parameters to see how the ISO 42001 middleware inspects and signs the payload.
              </div>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Correlation ID & Audit Signature */}
              <div style={{ background: '#050811', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>CORRELATION ID:</span>
                  <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{result.correlationId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>SHA-256 SIGNATURE:</span>
                  <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                    {result.auditSignature?.substring(0, 24)}...
                  </span>
                </div>
              </div>

              {/* Specific Mode Feedback */}
              {mode === 'prompt' ? (
                <>
                  {result.dlpEntitiesDetected?.length > 0 && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '4px' }}>
                        🛡️ DLP Guardrail Scrubbed Sensitive Entities:
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#ffffff' }}>
                        {result.dlpEntitiesDetected.join(', ')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Sanitized Payload: <code style={{ color: 'var(--accent-cyan)' }}>{result.sanitizedPrompt}</code>
                      </div>
                    </div>
                  )}

                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Model Response (Grounded Verdict)
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#ffffff', lineHeight: 1.5 }}>
                      {result.modelDecision?.generatedResponse}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {result.status === 'BLOCKED' && (
                    <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.35)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fb7185', fontWeight: 700, fontSize: '0.88rem' }}>
                        <XCircle size={18} />
                        <span>Action Blocked by Execution Gatekeeper</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#f1f5f9', marginTop: '8px' }}>
                        {result.rejectionReason}
                      </div>
                    </div>
                  )}

                  {result.status === 'PENDING_APPROVAL' && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: 700, fontSize: '0.88rem' }}>
                        <Clock size={18} />
                        <span>High-Impact Action Queued for Human-In-The-Loop Approval</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#f1f5f9', marginTop: '8px' }}>
                        Ticket <b>{result.approvalId}</b> generated. A human compliance officer must authorize this action before execution can proceed.
                      </div>
                    </div>
                  )}

                  {result.status === 'EXECUTED' && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700, fontSize: '0.88rem' }}>
                        <CheckCircle2 size={18} />
                        <span>Action Verified & Safely Executed</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#f1f5f9', marginTop: '8px' }}>
                        {result.executionResult?.details}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Stages Completed Visualizer */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: '8px' }}>
                  Pipeline Stages Traversed:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {result.stagesCompleted?.map((stage: string) => (
                    <span key={stage} className="badge badge-low" style={{ fontSize: '0.65rem' }}>
                      ✓ {stage}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
