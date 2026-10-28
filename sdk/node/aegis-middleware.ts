/**
 * AegisGov AI - Node.js & TypeScript Middleware SDK
 * ISO/IEC 42001 & AI Data Governance Client Library
 */

export interface ProcessPromptOptions {
  userPrompt: string;
  sourceIds?: string[];
  purpose?: string;
  targetModel?: string;
}

export interface ExecuteActionOptions {
  toolName: string;
  parameters: Record<string, any>;
  environment?: 'sandbox' | 'production';
  sourceIds?: string[];
  system?: string;
}

export class GovernanceMiddlewareClient {
  private endpointUrl: string;
  private agentId: string;
  private apiKey?: string;

  constructor(options: { endpointUrl?: string; agentId: string; apiKey?: string }) {
    this.endpointUrl = (options.endpointUrl || 'http://localhost:4000/api/v1').replace(/\/+$/, '');
    this.agentId = options.agentId;
    this.apiKey = options.apiKey;
  }

  private async post(path: string, payload: Record<string, any>): Promise<any> {
    const url = `${this.endpointUrl}/${path.replace(/^\/+/, '')}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'AegisGov-Node-SDK/1.0'
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok && response.status !== 202 && response.status !== 403) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }
    return data;
  }

  /**
   * Routes a user prompt through the 6-stage AI governance chain.
   */
  async processPrompt(options: ProcessPromptOptions): Promise<any> {
    return this.post('gateway/process-prompt', {
      agentId: this.agentId,
      userPrompt: options.userPrompt,
      sourceIds: options.sourceIds,
      purpose: options.purpose || 'customer_support',
      targetModel: options.targetModel || 'claude-3-5-sonnet'
    });
  }

  /**
   * Intercepts tool calls, verifies policies, sandboxing, and initiates human approvals when necessary.
   */
  async executeAction(options: ExecuteActionOptions): Promise<any> {
    return this.post('gateway/execute-action', {
      agentId: this.agentId,
      toolName: options.toolName,
      parameters: options.parameters,
      environment: options.environment || 'production',
      sourceIds: options.sourceIds,
      system: options.system
    });
  }
}
