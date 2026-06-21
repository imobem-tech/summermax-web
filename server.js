// ============================================================
// server.js — V.2606211550
// Servidor Web SUMMERMAX
// ============================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import orcamentosRoutes from './routes/orc_orcamentos.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// Middlewares
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// Log de requisições
// ============================================================
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ============================================================
// Rotas da API
// ============================================================
app.use('/api/orcamentos', orcamentosRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SUMMERMAX API está online',
    timestamp: new Date().toISOString(),
    timezone: process.env.TZ || 'America/Sao_Paulo'
  });
});

// ============================================================
// Rota raiz - redirecionar para orcamentos-novo.html
// ============================================================
app.get('/', (req, res) => {
  res.redirect('/orcamentos-novo.html');
});

// ============================================================
// Tratamento de erros 404
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.url
  });
});

// ============================================================
// Iniciar servidor
// ============================================================
app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log('🚀 SISTEMA WEB SUMMERMAX');
  console.log('🚀 ========================================');
  console.log(`🚀 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Timezone: ${process.env.TZ || 'America/Sao_Paulo'} (GMT-3)`);
  console.log('🚀 ========================================');
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
  console.log('🚀 ========================================');
});

// V.2606211550
