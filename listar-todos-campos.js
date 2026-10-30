// Listar todos os campos da tabela Cliente
import pool from './db/connection.js';

async function listar() {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'Cliente'
            ORDER BY ordinal_position
        `);

        console.log('\n📋 TODOS OS CAMPOS DA TABELA Cliente:\n');
        result.rows.forEach((col, i) => {
            const num = (i + 1).toString().padStart(3);
            const nome = col.column_name.padEnd(45);
            console.log(`${num}. ${nome} (${col.data_type})`);
        });
        console.log(`\nTotal: ${result.rows.length} campos\n`);

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ ERRO:', error.message);
        process.exit(1);
    }
}

listar();
