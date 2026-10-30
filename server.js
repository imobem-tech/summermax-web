// ============================================================
// SERVIDOR EXPRESS - SISTEMA WEB SUMMERMAX
// V.2610301220
// + Sistema de orçamentos web estilo chat (shared/orcamentos-core.js)
// ============================================================

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rotas
import authRoutes from './routes/auth.js';
import orcamentosRoutes from './routes/orc_orcamentos.js';
import orcamentosWebRoutes from './routes/orcamentos.js';
import embarcacoesRoutes from './routes/embarcacoes.js';
import clientesRoutes from './routes/clientes.js';
import contasRoutes from './routes/contas.js';
import usuariosRoutes from './routes/usuarios.js';

// Configurar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// MIDDLEWARES
// ============================================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// ROTAS
// ============================================================

// API de autenticação
app.use('/api/auth', authRoutes);

// API de orçamentos (antigo)
app.use('/api/orc', orcamentosRoutes);

// API de orçamentos (novo - estilo chat)
app.use('/api/orcamentos', orcamentosWebRoutes);

// API de embarcações
app.use('/api/embarcacoes', embarcacoesRoutes);

// API de clientes
app.use('/api/clientes', clientesRoutes);

// API de contas a receber
app.use('/api/contas', contasRoutes);

// API de usuários
app.use('/api/usuarios', usuariosRoutes);

// Rota raiz (login)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Dashboard
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Clientes
app.get('/clientes.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'clientes.html'));
});

// Usuários
app.get('/usuarios.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'usuarios.html'));
});

// Orçamentos
app.get('/orcamentos.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'orc_orcamentos.html'));
});

app.get('/orcamentos-novo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'orc_novo.html'));
});

// Modal de Rateio
app.get('/orc_rateio_modal.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'orc_rateio_modal.html'));
});

// Orçamentos Web (novo - estilo chat)
app.get('/orcamentos', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'orcamentos.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    timezone: 'America/Sao_Paulo'
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Handler de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('🚀 SISTEMA WEB SUMMERMAX');
  console.log('🚀 ========================================');
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`🚀 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Timezone: America/Sao_Paulo (GMT-3)`);
  console.log('🚀 ========================================');
  console.log('');
});

// V.2606181513
