// ============================================================
// routes/banco/index.js — V.2611011100
// ROTAS DO EXTRATO BANCÁRIO (SUMMERMAX-WEB)
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
import categoriasRouter from './categorias-crud.js';

const router = express.Router();

// Rotas de extrato bancário
router.use('/extrato', extratoRouter);

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
