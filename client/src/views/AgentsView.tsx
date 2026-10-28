import React, { useState } from 'react';
import { Key, Plus, Power, ShieldAlert, CheckCircle, AlertTriangle, Terminal, Copy, Check, Lock, Sliders, Building, Edit3 } from 'lucide-react';
import { api } from '../services/api';

interface AgentsViewProps {
  agents: any[];
  onRefresh: () => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({ agents, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [technicalIdentity, setTechnicalIdentity] = useState('');
  const [systemOwner, setSystemOwner] = useState('');
  const [processOwner, setProcessOwner] = useState('');
  const [department, setDepartment] = useState('TI Support America - Customer Helpdesk');
  const [riskTier, setRiskTier] = useState('MEDIUM');
  const [environment, setEnvironment] = useState('sandbox');
  const [scopes, setScopes] = useState('support:read_policy, support:answer_inquiry');
  const [allowedTools, setAllowedTools] = useState('airline.lookup_fare_rules');
  const [allowedDataSources, setAllowedDataSources] = useState('src-airline-policy-01');
  const [loading, setLoading] = useState(false);

  // Edit permissions state
  const [editingAgent, setEditingAgent] = useState<any | null>(null);
  const [editScopes, setEditScopes] = useState('');
  const [editAllowedSources, setEditAllowedSources] = useState('');
  const [editAllowedTools, setEditAllowedTools] = useState('');
  const [editRiskTier, setEditRiskTier] = useState('MEDIUM');
  const [editEnvironment, setEditEnvironment] = useState('sandbox');
  const [editDepartment, setEditDepartment] = useState('');
  const [editProcessOwner, setEditProcessOwner] = useState('');
  const [editSystemOwner, setEditSystemOwner] = useState('');

  // One-time API key display modal
  const [createdKeyData, setCreatedKeyData] = useState<{ name: string; rawApiKey: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const toggleKillSwitch = async (agentId: string, currentStatus: boolean) => {
    try {
      await api.setAgentKillSwitch(agentId, !currentStatus);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle kill switch');
    }
  };

  const openEditModal = (agent: any) => {
    setEditingAgent(agent);
    setEditScopes((agent.scopes || []).join(', '));
    setEditAllowedSources((agent.allowedDataSources || []).join(', '));
    setEditAllowedTools((agent.allowedTools || []).join(', '));
    setEditRiskTier(agent.riskTier || 'MEDIUM');
    setEditEnvironment(agent.environment || 'sandbox');
    setEditDepartment(agent.department || '');
    setEditProcessOwner(agent.processOwner || '');
    setEditSystemOwner(agent.systemOwner || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    setLoading(true);
    try {
      await api.updateAgent(editingAgent.id, {
        scopes: editScopes.split(',').map((s) => s.trim()).filter(Boolean),
        allowedDataSources: editAllowedSources.split(',').map((s) => s.trim()).filter(Boolean),
        allowedTools: editAllowedTools.split(',').map((s) => s.trim()).filter(Boolean),
        riskTier: editRiskTier,
        environment: editEnvironment,
        department: editDepartment,
        processOwner: editProcessOwner,
        systemOwner: editSystemOwner
      });
      setEditingAgent(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update agent permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.createAgent({
        name,
        technicalIdentity,
        systemOwner,
        processOwner,
        department,
        riskTier,
        environment,
        scopes: scopes.split(',').map((s) => s.trim()).filter(Boolean),
        allowedTools: allowedTools.split(',').map((s) => s.trim()).filter(Boolean),
        allowedDataSources: allowedDataSources.split(',').map((s) => s.trim()).filter(Boolean)
      });
      setShowModal(false);
      setName('');
      setTechnicalIdentity('');
      setSystemOwner('');
      setProcessOwner('');
      setAllowedDataSources('src-airline-policy-01');
      onRefresh();

      if (response.rawApiKey) {
        setCreatedKeyData({ name: response.agent.name, rawApiKey: response.rawApiKey });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to register agent');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (createdKeyData?.rawApiKey) {
      navigator.clipboard.writeText(createdKeyData.rawApiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 3000);
    }
  };

  const getRiskBadge = (tier: string) => {
    switch (tier) {
      case 'LOW': return 'badge-low';
      case 'MEDIUM': return 'badge-medium';
      case 'HIGH': return 'badge-high';
      case 'CRITICAL': return 'badge-critical';
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
              Agent Technical Identity & Access Control (Stage 2)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ISO 42001 Cl. A.7.2: Agents must utilize dedicated service identities and least privilege scopes. Never inherit creator executive credentials.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Register New AI Agent
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
        {agents.map((agent) => (
          <div 
            key={agent.id} 
            className="glass-panel" 
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              border: agent.killSwitchActive ? '1px solid rgba(244, 63, 94, 0.4)' : undefined,
              background: agent.killSwitchActive ? 'rgba(244, 63, 94, 0.03)' : undefined
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge ${getRiskBadge(agent.riskTier)}`}>
                  {agent.riskTier} RISK
                </span>
                <span className={`badge ${agent.environment === 'production' ? 'badge-purple' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                  {agent.environment}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {/* Edit Permissions Button */}
                <button
                  onClick={() => openEditModal(agent)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                  title="View & Edit Agent/Group Permissions"
                >
                  <Sliders size={13} />
                  <span>Permissions</span>
                </button>

                {/* Kill Switch Toggle */}
                <button
                  onClick={() => toggleKillSwitch(agent.id, agent.killSwitchActive)}
                  className="btn"
                  style={{
                    background: agent.killSwitchActive ? 'var(--accent-rose)' : 'rgba(255, 255, 255, 0.05)',
                    color: agent.killSwitchActive ? '#ffffff' : 'var(--text-muted)',
                    border: `1px solid ${agent.killSwitchActive ? '#f43f5e' : 'var(--border-subtle)'}`,
                    fontSize: '0.72rem',
                    padding: '4px 8px'
                  }}
                  title="Toggle Emergency Isolation"
                >
                  <Power size={13} />
                  <span>{agent.killSwitchActive ? 'LOCKED DOWN' : 'Kill Switch'}</span>
                </button>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                {agent.name}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                Identity: {agent.technicalIdentity}
              </div>
              {agent.department && (
                <div style={{ fontSize: '0.73rem', color: 'var(--accent-emerald)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Building size={12} />
                  <span>{agent.department}</span>
                </div>
              )}
            </div>

            {/* Ownership */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-faint)' }}>Process Owner:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{agent.processOwner}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-faint)' }}>System Owner:</span>
                <span style={{ color: '#cbd5e1' }}>{agent.systemOwner}</span>
              </div>
            </div>

            {/* Scopes & Tools */}
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: '4px' }}>
                Permitted Scopes & Tools:
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {agent.scopes?.map((s: string) => (
                  <span key={s} style={{ fontSize: '0.68rem', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)', padding: '2px 8px', borderRadius: '4px' }}>
                    {s}
                  </span>
                ))}
                {agent.allowedTools?.map((t: string) => (
                  <span key={t} style={{ fontSize: '0.68rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', padding: '2px 8px', borderRadius: '4px' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Allowed Data Sources */}
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: '4px' }}>
                Allowed Data Sources:
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {agent.allowedDataSources && agent.allowedDataSources.length > 0 ? (
                  agent.allowedDataSources.map((ds: string) => (
                    <span key={ds} style={{ fontSize: '0.68rem', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '4px' }}>
                      {ds}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>None assigned</span>
                )}
              </div>
            </div>

            {/* Token / Key */}
            <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={12} style={{ color: 'var(--accent-emerald)' }} />
                <span>
                  Key: <code style={{ color: 'var(--accent-cyan)' }}>{agent.apiKeyPrefix || agent.apiKey?.substring(0, 14) + '...'}</code>
                </span>
                <span style={{ fontSize: '0.62rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', padding: '1px 5px', borderRadius: '3px' }}>
                  SHA-256 HASHED
                </span>
              </div>
              <span>Expires: {agent.tokenExpiresAt?.split('T')[0]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* One-Time API Key Display Modal (Security / Compliance) */}
      {createdKeyData && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div className="glass-panel" style={{ width: '550px', maxWidth: '90%', padding: '24px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-emerald)', marginBottom: '12px' }}>
              <CheckCircle size={22} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Agent Identity Created Successfully
              </h3>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '16px' }}>
              Here is the live API key for <strong>{createdKeyData.name}</strong>.
            </p>

            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <AlertTriangle size={18} style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.78rem', color: '#fca5a5', lineHeight: '1.4' }}>
                <strong>ISO/IEC 42001 & SOC 2 Security Notice:</strong> This key is displayed <strong>ONLY ONCE</strong>.
                For your security, it is stored in the database exclusively as a salted SHA-256 cryptographic hash and cannot be recovered.
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <code style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                {createdKeyData.rawApiKey}
              </code>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={copyToClipboard}
                style={{ marginLeft: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}
              >
                {copiedKey ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCreatedKeyData(null)}
              >
                I Have Saved My Secret Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '500px', maxWidth: '90%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
              Register Technical AI Agent Identity
            </h3>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Agent Name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Autonomous Invoice Auditor" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Technical Identity (Service ID)</label>
                <input required value={technicalIdentity} onChange={(e) => setTechnicalIdentity(e.target.value)} placeholder="agent-svc-invoice-auditor" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Department / Organizational Unit</label>
                <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. TI Support America - Customer Helpdesk" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Process Owner</label>
                  <input required value={processOwner} onChange={(e) => setProcessOwner(e.target.value)} placeholder="Director of Accounting" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>System Owner</label>
                  <input required value={systemOwner} onChange={(e) => setSystemOwner(e.target.value)} placeholder="VP of IT Platforms" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Risk Tier</label>
                  <select value={riskTier} onChange={(e) => setRiskTier(e.target.value)}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Environment</label>
                  <select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
                    <option value="sandbox">Sandbox</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Allowed Scopes (comma separated)</label>
                <input value={scopes} onChange={(e) => setScopes(e.target.value)} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Allowed Tools (comma separated)</label>
                <input value={allowedTools} onChange={(e) => setAllowedTools(e.target.value)} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Allowed Data Sources (comma separated IDs)</label>
                <input value={allowedDataSources} onChange={(e) => setAllowedDataSources(e.target.value)} placeholder="e.g. src-us-tickets-db, src-snowflake-us" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Register Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {editingAgent && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050
        }}>
          <div className="glass-panel" style={{ width: '600px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Edit Permissions & Governance Scopes
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                  {editingAgent.name} ({editingAgent.technicalIdentity})
                </span>
              </div>
              <button className="btn btn-secondary" onClick={() => setEditingAgent(null)} style={{ padding: '4px 8px' }}>Cancel</button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Risk Tier</label>
                  <select value={editRiskTier} onChange={(e) => setEditRiskTier(e.target.value)}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Environment</label>
                  <select value={editEnvironment} onChange={(e) => setEditEnvironment(e.target.value)}>
                    <option value="sandbox">Sandbox</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Department / Business Unit</label>
                <input value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)} placeholder="e.g. TI Support America - Customer Helpdesk" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Process Owner</label>
                  <input value={editProcessOwner} onChange={(e) => setEditProcessOwner(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>System Owner</label>
                  <input value={editSystemOwner} onChange={(e) => setEditSystemOwner(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Allowed Data Sources (Whitelisted DBs / Data Lakes)
                </label>
                <input value={editAllowedSources} onChange={(e) => setEditAllowedSources(e.target.value)} placeholder="comma separated IDs, e.g. src-us-tickets-db, src-snowflake-us" />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Only data sources in this list can be queried by this agent.</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Allowed Scopes (Functional capabilities)
                </label>
                <input value={editScopes} onChange={(e) => setEditScopes(e.target.value)} placeholder="comma separated, e.g. support:read_policy, support:us:manage" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Allowed Tools (Executable API tools)
                </label>
                <input value={editAllowedTools} onChange={(e) => setEditAllowedTools(e.target.value)} placeholder="comma separated, e.g. jira.query_us_tickets, aws.s3_read_us" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingAgent(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving Changes...' : 'Save Permissions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
