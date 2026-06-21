// ============================================================
// ROTAS DE ORÇAMENTOS (orc_)
// V.2606181600
// ============================================================

import express from 'express';
import { query, getClient } from '../db/connection.js';
import { autenticar, autorizar } from '../middlewares/auth.js';

const router = express.Router();

// Todas as rotas precisam autenticação
router.use(autenticar);

// ============================================================
// GET /api/orcamentos - Listar orçamentos
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { id_grupo, id_empresa, status, limite = 50, pagina = 1 } = req.query;

    let filtros = [];
    let params = [];
    let paramIndex = 1;

    // Filtrar por grupo
    if (id_grupo) {
      filtros.push(`o.id_grupo = $${paramIndex++}`);
      params.push(id_grupo);
    } else if (req.usuario.nivel_acesso !== 'SUPER_ADMIN') {
      // Usuários não super admin só veem seu grupo
      filtros.push(`o.id_grupo = $${paramIndex++}`);
      params.push(req.usuario.id_grupo);
    }

    // Filtrar por empresa
    if (id_empresa) {
      filtros.push(`o.id_empresa = $${paramIndex++}`);
      params.push(id_empresa);
    }

    // Filtrar por status
    if (status) {
      filtros.push(`o.status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = filtros.length > 0 ? 'WHERE ' + filtros.join(' AND ') : '';
    const offset = (pagina - 1) * limite;

    const result = await query(`
      SELECT
        o.id_orcamento,
        o.numero,
        o.descricao,
        o.valor_servicos,
        o.taxa_servico_valor,
        o.valor_total,
        o.status,
        o.data_orcamento,
        o.data_validade,
        e.nome as nome_empresa,
        emb."Nome_Embar" as nome_embarcacao,
        emb."Num_PB" as num_pb,
        forn."Cliente_Nome" as nome_fornecedor,
        u.nome as usuario_cadastro_nome
      FROM orcamento_servico o
      INNER JOIN mae_empresa e ON o.id_empresa = e.id_empresa
      INNER JOIN "P_BOAT_1_Embarcacao" emb ON o.id_embarcacao = emb."Código"
      LEFT JOIN "Cliente" forn ON o.id_fornecedor = forn."Codigo"
      LEFT JOIN mae_usuario u ON o.usuario_cadastro = u.id_usuario
      ${whereClause}
      ORDER BY o.data_orcamento DESC, o.id_orcamento DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, limite, offset]);

    // Contar total
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM orcamento_servico o
      ${whereClause}
    `, params);

    res.json({
      orcamentos: result.rows,
      total: parseInt(countResult.rows[0].total),
      pagina: parseInt(pagina),
      limite: parseInt(limite)
    });

  } catch (err) {
    console.error('❌ Erro ao listar orçamentos:', err);
    res.status(500).json({ erro: 'Erro ao listar orçamentos' });
  }
});

// ============================================================
// GET /api/orcamentos/embarcacao/:id/cotistas - Buscar cotistas
// ✅ CORRIGIDO - V.2606211705 - Usa Num_PB para relacionamento
// ⚠️ IMPORTANTE: Esta rota DEVE vir ANTES de /:id para não ser capturada
// ============================================================
router.get('/embarcacao/:id/cotistas', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔍 Buscando cotistas para embarcação ID: ${id}`);

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

    // ✅ CORREÇÃO: Buscar cotistas usando Num_PB (não o Código!)
    // Relacionamento correto: P_BOAT_1_Embarcacao.Num_PB = P_BOAT_4_Autorizados.Cod_Embarcacao
    const cotistasResult = await query(`
      SELECT
        a."Código" as id,
        a."Cod_Pessoa" as id_cliente,
        a."Cota_comp" as qtd_cotas,
        c."Cliente_Nome" as nome,
        c."Cliente_CPF" as cpf_cnpj,
        c."Cliente_Telefone_Celular" as telefone
      FROM "P_BOAT_4_Autorizados" a
      LEFT JOIN "Cliente" c ON a."Cod_Pessoa" = c."Codigo"
      WHERE a."Cod_Embarcacao" = $1
      AND a."Cota_comp" > 0
      ORDER BY a."Cota_comp" DESC
    `, [numPB]);

    console.log(`✅ ${cotistasResult.rows.length} cotistas encontrados`);

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
    res.status(500).json({ erro: 'Erro ao buscar cotistas' });
  }
});

