import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, AlertTriangle, XCircle, Users, HelpCircle, Layers } from 'lucide-react';
import { api } from '../services/api';

export const MaturityView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'controls' | 'raci'>('controls');

  const loadMaturity = async () => {
    try {
      const res = await api.getMaturity();
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaturity();
  }, []);

  const handleStatusChange = async (id: number, status: 'YES' | 'PARTIAL' | 'NO') => {
    try {
      await api.updateMaturityControl(id, status);
      await loadMaturity();
    } catch (err: any) {
      alert(err.message || 'Failed to update control');
    }
  };

  if (loading || !data) {
    return <div style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>Loading ISO 42001 Assessment...</div>;
  }

  const { summary, controls, raci } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Score Banner */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              ISO/IEC 42001:2023 & AI Governance Maturity Diagnostic
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              20-Point Diagnostic assessment from the practical guide across Data, Agents & Access, Evidence, Responsibility, and Scale.
            </p>
          </div>

          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setActiveTab('controls')}
              className="btn"
              style={{
                background: activeTab === 'controls' ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === 'controls' ? '#000000' : 'var(--text-muted)',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              20-Point Controls ({summary.scorePercentage}%)
            </button>
            <button
              onClick={() => setActiveTab('raci')}
              className="btn"
              style={{
                background: activeTab === 'raci' ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === 'raci' ? '#000000' : 'var(--text-muted)',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              RACI Responsibility Matrix
            </button>
          </div>
        </div>

        {/* Readiness Meter */}
        <div style={{
          marginTop: '20px',
          background: '#070b14',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: '1.5fr 3fr',
          gap: '24px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Maturity Readiness Score</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '4px 0' }}>
              {summary.scorePercentage}%
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              Grade: {summary.readinessLevel}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
              <span style={{ color: 'var(--accent-emerald)' }}>● Implemented: {summary.implemented}</span>
              <span style={{ color: 'var(--accent-amber)' }}>● Partial: {summary.partial}</span>
              <span style={{ color: 'var(--accent-rose)' }}>● Absent: {summary.absent}</span>
              <span style={{ color: 'var(--text-muted)' }}>Total: {summary.totalControls} Controls</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${(summary.implemented / summary.totalControls) * 100}%`, background: 'var(--accent-emerald)' }} />
              <div style={{ width: `${(summary.partial / summary.totalControls) * 100}%`, background: 'var(--accent-amber)' }} />
              <div style={{ width: `${(summary.absent / summary.totalControls) * 100}%`, background: 'var(--accent-rose)' }} />
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '8px' }}>
              *Notice from Guide: An aggregate score does not substitute risk analysis: a single absent critical control is sufficient to block an agent from production.
            </p>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      {activeTab === 'controls' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {controls.map((ctrl: any) => (
            <div 
              key={ctrl.id} 
              className="glass-panel" 
              style={{
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: '60px 1.2fr 2fr 160px',
                gap: '16px',
                alignItems: 'center'
              }}
            >
              {/* ID & Dimension */}
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-faint)' }}>
                  #{ctrl.id}
                </span>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  {ctrl.dimension}
                </div>
              </div>

              {/* Title & ISO Ref */}
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                  {ctrl.controlName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                  {ctrl.isoReference}
                </div>
              </div>

              {/* Description & Remediation */}
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {ctrl.description}
                </div>
                {ctrl.status !== 'YES' && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', marginTop: '4px' }}>
                    Remediation: {ctrl.remediationGuidance}
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => handleStatusChange(ctrl.id, 'YES')}
                  className="btn"
                  style={{
                    background: ctrl.status === 'YES' ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.05)',
                    color: ctrl.status === 'YES' ? '#ffffff' : 'var(--text-muted)',
                    padding: '4px 8px',
                    fontSize: '0.72rem'
                  }}
                >
                  YES
                </button>
                <button
                  onClick={() => handleStatusChange(ctrl.id, 'PARTIAL')}
                  className="btn"
                  style={{
                    background: ctrl.status === 'PARTIAL' ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.05)',
                    color: ctrl.status === 'PARTIAL' ? '#ffffff' : 'var(--text-muted)',
                    padding: '4px 8px',
                    fontSize: '0.72rem'
                  }}
                >
                  PARTIAL
                </button>
                <button
                  onClick={() => handleStatusChange(ctrl.id, 'NO')}
                  className="btn"
                  style={{
                    background: ctrl.status === 'NO' ? 'var(--accent-rose)' : 'rgba(255, 255, 255, 0.05)',
                    color: ctrl.status === 'NO' ? '#ffffff' : 'var(--text-muted)',
                    padding: '4px 8px',
                    fontSize: '0.72rem'
                  }}
                >
                  NO
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* RACI Matrix View */
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              RACI Governance Assignment Matrix (Guide Section 7)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              R = Responsible (Executes) · A = Accountable (Approves & Owns) · C = Consulted · I = Informed. Avoid single reliance on external LLM vendors for business liability.
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', color: 'var(--text-faint)' }}>ACTIVITY</th>
                <th style={{ padding: '14px', color: 'var(--accent-cyan)' }}>DATA</th>
                <th style={{ padding: '14px', color: 'var(--accent-rose)' }}>SECURITY</th>
                <th style={{ padding: '14px', color: 'var(--accent-purple)' }}>IT / PLATFORM</th>
                <th style={{ padding: '14px', color: 'var(--accent-amber)' }}>BUSINESS</th>
                <th style={{ padding: '14px', color: 'var(--accent-emerald)' }}>LEGAL / COMPL.</th>
              </tr>
            </thead>
            <tbody>
              {raci.map((row: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600, color: '#ffffff' }}>
                    {row.activity}
                  </td>
                  <td style={{ padding: '14px', fontWeight: row.data.includes('A') ? 800 : 500, color: row.data.includes('A') ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {row.data}
                  </td>
                  <td style={{ padding: '14px', fontWeight: row.security.includes('A') ? 800 : 500, color: row.security.includes('A') ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {row.security}
                  </td>
                  <td style={{ padding: '14px', fontWeight: row.itPlatform.includes('A') ? 800 : 500, color: row.itPlatform.includes('A') ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {row.itPlatform}
                  </td>
                  <td style={{ padding: '14px', fontWeight: row.business.includes('A') ? 800 : 500, color: row.business.includes('A') ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {row.business}
                  </td>
                  <td style={{ padding: '14px', fontWeight: row.legalCompliance.includes('A') ? 800 : 500, color: row.legalCompliance.includes('A') ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {row.legalCompliance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
