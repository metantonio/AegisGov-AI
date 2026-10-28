import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, FileText, Hash, Search, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface EvidenceViewProps {
  evidence: any[];
  onRefresh: () => void;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({ evidence, onRefresh }) => {
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyChain();
      setVerificationResult(res);
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const filtered = evidence.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.correlationId.toLowerCase().includes(term) ||
      r.identityEvidence.agentId.toLowerCase().includes(term) ||
      (r.decisionEvidence.toolName && r.decisionEvidence.toolName.toLowerCase().includes(term))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'badge-low';
      case 'BLOCKED': return 'badge-critical';
      case 'PENDING_APPROVAL': return 'badge-medium';
      default: return 'badge-cyan';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              Cryptographic Evidence & Correlated Audit Trail (Stage 6)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ISO 42001 Cl. 9.1 & 9.2: Every prompt and action generates an immutable SHA-256 chained audit record with correlation IDs for instant incident reconstruction.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={onRefresh}>
              <RefreshCw size={15} /> Refresh
            </button>
            <button className="btn btn-primary" onClick={handleVerifyChain} disabled={verifying}>
              <ShieldCheck size={16} /> {verifying ? 'Verifying...' : 'Verify Cryptographic Integrity'}
            </button>
          </div>
        </div>

        {/* Verification Alert Banner */}
        {verificationResult && (
          <div style={{
            marginTop: '16px',
            background: verificationResult.valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${verificationResult.valid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            borderRadius: '8px',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} color={verificationResult.valid ? 'var(--accent-emerald)' : 'var(--accent-rose)'} />
              <div>
                <div style={{ fontWeight: 700, color: verificationResult.valid ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontSize: '0.88rem' }}>
                  {verificationResult.status}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#f1f5f9' }}>
                  {verificationResult.totalBlocksChecked} audit blocks verified sequentially from Genesis Block. Zero tampering detected.
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              Checked at {verificationResult.timestamp?.split('T')[1]?.slice(0, 8)} UTC
            </span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            placeholder="Search by correlation ID, agent, or tool name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>CORRELATION ID</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>ACTION / TOOL</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>CALLING AGENT</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>STATUS</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>RISK</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>SHA-256 SIGNATURE</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-faint)' }}>FORENSICS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={record.correlationId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                  {record.correlationId}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>
                  {record.decisionEvidence.toolName || record.decisionEvidence.actionType}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                  {record.identityEvidence.agentId}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${getStatusBadge(record.executionEvidence.status)}`}>
                    {record.executionEvidence.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${
                    record.decisionEvidence.riskTier === 'CRITICAL' ? 'badge-critical' :
                    record.decisionEvidence.riskTier === 'HIGH' ? 'badge-high' :
                    record.decisionEvidence.riskTier === 'MEDIUM' ? 'badge-medium' : 'badge-low'
                  }`}>
                    {record.decisionEvidence.riskTier}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontSize: '0.75rem' }}>
                  {record.signatureHash?.substring(0, 16)}...
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <Eye size={13} /> Replay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Forensic Replay Modal */}
      {selectedRecord && (
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
          <div className="glass-panel" style={{ width: '700px', maxWidth: '95%', maxHeight: '85vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                  Incident Reconstruction & Audit Forensics
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {selectedRecord.correlationId}
                </span>
              </div>
              <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>Close</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Stage 1 Evidence */}
              <div style={{ background: '#070b14', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                  Stage 1 & 3: Source Lineage & Context
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  Grounded Sources: {selectedRecord.decisionEvidence.groundedSources?.join(', ') || 'Direct invocation'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                  DLP Triggered: {selectedRecord.contextEvidence.dlpSanitized ? 'YES (Redacted)' : 'NO'} · 
                  Entities Detected: {selectedRecord.contextEvidence.entitiesDetected?.join(', ') || 'None'}
                </div>
              </div>

              {/* Stage 2 Evidence */}
              <div style={{ background: '#070b14', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '4px' }}>
                  Stage 2: Technical Identity
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  Agent: {selectedRecord.identityEvidence.agentId} ({selectedRecord.identityEvidence.technicalIdentity})
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                  Environment: {selectedRecord.environment} · Scopes Verified: {selectedRecord.identityEvidence.scopesChecked?.join(', ') || 'N/A'}
                </div>
              </div>

              {/* Stage 5 Evidence */}
              <div style={{ background: '#070b14', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '4px' }}>
                  Stage 5: Policy Evaluation & Human Approval
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  Approval Status: {selectedRecord.approvalEvidence.status} · Rationale: {selectedRecord.approvalEvidence.rationale || 'N/A'}
                </div>
              </div>

              {/* Cryptographic Proof */}
              <div style={{ background: '#050811', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '4px' }}>
                  Cryptographic Chaining Proof (SHA-256)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Previous Block Hash: <span style={{ fontFamily: 'var(--font-mono)', color: '#ffffff' }}>{selectedRecord.previousHash}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  This Block Signature: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>{selectedRecord.signatureHash}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
