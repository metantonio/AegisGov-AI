import React from 'react';
import { Sliders, ShieldCheck, AlertTriangle, Lock, DollarSign, Database, Server, Mail, CreditCard } from 'lucide-react';

interface PoliciesViewProps {
  policies: any[];
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({ policies }) => {
  const getSystemIcon = (system: string) => {
    switch (system) {
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
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
            Action Risk Matrix & Least Privilege Policies (Stage 5)
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ISO 42001 Cl. A.8.4 & Guide Section 3: For irreversible or material actions, the model being "confident" is never sufficient: authorization must be verified technically outside the model.
          </p>
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
                <span className={`badge ${getRiskBadge(pol.riskLevel)}`}>
                  {pol.riskLevel}
                </span>
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
    </div>
  );
};
