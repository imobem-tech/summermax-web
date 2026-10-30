// ============================================================
// ROTAS DE CONTAS A RECEBER - V.2610291905
// API de gerenciamento de contas
// ============================================================

import express from 'express';
import pool from '../db/connection.js';
import { autenticar } from '../middlewares/auth.js';

const router = express.Router();

// ============================================================
// MARCAR CONTA COMO PAGA
// POST /api/contas/:codigo/marcar-paga
// ============================================================
router.post('/:codigo/marcar-paga', autenticar, async (req, res) => {
    try {
        const { codigo } = req.params;
        const { dataPagamento, valorPago, formaPagamento, observacoes } = req.body;

        // Validações
        if (!dataPagamento || !valorPago || !formaPagamento || !observacoes) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Campos obrigatórios: dataPagamento, valorPago, formaPagamento, observacoes'
            });
        }

        // 1. Buscar conta atual (com Portador para manter ID do Asaas)
        const contaResult = await pool.query(`
            SELECT "Observacões_Pagamento", "Portador", "agendamento_obs", "Centro_Custo"
            FROM public."Contas_Receber"
            WHERE "Codigo" = $1
        `, [codigo]);

        if (contaResult.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Conta não encontrada'
            });
        }

        const obsAnterior = contaResult.rows[0].Observacões_Pagamento || '';

        // 2. Buscar data/hora atual do servidor em GMT-3 (America/Sao_Paulo)
        const agora = new Date();
        const dataHoraBrasil = agora.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // 3. Nome do usuário logado
        console.log('📍 DADOS DO USUÁRIO:', {
            completo: req.usuario,
            nome: req.usuario?.nome,
            id: req.usuario?.id_usuario
        });
        const nomeUsuario = req.usuario?.nome || 'Sistema';

        // 4. Formatar valor
        const valorFormatado = parseFloat(valorPago).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        // 5. Formatar data de pagamento informada
        const dataPgtoFormatada = new Date(dataPagamento + 'T00:00:00').toLocaleDateString('pt-BR');

        // 6. Montar nova observação no formato especificado
        let novaObservacao = '';

        if (obsAnterior && obsAnterior.trim()) {
            novaObservacao = obsAnterior + '\n\n';
        }

        novaObservacao += '-----------------------\n';
        novaObservacao += `${dataHoraBrasil} - ${nomeUsuario}\n`;
        novaObservacao += `Data Pgto ${dataPgtoFormatada} Forma: ${formaPagamento} Vlr: R$ ${valorFormatado}\n`;
        novaObservacao += '\n';
        novaObservacao += observacoes;

        // 7. Atualizar conta (NUNCA sobrescrever o campo Portador!)
        const updateQuery = `
            UPDATE public."Contas_Receber"
            SET
                "Data_Pagamento" = $1,
                "Total" = $2,
                "Observacões_Pagamento" = $3
            WHERE "Codigo" = $4
            RETURNING *
        `;

        const params = [dataPagamento, valorPago, novaObservacao, codigo];
        const result = await pool.query(updateQuery, params);

        // 8. Tentar fazer baixa no Asaas (se houver integração)
        let asaasResult = null;
        let asaasMotivoNaoBaixado = null;
        const paymentId = contaResult.rows[0].Portador; // Usar o Portador ANTES do update
        const linkAsaas = contaResult.rows[0].agendamento_obs;

        if (paymentId && paymentId.startsWith('pay_')) {
            try {
                const isProduction = linkAsaas && linkAsaas.includes('www.asaas.com');

                // Buscar API Key do Centro de Custo
                const centroCusto = contaResult.rows[0].Centro_Custo;
                const apiKeyResult = await pool.query(`
                    SELECT "API_Key"
                    FROM public."Centros_Custos"
                    WHERE CAST("Codigo_Texto" AS TEXT) = CAST($1 AS TEXT)
                `, [centroCusto]);

                if (apiKeyResult.rows.length > 0 && apiKeyResult.rows[0].API_Key) {
                    const apiKey = apiKeyResult.rows[0].API_Key;

                    // PRIMEIRO: Consultar estado da cobrança
                    const consultaUrl = isProduction
                        ? `https://www.asaas.com/api/v3/payments/${paymentId}`
                        : `https://sandbox.asaas.com/api/v3/payments/${paymentId}`;

                    console.log('🔍 CONSULTANDO ESTADO DA COBRANÇA NO ASAAS:');
                    console.log('   URL:', consultaUrl);

                    const consultaResponse = await fetch(consultaUrl, {
                        headers: {
                            'access_token': apiKey,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (consultaResponse.ok) {
                        const cobranca = await consultaResponse.json();
                        console.log('   Status:', cobranca.status);
                        console.log('   Deleted:', cobranca.deleted);

                        // VERIFICAR SE FOI DELETADA/CANCELADA
                        if (cobranca.deleted === true) {
                            console.log('⚠️ COBRANÇA REMOVIDA - NÃO É POSSÍVEL FAZER BAIXA NO ASAAS');
                            asaasMotivoNaoBaixado = 'Cobrança foi removida/cancelada no Asaas - não é possível registrar baixa manual';
                        } else {
                            // Cobrança ativa - tentar baixa
                            const apiUrl = isProduction
                                ? `https://www.asaas.com/api/v3/payments/${paymentId}/receiveInCash`
                                : `https://sandbox.asaas.com/api/v3/payments/${paymentId}/receiveInCash`;

                            console.log('🔍 TENTANDO BAIXA NO ASAAS:');
                            console.log('   URL:', apiUrl);
                            console.log('   Payment ID:', paymentId);
                            console.log('   Data:', dataPagamento);
                            console.log('   Valor:', valorPago);

                            const asaasResponse = await fetch(apiUrl, {
                                method: 'POST',
                                headers: {
                                    'access_token': apiKey,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    paymentDate: dataPagamento,
                                    value: valorPago,
                                    notifyCustomer: false
                                })
                            });

                            console.log('📡 RESPOSTA ASAAS:');
                            console.log('   Status:', asaasResponse.status);
                            console.log('   OK?', asaasResponse.ok);

                            if (asaasResponse.ok) {
                                asaasResult = await asaasResponse.json();
                                console.log('✅ BAIXA REALIZADA:', asaasResult);
                            } else {
                                const errorText = await asaasResponse.text();
                                console.log('❌ ERRO NA BAIXA:');
                                console.log('   Status:', asaasResponse.status);
                                console.log('   Resposta:', errorText);

                                try {
                                    const errorJson = JSON.parse(errorText);
                                    asaasMotivoNaoBaixado = errorJson.errors?.[0]?.description || 'Erro desconhecido ao fazer baixa';
                                } catch {
                                    asaasMotivoNaoBaixado = 'Erro ao comunicar com Asaas';
                                }
                            }
                        }
                    } else {
                        console.log('❌ ERRO AO CONSULTAR COBRANÇA:', consultaResponse.status);
                        asaasMotivoNaoBaixado = 'Erro ao consultar estado da cobrança no Asaas';
                    }
                } else {
                    console.log('❌ API KEY NÃO ENCONTRADA para baixa');
                    asaasMotivoNaoBaixado = 'API Key não encontrada para este Centro de Custo';
                }
            } catch (asaasError) {
                console.error('Erro ao baixar no Asaas:', asaasError);
                asaasMotivoNaoBaixado = asaasError.message || 'Erro ao comunicar com Asaas';
            }
        }

        // Montar resumo detalhado das alterações
        const resumo = {
            bancoLocal: {
                alterado: true,
                campos: {
                    'Data de Pagamento': dataPgtoFormatada,
                    'Valor Pago': `R$ ${valorFormatado}`,
                    'Forma de Pagamento': formaPagamento,
                    'Observações': 'Atualizada com histórico do pagamento'
                }
            },
            asaas: asaasResult ? {
                alterado: true,
                acao: 'Baixa manual registrada',
                status: asaasResult.status,
                paymentId: paymentId
            } : {
                alterado: false,
                motivo: asaasMotivoNaoBaixado ||
                    (paymentId && paymentId.startsWith('pay_')
                        ? 'Erro ao comunicar com Asaas'
                        : 'Conta sem integração Asaas')
            }
        };

        res.json({
            sucesso: true,
            mensagem: 'Pagamento registrado com sucesso',
            conta: result.rows[0],
            resumo
        });

    } catch (error) {
        console.error('Erro ao marcar como paga:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao registrar pagamento',
            erro: error.message
        });
    }
});

