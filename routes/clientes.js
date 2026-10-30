// ============================================================
// ROTAS DE CLIENTES - V.2610292058
// API de gerenciamento de clientes
// ============================================================

import express from 'express';
import pool from '../db/connection.js';
import { autenticar } from '../middlewares/auth.js';

const router = express.Router();

// ============================================================
// BUSCAR CLIENTES POR NOME (AUTOCOMPLETE)
// GET /api/clientes/buscar?nome=XXX
// IMPORTANTE: Esta rota deve vir ANTES de /:codigo
// ============================================================
router.get('/buscar', autenticar, async (req, res) => {
    try {
        const { nome } = req.query;

        if (!nome || nome.length < 3) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Digite pelo menos 3 caracteres'
            });
        }

        // Busca usando ILIKE (case-insensitive) - TODOS os resultados
        const result = await pool.query(`
            SELECT
                "Codigo",
                "Cliente_Nome",
                "Cliente_CPF",
                "Cliente_Telefone_Celular"
            FROM public."Cliente"
            WHERE UPPER("Cliente_Nome") LIKE UPPER($1)
            ORDER BY "Cliente_Nome"
        `, [`%${nome}%`]);

        res.json({
            sucesso: true,
            clientes: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('Erro na busca:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro na busca',
            erro: error.message
        });
    }
});

// ============================================================
// BUSCAR CLIENTE POR CÓDIGO
// GET /api/clientes/:codigo
// ============================================================
router.get('/:codigo', autenticar, async (req, res) => {
    try {
        const { codigo } = req.params;

        const result = await pool.query(`
            SELECT *
            FROM public."Cliente"
            WHERE "Codigo" = $1
        `, [codigo]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Cliente não encontrado'
            });
        }

        res.json({
            sucesso: true,
            cliente: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar cliente',
            erro: error.message
        });
    }
});

