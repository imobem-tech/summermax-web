import pool from './db/connection.js';

try {
    const result = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Contas_Receber'
        ORDER BY ordinal_position
    `);

    console.log('\n=== CAMPOS DA TABELA Contas_Receber ===\n');
    result.rows.forEach(col => {
        console.log(`- "${col.column_name}" (${col.data_type})`);
    });

    await pool.end();
    process.exit(0);
} catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
}
