import React, { useState, useEffect } from 'react';
import { Cpu, Plus, Power, ShieldCheck, AlertTriangle, ExternalLink, HardDrive, CheckCircle2, Lock, Sliders, Trash2 } from 'lucide-react';
import { api } from '../services/api';

interface ModelsViewProps {
  onRefresh?: () => void;
}

export const ModelsView: React.FC<ModelsViewProps> = ({ onRefresh }) => {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingModel, setEditingModel] = useState<any | null>(null);

  // Form states for creating / editing
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('Ollama');
  const [type, setType] = useState<'EXTERNAL' | 'LOCAL'>('LOCAL');
  const [endpointUrl, setEndpointUrl] = useState('http://localhost:11434');
  const [modelIdentifier, setModelIdentifier] = useState('llama3.2:latest');
  const [apiKey, setApiKey] = useState('');
  const [maxContextTokens, setMaxContextTokens] = useState(128000);
  const [dataClassificationClearance, setDataClassificationClearance] = useState('RESTRICTED');
  const [allowedRiskTiers, setAllowedRiskTiers] = useState<string[]>(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
  const [enforceGrounding, setEnforceGrounding] = useState<boolean>(true);
  const [owner, setOwner] = useState('AI Infrastructure Team');
  const [department, setDepartment] = useState('TI Operations');

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await api.getModels();
      setModels(res.models || []);
    } catch (err: any) {
      console.error('Failed to load models:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    if (newProvider === 'Ollama') {
      setType('LOCAL');
      setEndpointUrl('http://localhost:11434');
      setModelIdentifier('llama3.2:latest');
      setDataClassificationClearance('RESTRICTED');
    } else if (newProvider === 'vLLM') {
      setType('LOCAL');
      setEndpointUrl('http://localhost:8000/v1');
      setModelIdentifier('mistralai/Mistral-7B-Instruct');
      setDataClassificationClearance('RESTRICTED');
    } else if (newProvider === 'OpenAI') {
      setType('EXTERNAL');
      setEndpointUrl('https://api.openai.com/v1');
      setModelIdentifier('gpt-4o');
      setDataClassificationClearance('CONFIDENTIAL');
    } else if (newProvider === 'Anthropic') {
      setType('EXTERNAL');
      setEndpointUrl('https://api.anthropic.com/v1');
      setModelIdentifier('claude-3-5-sonnet-20241022');
      setDataClassificationClearance('CONFIDENTIAL');
    } else if (newProvider === 'Google') {
      setType('EXTERNAL');
      setEndpointUrl('https://generativelanguage.googleapis.com/v1beta');
      setModelIdentifier('gemini-1.5-pro');
      setDataClassificationClearance('CONFIDENTIAL');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createModel({
        name,
        provider,
        type,
        endpointUrl,
        modelIdentifier,
        apiKey: apiKey || undefined,
        maxContextTokens: Number(maxContextTokens),
        dataClassificationClearance,
        allowedRiskTiers,
        enforceGrounding,
        owner,
        department
      });
      setShowModal(false);
      setName('');
      setApiKey('');
      fetchModels();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to register model');
    }
  };

  const openEditModal = (model: any) => {
    setEditingModel(model);
    setName(model.name);
    setProvider(model.provider);
    setType(model.type);
    setEndpointUrl(model.endpointUrl);
    setModelIdentifier(model.modelIdentifier);
    setApiKey('');
    setMaxContextTokens(model.maxContextTokens || 128000);
    setDataClassificationClearance(model.dataClassificationClearance || 'CONFIDENTIAL');
    setAllowedRiskTiers(model.allowedRiskTiers || ['LOW', 'MEDIUM', 'HIGH']);
    setEnforceGrounding(model.enforceGrounding !== false);
    setOwner(model.owner || '');
    setDepartment(model.department || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel) return;
    try {
      await api.updateModel(editingModel.id, {
        name,
        endpointUrl,
        modelIdentifier,
        apiKey: apiKey || undefined,
        maxContextTokens: Number(maxContextTokens),
        dataClassificationClearance,
        allowedRiskTiers,
        enforceGrounding,
        owner,
        department
      });
      setEditingModel(null);
      fetchModels();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update model');
    }
  };

  const toggleModelStatus = async (modelId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.setModelStatus(modelId, nextStatus);
      fetchModels();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (modelId: string) => {
    if (window.confirm('Are you sure you want to remove this model from the governance registry?')) {
      try {
        await api.deleteModel(modelId);
        fetchModels();
        if (onRefresh) onRefresh();
      } catch (err: any) {
        alert(err.message || 'Failed to delete model');
      }
    }
  };

  const toggleRiskTier = (tier: string) => {
    if (allowedRiskTiers.includes(tier)) {
      setAllowedRiskTiers(allowedRiskTiers.filter((t) => t !== tier));
    } else {
      setAllowedRiskTiers([...allowedRiskTiers, tier]);
    }
  };

  const getClearanceBadge = (cls: string) => {
    switch (cls) {
      case 'RESTRICTED': return 'badge-critical';
      case 'CONFIDENTIAL': return 'badge-medium';
      case 'INTERNAL': return 'badge-cyan';
      default: return 'badge-low';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              LLM Models Registry & Guardrails (Stage 4)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ISO 42001 Cl. 6.1.2 & Annex A.8: Authoritative inventory of External (Cloud) and Local (Air-Gapped) LLM models with data sensitivity clearances, token caps, and grounding constraints.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => {
            setName('');
            handleProviderChange('Ollama');
            setShowModal(true);
          }}>
            <Plus size={16} /> Register New LLM Model
          </button>
        </div>
      </div>

      {/* Models Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
        {models.map((model) => (
          <div
            key={model.id}
            className="glass-panel"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              border: model.status === 'SUSPENDED' ? '1px solid rgba(244, 63, 94, 0.4)' : undefined,
              background: model.status === 'SUSPENDED' ? 'rgba(244, 63, 94, 0.03)' : undefined
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span className={`badge ${model.type === 'LOCAL' ? 'badge-emerald' : 'badge-purple'}`} style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {model.type === 'LOCAL' ? <HardDrive size={11} /> : <ExternalLink size={11} />}
                  {model.type} ({model.provider})
                </span>
                <span className={`badge ${getClearanceBadge(model.dataClassificationClearance)}`} style={{ fontSize: '0.65rem' }}>
                  Max: {model.dataClassificationClearance}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => openEditModal(model)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                  title="Configure Permissions & Clearance"
                >
                  <Sliders size={13} />
                  <span>Configure</span>
                </button>
                <button
                  onClick={() => toggleModelStatus(model.id, model.status)}
                  className="btn"
                  style={{
                    background: model.status === 'SUSPENDED' ? 'var(--accent-rose)' : 'rgba(255, 255, 255, 0.05)',
                    color: model.status === 'SUSPENDED' ? '#ffffff' : 'var(--text-muted)',
                    border: `1px solid ${model.status === 'SUSPENDED' ? '#f43f5e' : 'var(--border-subtle)'}`,
                    fontSize: '0.72rem',
                    padding: '4px 8px'
                  }}
                  title="Toggle Model Availability"
                >
                  <Power size={13} />
                  <span>{model.status === 'SUSPENDED' ? 'SUSPENDED' : 'Active'}</span>
                </button>
              </div>
            </div>

            {/* Model Name & ID */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                {model.name}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                Identifier: {model.modelIdentifier}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Endpoint: <code style={{ color: '#cbd5e1' }}>{model.endpointUrl}</code>
              </div>
            </div>

            {/* Governance Properties */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-faint)' }}>Context Window:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{(model.maxContextTokens || 128000).toLocaleString()} tokens</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-faint)' }}>Grounding Verification:</span>
                <span style={{ color: model.enforceGrounding ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: 600 }}>
                  {model.enforceGrounding ? 'ENFORCED (Anti-Hallucination)' : 'DISABLED'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-faint)' }}>Assigned Department:</span>
                <span style={{ color: '#cbd5e1' }}>{model.department || 'Enterprise AI'}</span>
              </div>
            </div>

            {/* Allowed Risk Tiers */}
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: '4px' }}>
                Authorized Agent Risk Tiers:
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {model.allowedRiskTiers?.map((tier: string) => (
                  <span key={tier} style={{ fontSize: '0.68rem', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)', padding: '2px 8px', borderRadius: '4px' }}>
                    {tier}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer / Secret status */}
            <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={12} style={{ color: 'var(--accent-emerald)' }} />
                Vault: {model.type === 'LOCAL' ? 'No External API Key Needed (Air-Gapped)' : `Encrypted AES-256 (${model.apiKeyPrefix || 'Key Saved'})`}
              </span>
              <button
                onClick={() => handleDelete(model.id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: '2px' }}
                title="Delete Model"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Register Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '600px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
              Register LLM Model (External Cloud or Local Air-Gapped)
            </h3>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Provider Preset</label>
                <select value={provider} onChange={(e) => handleProviderChange(e.target.value)}>
                  <option value="Ollama">Ollama (Local / On-Premise Air-Gapped)</option>
                  <option value="vLLM">vLLM (Local GPU Server / Cluster)</option>
                  <option value="OpenAI">OpenAI (External Cloud)</option>
                  <option value="Anthropic">Anthropic (External Cloud)</option>
                  <option value="Google">Google Gemini (External Cloud)</option>
                  <option value="Custom">Custom Provider</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Deployment Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value as any)}>
                    <option value="LOCAL">LOCAL (On-Premises / Air-Gapped)</option>
                    <option value="EXTERNAL">EXTERNAL (Cloud / SaaS)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Model Identifier</label>
                  <input required value={modelIdentifier} onChange={(e) => setModelIdentifier(e.target.value)} placeholder="e.g. llama3.2:latest, gpt-4o" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Display Name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Local Llama 3.2 8B (Air-Gapped)" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Endpoint URL</label>
                <input required value={endpointUrl} onChange={(e) => setEndpointUrl(e.target.value)} placeholder="e.g. http://localhost:11434" />
              </div>

              {type === 'EXTERNAL' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>API Key (Encrypted in AES-256 Vault)</label>
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)' }}>🔒 Encrypted with AES-256-GCM before saving.</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Max Context Tokens</label>
                  <input type="number" value={maxContextTokens} onChange={(e) => setMaxContextTokens(Number(e.target.value))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Data Clearance Level</label>
                  <select value={dataClassificationClearance} onChange={(e) => setDataClassificationClearance(e.target.value)}>
                    <option value="INTERNAL">INTERNAL (Lowest)</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL (Standard)</option>
                    <option value="RESTRICTED">RESTRICTED (Air-Gapped / Highly Sensitive)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Owner</label>
                  <input value={owner} onChange={(e) => setOwner(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Department</label>
                  <input value={department} onChange={(e) => setDepartment(e.target.value)} />
                </div>
              </div>

              {/* Grounding toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <input
                  type="checkbox"
                  id="groundingCheckbox"
                  checked={enforceGrounding}
                  onChange={(e) => setEnforceGrounding(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="groundingCheckbox" style={{ fontSize: '0.78rem', color: '#ffffff', cursor: 'pointer' }}>
                  <strong>Enforce Grounding Verification (ISO 42001 Anti-Hallucination)</strong>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Rejects or escalates prompts to human review if verified sources do not support the inquiry.
                  </div>
                </label>
              </div>

              {/* Authorized Risk Tiers */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Authorized Agent Risk Tiers:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => toggleRiskTier(tier)}
                      className="btn"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        background: allowedRiskTiers.includes(tier) ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${allowedRiskTiers.includes(tier) ? 'var(--accent-purple)' : 'var(--border-subtle)'}`,
                        color: allowedRiskTiers.includes(tier) ? '#ffffff' : 'var(--text-muted)'
                      }}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Model</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Model Permissions Modal */}
      {editingModel && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '600px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Configure Model Permissions & Clearance
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                  {editingModel.name} ({editingModel.provider})
                </span>
              </div>
              <button className="btn btn-secondary" onClick={() => setEditingModel(null)} style={{ padding: '4px 8px' }}>Cancel</button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Model Name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Model Identifier</label>
                  <input required value={modelIdentifier} onChange={(e) => setModelIdentifier(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Data Clearance Level</label>
                  <select value={dataClassificationClearance} onChange={(e) => setDataClassificationClearance(e.target.value)}>
                    <option value="INTERNAL">INTERNAL</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Endpoint URL</label>
                <input required value={endpointUrl} onChange={(e) => setEndpointUrl(e.target.value)} />
              </div>

              {editingModel.type === 'EXTERNAL' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Update API Key (Optional)</label>
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Leave blank to keep current key" />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Max Context Tokens</label>
                  <input type="number" value={maxContextTokens} onChange={(e) => setMaxContextTokens(Number(e.target.value))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Department</label>
                  <input value={department} onChange={(e) => setDepartment(e.target.value)} />
                </div>
              </div>

              {/* Grounding toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <input
                  type="checkbox"
                  id="editGroundingCheckbox"
                  checked={enforceGrounding}
                  onChange={(e) => setEnforceGrounding(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="editGroundingCheckbox" style={{ fontSize: '0.78rem', color: '#ffffff', cursor: 'pointer' }}>
                  <strong>Enforce Grounding Verification (ISO 42001 Anti-Hallucination)</strong>
                </label>
              </div>

              {/* Authorized Risk Tiers */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Authorized Agent Risk Tiers:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => toggleRiskTier(tier)}
                      className="btn"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        background: allowedRiskTiers.includes(tier) ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${allowedRiskTiers.includes(tier) ? 'var(--accent-purple)' : 'var(--border-subtle)'}`,
                        color: allowedRiskTiers.includes(tier) ? '#ffffff' : 'var(--text-muted)'
                      }}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingModel(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Model Permissions</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
