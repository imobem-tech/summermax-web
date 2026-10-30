// Script para listar tabelas
import pool from './db/connection.js';

async function listarTabelas() {
    try {
        const result = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        console.log('\n📋 TABELAS NO BANCO:\n');
        result.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });
        console.log('');

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ ERRO:', error);
        process.exit(1);
    }
}

listarTabelas();
