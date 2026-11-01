// ============================================================
// routes/banco/index.js — V.2611011045
// ROTAS DO EXTRATO BANCÁRIO (SUMMERMAX-WEB)
// Migrado do calendario-boat
// ============================================================

import express from 'express';
import extratoRouter from './extrato-api.js';
import editarLancamentoRouter from './editar-lancamento-api.js';
import enriquecerRouter from './enriquecer-api.js';
import reclassificarRouter from './reclassificar-api.js';
import importarOfxRouter from './importar-ofx-api.js';
import saldoInicialRouter from './saldo-inicial-api.js';
import divergenciasDataRouter from './divergencias-data-api.js';
import corrigirMesRouter from './corrigir-mes-api.js';

const router = express.Router();

// ============================================================
// ROTAS DO EXTRATO
// ============================================================

// Rotas de extrato bancário (listar, filtrar, exportar)
router.use('/extrato', extratoRouter);

// Rotas de edição de lançamentos
router.use('/', editarLancamentoRouter);

// ============================================================
// FERRAMENTAS ADMINISTRATIVAS
// ============================================================

// Importar arquivo OFX via upload
router.use('/importar-ofx', importarOfxRouter);

// Enriquecer dados (buscar cliente e CR)
router.use('/enriquecer', enriquecerRouter);

// Reclassificar por palavras-chave
router.use('/reclassificar', reclassificarRouter);

// Gerenciar divergências de data
router.use('/divergencias-data', divergenciasDataRouter);

// Corrigir e auditar mês específico
router.use('/corrigir-mes', corrigirMesRouter);

// Gerenciar saldos iniciais
router.use('/saldo-inicial', saldoInicialRouter);

// ============================================================
// EXPORTAÇÕES
// ============================================================

export default router;

// V.2611011045
