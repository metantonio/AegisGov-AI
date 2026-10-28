const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api/v1';

export async function fetchJson(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await res.json();
  if (!res.ok && res.status !== 202 && res.status !== 403) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  getStats: () => fetchJson('/stats'),
  
  getSources: () => fetchJson('/sources'),
  createSource: (source: any) => fetchJson('/sources', { method: 'POST', body: JSON.stringify(source) }),
  
  getAgents: () => fetchJson('/agents'),
  createAgent: (agent: any) => fetchJson('/agents', { method: 'POST', body: JSON.stringify(agent) }),
  setAgentKillSwitch: (agentId: string, active: boolean) => 
    fetchJson(`/agents/${agentId}/kill-switch`, { method: 'PATCH', body: JSON.stringify({ active }) }),
  setGlobalKillSwitch: (active: boolean) =>
    fetchJson('/agents/global-kill-switch', { method: 'POST', body: JSON.stringify({ active }) }),

  getPolicies: () => fetchJson('/policies'),
  updatePolicy: (id: string, updates: any) => fetchJson(`/policies/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  getApprovals: () => fetchJson('/gateway/approvals'),
  decideApproval: (id: string, decision: 'APPROVED' | 'REJECTED', decidedBy: string, rationale: string) =>
    fetchJson(`/gateway/approvals/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, decidedBy, rationale })
    }),

  getEvidence: (query?: { agentId?: string; riskTier?: string; status?: string }) => {
    const params = new URLSearchParams(query as any).toString();
    return fetchJson(`/evidence${params ? `?${params}` : ''}`);
  },
  verifyChain: () => fetchJson('/evidence/verify-chain'),
  getEvidenceByCorrelation: (correlationId: string) => fetchJson(`/evidence/${correlationId}`),

  getMaturity: () => fetchJson('/maturity'),
  updateMaturityControl: (id: number, status: 'YES' | 'PARTIAL' | 'NO') =>
    fetchJson(`/maturity/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  processPrompt: (payload: { agentId: string; userPrompt: string; sourceIds?: string[]; purpose?: string; targetModel?: string }) =>
    fetchJson('/gateway/process-prompt', { method: 'POST', body: JSON.stringify(payload) }),

  executeAction: (payload: { agentId: string; toolName: string; parameters: any; environment?: string; sourceIds?: string[] }) =>
    fetchJson('/gateway/execute-action', { method: 'POST', body: JSON.stringify(payload) })
};
