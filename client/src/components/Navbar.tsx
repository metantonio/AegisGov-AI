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
  Power
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
    { id: 'dashboard', label: 'Overview', icon: Layers },
    { id: 'simulator', label: 'Middleware Simulator', icon: Terminal },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare, badge: pendingApprovalsCount },
    { id: 'catalog', label: 'Data Catalog', icon: Database },
    { id: 'agents', label: 'Agent Identity', icon: Key },
    { id: 'models', label: 'LLM Models', icon: Cpu },
    { id: 'policies', label: 'Risk Matrix', icon: Sliders },
    { id: 'evidence', label: 'Evidence Ledger', icon: ShieldAlert },
    { id: 'maturity', label: 'ISO 42001 Maturity', icon: Award },
    { id: 'docs', label: 'API & SDK', icon: BookOpen }
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(9, 13, 24, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => onTabChange('dashboard')}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)'
          }}>
            <Cpu size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                AEGIS<span style={{ color: 'var(--accent-cyan)' }}>GOV</span>
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                ISO/IEC 42001
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Data & AI Governance Middleware
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  background: active ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  border: active ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                  color: active ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  fontWeight: active ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    background: 'var(--accent-rose)',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    borderRadius: '999px',
                    padding: '1px 6px',
                    marginLeft: '2px',
                    boxShadow: '0 0 8px rgba(244, 63, 94, 0.5)'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Kill Switch & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onToggleGlobalKillSwitch}
            className="btn"
            style={{
              background: globalKillSwitch 
                ? 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)' 
                : 'rgba(244, 63, 94, 0.1)',
              border: `1px solid ${globalKillSwitch ? '#f43f5e' : 'rgba(244, 63, 94, 0.3)'}`,
              color: globalKillSwitch ? '#ffffff' : '#fb7185',
              padding: '8px 14px',
              fontSize: '0.8rem',
              boxShadow: globalKillSwitch ? '0 0 16px rgba(244, 63, 94, 0.6)' : 'none'
            }}
            title="Emergency Global Kill Switch"
          >
            <Power size={15} />
            <span>{globalKillSwitch ? 'GLOBAL KILL SWITCH ACTIVE' : 'Kill Switch Disarmed'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
