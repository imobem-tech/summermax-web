// ============================================================
// TESTE DE BAIXA MANUAL NO ASAAS - V.2610291900
// Bateria de testes para descobrir o erro exato
// ============================================================

import pool from './db/connection.js';

const TESTES = {
    codigoConta: 56627,
    paymentId: 'pay_3b9hlfkwkyjpw6rr',
    centroCusto: '8'
};

console.log('\n========================================');
console.log('🧪 BATERIA DE TESTES - BAIXA ASAAS');
console.log('========================================\n');

try {
    // ============================================================
    // PASSO 1: BUSCAR API KEY
    // ============================================================
    console.log('📍 PASSO 1: Buscar API Key');
    const apiKeyResult = await pool.query(`
        SELECT "API_Key", "Descrição"
        FROM public."Centros_Custos"
        WHERE CAST("Codigo_Texto" AS TEXT) = CAST($1 AS TEXT)
    `, [TESTES.centroCusto]);

    if (apiKeyResult.rows.length === 0) {
        throw new Error('API Key não encontrada!');
    }

    const apiKey = apiKeyResult.rows[0].API_Key;
    const empresa = apiKeyResult.rows[0].Descrição;

    console.log('   ✅ Empresa:', empresa);
    console.log('   ✅ API Key:', apiKey.substring(0, 25) + '...');
    console.log('');

    // ============================================================
    // PASSO 2: CONSULTAR COBRANÇA ATUAL
    // ============================================================
    console.log('📍 PASSO 2: Consultar estado atual da cobrança');
    const apiUrl = `https://www.asaas.com/api/v3/payments/${TESTES.paymentId}`;

    const consultaResponse = await fetch(apiUrl, {
        headers: {
            'access_token': apiKey,
            'Content-Type': 'application/json'
        }
    });

    if (!consultaResponse.ok) {
        throw new Error(`Erro ao consultar: ${consultaResponse.status}`);
    }

    const cobranca = await consultaResponse.json();
    console.log('   ✅ Status atual:', cobranca.status);
    console.log('   ✅ Deleted:', cobranca.deleted);
    console.log('   ✅ Valor:', cobranca.value);
    console.log('   ✅ Vencimento:', cobranca.dueDate);
    console.log('   ✅ Tipo:', cobranca.billingType);
    console.log('');

    // ============================================================
    // PASSO 3: TESTE 1 - BAIXA COM DATA E VALOR EXATOS
    // ============================================================
    console.log('🧪 TESTE 1: Baixa manual com data e valor exatos');
    console.log('   Endpoint: POST /payments/{id}/receiveInCash');
    console.log('');

    const teste1Payload = {
        paymentDate: '2026-10-29',
        value: 100.00,
        notifyCustomer: false
    };

    console.log('   Payload:', JSON.stringify(teste1Payload, null, 2));
    console.log('');

    const teste1Response = await fetch(
        `https://www.asaas.com/api/v3/payments/${TESTES.paymentId}/receiveInCash`,
        {
            method: 'POST',
            headers: {
                'access_token': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teste1Payload)
        }
    );

    console.log('   Status HTTP:', teste1Response.status, teste1Response.statusText);

    if (teste1Response.ok) {
        const resultado = await teste1Response.json();
        console.log('   ✅ SUCESSO!');
        console.log('   Resposta:', JSON.stringify(resultado, null, 2));
    } else {
        const erro = await teste1Response.text();
        console.log('   ❌ ERRO!');
        try {
            const erroJson = JSON.parse(erro);
            console.log('   Erro (JSON):');
            console.log(JSON.stringify(erroJson, null, 2));
        } catch {
            console.log('   Erro (texto):', erro);
        }
    }
    console.log('');

    // ============================================================
    // PASSO 4: TESTE 2 - BAIXA SEM VALOR (USAR VALOR DA COBRANÇA)
    // ============================================================
    console.log('🧪 TESTE 2: Baixa manual SEM especificar valor');
    console.log('   (API deve usar o valor da cobrança)');
    console.log('');

    const teste2Payload = {
        paymentDate: '2026-10-29',
        notifyCustomer: false
    };

    console.log('   Payload:', JSON.stringify(teste2Payload, null, 2));
    console.log('');

    const teste2Response = await fetch(
        `https://www.asaas.com/api/v3/payments/${TESTES.paymentId}/receiveInCash`,
        {
            method: 'POST',
            headers: {
                'access_token': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teste2Payload)
        }
    );

    console.log('   Status HTTP:', teste2Response.status, teste2Response.statusText);

    if (teste2Response.ok) {
        const resultado = await teste2Response.json();
        console.log('   ✅ SUCESSO!');
        console.log('   Resposta:', JSON.stringify(resultado, null, 2));
    } else {
        const erro = await teste2Response.text();
        console.log('   ❌ ERRO!');
        try {
            const erroJson = JSON.parse(erro);
            console.log('   Erro (JSON):');
            console.log(JSON.stringify(erroJson, null, 2));
        } catch {
            console.log('   Erro (texto):', erro);
        }
    }
    console.log('');

    // ============================================================
    // PASSO 5: TESTE 3 - BAIXA COM VALOR DIFERENTE
    // ============================================================
    console.log('🧪 TESTE 3: Baixa manual com valor DIFERENTE');
    console.log('   (Testar se aceita valor menor/maior)');
    console.log('');

    const teste3Payload = {
        paymentDate: '2026-10-29',
        value: 50.00,  // Metade do valor
        notifyCustomer: false
    };

    console.log('   Payload:', JSON.stringify(teste3Payload, null, 2));
    console.log('');

    const teste3Response = await fetch(
        `https://www.asaas.com/api/v3/payments/${TESTES.paymentId}/receiveInCash`,
        {
            method: 'POST',
            headers: {
                'access_token': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teste3Payload)
        }
    );

    console.log('   Status HTTP:', teste3Response.status, teste3Response.statusText);

    if (teste3Response.ok) {
        const resultado = await teste3Response.json();
        console.log('   ✅ SUCESSO!');
        console.log('   Resposta:', JSON.stringify(resultado, null, 2));
    } else {
        const erro = await teste3Response.text();
        console.log('   ❌ ERRO!');
        try {
            const erroJson = JSON.parse(erro);
            console.log('   Erro (JSON):');
            console.log(JSON.stringify(erroJson, null, 2));
        } catch {
            console.log('   Erro (texto):', erro);
        }
    }
    console.log('');

    // ============================================================
    // PASSO 6: VERIFICAR ESTADO FINAL
    // ============================================================
    console.log('📍 PASSO 6: Verificar estado final da cobrança');

    const consultaFinalResponse = await fetch(apiUrl, {
        headers: {
            'access_token': apiKey,
            'Content-Type': 'application/json'
        }
    });

    if (consultaFinalResponse.ok) {
        const cobrancaFinal = await consultaFinalResponse.json();
        console.log('   Status final:', cobrancaFinal.status);
        console.log('   Deleted:', cobrancaFinal.deleted);
        console.log('   Payment Date:', cobrancaFinal.paymentDate);
        console.log('   Client Payment Date:', cobrancaFinal.clientPaymentDate);
    }
    console.log('');

    console.log('========================================');
    console.log('✅ BATERIA DE TESTES CONCLUÍDA!');
    console.log('========================================\n');

} catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error(error);
} finally {
    await pool.end();
}
