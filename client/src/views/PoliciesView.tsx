import React, { useState } from 'react';
import { Sliders, ShieldCheck, AlertTriangle, Lock, DollarSign, Database, Server, Mail, CreditCard, Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api';

interface PoliciesViewProps {
  policies: any[];
  onRefresh?: () => void;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({ policies, onRefresh }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [system, setSystem] = useState<string>('ERP');
  const [toolName, setToolName] = useState<string>('erp.delete');
  const [description, setDescription] = useState<string>('Delete a ledger record, invoice, or supplier transaction in ERP');
  const [riskLevel, setRiskLevel] = useState<string>('CRITICAL');
  const [requiresApproval, setRequiresApproval] = useState<boolean>(true);
  const [dualApprovalRequired, setDualApprovalRequired] = useState<boolean>(false);
  const [disallowedInProduction, setDisallowedInProduction] = useState<boolean>(true);
  const [maxMonetaryLimit, setMaxMonetaryLimit] = useState<string>('');
  const [allowedParameters, setAllowedParameters] = useState<string>('recordId, entityType, reason');
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createPolicy({
        system,
        toolName,
        description,
        riskLevel,
        requiresApproval,
        dualApprovalRequired,
        disallowedInProduction,
        maxMonetaryLimit: maxMonetaryLimit ? Number(maxMonetaryLimit) : undefined,
        allowedParameters: allowedParameters.split(',').map((s) => s.trim()).filter(Boolean),
        rateLimitPerMinute: Number(rateLimitPerMinute)
      });
      setShowModal(false);
      setToolName('');
      setDescription('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to create action tool policy');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (policyId: string) => {
    if (window.confirm('Delete this action tool policy from the Risk Matrix?')) {
      try {
        await api.deletePolicy(policyId);
        if (onRefresh) onRefresh();
      } catch (err: any) {
        alert(err.message || 'Failed to delete policy');
      }
    }
  };

  const getSystemIcon = (sys: string) => {
    switch (sys) {
      case 'CRM': return Sliders;
      case 'ERP': return Database;
      case 'Data Lake': return Server;
      case 'Email System': return Mail;
      case 'Production Database': return Server;
      case 'Financial APIs': return CreditCard;
      default: return ShieldCheck;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              Action Risk Matrix & Least Privilege Policies (Stage 5)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ISO 42001 Cl. A.8.4 & Guide Section 3: Authoritative registry of executable tools. The model being "confident" is never sufficient: permissions and risk tiers are enforced outside the model.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Define New Action Tool & Policy
          </button>
        </div>

        {/* Six Stage Workflow banner */}
        <div style={{
          marginTop: '16px',
          background: 'rgba(56, 189, 248, 0.05)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem'
        }}>
          <span style={{ color: '#ffffff', fontWeight: 700 }}>Mandatory Action Cycle:</span>
          <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            SOURCE (Observe) → PERMISSIONS (Propose) → CONTEXT (Validate) → DECISION (Review) → APPROVAL (Gate) → RESULT (Verify)
          </span>
        </div>
      </div>

      {/* Systems Policy Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
        {policies.map((pol) => {
          const Icon = getSystemIcon(pol.system);
          return (
            <div key={pol.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '6px', borderRadius: '6px' }}>
                    <Icon size={16} color="var(--accent-cyan)" />
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                    {pol.system}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`badge ${getRiskBadge(pol.riskLevel)}`}>
                    {pol.riskLevel}
                  </span>
                  <button
                    onClick={() => handleDelete(pol.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: '2px' }}
                    title="Delete Policy"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {pol.toolName}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {pol.description}
                </p>
              </div>

              {/* Policy Enforcement Flags */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-faint)' }}>Human Approval:</span>
                  <span style={{ color: pol.requiresApproval ? 'var(--accent-amber)' : 'var(--accent-emerald)', fontWeight: 700 }}>
                    {pol.requiresApproval ? 'REQUIRED' : 'Auto-Authorized'}
                  </span>
                </div>

                {pol.dualApprovalRequired && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-faint)' }}>Dual Approval:</span>
                    <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>Two-Person Rule Enforced</span>
                  </div>
                )}

                {pol.maxMonetaryLimit && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-faint)' }}>Max Exposure Cap:</span>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>${pol.maxMonetaryLimit.toLocaleString()} USD</span>
                  </div>
                )}

                {pol.disallowedInProduction && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-faint)' }}>Production Boundary:</span>
                    <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>SANDBOX ONLY (Blocked in Prod)</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-faint)' }}>Rate Limit:</span>
                  <span style={{ color: 'var(--text-muted)' }}>{pol.rateLimitPerMinute} calls / min</span>
                </div>
              </div>

              {/* Allowed Parameters Schema */}
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: '4px' }}>
                  Strict Whitelisted Parameters:
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {pol.allowedParameters?.map((p: string) => (
                    <span key={p} style={{ fontSize: '0.68rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Define Tool Policy Modal */}
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
              Define Action Tool & Risk Policy (Stage 5)
            </h3>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>System Category</label>
                  <select value={system} onChange={(e) => setSystem(e.target.value)}>
                    <option value="ERP">ERP (SAP / Oracle / NetSuite)</option>
                    <option value="CRM">CRM (Salesforce / HubSpot)</option>
                    <option value="Production Database">Production Database (Postgres / MySQL)</option>
                    <option value="Data Lake">Data Lake (Snowflake / AWS S3 / BigQuery)</option>
                    <option value="Financial APIs">Financial APIs (Stripe / Bank Wire / Payouts)</option>
                    <option value="Email System">Email System (SendGrid / Exchange)</option>
                    <option value="Custom">Custom Core System</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Tool Name (Executable ID)</label>
                  <input required value={toolName} onChange={(e) => setToolName(e.target.value)} placeholder="e.g. erp.delete, financial.transfer" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Description & Risk Scope</label>
                <input required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Delete a ledger record or invoice in ERP" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Risk Level</label>
                  <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
                    <option value="LOW">LOW (Read-only / Safe queries)</option>
                    <option value="MEDIUM">MEDIUM (Standard non-destructive writes)</option>
                    <option value="HIGH">HIGH (External emails, status updates)</option>
                    <option value="CRITICAL">CRITICAL (Financial transfer, deletion, schema drop)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Max Monetary Exposure ($ USD)</label>
                  <input type="number" value={maxMonetaryLimit} onChange={(e) => setMaxMonetaryLimit(e.target.value)} placeholder="e.g. 5000 (leave blank if N/A)" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Whitelisted Parameters (comma separated)</label>
                <input value={allowedParameters} onChange={(e) => setAllowedParameters(e.target.value)} placeholder="e.g. recordId, entityType, reason" />
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#ffffff', cursor: 'pointer' }}>
                  <input type="checkbox" checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)} />
                  <strong>Require Human-In-The-Loop (HITL) Authorization</strong>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#ffffff', cursor: 'pointer' }}>
                  <input type="checkbox" checked={dualApprovalRequired} onChange={(e) => setDualApprovalRequired(e.target.checked)} />
                  <span>Enforce Two-Person Rule (Dual Approval Required)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#fca5a5', cursor: 'pointer' }}>
                  <input type="checkbox" checked={disallowedInProduction} onChange={(e) => setDisallowedInProduction(e.target.checked)} />
                  <strong>Strict Environment Separation: PROHIBITED in Production (Sandbox only)</strong>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Registering...' : 'Register Action Tool'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
