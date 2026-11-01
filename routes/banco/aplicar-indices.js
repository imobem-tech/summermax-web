// ============================================================
// SCRIPT PARA APLICAR ÍNDICES DE PERFORMANCE
// V.2611011111
// ============================================================

import pkg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env do diretório raiz do projeto (2 níveis acima)
const projectRoot = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(projectRoot, '.env') });

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function aplicarIndices() {
  console.log('🔧 Aplicando índices de performance...\n');

  try {
    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, 'criar-indices-performance.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Executar cada comando SQL
    const comandos = sql.split(';').filter(cmd => cmd.trim() && !cmd.trim().startsWith('--'));

    for (const comando of comandos) {
      const cmdTrimmed = comando.trim();
      if (!cmdTrimmed) continue;

      console.log(`📝 Executando: ${cmdTrimmed.substring(0, 60)}...`);
      await pool.query(cmdTrimmed);
      console.log('   ✅ OK\n');
    }

    console.log('🎉 TODOS OS ÍNDICES FORAM APLICADOS COM SUCESSO!\n');
    console.log('⚡ Performance do extrato bancário otimizada!\n');

  } catch (err) {
    console.error('❌ Erro ao aplicar índices:', err.message);
    console.error(err);
  } finally {
    await pool.end();
  }
}

aplicarIndices();

// V.2611011111
