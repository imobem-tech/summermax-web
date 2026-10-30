// Buscar "7" em todos os campos de texto
import pool from './db/connection.js';

async function buscar() {
    try {
        console.log('\n🔍 Procurando "7" em TODOS os campos de texto...\n');

        // Lista de campos de texto para verificar
        const campos = [
            'Cliente_Endereço',
            'Cliente_Bairro_Descrição',
            'Cliente_Cidade',
            'Cliente_CEP',
            'Cliente_UF',
            'Conjuge_Nome',
            'Cliente_Telefone_Celular',
            'Outros_Email',
            'Plano_Pgto'
        ];

        const total = await pool.query(`SELECT COUNT(*) as total FROM public."Cliente"`);
        const totalClientes = total.rows[0].total;

        console.log(`Total de clientes: ${totalClientes}\n`);
        console.log('📊 Campos com valor exatamente "7":\n');

        for (const campo of campos) {
            const result = await pool.query(`
                SELECT COUNT(*) as total
                FROM public."Cliente"
                WHERE "${campo}" = '7'
            `);

            if (result.rows[0].total > 0) {
                console.log(`✅ ${campo}: ${result.rows[0].total} registros`);
            }
        }

        // Verificar também Plano_Pgto
        console.log('\n📋 Valores mais comuns em Plano_Pgto:\n');
        const plano = await pool.query(`
            SELECT "Plano_Pgto", COUNT(*) as qtd
            FROM public."Cliente"
            WHERE "Plano_Pgto" IS NOT NULL AND "Plano_Pgto" != ''
            GROUP BY "Plano_Pgto"
            ORDER BY qtd DESC
            LIMIT 10
        `);

        plano.rows.forEach(r => {
            const valor = r.Plano_Pgto?.substring(0, 50) || '';
            console.log(`   "${valor}" → ${r.qtd} vezes`);
        });

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ ERRO:', error.message);
        process.exit(1);
    }
}

buscar();