// ============================================================
// LISTAR TODOS OS CLIENTES (COM PAGINAÇÃO)
// GET /api/clientes?page=1&limit=50
// ============================================================
router.get('/', autenticar, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        const result = await pool.query(`
            SELECT
                "Codigo",
                "Cliente_Nome",
                "Cliente_CPF",
                "Cliente_Telefone_Celular",
                "Cliente_e_mail",
                "Cliente_Cidade",
                "Cliente_UF"
            FROM public."Cliente"
            ORDER BY "Cliente_Nome"
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        const countResult = await pool.query(`
            SELECT COUNT(*) as total
            FROM public."Cliente"
        `);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        res.json({
            sucesso: true,
            clientes: result.rows,
            paginacao: {
                page,
                limit,
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error('Erro ao listar clientes:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar clientes',
            erro: error.message
        });
    }
});

// ============================================================
// CRIAR NOVO CLIENTE
// POST /api/clientes
// ============================================================
router.post('/', autenticar, async (req, res) => {
    try {
        const {
            nome,
            cpf,
            email,
            telefone,
            celular,
            endereco,
            bairro,
            cidade,
            uf,
            cep,
            observacoes
        } = req.body;

        // TODO: Implementar validações
        // TODO: Implementar geração automática de código

        res.status(501).json({
            sucesso: false,
            mensagem: 'Funcionalidade em desenvolvimento'
        });

    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao criar cliente',
            erro: error.message
        });
    }
});

// ============================================================
// ATUALIZAR CLIENTE
// PUT /api/clientes/:codigo
// ============================================================
router.put('/:codigo', autenticar, async (req, res) => {
    try {
        const { codigo } = req.params;

        // TODO: Implementar atualização

        res.status(501).json({
            sucesso: false,
            mensagem: 'Funcionalidade em desenvolvimento'
        });

    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar cliente',
            erro: error.message
        });
    }
});

// ============================================================
// BUSCAR CONTAS A RECEBER DO CLIENTE COM FILTROS
// GET /api/clientes/:codigo/contas?status=vencidas&dataDe=...&dataAte=...
// ============================================================
router.get('/:codigo/contas', autenticar, async (req, res) => {
    try {
        const { codigo } = req.params;
        const { status, dataDe, dataAte } = req.query;

        let whereConditions = ['"Código_Cliente" = $1'];
        let params = [codigo];
        let paramIndex = 2;

        // Filtro por status
        if (status === 'vencidas') {
            // Vencidas: vencimento < hoje E sem pagamento
            whereConditions.push('"Data_Vencimento" < CURRENT_DATE');
            whereConditions.push('"Data_Pagamento" IS NULL');
        } else if (status === 'abertas') {
            // Abertas: sem pagamento
            whereConditions.push('"Data_Pagamento" IS NULL');
        } else if (status === 'quitadas') {
            // Quitadas: com pagamento
            whereConditions.push('"Data_Pagamento" IS NOT NULL');
        }
        // 'todas' não adiciona filtro

        // Filtro por data inicial
        if (dataDe) {
            whereConditions.push(`"Data_Vencimento" >= $${paramIndex}`);
            params.push(dataDe);
            paramIndex++;
        }

        // Filtro por data final
        if (dataAte) {
            whereConditions.push(`"Data_Vencimento" <= $${paramIndex}`);
            params.push(dataAte);
            paramIndex++;
        }

        const result = await pool.query(`
            SELECT
                "Codigo",
                "Descrição" as descricao,
                "Valor" as valor,
                "Data_Vencimento" as data_vencimento,
                "Data_Pagamento" as data_pagamento,
                "agendamento_obs" as link_asaas,
                "Total" as pago
            FROM public."Contas_Receber"
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY "Data_Vencimento" DESC
        `, params);

        res.json({
            sucesso: true,
            contas: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('Erro ao buscar contas:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar contas',
            erro: error.message
        });
    }
});

// ============================================================
// BUSCAR DETALHES COMPLETOS DE UMA CONTA
// GET /api/clientes/:codigo/contas/:codigoConta/detalhes
// ============================================================
router.get('/:codigo/contas/:codigoConta/detalhes', autenticar, async (req, res) => {
    try {
        const { codigoConta } = req.params;

        const result = await pool.query(`
            SELECT
                cr.*,
                c."Cliente_Nome",
                c."Cliente_CPF",
                c."Cliente_Telefone_Celular"
            FROM public."Contas_Receber" cr
            LEFT JOIN public."Cliente" c ON cr."Código_Cliente" = c."Codigo"
            WHERE cr."Codigo" = $1
        `, [codigoConta]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Conta não encontrada'
            });
        }

        res.json({
            sucesso: true,
            conta: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar detalhes',
            erro: error.message
        });
    }
});

// ============================================================
// SINCRONIZAR CONTA COM ASAAS
// GET /api/clientes/:codigo/contas/:codigoConta/asaas
// ============================================================
router.get('/:codigo/contas/:codigoConta/asaas', autenticar, async (req, res) => {
    try {
        const { codigoConta } = req.params;

        // 1. Buscar conta no banco
        console.log('🔍 PASSO 1: Buscar conta', codigoConta);
        const contaResult = await pool.query(`
            SELECT
                "Codigo",
                "Portador",
                "agendamento_obs",
                "Centro_Custo"
            FROM public."Contas_Receber"
            WHERE "Codigo" = $1
        `, [codigoConta]);

        if (contaResult.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Conta não encontrada'
            });
        }

        const conta = contaResult.rows[0];
        const paymentId = conta.Portador; // ID do pagamento está no campo Portador
        const linkAsaas = conta.agendamento_obs;

        console.log('✅ CONTA:', {
            Codigo: conta.Codigo,
            Portador: conta.Portador,
            Centro_Custo: conta.Centro_Custo,
            Link: conta.agendamento_obs
        });

        if (!paymentId || !paymentId.startsWith('pay_')) {
            console.log('❌ PAYMENT ID INVÁLIDO:', paymentId);
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Conta sem integração Asaas ou ID inválido',
                debug: {
                    paymentId,
                    link: linkAsaas
                }
            });
        }

        console.log('✅ Payment ID válido:', paymentId);

        // 3. Buscar API Key do Centro de Custo
        console.log('🔍 PASSO 2: Buscar API Key para Centro Custo:', conta.Centro_Custo);
        const apiKeyResult = await pool.query(`
            SELECT "Codigo", "Codigo_Texto", "Descrição", "API_Key"
            FROM public."Centros_Custos"
            WHERE CAST("Codigo_Texto" AS TEXT) = CAST($1 AS TEXT)
        `, [conta.Centro_Custo]);

        if (apiKeyResult.rows.length === 0 || !apiKeyResult.rows[0].API_Key) {
            console.log('❌ API KEY NÃO ENCONTRADA para Centro Custo:', conta.Centro_Custo);
            return res.status(400).json({
                sucesso: false,
                mensagem: 'API Key do Asaas não encontrada para este Centro de Custo',
                debug: {
                    centroCusto: conta.Centro_Custo
                }
            });
        }

        const apiKey = apiKeyResult.rows[0].API_Key;
        console.log('✅ API KEY ENCONTRADA:', {
            Codigo: apiKeyResult.rows[0].Codigo,
            Empresa: apiKeyResult.rows[0].Descrição,
            API_Key: apiKey.substring(0, 20) + '...'
        });

        // 4. Determinar URL da API (produção ou sandbox)
        const isProduction = linkAsaas && linkAsaas.includes('www.asaas.com');
        const apiUrl = isProduction
            ? `https://www.asaas.com/api/v3/payments/${paymentId}`
            : `https://sandbox.asaas.com/api/v3/payments/${paymentId}`;

        console.log('🔍 PASSO 3: Chamar API Asaas');
        console.log('   Ambiente:', isProduction ? 'PRODUÇÃO' : 'SANDBOX');
        console.log('   URL:', apiUrl);

        // 5. Buscar dados no Asaas
        const asaasResponse = await fetch(apiUrl, {
            headers: {
                'access_token': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!asaasResponse.ok) {
            const errorData = await asaasResponse.text();
            console.log('❌ ERRO API ASAAS:', asaasResponse.status, errorData);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao consultar Asaas',
                statusCode: asaasResponse.status,
                erro: errorData
            });
        }

        const asaasData = await asaasResponse.json();
        console.log('✅ DADOS ASAAS RECEBIDOS:', {
            id: asaasData.id,
            externalReference: asaasData.externalReference,
            status: asaasData.status,
            value: asaasData.value
        });

        // 🔍 VALIDAÇÃO: Comparar externalReference com Codigo da conta
        console.log('📋 VALIDAÇÃO DE CRUZAMENTO:');
        console.log('   Conta solicitada (Codigo):', codigoConta);
        console.log('   External Reference (Asaas):', asaasData.externalReference);
        console.log('   ✅ Bateu?', asaasData.externalReference == codigoConta);

        if (asaasData.externalReference != codigoConta) {
            console.warn('⚠️⚠️⚠️ ALERTA: DADOS DE OUTRA CONTA! ⚠️⚠️⚠️');
            console.warn('   Payment ID usado:', paymentId);
            console.warn('   Conta esperada:', codigoConta);
            console.warn('   Conta do Asaas:', asaasData.externalReference);
        }

        // 6. Retornar dados combinados
        res.json({
            sucesso: true,
            asaas: asaasData,
            ambiente: isProduction ? 'PRODUÇÃO' : 'SANDBOX',
            ultimaSincronizacao: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ ERRO FATAL:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao sincronizar com Asaas',
            erro: error.message,
            stack: error.stack
        });
    }
});

export default router;

// V.2610291835