// ============================================================
// GET /api/orcamentos/:id - Buscar orçamento específico
// ⚠️ IMPORTANTE: Esta rota genérica DEVE vir DEPOIS das rotas específicas
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar orçamento
    const orcResult = await query(`
      SELECT
        o.*,
        e.nome as nome_empresa,
        emb."Nome_Embar" as nome_embarcacao,
        emb."Num_PB" as num_pb,
        emb."Cod_Cliente" as cod_proprietario,
        forn."Cliente_Nome" as nome_fornecedor,
        forn."Cliente_CPF" as cnpj_fornecedor,
        u.nome as usuario_cadastro_nome
      FROM orcamento_servico o
      INNER JOIN mae_empresa e ON o.id_empresa = e.id_empresa
      INNER JOIN "P_BOAT_1_Embarcacao" emb ON o.id_embarcacao = emb."Código"
      LEFT JOIN "Cliente" forn ON o.id_fornecedor = forn."Codigo"
      LEFT JOIN mae_usuario u ON o.usuario_cadastro = u.id_usuario
      WHERE o.id_orcamento = $1
    `, [id]);

    if (orcResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Orçamento não encontrado' });
    }

    const orcamento = orcResult.rows[0];

    // Verificar permissão
    if (req.usuario.nivel_acesso !== 'SUPER_ADMIN' && req.usuario.id_grupo !== orcamento.id_grupo) {
      return res.status(403).json({ erro: 'Sem permissão para acessar este orçamento' });
    }

    // Buscar itens
    const itensResult = await query(`
      SELECT *
      FROM orcamento_item
      WHERE id_orcamento = $1
      ORDER BY ordem, id_item
    `, [id]);

    // Buscar rateios
    const rateiosResult = await query(`
      SELECT
        r.*,
        c."Nome" as nome_cliente,
        c."CPF_CNPJ" as cpf_cliente
      FROM orcamento_rateio r
      INNER JOIN "Cliente" c ON r.id_cliente = c."ID"
      WHERE r.id_orcamento = $1
      ORDER BY r.id_cliente
    `, [id]);

    res.json({
      ...orcamento,
      itens: itensResult.rows,
      rateios: rateiosResult.rows
    });

  } catch (err) {
    console.error('❌ Erro ao buscar orçamento:', err);
    res.status(500).json({ erro: 'Erro ao buscar orçamento' });
  }
});

