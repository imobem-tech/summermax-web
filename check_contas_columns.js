import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: 'D:\\OneDrive\\GESTAO_DZ\\Claude_DZ\\web-app\\.env' });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

try {
    console.log('\n=== COLUNAS DA TABELA Contas_Receber ===\n');

    const result = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Contas_Receber'
        ORDER BY ordinal_position
    `);

    if (result.rows.length > 0) {
        result.rows.forEach(col => {
            console.log(`- "${col.column_name}" (${col.data_type})`);
        });
    } else {
        console.log('Nenhuma coluna encontrada');
    }

    await pool.end();
} catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
}
