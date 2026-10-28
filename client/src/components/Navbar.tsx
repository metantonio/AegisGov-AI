import React from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  Terminal, 
  CheckSquare, 
  Database, 
  Key, 
  Sliders, 
  Layers, 
  Award, 
  BookOpen,
  Power,
  Lock,
  Building,
  UserCheck,
  Server
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  pendingApprovalsCount: number;
  globalKillSwitch: boolean;
  onToggleGlobalKillSwitch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  pendingApprovalsCount,
  globalKillSwitch,
  onToggleGlobalKillSwitch
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: Layers },
    { id: 'simulator', label: 'PEP Simulator', icon: Terminal },
    { id: 'approvals', label: 'HITL Approvals', icon: CheckSquare, badge: pendingApprovalsCount },
    { id: 'catalog', label: 'Data Catalog (Stage 1)', icon: Database },
    { id: 'agents', label: 'AI Agents (Stage 3)', icon: Key },
    { id: 'models', label: 'LLM Inventory (Stage 4)', icon: Cpu },
    { id: 'policies', label: 'Action Matrix (Stage 5)', icon: Sliders },
    { id: 'evidence', label: 'Evidence Ledger (Stage 6)', icon: ShieldAlert },
    { id: 'maturity', label: 'ISO 42001 Maturity', icon: Award },
    { id: 'docs', label: 'API & Developers', icon: BookOpen }
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: '#090d18',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Top Utility Bar (Enterprise Identity & Posture) */}
      <div style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: '#060a12',
        padding: '0 24px',
        height: '34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem'
      }}>
        {/* Left: Organization & Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <Building size={13} color="#94a3b8" />
            <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Qualex Consulting Services Inc.</span>
            <span style={{ color: 'var(--text-faint)' }}>• Enterprise Production Tenant</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Server size={12} color="#0ea5e9" />
            <span style={{ color: 'var(--text-muted)' }}>Cluster:</span>
            <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>us-east-prod-01</span>
          </div>
        </div>

        {/* Right: Security Engines & Operator Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={12} color="#10b981" />
            <span style={{ color: '#34d399', fontWeight: 600 }}>AES-256-GCM Hardware Vault</span>
          </div>

          <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <span className="status-dot status-dot-active" />
            <span>ISO/IEC 42001 & NIST AI RMF Active</span>
          </div>

          <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={13} color="#a855f7" />
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Antonio Martínez</span>
            <span style={{ color: 'var(--text-faint)', fontSize: '0.68rem' }}>(SecOps Admin)</span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div style={{
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        {/* Brand */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} 
          onClick={() => onTabChange('dashboard')}
        >
          <div style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            padding: '8px 10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #3b82f6',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)'
          }}>
            <ShieldAlert size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                AEGIS<span style={{ color: '#38bdf8' }}>GOV</span>
              </span>
              <span style={{
                background: 'rgba(37, 99, 235, 0.18)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.04em'
              }}>
                ENTERPRISE CONTROL PLANE
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
              Zero-Trust AI & Sensitive Data Middleware
            </div>
          </div>
        </div>

        {/* Global Industrial Kill Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            border: globalKillSwitch ? '1px solid #ef4444' : '1px solid #334155',
            background: globalKillSwitch ? 'rgba(239, 68, 68, 0.15)' : '#0f172a',
            padding: '5px 12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: globalKillSwitch ? '#f87171' : 'var(--text-muted)' }}>
                GLOBAL EMERGENCY CIRCUIT
              </div>
              <div style={{ fontSize: '0.62rem', color: globalKillSwitch ? '#fca5a5' : '#34d399' }}>
                {globalKillSwitch ? 'SYSTEM LOCKED DOWN' : 'All Gateways Armed & Operational'}
              </div>
            </div>

            <button
              onClick={onToggleGlobalKillSwitch}
              className="btn"
              style={{
                background: globalKillSwitch 
                  ? '#dc2626' 
                  : '#1e293b',
                border: `1px solid ${globalKillSwitch ? '#f87171' : '#475569'}`,
                color: '#ffffff',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                boxShadow: globalKillSwitch ? '0 0 12px rgba(220, 38, 38, 0.6)' : 'none'
              }}
              title="Click to toggle enterprise emergency circuit breaker"
            >
              <Power size={13} />
              <span>{globalKillSwitch ? 'DISARM SHUTDOWN' : 'ENGAGE LOCKDOWN'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div style={{
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        overflowX: 'auto',
        background: '#070b14',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                background: active ? '#17223b' : 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid #38bdf8' : '2px solid transparent',
                color: active ? '#ffffff' : 'var(--text-muted)',
                padding: '10px 14px',
                fontSize: '0.8rem',
                fontWeight: active ? 700 : 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={14} color={active ? '#38bdf8' : 'currentColor'} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  borderRadius: '999px',
                  padding: '1px 6px',
                  marginLeft: '2px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
