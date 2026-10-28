import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { gatewayRouter } from './routes/gateway.js';
import { sourcesRouter } from './routes/sources.js';
import { agentsRouter } from './routes/agents.js';
import { policiesRouter } from './routes/policies.js';
import { evidenceRouter } from './routes/evidence.js';
import { maturityRouter } from './routes/maturity.js';
import { statsRouter } from './routes/stats.js';
import { docsRouter } from './routes/docs.js';
import { modelsRouter } from './routes/models.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[GOV-GATEWAY] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/v1/gateway', gatewayRouter);
app.use('/api/v1/sources', sourcesRouter);
app.use('/api/v1/agents', agentsRouter);
app.use('/api/v1/policies', policiesRouter);
app.use('/api/v1/evidence', evidenceRouter);
app.use('/api/v1/maturity', maturityRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/api/v1/docs', docsRouter);
app.use('/api/v1/models', modelsRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'AegisGov AI - ISO/IEC 42001 Middleware Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🛡️  AEGIS-GOV AI MIDDLEWARE GATEWAY ONLINE on port ${PORT}`);
  console.log(`📘 API Documentation & OpenAPI UI: http://localhost:${PORT}/api/v1/docs`);
  console.log(`🔍 OpenAPI JSON Specification:     http://localhost:${PORT}/api/v1/docs/openapi.json`);
  console.log(`⚡ Health Check:                    http://localhost:${PORT}/health`);
  console.log(`================================================================`);
});
