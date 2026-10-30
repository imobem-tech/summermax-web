-- ============================================================
-- MIGRAÇÃO: Adicionar campos de status e aprovação
-- V.2606221750
-- ============================================================

-- Adicionar coluna status (se não existir)
ALTER TABLE orcamento_servico
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'RASCUNHO';

-- Adicionar colunas de aprovação
ALTER TABLE orcamento_servico
ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMP;

ALTER TABLE orcamento_servico
ADD COLUMN IF NOT EXISTS aprovado_por INTEGER REFERENCES mae_usuario(id_usuario);

-- Atualizar registros existentes
UPDATE orcamento_servico
SET status = 'RASCUNHO'
WHERE status IS NULL;

-- Adicionar índice
CREATE INDEX IF NOT EXISTS idx_orcamento_status ON orcamento_servico(status);

-- Comentários
COMMENT ON COLUMN orcamento_servico.status IS 'Status do orçamento: RASCUNHO, EM_APROVACAO, APROVADO, EM_EXECUCAO, FINALIZADO';
COMMENT ON COLUMN orcamento_servico.aprovado_em IS 'Data/hora da aprovação (trava alterações)';
COMMENT ON COLUMN orcamento_servico.aprovado_por IS 'Usuário que aprovou';

-- V.2606221750