// ============================================================
// ADICIONAR OBSERVAÇÃO
// POST /api/contas/:codigo/observacao
// ============================================================
router.post('/:codigo/observacao', autenticar, async (req, res) => {
    try {
        const { codigo } = req.params;
        const { observacao } = req.body;

        if (!observacao || !observacao.trim()) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Observação é obrigatória'
            });
        }

        // 1. Buscar observações atuais
        const result = await pool.query(`
            SELECT "Observações"
            FROM public."Contas_Receber"
            WHERE "Codigo" = $1
        `, [codigo]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Conta não encontrada'
            });
        }

        const obsAnterior = result.rows[0].Observações || '';

        // 2. Buscar data/hora atual em GMT-3
        const agora = new Date();
        const dataHoraBrasil = agora.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // 3. Nome do usuário
        const nomeUsuario = req.usuario?.nome || 'Sistema';

        // 4. Montar nova observação (MAIS RECENTE NO TOPO)
        let novaObservacao = '';

        // NOVO REGISTRO NO TOPO
        novaObservacao += '-----------------------\n';
        novaObservacao += `${dataHoraBrasil} - ${nomeUsuario}\n`;
        novaObservacao += '\n';
        novaObservacao += observacao.trim();

        // REGISTROS ANTERIORES EMBAIXO
        if (obsAnterior && obsAnterior.trim()) {
            novaObservacao += '\n\n' + obsAnterior;
        }

        // 5. Atualizar no banco
        await pool.query(`
            UPDATE public."Contas_Receber"
            SET "Observações" = $1
            WHERE "Codigo" = $2
        `, [novaObservacao, codigo]);

        res.json({
            sucesso: true,
            mensagem: 'Observação salva com sucesso'
        });

    } catch (error) {
        console.error('Erro ao salvar observação:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao salvar observação',
            erro: error.message
        });
    }
});

