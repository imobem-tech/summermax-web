// ============================================================
// routes/orc_orcamentos.js — V.2606211545
// Rotas de Orçamentos - CORRIGIDO
// ============================================================

import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// ============================================================
// GET /api/orcamentos/embarcacoes
// Listar embarcações
// ============================================================
router.get('/embarcacoes', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        "Código" as id,
        "Nome_Embar" as nome,
        "Num_PB" as numero_pb,
        "Cod_Cliente" as cod_proprietario,
        "Marca" as marca,
        "Modelo" as modelo,
        "Ano" as ano
      FROM "P_BOAT_1_Embarcacao"
      WHERE "Num_PB" IS NOT NULL
      ORDER BY "Num_PB"
      LIMIT 100
    `);

    res.json({
      success: true,
      total: result.rows.length,
      embarcacoes: result.rows
    });
  } catch (error) {
    console.error('❌ Erro ao listar embarcações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar embarcações',
      error: error.message
    });
  }
});

// ============================================================
// GET /api/orcamentos/embarcacao/:num_pb
// Buscar embarcação por Num_PB
// ============================================================
router.get('/embarcacao/:num_pb', async (req, res) => {
  try {
    const { num_pb } = req.params;

    const result = await query(`
      SELECT
        "Código" as id,
        "Nome_Embar" as nome,
        "Num_PB" as numero_pb,
        "Cod_Cliente" as cod_proprietario,
        "Marca" as marca,
        "Modelo" as modelo,
        "Ano" as ano
      FROM "P_BOAT_1_Embarcacao"
      WHERE "Num_PB" = $1
    `, [num_pb]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Embarcação não encontrada'
      });
    }

    res.json({
      success: true,
      embarcacao: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro ao buscar embarcação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar embarcação',
      error: error.message
    });
  }
});

// ============================================================
// GET /api/orcamentos/embarcacao/:num_pb/cotistas
// ✅ CORRIGIDO - Buscar cotistas usando Num_PB
// ============================================================
router.get('/embarcacao/:num_pb/cotistas', async (req, res) => {
  try {
    const { num_pb } = req.params;

    console.log(`🔍 Buscando cotistas para Num_PB: ${num_pb}`);

    // ✅ RELACIONAMENTO CORRETO:
    // P_BOAT_1_Embarcacao.Num_PB = P_BOAT_4_Autorizados.Cod_Embarcacao
    // P_BOAT_4_Autorizados.Cod_Pessoa = Cliente.Código
    const result = await query(`
      SELECT
        a."Código" as id,
        a."Cod_Pessoa" as id_cliente,
        a."Cod_Embarcacao" as num_pb,
        a."Cota_comp" as qtd_cotas,
        c."Código" as codigo_cliente,
        c."Cliente_Nome" as nome,
        c."Cliente_CPF" as cpf_cnpj,
        c."Cliente_Telefone_Celular" as telefone
      FROM "P_BOAT_4_Autorizados" a
      LEFT JOIN "Cliente" c ON a."Cod_Pessoa" = c."Código"
      WHERE a."Cod_Embarcacao" = $1
        AND a."Cota_comp" > 0
      ORDER BY a."Código"
    `, [num_pb]);

    console.log(`✅ ${result.rows.length} cotistas encontrados`);

    res.json({
      success: true,
      total: result.rows.length,
      cotistas: result.rows
    });
  } catch (error) {
    console.error('❌ Erro ao buscar cotistas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cotistas',
      error: error.message
    });
  }
});

// ============================================================
// GET /api/orcamentos
// ✅ CORRIGIDO - Listar orçamentos (REMOVIDO forn.Nome)
// ============================================================
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        o.id_orcamento,
        o.id_embarcacao,
        o.descricao,
        o.valor_total,
        o.status,
        o.data_criacao,
        e."Nome_Embar" as nome_embarcacao,
        e."Num_PB" as numero_pb
      FROM orc_orcamento o
      LEFT JOIN "P_BOAT_1_Embarcacao" e ON o.id_embarcacao = e."Num_PB"
      ORDER BY o.data_criacao DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      total: result.rows.length,
      orcamentos: result.rows
    });
  } catch (error) {
    console.error('❌ Erro ao listar orçamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar orçamentos',
      error: error.message
    });
  }
});

// ============================================================
// POST /api/orcamentos
// Criar novo orçamento
// ============================================================
router.post('/', async (req, res) => {
  try {
    const {
      id_embarcacao,
      descricao,
      valor_total,
      observacao,
      ratear_cotistas
    } = req.body;

    const result = await query(`
      INSERT INTO orc_orcamento (
        id_embarcacao,
        descricao,
        valor_total,
        observacao,
        status,
        data_criacao
      ) VALUES ($1, $2, $3, $4, 'pendente', NOW())
      RETURNING id_orcamento
    `, [id_embarcacao, descricao, valor_total, observacao || null]);

    const id_orcamento = result.rows[0].id_orcamento;

    // Se ratear entre cotistas
    if (ratear_cotistas) {
      // TODO: Implementar rateio
    }

    res.json({
      success: true,
      id_orcamento,
      message: 'Orçamento criado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar orçamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar orçamento',
      error: error.message
    });
  }
});

export default router;

// V.2606211545
