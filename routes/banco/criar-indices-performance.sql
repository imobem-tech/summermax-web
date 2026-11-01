-- ============================================================
-- ÍNDICES PARA PERFORMANCE DO EXTRATO BANCÁRIO
-- V.2611011111
-- ============================================================
--
-- ⚡ OBJETIVO: Acelerar queries do extrato em 10-20x
--
-- ANTES: Query lenta (~2-3 segundos)
-- DEPOIS: Query rápida (~200-300ms)
--
-- ============================================================

-- 1️⃣ ÍNDICE COMPOSTO: empresa + data (MAIS IMPORTANTE!)
-- Usado em: WHERE empresa = X ORDER BY data DESC
CREATE INDEX IF NOT EXISTS idx_bank_extratos_empresa_data
ON bank_extratos (empresa, data DESC);

-- 2️⃣ ÍNDICE: empresa + mes_ref
-- Usado em: WHERE empresa = X AND mes_ref = Y
CREATE INDEX IF NOT EXISTS idx_bank_extratos_empresa_mes
ON bank_extratos (empresa, mes_ref);

-- 3️⃣ ÍNDICE: empresa + status
-- Usado em: WHERE empresa = X AND status = Y
CREATE INDEX IF NOT EXISTS idx_bank_extratos_empresa_status
ON bank_extratos (empresa, status);

-- 4️⃣ ÍNDICE: empresa + classificacao
-- Usado em: WHERE empresa = X AND classificacao = Y
CREATE INDEX IF NOT EXISTS idx_bank_extratos_empresa_classificacao
ON bank_extratos (empresa, classificacao);

-- 5️⃣ ÍNDICE: importado_em (para ordenação secundária)
-- Usado em: ORDER BY data DESC, importado_em DESC
CREATE INDEX IF NOT EXISTS idx_bank_extratos_importado_em
ON bank_extratos (importado_em DESC);

-- 6️⃣ ÍNDICE: bank_categorias.id (já deve existir por ser PK, mas garantir)
-- Usado em: LEFT JOIN bank_categorias
CREATE INDEX IF NOT EXISTS idx_bank_categorias_id
ON bank_categorias (id);

-- ============================================================
-- ESTATÍSTICAS
-- ============================================================

-- Atualizar estatísticas do PostgreSQL para otimização de queries
ANALYZE bank_extratos;
ANALYZE bank_categorias;

-- ============================================================
-- VERIFICAR ÍNDICES CRIADOS
-- ============================================================

-- Listar todos os índices da tabela bank_extratos
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'bank_extratos'
ORDER BY indexname;

-- ============================================================
-- RESULTADO ESPERADO:
--
-- ✅ Query /api/banco/extrato/listar: 2-3s → 200-300ms
-- ✅ Filtros por empresa: instantâneo
-- ✅ Filtros por mês: muito rápido
-- ✅ Ordenação: sem overhead
-- ✅ JOINs: otimizados
--
-- ============================================================
-- V.2611011111
