// ============================================================
// CONEXÃO COM BANCO DE DADOS POSTGRESQL (NEON)
// V.2606181505
// ============================================================

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Pool de conexões
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Teste de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL (NEON)');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexões:', err);
});

// Função auxiliar para queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('🔍 Query executada:', { text: text.substring(0, 100), duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('❌ Erro na query:', err);
    throw err;
  }
};

// Função para transações
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Wrapper para liberar conexão automaticamente em caso de erro
  const timeout = setTimeout(() => {
    console.error('⚠️ Cliente não foi liberado após 5 segundos');
  }, 5000);

  client.query = (...args) => {
    return query.apply(client, args);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

export default pool;

// V.2606181505
