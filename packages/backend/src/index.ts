import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { progressRouter } from './routes/progress.js';
import { hintRouter } from './routes/ai-hint.js';

config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/progress', progressRouter);
app.use('/hint', hintRouter);

app.listen(PORT, () => {
  console.log(`RISC-V Learn backend running on port ${PORT}`);
});

export { app };
