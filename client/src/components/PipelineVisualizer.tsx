import React from 'react';
import { Database, Key, GitFork, Cpu, ShieldAlert, FileText, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';

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
      number: '01',
      title: 'Data & Sources',
      sub: 'Catalog & Classification',
      metric: 'Stage 1 Enforced',
      icon: Database,
      accent: '#38bdf8'
    },
    {
      id: 'IDENTITY_ACCESS',
      number: '02',
      title: 'Identity & Access',
      sub: 'Agent Service IDs & Scopes',
      metric: 'Least Privilege',
      icon: Key,
      accent: '#818cf8'
    },
    {
      id: 'LINEAGE_CONTEXT',
      number: '03',
      title: 'Lineage & DLP',
      sub: 'Redaction & Provenance',
      metric: 'Zero Exfiltration',
      icon: GitFork,
      accent: '#a78bfa'
    },
    {
      id: 'LLM_MODEL',
      number: '04',
      title: 'LLM Vault',
      sub: 'Local/External Guardrails',
      metric: 'AES-256 Cryptography',
      icon: Cpu,
      accent: '#34d399'
    },
    {
      id: 'AGENT_EXECUTION',
      number: '05',
      title: 'Action Risk Matrix',
      sub: 'PEP Gateway & HITL',
      metric: 'Human-in-the-Loop',
      icon: ShieldAlert,
      accent: '#fbbf24'
    },
    {
      id: 'EVIDENCE_AUDIT',
      number: '06',
      title: 'Evidence Ledger',
      sub: 'SHA-256 Merkle Chain',
      metric: 'Immutable Audit',
      icon: FileText,
      accent: '#2dd4bf'
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', margin: '20px 0', background: '#0b101d', border: '1px solid #1e293b' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(37, 99, 235, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '0.7rem',
            fontWeight: 800,
            color: '#60a5fa',
            letterSpacing: '0.04em'
          }}>
            DEFENSE-IN-DEPTH
          </div>
          <div>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              6-Stage Enterprise AI Governance Gating Pipeline
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
              Strict Progressive Validation: Downstream stages cannot execute unless upstream data and identity requirements are satisfied.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Lifecycle:
          </span>
          <span style={{
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            color: '#38bdf8',
            background: 'rgba(14, 165, 233, 0.1)',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(14, 165, 233, 0.2)'
          }}>
            OBSERVE → EVALUATE → GATE → APPROVE → EXECUTE → RECORD
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '8px',
        position: 'relative'
      }}>
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = stagesCompleted.includes(stage.id);
          const isActive = activeStage === stage.id;

          let borderColor = '#1e293b';
          let bgColor = '#0f172a';
          if (isActive) {
            borderColor = stage.accent;
            bgColor = 'rgba(37, 99, 235, 0.12)';
          } else if (isDone) {
            borderColor = '#059669';
            bgColor = 'rgba(5, 150, 105, 0.08)';
          }

          return (
            <div
              key={stage.id}
              style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '84px',
                position: 'relative',
                transition: 'all 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: stage.accent,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.04em'
                  }}>
                    STAGE {stage.number}
                  </span>
                  <Icon size={14} color={stage.accent} />
                </div>

                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                  {stage.title}
                </div>
                <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.2 }}>
                  {stage.sub}
                </div>
              </div>

              <div style={{
                marginTop: '8px',
                paddingTop: '6px',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.62rem'
              }}>
                <span style={{ color: 'var(--text-faint)' }}>{stage.metric}</span>
                {isDone ? (
                  <CheckCircle2 size={11} color="#10b981" />
                ) : (
                  <Lock size={10} color="#64748b" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
