import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
<<<<<<< HEAD
  const PORT = 3000;
=======
  const PORT = 3001;
>>>>>>> 9829742 (done)

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Unified Health Intelligence Platform API is running' });
  });

  // Patient Routes (Placeholder)
  app.get('/api/patients', (req, res) => {
    res.json([]);
  });

  // Risk Prediction (Placeholder)
  app.post('/api/predict-risk', (req, res) => {
    const { glucose, bp, bmi } = req.body;
    let risk = 'Low';
    let score = 0.1;
    
    if (glucose > 140 || bp > 90 || bmi > 30) {
      risk = 'High';
      score = 0.8;
    } else if (glucose > 120 || bp > 80 || bmi > 25) {
      risk = 'Medium';
      score = 0.4;
    }
    
    res.json({ risk, score, recommendation: 'Consult a specialist for further evaluation.' });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