// ============================================================
// POST /api/orcamentos - Criar novo orçamento
// ============================================================
router.post('/', autorizar('OPERADOR', 'ADMIN_EMPRESA', 'MASTER_GRUPO', 'SUPER_ADMIN'), async (req, res) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const {
      id_embarcacao,
      id_fornecedor,
      descricao,
      observacao,
      itens,
      taxa_servico_perc,
      forma_pagamento,
      qtd_parcelas,
      dias_vencimento
    } = req.body;

    // Validações
    if (!id_embarcacao || !descricao || !itens || itens.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ erro: 'Dados obrigatórios faltando' });
    }

    // Buscar embarcação para pegar id_empresa
    const embResult = await client.query(`
      SELECT id_grupo, id_empresa, "Num_PB"
      FROM "P_BOAT_1_Embarcacao"
      WHERE "Código" = $1
    `, [id_embarcacao]);

    if (embResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erro: 'Embarcação não encontrada' });
    }

    const { id_grupo, id_empresa, Num_PB: num_pb } = embResult.rows[0];

    // Gerar número do orçamento (formato: ORC-YYYYMMDD-XXXX)
    const dataHoje = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countResult = await client.query(`
      SELECT COUNT(*) as total
      FROM orcamento_servico
      WHERE id_empresa = $1
      AND data_orcamento = CURRENT_DATE
    `, [id_empresa]);

    const seq = parseInt(countResult.rows[0].total) + 1;
    const numero = `ORC-${dataHoje}-${String(seq).padStart(4, '0')}`;

    // Calcular valor total dos itens
    const valor_servicos = itens.reduce((sum, item) => sum + parseFloat(item.valor_total || 0), 0);
    const taxa_perc = parseFloat(taxa_servico_perc || 20);
    const taxa_servico_valor = valor_servicos * (taxa_perc / 100);
    const valor_total = valor_servicos + taxa_servico_valor;

    // Inserir orçamento
    const orcResult = await client.query(`
      INSERT INTO orcamento_servico (
        id_grupo, id_empresa, numero, id_embarcacao, id_fornecedor,
        descricao, observacao,
        valor_servicos, taxa_servico_perc, taxa_servico_valor, valor_total,
        forma_pagamento, qtd_parcelas, dias_vencimento,
        usuario_cadastro
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id_orcamento
    `, [
      id_grupo, id_empresa, numero, id_embarcacao, id_fornecedor,
      descricao, observacao,
      valor_servicos, taxa_perc, taxa_servico_valor, valor_total,
      forma_pagamento || 'BOLETO', qtd_parcelas || 1, dias_vencimento || 5,
      req.usuario.id_usuario
    ]);

    const id_orcamento = orcResult.rows[0].id_orcamento;

    // Inserir itens
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      await client.query(`
        INSERT INTO orcamento_item (
          id_orcamento, ordem, descricao, quantidade, valor_unitario, valor_total, observacao
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        id_orcamento,
        i + 1,
        item.descricao,
        item.quantidade || 1,
        item.valor_unitario,
        item.valor_total,
        item.observacao
      ]);
    }

    // Buscar cotistas e criar rateios
    const cotistasResult = await client.query(`
      SELECT "Cod_Pessoa" as id_cliente, "Cota_comp" as qtd_cotas
      FROM "P_BOAT_4_Autorizados"
      WHERE "Cod_Embarcacao" = $1
      AND "Cota_comp" > 0
    `, [id_embarcacao]);

    if (cotistasResult.rows.length > 0) {
      const total_cotas = cotistasResult.rows.reduce((sum, c) => sum + parseFloat(c.qtd_cotas), 0);

      for (const cotista of cotistasResult.rows) {
        const percentual = (parseFloat(cotista.qtd_cotas) / total_cotas * 100);
        const valor_servico = (valor_servicos * percentual / 100);
        const valor_taxa = (taxa_servico_valor * percentual / 100);
        const valor_total_cotista = valor_servico + valor_taxa;
        const valor_parcela = valor_total_cotista / (qtd_parcelas || 1);

        await client.query(`
          INSERT INTO orcamento_rateio (
            id_orcamento, id_cliente, qtd_cotas, total_cotas, percentual,
            valor_servico, valor_taxa, valor_total, qtd_parcelas, valor_parcela
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          id_orcamento,
          cotista.id_cliente,
          cotista.qtd_cotas,
          total_cotas,
          percentual,
          valor_servico,
          valor_taxa,
          valor_total_cotista,
          qtd_parcelas || 1,
          valor_parcela
        ]);
      }
    }

    // Log de auditoria
    await client.query(`
      INSERT INTO orcamento_log (
        id_orcamento, acao, descricao, status_novo, id_usuario, ip_origem
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      id_orcamento,
      'CRIACAO',
      'Orçamento criado',
      'RASCUNHO',
      req.usuario.id_usuario,
      req.ip
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      sucesso: true,
      id_orcamento,
      numero,
      mensagem: 'Orçamento criado com sucesso'
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao criar orçamento:', err);
    res.status(500).json({ erro: 'Erro ao criar orçamento' });
  } finally {
    client.release();
  }
});

export default router;

// V.2606181600