// ============================================================
// ADICIONAR OBSERVAÇÃO DE PAGAMENTO
// ============================================================
router.post('/:codigo/observacao-pagamento', autenticar, async (req, res) => {
    try {
        const { codigo } = req.params;
        const { observacao } = req.body;

        if (!observacao || !observacao.trim()) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Observação é obrigatória'
            });
        }

        // 1. Buscar observações atuais
        const result = await pool.query(`
            SELECT "Observacões_Pagamento"
            FROM public."Contas_Receber"
            WHERE "Codigo" = $1
        `, [codigo]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Conta não encontrada'
            });
        }

        const obsAnterior = result.rows[0].Observacões_Pagamento || '';

        // 2. Buscar data/hora atual em GMT-3
        const agora = new Date();
        const dataHoraBrasil = agora.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // 3. Nome do usuário
        const nomeUsuario = req.usuario?.nome || 'Sistema';

        // 4. Montar nova observação (MAIS RECENTE NO TOPO)
        let novaObservacao = '';

        // NOVO REGISTRO NO TOPO
        novaObservacao += '-----------------------\n';
        novaObservacao += `${dataHoraBrasil} - ${nomeUsuario}\n`;
        novaObservacao += '\n';
        novaObservacao += observacao.trim();

        // REGISTROS ANTERIORES EMBAIXO
        if (obsAnterior && obsAnterior.trim()) {
            novaObservacao += '\n\n' + obsAnterior;
        }

        // 5. Atualizar no banco
        await pool.query(`
            UPDATE public."Contas_Receber"
            SET "Observacões_Pagamento" = $1
            WHERE "Codigo" = $2
        `, [novaObservacao, codigo]);

        res.json({
            sucesso: true,
            mensagem: 'Observação de pagamento salva com sucesso'
        });

    } catch (error) {
        console.error('Erro ao salvar observação de pagamento:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao salvar observação de pagamento',
            erro: error.message
        });
    }
});

