import React, { useState } from 'react';
import { CheckSquare, CheckCircle2, XCircle, Clock, ShieldAlert, UserCheck } from 'lucide-react';
import { api } from '../services/api';

interface ApprovalsViewProps {
  approvals: any[];
  onRefresh: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ approvals, onRefresh }) => {
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [decidedBy, setDecidedBy] = useState<string>('sarah.connor@enterprise.com');
  const [rationale, setRationale] = useState<string>('Reviewed risk parameters and verified with process owner.');
  const [loading, setLoading] = useState<boolean>(false);

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const resolvedApprovals = approvals.filter((a) => a.status !== 'PENDING');

  const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    try {
      await api.decideApproval(id, decision, decidedBy, rationale);
      setDecidingId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error recording decision');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              Human-in-the-Loop Authorization Queue
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ISO 42001 & EU AI Act Art. 14 Requirement: Irreversible, high-impact, or critical actions must be validated by a human authority outside the model.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-medium">
              {pendingApprovals.length} Pending Actions
            </span>
          </div>
        </div>
      </div>

      {/* Pending Queue */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="var(--accent-amber)" />
          <span>Pending Authorization Requests</span>
        </h3>

        {pendingApprovals.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="var(--accent-emerald)" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>All Clear! No Pending Actions</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
              All agent tool requests have been reviewed or operate within auto-approved low-friction policies.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '16px' }}>
            {pendingApprovals.map((req) => (
              <div 
                key={req.id} 
                className="glass-panel" 
                style={{
                  padding: '20px',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  background: 'rgba(245, 158, 11, 0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                      {req.riskLevel} RISK
                    </span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>
                      {req.toolName}
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                    {req.id}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Requested by: <b style={{ color: '#ffffff' }}>{req.agentName}</b> ({req.environment} environment)
                </div>

                {/* Parameters inspection */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: '4px' }}>
                    Sanitized Parameters:
                  </div>
                  <pre className="code-container" style={{ maxHeight: '110px' }}>
                    {JSON.stringify(req.parameters, null, 2)}
                  </pre>
                </div>

                {decidingId === req.id ? (
                  <div style={{ background: '#070b14', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                      Authorizing Officer Sign-Off
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        placeholder="Officer Name / Email"
                        value={decidedBy}
                        onChange={(e) => setDecidedBy(e.target.value)}
                        style={{ fontSize: '0.8rem' }}
                      />
                      <input
                        placeholder="Audit Rationale / Justification"
                        value={rationale}
                        onChange={(e) => setRationale(e.target.value)}
                        style={{ fontSize: '0.8rem' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button
                          onClick={() => handleDecision(req.id, 'APPROVED')}
                          disabled={loading}
                          className="btn btn-success"
                          style={{ flex: 1, padding: '8px', fontSize: '0.78rem' }}
                        >
                          <CheckCircle2 size={14} /> Authorize Execution
                        </button>
                        <button
                          onClick={() => handleDecision(req.id, 'REJECTED')}
                          disabled={loading}
                          className="btn btn-danger"
                          style={{ flex: 1, padding: '8px', fontSize: '0.78rem' }}
                        >
                          <XCircle size={14} /> Reject Request
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setDecidingId(req.id)}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                    >
                      <UserCheck size={15} /> Review & Sign Off
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Decisions */}
      {resolvedApprovals.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
            Historical Governance Authorizations
          </h3>

          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>TICKET ID</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>TOOL / ACTION</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>AGENT</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>STATUS</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>DECIDED BY</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>RATIONALE</th>
                </tr>
              </thead>
              <tbody>
                {resolvedApprovals.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {req.id}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>
                      {req.toolName}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      {req.agentName}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${req.status === 'APPROVED' ? 'badge-low' : 'badge-critical'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--accent-cyan)' }}>
                      {req.decidedBy || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      {req.decisionRationale || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
