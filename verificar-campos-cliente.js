// Verificar campos da tabela Cliente
import pool from './db/connection.js';

async function verificar() {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'Cliente'
            AND (
                column_name ILIKE '%carta%'
                OR column_name ILIKE '%cobranca%'
                OR column_name ILIKE '%cobrar%'
                OR column_name ILIKE '%emitir%'
                OR column_name ILIKE '%dias%'
                OR column_name ILIKE '%antes%'
            )
            ORDER BY column_name
        `);

        console.log('\n📋 CAMPOS RELACIONADOS A COBRANÇA:\n');
        result.rows.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`);
        });
        console.log('');

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ ERRO:', error.message);
        process.exit(1);
    }
}

verificar();
