// Script para inserir dados de teste
import pool from './db/connection.js';

async function inserirDados() {
    try {
        console.log('🔄 Inserindo dados de teste...\n');

        // Inserir Grupos
        console.log('📁 Inserindo Grupos...');
        await pool.query(`
            INSERT INTO public."Grupos" (nome, descricao, ativo)
            VALUES
                ('SUMMERMAX', 'Grupo SUMMERMAX - Marina e Embarcações', true),
                ('ALLMAX', 'Grupo ALLMAX', true),
                ('IMOBEM', 'Grupo IMOBEM', true)
            ON CONFLICT DO NOTHING
        `);

        // Buscar id do grupo SUMMERMAX
        const grupoResult = await pool.query(`
            SELECT id_grupo FROM public."Grupos" WHERE nome = 'SUMMERMAX' LIMIT 1
        `);

        if (grupoResult.rows.length === 0) {
            console.log('❌ Grupo SUMMERMAX não encontrado!');
            return;
        }

        const idGrupo = grupoResult.rows[0].id_grupo;
        console.log(`✅ Grupo SUMMERMAX: ID ${idGrupo}`);

        // Inserir Empresas
        console.log('\n🏢 Inserindo Empresas...');
        await pool.query(`
            INSERT INTO public."Empresas" (id_grupo, nome, cnpj, ativo)
            VALUES
                ($1, 'ALLMAX', '00.000.000/0001-01', true),
                ($1, 'SUMMER MARINA', '00.000.000/0001-02', true),
                ($1, 'IMOBEM TECH', '00.000.000/0001-03', true)
            ON CONFLICT DO NOTHING
        `, [idGrupo]);

        // Listar resultados
        console.log('\n📋 GRUPOS CADASTRADOS:');
        const grupos = await pool.query(`SELECT id_grupo, nome FROM public."Grupos" ORDER BY nome`);
        grupos.rows.forEach(g => console.log(`   - ID ${g.id_grupo}: ${g.nome}`));

        console.log('\n🏢 EMPRESAS CADASTRADAS:');
        const empresas = await pool.query(`SELECT id_empresa, nome FROM public."Empresas" ORDER BY nome`);
        empresas.rows.forEach(e => console.log(`   - ID ${e.id_empresa}: ${e.nome}`));

        console.log('\n✅ DADOS INSERIDOS COM SUCESSO!');

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ ERRO:', error);
        process.exit(1);
    }
}

inserirDados();
