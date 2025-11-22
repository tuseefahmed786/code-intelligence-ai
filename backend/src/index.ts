import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env';
import analysisRoutes from './routes/analysis';
import webhookRoutes from './routes/webhooks';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'code-intelligence-ai',
  });
});

app.use('/api/analyze', analysisRoutes);
app.use('/api/documentation', analysisRoutes);
app.use('/api/tests', analysisRoutes);
app.use('/api/webhooks', webhookRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Code Intelligence AI - PR Review Service',
    version: '1.0.0',
    description: 'Automatically analyze GitHub Pull Requests with AI',
    webhook: {
      endpoint: '/api/webhooks/github',
      events: ['pull_request'],
      instructions: 'Add this URL as a webhook in your GitHub repository settings',
    },
    health: '/health',
  });
});

app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    path: req.path,
  });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
🚀 Code Intelligence AI Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server running on http://localhost:${PORT}
🌍 Environment: ${config.nodeEnv}
${config.openaiApiKey ? '✅ OpenAI API configured' : '⚠️  OpenAI API not configured'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;

