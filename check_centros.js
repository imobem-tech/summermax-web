import pool from './db/connection.js';

try {
    const result = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Centros_Custos'
        ORDER BY ordinal_position
    `);

    console.log('\n=== CAMPOS DA TABELA Centros_Custos ===\n');
    result.rows.forEach(col => {
        console.log(`- "${col.column_name}"`);
    });

    await pool.end();
    process.exit(0);
} catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
}
