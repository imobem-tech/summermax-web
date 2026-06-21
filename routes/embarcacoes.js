// ============================================================
// ROTAS DE EMBARCAÇÕES (temporário para orçamentos)
// V.2606181626
// ============================================================

import express from 'express';
import { query } from '../db/connection.js';
import { autenticar } from '../middlewares/auth.js';

const router = express.Router();
router.use(autenticar);

// ============================================================
// GET /api/embarcacoes - Listar embarcações
// ============================================================
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        "Código" as id,
        "Nome_Embar" as nome,
        "Num_PB" as num_pb,
        "Tipo_Embar" as tipo,
        "Marca" as marca,
        "Modelo" as modelo
      FROM "P_BOAT_1_Embarcacao"
      WHERE id_grupo = $1
      ORDER BY "Nome_Embar"
      LIMIT 100
    `, [req.usuario.id_grupo]);

    res.json(result.rows);

  } catch (err) {
    console.error('❌ Erro ao listar embarcações:', err);
    res.status(500).json({ erro: 'Erro ao listar embarcações' });
  }
});

// ============================================================
// GET /api/embarcacoes/:id/cotistas - Buscar cotistas de uma embarcação
// ✅ CORRIGIDO - V.2606211710 - Usa Num_PB para relacionamento
// ============================================================
router.get('/:id/cotistas', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔍 Buscando cotistas para embarcação ID: ${id}`);

    // Debug: Log do ID recebido
    console.log(`  → Tipo do ID: ${typeof id}, Valor: "${id}"`);

    // Buscar embarcação
    const embResult = await query(`
      SELECT "Código", "Nome_Embar", "Num_PB", "Cod_Cliente"
      FROM "P_BOAT_1_Embarcacao"
      WHERE "Código" = $1
    `, [id]);

    if (embResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Embarcação não encontrada' });
    }

    const embarcacao = embResult.rows[0];
    const numPB = embarcacao.Num_PB;

    console.log(`✅ Embarcação encontrada - Num_PB: ${numPB}`);

    // ✅ RELACIONAMENTO CORRETO:
    // P_BOAT_1_Embarcacao.Num_PB = P_BOAT_4_Autorizados.Cod_Embarcacao
    // P_BOAT_4_Autorizados.Cod_Pessoa = Cliente.Codigo (SEM acento)
    // ✅ FILTROS:
    // - Excluir cotistas com Dt_Cancelamento ou Dt_Desautorizacao preenchidos
    // - Mostrar Grupo_letra em vez de Cota_comp
    const cotistasResult = await query(`
      SELECT
        a."Código" as id,
        a."Cod_Pessoa" as id_cliente,
        a."Cota_comp" as qtd_cotas,
        a."Grupo_letra" as grupo_letra,
        c."Cliente_Nome" as nome,
        c."Cliente_CPF" as cpf_cnpj,
        c."Cliente_Telefone_Celular" as telefone
      FROM "P_BOAT_4_Autorizados" a
      LEFT JOIN "Cliente" c ON a."Cod_Pessoa" = c."Codigo"
      WHERE a."Cod_Embarcacao" = $1
        AND a."Cota_comp" > 0
        AND a."Dt_Cancelamento" IS NULL
        AND a."Dt_Desautorizacao" IS NULL
      ORDER BY a."Grupo_letra", a."Código"
    `, [numPB]);

    console.log(`✅ ${cotistasResult.rows.length} cotistas encontrados`);

    // Debug: Mostrar primeiro cotista se houver
    if (cotistasResult.rows.length > 0) {
      console.log(`  → Primeiro cotista:`, cotistasResult.rows[0]);
    }

    // Calcular total de cotas
    const totalCotas = cotistasResult.rows.reduce((sum, c) => sum + parseFloat(c.qtd_cotas || 0), 0);

    // Calcular percentual de cada cotista
    const cotistas = cotistasResult.rows.map(c => ({
      ...c,
      percentual: totalCotas > 0 ? (parseFloat(c.qtd_cotas) / totalCotas * 100).toFixed(2) : 0
    }));

    res.json({
      embarcacao,
      cotistas,
      total_cotas: totalCotas
    });

  } catch (err) {
    console.error('❌ Erro ao buscar cotistas:', err);
    console.error('  → Stack:', err.stack);
    console.error('  → Message:', err.message);
    res.status(500).json({
      erro: 'Erro ao buscar cotistas',
      detalhes: err.message
    });
  }
});

export default router;

// V.2606211710
