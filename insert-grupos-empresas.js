// Script para inserir grupos e empresas
import pool from './db/connection.js';

async function inserir() {
    try {
        console.log('🔄 Inserindo grupos e empresas...\n');

        // Inserir grupos
        await pool.query(`
            INSERT INTO public.mae_grupo (nome, descricao, ativo)
            VALUES
                ('SUMMERMAX', 'Grupo SUMMERMAX', true),
                ('ALLMAX', 'Grupo ALLMAX', true)
            ON CONFLICT DO NOTHING
        `);

        // Buscar ID do grupo
        const g = await pool.query(`SELECT id_grupo FROM public.mae_grupo WHERE nome = 'SUMMERMAX' LIMIT 1`);
        const idGrupo = g.rows[0].id_grupo;

        // Inserir empresas
        await pool.query(`
            INSERT INTO public.mae_empresa (id_grupo, nome, cnpj, ativo)
            VALUES
                ($1, 'ALLMAX', '00.000.000/0001-01', true),
                ($1, 'SUMMER MARINA', '00.000.000/0001-02', true)
            ON CONFLICT DO NOTHING
        `, [idGrupo]);

        console.log('✅ Dados inseridos com sucesso!');

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ ERRO:', error.message);
        process.exit(1);
    }
}

inserir();
