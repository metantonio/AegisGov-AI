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
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Connecting to ISO 42001 Governance Middleware...
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
        borderTop: '1px solid var(--border-subtle)',
        padding: '20px 24px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-faint)',
        background: '#060911'
      }}>
        AegisGov AI · Enterprise Data & AI Governance Middleware Platform · Aligned with ISO/IEC 42001:2023, NIST AI RMF 1.0, EU AI Act & GDPR
      </footer>
    </div>
  );
}

export default App;
