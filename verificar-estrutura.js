// Verificar estrutura da tabela mae_usuario
import pool from './db/connection.js';

async function verificar() {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'mae_usuario'
            ORDER BY ordinal_position
        `);

        console.log('\n📋 ESTRUTURA DA TABELA mae_usuario:\n');
        result.rows.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
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
