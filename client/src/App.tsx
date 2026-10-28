import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { DashboardView } from './views/DashboardView';
import { SimulatorView } from './views/SimulatorView';
import { ApprovalsView } from './views/ApprovalsView';
import { DataCatalogView } from './views/DataCatalogView';
import { AgentsView } from './views/AgentsView';
import { ModelsView } from './views/ModelsView';
import { PoliciesView } from './views/PoliciesView';
import { EvidenceView } from './views/EvidenceView';
import { MaturityView } from './views/MaturityView';
import { DocsView } from './views/DocsView';
import { api } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [globalKillSwitch, setGlobalKillSwitch] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAllData = async () => {
    try {
      const [statsRes, sourcesRes, agentsRes, policiesRes, approvalsRes, evidenceRes] = await Promise.all([
        api.getStats().catch(() => null),
        api.getSources().catch(() => ({ sources: [] })),
        api.getAgents().catch(() => ({ agents: [], globalKillSwitch: false })),
        api.getPolicies().catch(() => ({ policies: [] })),
        api.getApprovals().catch(() => ({ approvals: [] })),
        api.getEvidence().catch(() => ({ records: [] }))
      ]);

      if (statsRes) setStats(statsRes);
      setSources(sourcesRes?.sources || []);
      setAgents(agentsRes?.agents || []);
      setGlobalKillSwitch(agentsRes?.globalKillSwitch || false);
      setPolicies(policiesRes?.policies || []);
      setApprovals(approvalsRes?.approvals || []);
      setEvidence(evidenceRes?.records || []);
    } catch (err) {
      console.error('Failed to load governance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleGlobalKillSwitch = async () => {
    const newState = !globalKillSwitch;
    const confirmMsg = newState
      ? 'EMERGENCY: Are you sure you want to activate the GLOBAL KILL SWITCH? This will immediately halt all AI prompts, tools, and autonomous agent actions enterprise-wide.'
      : 'Are you sure you want to disarm the Global Kill Switch and restore normal AI operations?';

    if (window.confirm(confirmMsg)) {
      try {
        await api.setGlobalKillSwitch(newState);
        setGlobalKillSwitch(newState);
        loadAllData();
      } catch (err: any) {
        alert(err.message || 'Failed to toggle kill switch');
      }
    }
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pendingApprovalsCount={pendingApprovalsCount}
        globalKillSwitch={globalKillSwitch}
        onToggleGlobalKillSwitch={handleToggleGlobalKillSwitch}
      />

      <main style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '0 24px 60px 24px', flex: 1 }}>
        <PipelineVisualizer />

        {loading && !stats ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            background: '#0c1220',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            margin: '40px 0'
          }}>
            <div style={{
              display: 'inline-block',
              width: '36px',
              height: '36px',
              border: '3px solid rgba(56, 189, 248, 0.2)',
              borderTopColor: '#38bdf8',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginBottom: '16px'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
              Initializing Enterprise Governance Control Plane...
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Verifying AES-256 Vault, PEP Policies, and SHA-256 Ledger Integrity
            </div>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView stats={stats} onNavigate={setCurrentTab} />
            )}
            {currentTab === 'simulator' && (
              <SimulatorView agents={agents} sources={sources} onActionTriggered={loadAllData} />
            )}
            {currentTab === 'approvals' && (
              <ApprovalsView approvals={approvals} onRefresh={loadAllData} />
            )}
            {currentTab === 'catalog' && (
              <DataCatalogView sources={sources} onRefresh={loadAllData} />
            )}
            {currentTab === 'agents' && (
              <AgentsView agents={agents} sources={sources} policies={policies} onRefresh={loadAllData} />
            )}
            {currentTab === 'models' && (
              <ModelsView onRefresh={loadAllData} />
            )}
            {currentTab === 'policies' && (
              <PoliciesView policies={policies} onRefresh={loadAllData} />
            )}
            {currentTab === 'evidence' && (
              <EvidenceView evidence={evidence} onRefresh={loadAllData} />
            )}
            {currentTab === 'maturity' && (
              <MaturityView />
            )}
            {currentTab === 'docs' && (
              <DocsView />
            )}
          </>
        )}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '24px 32px',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        background: '#060a12',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>AegisGov™ Enterprise AI & Data Governance Middleware</span>
            <span style={{ fontSize: '0.65rem', padding: '1px 6px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>v2.4.0-enterprise</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
            Copyright © 2026 Qualex Consulting Services INC & Antonio Martínez. All Rights Reserved.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.72rem', color: 'var(--text-faint)' }}>
          <span>ISO/IEC 42001:2023</span>
          <span>•</span>
          <span>NIST AI RMF 1.0</span>
          <span>•</span>
          <span>EU AI Act Art. 14 (HITL)</span>
          <span>•</span>
          <span>FIPS 140-3 Cryptography</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
