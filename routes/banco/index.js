// ============================================================
// routes/banco/index.js — V.2611011440
// ROTAS DO EXTRATO BANCÁRIO (SUMMERMAX-WEB)
// 🔒 TODAS AS ROTAS PROTEGIDAS COM AUTENTICAÇÃO
// ============================================================

import express from 'express';
import { autenticar } from '../../middlewares/auth.js';
import extratoRouter from './extrato-api.js';
import editarLancamentoRouter from './editar-lancamento-api.js';
import enriquecerRouter from './enriquecer-api.js';
import reclassificarRouter from './reclassificar-api.js';
import importarOfxRouter from './importar-ofx-api.js';
import saldoInicialRouter from './saldo-inicial-api.js';
import divergenciasDataRouter from './divergencias-data-api.js';
import corrigirMesRouter from './corrigir-mes-api.js';
import categoriasRouter from './categorias-crud.js';
import gerarPdfRouter from './gerar-pdf-api.js';

const router = express.Router();

// ============================================================
// 🔒 APLICAR AUTENTICAÇÃO EM TODAS AS ROTAS
// ============================================================
router.use(autenticar);

// Rotas de extrato bancário
router.use('/extrato', extratoRouter);
router.use('/extrato', gerarPdfRouter);

// Rotas de edição
router.use('/', editarLancamentoRouter);

// Ferramentas administrativas
router.use('/importar-ofx', importarOfxRouter);
router.use('/enriquecer', enriquecerRouter);
router.use('/reclassificar', reclassificarRouter);
router.use('/divergencias-data', divergenciasDataRouter);
router.use('/corrigir-mes', corrigirMesRouter);
router.use('/saldo-inicial', saldoInicialRouter);
router.use('/categorias', categoriasRouter);

export default router;
