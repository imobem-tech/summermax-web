-- ============================================================
-- MIGRAÇÃO COMPLETA - SISTEMA DE RATEIO
-- Execute TODO este arquivo de uma vez no Neon Console
-- V.2606221800
-- ============================================================

-- PASSO 1: Adicionar colunas de status na tabela orcamento_servico
-- ============================================================

ALTER TABLE orcamento_servico
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'RASCUNHO';

ALTER TABLE orcamento_servico
ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMP;

ALTER TABLE orcamento_servico
ADD COLUMN IF NOT EXISTS aprovado_por INTEGER;

UPDATE orcamento_servico
SET status = 'RASCUNHO'
WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_orcamento_status ON orcamento_servico(status);

COMMENT ON COLUMN orcamento_servico.status IS 'Status: RASCUNHO, EM_APROVACAO, APROVADO, EM_EXECUCAO, FINALIZADO';
COMMENT ON COLUMN orcamento_servico.aprovado_em IS 'Data/hora da aprovação (trava alterações)';
COMMENT ON COLUMN orcamento_servico.aprovado_por IS 'Usuário que aprovou';


-- PASSO 2: Criar tabela orcamento_rateio
-- ============================================================

CREATE TABLE IF NOT EXISTS orcamento_rateio (
    id_rateio SERIAL PRIMARY KEY,
    id_orcamento INTEGER NOT NULL REFERENCES orcamento_servico(id_orcamento) ON DELETE CASCADE,
    id_cliente INTEGER NOT NULL,
    id_autorizado INTEGER NOT NULL,
    qtd_cotas INTEGER DEFAULT 0,
    total_cotas INTEGER DEFAULT 0,
    percentual NUMERIC(5,2) DEFAULT 0,
    valor_servico NUMERIC(10,2) DEFAULT 0,
    valor_taxa NUMERIC(10,2) DEFAULT 0,
    valor_cotista NUMERIC(10,2) DEFAULT 0,
    participando BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rateio_orcamento ON orcamento_rateio(id_orcamento);
CREATE INDEX IF NOT EXISTS idx_rateio_cliente ON orcamento_rateio(id_cliente);

COMMENT ON TABLE orcamento_rateio IS 'Rateio de valores do orçamento entre cotistas';
COMMENT ON COLUMN orcamento_rateio.participando IS 'Se o cotista está participando deste rateio';
COMMENT ON COLUMN orcamento_rateio.valor_cotista IS 'Valor total que o cotista deve pagar (serviço + taxa)';


-- PASSO 3: Verificar se deu certo
-- ============================================================

-- Verificar colunas adicionadas
SELECT 'Verificando orcamento_servico...' as passo;
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'orcamento_servico'
  AND column_name IN ('status', 'aprovado_em', 'aprovado_por')
ORDER BY column_name;

-- Verificar tabela criada
SELECT 'Verificando orcamento_rateio...' as passo;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orcamento_rateio'
ORDER BY ordinal_position;


-- ============================================================
-- RESULTADO ESPERADO:
-- ============================================================
-- Deve mostrar:
--   - 3 colunas em orcamento_servico (status, aprovado_em, aprovado_por)
--   - 13 colunas em orcamento_rateio
-- ============================================================
-- V.2606221800
-- ============================================================