// ============================================================
// CANCELAR COBRANÇA
// POST /api/contas/:codigo/cancelar
// ============================================================
router.post('/:codigo/cancelar', autenticar, async (req, res) => {
    try {
        const { codigo } = req.params;
        const { motivo, cancelarAsaas } = req.body;

        // Validações
        if (!motivo || !motivo.trim()) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Motivo é obrigatório'
            });
        }

        // 1. Buscar conta atual
        const contaResult = await pool.query(`
            SELECT "Codigo", "Portador", "agendamento_obs", "Centro_Custo", "Observacões_Pagamento", "Descrição", "Valor"
            FROM public."Contas_Receber"
            WHERE "Codigo" = $1
        `, [codigo]);

        if (contaResult.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Conta não encontrada'
            });
        }

        const conta = contaResult.rows[0];
        const paymentId = conta.Portador;
        const linkAsaas = conta.agendamento_obs;

        // 2. Registrar cancelamento no banco local
        const agora = new Date();
        const dataHoraBrasil = agora.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const nomeUsuario = req.usuario?.nome || 'Sistema';

        // Montar observação de cancelamento
        const obsAnterior = conta.Observacões_Pagamento || '';
        let novaObservacao = '';

        novaObservacao += '-----------------------\n';
        novaObservacao += `${dataHoraBrasil} - ${nomeUsuario}\n`;
        novaObservacao += '🚫 COBRANÇA CANCELADA\n';
        novaObservacao += '\n';
        novaObservacao += `Motivo: ${motivo.trim()}`;

        if (obsAnterior && obsAnterior.trim()) {
            novaObservacao += '\n\n' + obsAnterior;
        }

        // Atualizar banco (registrar cancelamento)
        const dataCancelamento = new Date().toISOString().split('T')[0]; // Data atual YYYY-MM-DD

        await pool.query(`
            UPDATE public."Contas_Receber"
            SET "Data_Vencimento" = $1,
                "Total" = NULL,
                "Observacões_Pagamento" = $2
            WHERE "Codigo" = $3
        `, [dataCancelamento, novaObservacao, codigo]);

        // 3. Tentar cancelar no Asaas (se solicitado e houver integração)
        let asaasResult = null;
        let asaasMotivoNaoCancelado = null;

        if (cancelarAsaas && paymentId && paymentId.startsWith('pay_')) {
            try {
                const isProduction = linkAsaas && linkAsaas.includes('www.asaas.com');

                // Buscar API Key
                const apiKeyResult = await pool.query(`
                    SELECT "API_Key"
                    FROM public."Centros_Custos"
                    WHERE CAST("Codigo_Texto" AS TEXT) = CAST($1 AS TEXT)
                `, [conta.Centro_Custo]);

                if (apiKeyResult.rows.length > 0 && apiKeyResult.rows[0].API_Key) {
                    const apiKey = apiKeyResult.rows[0].API_Key;

                    // Cancelar no Asaas
                    const apiUrl = isProduction
                        ? `https://www.asaas.com/api/v3/payments/${paymentId}`
                        : `https://sandbox.asaas.com/api/v3/payments/${paymentId}`;

                    console.log('🚫 CANCELANDO NO ASAAS:', paymentId);

                    const asaasResponse = await fetch(apiUrl, {
                        method: 'DELETE',
                        headers: {
                            'access_token': apiKey,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (asaasResponse.ok) {
                        asaasResult = await asaasResponse.json();
                        console.log('✅ CANCELADA NO ASAAS:', asaasResult);
                    } else {
                        const errorText = await asaasResponse.text();
                        console.log('❌ ERRO AO CANCELAR:', errorText);

                        try {
                            const errorJson = JSON.parse(errorText);
                            asaasMotivoNaoCancelado = errorJson.errors?.[0]?.description || 'Erro ao cancelar no Asaas';
                        } catch {
                            asaasMotivoNaoCancelado = 'Erro ao comunicar com Asaas';
                        }
                    }
                } else {
                    asaasMotivoNaoCancelado = 'API Key não encontrada para este Centro de Custo';
                }
            } catch (asaasError) {
                console.error('Erro ao cancelar no Asaas:', asaasError);
                asaasMotivoNaoCancelado = asaasError.message || 'Erro ao comunicar com Asaas';
            }
        }

        // Montar resumo
        const resumo = {
            bancoLocal: {
                alterado: true,
                acao: 'Cobrança marcada como cancelada'
            },
            asaas: asaasResult ? {
                alterado: true,
                acao: 'Cobrança cancelada no Asaas',
                status: asaasResult.deleted ? 'CANCELADA' : asaasResult.status,
                paymentId: paymentId
            } : {
                alterado: false,
                motivo: asaasMotivoNaoCancelado ||
                    (cancelarAsaas
                        ? (paymentId && paymentId.startsWith('pay_')
                            ? 'Erro ao comunicar com Asaas'
                            : 'Conta sem integração Asaas')
                        : 'Cancelamento no Asaas não solicitado')
            }
        };

        res.json({
            sucesso: true,
            mensagem: 'Cobrança cancelada com sucesso',
            resumo
        });

    } catch (error) {
        console.error('Erro ao cancelar cobrança:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao cancelar cobrança',
            erro: error.message
        });
    }
});

export default router;

// V.2610292150
