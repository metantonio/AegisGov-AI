import React from 'react';
import { Database, Key, GitFork, Cpu, ShieldAlert, FileText, ArrowRight } from 'lucide-react';

interface PipelineVisualizerProps {
  activeStage?: string;
  stagesCompleted?: string[];
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  activeStage,
  stagesCompleted = []
}) => {
  const stages = [
    {
      id: 'DATA_SOURCES',
      number: '1',
      title: 'Data & Sources',
      sub: 'Origin · Quality · Owner',
      icon: Database,
      color: '#38bdf8'
    },
    {
      id: 'IDENTITY_ACCESS',
      number: '2',
      title: 'Identity & Access',
      sub: 'Scopes · Least Privilege',
      icon: Key,
      color: '#a855f7'
    },
    {
      id: 'LINEAGE_CONTEXT',
      number: '3',
      title: 'Lineage & DLP',
      sub: 'Provenance · Masking',
      icon: GitFork,
      color: '#6366f1'
    },
    {
      id: 'LLM_MODEL',
      number: '4',
      title: 'LLM Guardrails',
      sub: 'Grounding · Veracity',
      icon: Cpu,
      color: '#10b981'
    },
    {
      id: 'AGENT_EXECUTION',
      number: '5',
      title: 'Agent Execution',
      sub: 'Tools · Sandbox · Approval',
      icon: ShieldAlert,
      color: '#f59e0b'
    },
    {
      id: 'EVIDENCE_AUDIT',
      number: '6',
      title: 'Evidence & Audit',
      sub: 'SHA-256 Ledger · Traces',
      icon: FileText,
      color: '#34d399'
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px 24px', margin: '24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
            The 6-Stage AI & Data Governance Pipeline
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Strict ISO/IEC 42001 enforcement: No subsequent stage can bypass restrictions set by previous stages.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Pattern:</span>
          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
            Observe → Propose → Validate → Approve → Execute → Verify
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '12px',
        position: 'relative'
      }}>
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = stagesCompleted.includes(stage.id);
          const isActive = activeStage === stage.id;

          let borderColor = 'var(--border-subtle)';
          let bgColor = 'rgba(255, 255, 255, 0.02)';
          if (isActive) {
            borderColor = stage.color;
            bgColor = `${stage.color}15`;
          } else if (isDone) {
            borderColor = 'rgba(16, 185, 129, 0.4)';
            bgColor = 'rgba(16, 185, 129, 0.08)';
          }

          return (
            <div
              key={stage.id}
              style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? `0 0 16px ${stage.color}30` : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: stage.color,
                  background: `${stage.color}20`,
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  STAGE {stage.number}
                </span>
                <Icon size={16} color={stage.color} />
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                  {stage.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {stage.sub}
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div style={{
                  position: 'absolute',
                  right: '-10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  display: 'none'
                }}>
                  <ArrowRight size={14} color="var(--text-faint)" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
