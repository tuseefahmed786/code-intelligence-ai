import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  githubToken: process.env.GITHUB_TOKEN,
  gitlabToken: process.env.GITLAB_TOKEN,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
};

if (!config.openaiApiKey) {
  console.warn('⚠️  OPENAI_API_KEY not set. Some features may not work.');
}

