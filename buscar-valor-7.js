// Buscar qual campo tem muitos registros com valor 7
import pool from './db/connection.js';

async function buscar() {
    try {
        console.log('\n🔍 Procurando campos com valor "7"...\n');

        // Verificar Cliente_ID_tab_6
        const tab6 = await pool.query(`
            SELECT COUNT(*) as total
            FROM public."Cliente"
            WHERE "Cliente_ID_tab_6" = '7'
        `);

        // Verificar Cliente_ID_tab_8
        const tab8 = await pool.query(`
            SELECT COUNT(*) as total
            FROM public."Cliente"
            WHERE "Cliente_ID_tab_8" = '7'
        `);

        // Verificar Cliente_ID_tab_9
        const tab9 = await pool.query(`
            SELECT COUNT(*) as total
            FROM public."Cliente"
            WHERE "Cliente_ID_tab_9" = '7'
        `);

        // Total de clientes
        const total = await pool.query(`
            SELECT COUNT(*) as total
            FROM public."Cliente"
        `);

        const totalClientes = total.rows[0].total;

        console.log('📊 RESULTADOS:\n');
        console.log(`Total de clientes: ${totalClientes}`);
        console.log('');
        console.log(`Cliente_ID_tab_6 = "7": ${tab6.rows[0].total} registros`);
        console.log(`Cliente_ID_tab_8 = "7": ${tab8.rows[0].total} registros`);
        console.log(`Cliente_ID_tab_9 = "7": ${tab9.rows[0].total} registros`);
        console.log('');

        // Verificar valores únicos em cada campo
        const valores6 = await pool.query(`
            SELECT "Cliente_ID_tab_6", COUNT(*) as qtd
            FROM public."Cliente"
            WHERE "Cliente_ID_tab_6" IS NOT NULL AND "Cliente_ID_tab_6" != ''
            GROUP BY "Cliente_ID_tab_6"
            ORDER BY qtd DESC
            LIMIT 5
        `);

        const valores8 = await pool.query(`
            SELECT "Cliente_ID_tab_8", COUNT(*) as qtd
            FROM public."Cliente"
            WHERE "Cliente_ID_tab_8" IS NOT NULL AND "Cliente_ID_tab_8" != ''
            GROUP BY "Cliente_ID_tab_8"
            ORDER BY qtd DESC
            LIMIT 5
        `);

        const valores9 = await pool.query(`
            SELECT "Cliente_ID_tab_9", COUNT(*) as qtd
            FROM public."Cliente"
            WHERE "Cliente_ID_tab_9" IS NOT NULL AND "Cliente_ID_tab_9" != ''
            GROUP BY "Cliente_ID_tab_9"
            ORDER BY qtd DESC
            LIMIT 5
        `);

        console.log('📈 TOP 5 VALORES MAIS COMUNS:\n');

        console.log('Cliente_ID_tab_6:');
        valores6.rows.forEach(r => console.log(`   "${r.Cliente_ID_tab_6}" → ${r.qtd} vezes`));
        console.log('');

        console.log('Cliente_ID_tab_8:');
        valores8.rows.forEach(r => console.log(`   "${r.Cliente_ID_tab_8}" → ${r.qtd} vezes`));
        console.log('');

        console.log('Cliente_ID_tab_9:');
        valores9.rows.forEach(r => console.log(`   "${r.Cliente_ID_tab_9}" → ${r.qtd} vezes`));
        console.log('');

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ ERRO:', error.message);
        process.exit(1);
    }
}

buscar();
