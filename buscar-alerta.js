// Buscar campos com alerta
import pool from './db/connection.js';

async function buscar() {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'Cliente'
            AND column_name ILIKE '%alerta%'
            ORDER BY column_name
        `);

        console.log('\n📋 CAMPOS COM ALERTA:\n');
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

buscar();
