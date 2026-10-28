import React, { useState } from 'react';
import { Key, Plus, Power, ShieldAlert, CheckCircle, AlertTriangle, Terminal } from 'lucide-react';
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
  const [riskTier, setRiskTier] = useState('MEDIUM');
  const [environment, setEnvironment] = useState('sandbox');
  const [scopes, setScopes] = useState('support:read_policy, support:answer_inquiry');
  const [allowedTools, setAllowedTools] = useState('airline.lookup_fare_rules');
  const [allowedDataSources, setAllowedDataSources] = useState('src-airline-policy-01');
  const [loading, setLoading] = useState(false);

  const toggleKillSwitch = async (agentId: string, currentStatus: boolean) => {
    try {
      await api.setAgentKillSwitch(agentId, !currentStatus);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle kill switch');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createAgent({
        name,
        technicalIdentity,
        systemOwner,
        processOwner,
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
    } catch (err: any) {
      alert(err.message || 'Failed to register agent');
    } finally {
      setLoading(false);
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

            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                {agent.name}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                Identity: {agent.technicalIdentity}
              </div>
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

            {/* Token */}
            <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>API Key: <code style={{ color: 'var(--accent-cyan)' }}>{agent.apiKey?.substring(0, 16)}...</code></span>
              <span>Expires: {agent.tokenExpiresAt?.split('T')[0]}</span>
            </div>
          </div>
        ))}
      </div>

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
    </div>
  );
};
