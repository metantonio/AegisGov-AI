import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Cpu, 
  Database, 
  Lock, 
  ArrowUpRight,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DashboardViewProps {
  stats: any;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, onNavigate }) => {
  const kpis = stats?.kpis || {
    totalRequests: 0,
    blockedRequests: 0,
    pendingApprovals: 0,
    activeAgents: 0,
    totalSources: 0,
    maturityScore: 0
  };

  const playbooks = stats?.failurePlaybooks || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {/* KPI 1 */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              TOTAL GOVERNED REQUESTS
            </span>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <Activity size={18} color="var(--accent-cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '12px 0 4px 0' }}>
            {kpis.totalRequests}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>● 100% Cryptographically signed</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              POLICY BLOCKS / RESTRICTIONS
            </span>
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <AlertTriangle size={18} color="var(--accent-rose)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-rose)', margin: '12px 0 4px 0' }}>
            {kpis.blockedRequests}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Replit, Samsung & Zillow safeguards active
          </div>
        </div>

        {/* KPI 3 */}
        <div 
          className="glass-panel" 
          style={{ padding: '20px', cursor: 'pointer', borderColor: kpis.pendingApprovals > 0 ? 'rgba(245, 158, 11, 0.4)' : undefined }}
          onClick={() => onNavigate('approvals')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              HUMAN-IN-THE-LOOP APPROVALS
            </span>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <Lock size={18} color="var(--accent-amber)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: kpis.pendingApprovals > 0 ? 'var(--accent-amber)' : '#ffffff', margin: '12px 0 4px 0' }}>
            {kpis.pendingApprovals}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{kpis.pendingApprovals > 0 ? '⚠️ High/Critical actions awaiting review' : 'All tickets cleared'}</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div 
          className="glass-panel" 
          style={{ padding: '20px', cursor: 'pointer' }}
          onClick={() => onNavigate('maturity')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              ISO 42001 MATURITY SCORE
            </span>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <ShieldCheck size={18} color="var(--accent-emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '12px 0 4px 0' }}>
            {kpis.maturityScore}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            20 Controls across 5 dimensions evaluated
          </div>
        </div>
      </div>

      {/* 3 Architecture Planes & Real World Playbooks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px' }}>
        {/* 3 Architecture Planes */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Architecture Planes (ISO 42001 Standard)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Separation of concerns between governance authority, proxy mediation, and evidence storage.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>Control Plane</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>Authority & Governance</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Identity scoping, tool authorization matrix, least privilege bounds, secret vault, and global kill switch.
              </p>
            </div>

            <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>Execution Plane</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>Interception & Sandbox</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                DLP PII sanitization, parameter schema validation, sandbox environment barriers, and human approval gateways.
              </p>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-low" style={{ fontSize: '0.68rem' }}>Evidence Plane</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>Traceability & Auditing</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Correlated traces linking all 6 stages, SHA-256 tamper-evident chaining, and incident replay forensics.
              </p>
            </div>
          </div>
        </div>

        {/* Real-World Failure Playbooks */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                Real Failure Cases & Enforced Mitigations
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Analyzed incidents from the ISO 42001 governance guide and their automated guardrails.
              </p>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => onNavigate('simulator')}>
              <span>Test in Simulator</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {playbooks.map((item: any, idx: number) => (
              <div 
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{item.case}</span>
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{item.dimension}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {item.description}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    ACTIVE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Five Quarterly Review Questions (From Page 12 of PDF) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <HelpCircle size={20} color="var(--accent-cyan)" />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Quarterly Governance Review (The 5 Executive Questions)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Mandatory questions for executive AI committee meetings defined in ISO 42001 Section 10.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>Q1. Active Agents?</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Identified in AI inventory with named business and technical owners.
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>Q2. Queried Data?</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Cataloged with sensitivity classification, approved purpose, and DLP scanning.
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>Q3. Permitted Actions?</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Governed by action risk matrix, monetary caps, and human-in-the-loop gates.
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>Q4. Evidence Generated?</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Immutable correlated traces with SHA-256 tamper-evident integrity.
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>Q5. Revocation & Kill Switch?</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Instant single-click kill switch for individual agents or global operations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
