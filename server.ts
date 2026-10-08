import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Vercel API handlers
import pointsHandler from './api/points.js';
import postbackHandler from './api/postback.js';
import hyperbeamHandler from './api/hyperbeam.js';
import surveysHandler from './api/surveys.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';

  // Request parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.get('/api/points', async (req, res) => {
    try {
      await pointsHandler(req as any, res as any);
    } catch (error) {
      console.error('Error in /api/points:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/postback', async (req, res) => {
    try {
      await postbackHandler(req as any, res as any);
    } catch (error) {
      console.error('Error in /api/postback:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/api/hyperbeam', async (req, res) => {
    try {
      await hyperbeamHandler(req as any, res as any);
    } catch (error) {
      console.error('Error in /api/hyperbeam:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/surveys', async (req, res) => {
    try {
      await surveysHandler(req as any, res as any);
    } catch (error) {
      console.error('Error in /api/surveys:', error);
      res.status(502).json({ error: 'Survey service unavailable' });
    }
  });

  // Serve static assets / HTML
  if (!isProd) {
    // Create Vite server in middleware mode
    console.log('Starting Vite in middleware mode...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build
    console.log('Serving production build from dist...');
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  const host = '0.0.0.0';

  app.listen(Number(port), host, () => {
    console.log(`Server is running at http://${host}:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
