// ============================================================
// TESTE DEBUG - BUSCAR DADOS DA CONTA PARA ASAAS
// ============================================================

import pool from './db/connection.js';

const codigoConta = 56627; // Código da conta do exemplo

try {
    console.log('\n========================================');
    console.log('🔍 DEBUG - SINCRONIZAR COM ASAAS');
    console.log('========================================\n');

    // 1. Buscar conta completa
    console.log('PASSO 1: Buscar conta no banco');
    console.log('Código da Conta:', codigoConta);

    const contaResult = await pool.query(`
        SELECT
            "Codigo",
            "Portador",
            "agendamento_obs",
            "Centro_Custo",
            "Descrição",
            "Valor"
        FROM public."Contas_Receber"
        WHERE "Codigo" = $1
    `, [codigoConta]);

    if (contaResult.rows.length === 0) {
        console.log('❌ Conta NÃO encontrada!');
        process.exit(1);
    }

    const conta = contaResult.rows[0];
    console.log('\n✅ CONTA ENCONTRADA:');
    console.log('   Código:', conta.Codigo);
    console.log('   Descrição:', conta.Descrição);
    console.log('   Valor:', conta.Valor);
    console.log('   Portador (Payment ID):', conta.Portador);
    console.log('   Link Asaas:', conta.agendamento_obs);
    console.log('   Centro Custo:', conta.Centro_Custo);

    // 2. Buscar API Key
    console.log('\nPASSO 2: Buscar API Key do Centro de Custo');
    console.log('Centro Custo:', conta.Centro_Custo);

    const apiKeyResult = await pool.query(`
        SELECT "Codigo", "Codigo_Texto", "Descrição", "API_Key"
        FROM public."Centros_Custos"
        WHERE CAST("Codigo_Texto" AS TEXT) = CAST($1 AS TEXT)
    `, [conta.Centro_Custo]);

    if (apiKeyResult.rows.length === 0) {
        console.log('❌ API KEY NÃO encontrada!');
        console.log('   Tentando buscar com valor:', conta.Centro_Custo);
    } else {
        const apiKey = apiKeyResult.rows[0];
        console.log('\n✅ API KEY ENCONTRADA:');
        console.log('   Código:', apiKey.Codigo);
        console.log('   Codigo_Texto:', apiKey.Codigo_Texto);
        console.log('   Descrição:', apiKey.Descrição);
        console.log('   API_Key:', apiKey.API_Key ?
            apiKey.API_Key.substring(0, 20) + '...' :
            'VAZIA');
    }

    // 3. Verificar Payment ID
    console.log('\nPASSO 3: Verificar Payment ID');
    const paymentId = conta.Portador;
    console.log('   Payment ID:', paymentId);
    console.log('   Começa com "pay_"?', paymentId && paymentId.startsWith('pay_') ? 'SIM ✅' : 'NÃO ❌');

    // 4. Determinar ambiente
    console.log('\nPASSO 4: Determinar ambiente Asaas');
    const linkAsaas = conta.agendamento_obs;
    const isProduction = linkAsaas && linkAsaas.includes('www.asaas.com');
    console.log('   Link:', linkAsaas);
    console.log('   Ambiente:', isProduction ? 'PRODUÇÃO' : 'SANDBOX');

    console.log('\n========================================');
    await pool.end();
    process.exit(0);

} catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error);
    process.exit(1);
}
