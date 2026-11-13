// ============================================================
// routes/banco/gestao-financeira-api.js — V.2611122202
// API GESTÃO FINANCEIRA (SUMMERMAX-WEB)
// 🔒 PROTEGIDA COM AUTENTICAÇÃO
// ============================================================

import express from 'express';
import pool from '../../db/connection.js';

const router = express.Router();

// ============================================================
// GET /api/banco/gestao/resumo
// Retorna resumo geral (entradas, saídas, saldo)
// ============================================================
router.get('/resumo', async (req, res) => {
    try {
        const { dataInicio, dataFim, empresa } = req.query;

        if (!dataInicio || !dataFim) {
            return res.status(400).json({
                error: 'Parâmetros dataInicio e dataFim são obrigatórios'
            });
        }

        let sql = `
            SELECT
                COUNT(*) as total_movimentacoes,
                SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END) as total_entradas,
                SUM(CASE WHEN valor < 0 THEN valor ELSE 0 END) as total_saidas,
                SUM(valor) as saldo
            FROM bank_extratos
            WHERE data >= $1 AND data <= $2
        `;

        const params = [dataInicio, dataFim];

        if (empresa && empresa !== 'TODOS') {
            sql += ' AND empresa = $3';
            params.push(empresa);
        }

        const result = await pool.query(sql, params);
        const dados = result.rows[0];

        res.json({
            total_movimentacoes: parseInt(dados.total_movimentacoes) || 0,
            total_entradas: parseFloat(dados.total_entradas) || 0,
            total_saidas: parseFloat(dados.total_saidas) || 0,
            saldo: parseFloat(dados.saldo) || 0,
        });

    } catch (error) {
        console.error('Erro ao buscar resumo:', error);
        res.status(500).json({
            error: 'Erro ao buscar resumo',
            details: error.message
        });
    }
});

// ============================================================
// GET /api/banco/gestao/categorias
// Retorna categorias agrupadas (receitas e despesas)
// ============================================================
router.get('/categorias', async (req, res) => {
    try {
        const { dataInicio, dataFim, empresa } = req.query;

        if (!dataInicio || !dataFim) {
            return res.status(400).json({
                error: 'Parâmetros dataInicio e dataFim são obrigatórios'
            });
        }

        let sql = `
            SELECT
                COALESCE(c.nome, 'Não categorizada') as categoria,
                COALESCE(c.id, 0) as categoria_id,
                COUNT(*) as quantidade,
                SUM(e.valor) as total
            FROM bank_extratos e
            LEFT JOIN bank_categorias c ON e.classificacao::integer = c.id
            WHERE e.data >= $1 AND e.data <= $2
        `;

        const params = [dataInicio, dataFim];

        if (empresa && empresa !== 'TODOS') {
            sql += ' AND e.empresa = $3';
            params.push(empresa);
        }

        sql += `
            GROUP BY c.nome, c.id
            ORDER BY ABS(SUM(e.valor)) DESC
        `;

        const result = await pool.query(sql, params);

        // Separar receitas e despesas
        const receitas = result.rows
            .filter(c => parseFloat(c.total) > 0)
            .map(c => ({
                categoria: c.categoria,
                categoria_id: c.categoria_id,
                quantidade: parseInt(c.quantidade),
                total: parseFloat(c.total),
            }));

        const despesas = result.rows
            .filter(c => parseFloat(c.total) < 0)
            .map(c => ({
                categoria: c.categoria,
                categoria_id: c.categoria_id,
                quantidade: parseInt(c.quantidade),
                total: parseFloat(c.total),
            }));

        // Calcular totais para percentuais
        const totalReceitas = receitas.reduce((sum, r) => sum + r.total, 0);
        const totalDespesas = Math.abs(despesas.reduce((sum, d) => sum + d.total, 0));

        // Adicionar percentuais
        const receitasComPerc = receitas.map(r => ({
            ...r,
            percentual: totalReceitas > 0 ? (r.total / totalReceitas) * 100 : 0,
        }));

        const despesasComPerc = despesas.map(d => ({
            ...d,
            percentual: totalDespesas > 0 ? (Math.abs(d.total) / totalDespesas) * 100 : 0,
        }));

        res.json({
            receitas: receitasComPerc,
            despesas: despesasComPerc,
            totais: {
                receitas: totalReceitas,
                despesas: -totalDespesas,
            },
        });

    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({
            error: 'Erro ao buscar categorias',
            details: error.message
        });
    }
});

// ============================================================
// GET /api/banco/gestao/lancamentos
// Retorna lançamentos detalhados de uma categoria
// ============================================================
router.get('/lancamentos', async (req, res) => {
    try {
        const { dataInicio, dataFim, empresa, categoria } = req.query;

        if (!dataInicio || !dataFim || !categoria) {
            return res.status(400).json({
                error: 'Parâmetros dataInicio, dataFim e categoria são obrigatórios'
            });
        }

        let sql = `
            SELECT
                e.data,
                e.valor,
                e.descricao_original,
                e.nome_origem,
                e.observacoes
            FROM bank_extratos e
            LEFT JOIN bank_categorias c ON e.classificacao::integer = c.id
            WHERE e.data >= $1 AND e.data <= $2
        `;

        const params = [dataInicio, dataFim];
        let paramIndex = 3;

        if (empresa && empresa !== 'TODOS') {
            sql += ` AND e.empresa = $${paramIndex}`;
            params.push(empresa);
            paramIndex++;
        }

        // Filtro por categoria
        if (categoria === 'Não categorizada') {
            sql += ' AND (c.nome IS NULL OR c.nome = $' + paramIndex + ')';
            params.push('Não categorizada');
        } else {
            sql += ' AND c.nome = $' + paramIndex;
            params.push(categoria);
        }

        sql += ' ORDER BY e.data DESC, e.valor';

        const result = await pool.query(sql, params);

        res.json({
            categoria,
            lancamentos: result.rows.map(l => ({
                data: l.data,
                valor: parseFloat(l.valor),
                descricao_original: l.descricao_original,
                nome_origem: l.nome_origem,
                observacoes: l.observacoes,
            })),
        });

    } catch (error) {
        console.error('Erro ao buscar lançamentos:', error);
        res.status(500).json({
            error: 'Erro ao buscar lançamentos',
            details: error.message
        });
    }
});

export default router;
