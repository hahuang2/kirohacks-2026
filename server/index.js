import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { handleAIRequest } from './ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    aiEnabled: !!process.env.OPENAI_API_KEY,
  });
});

// AI endpoint
app.post('/api/ai', async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'AI is not available' });
  }

  try {
    const result = await handleAIRequest(req.body);
    res.json(result);
  } catch (err) {
    console.error('AI request failed:', err.message);
    res.status(500).json({ error: 'AI request failed' });
  }
});

app.listen(PORT, () => {
  console.log(`AlgoMentor API running on port ${PORT}`);
  console.log(`AI enabled: ${!!process.env.OPENAI_API_KEY}`);
});
