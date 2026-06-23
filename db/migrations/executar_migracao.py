#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Executar Migração SQL no Neon PostgreSQL
V.2606221830
"""

import psycopg2
import sys

# Credenciais
CONNECTION_STRING = "postgresql://neondb_owner:npg_GBncO6VelY8C@ep-steep-silence-acy3c620.sa-east-1.aws.neon.tech:5432/neondb?sslmode=require"

# SQL da migração
MIGRATION_SQL = """
-- PASSO 1: Adicionar colunas de status
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

-- PASSO 2: Dropar e recriar tabela orcamento_rateio
DROP TABLE IF EXISTS orcamento_rateio CASCADE;

CREATE TABLE orcamento_rateio (
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
"""

# SQL de verificação
VERIFY_SQL = """
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'orcamento_servico'
  AND column_name IN ('status', 'aprovado_em', 'aprovado_por')
ORDER BY column_name;
"""

VERIFY_RATEIO_SQL = """
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orcamento_rateio'
ORDER BY ordinal_position;
"""

def main():
    print("=" * 60)
    print("EXECUTANDO MIGRACAO DO BANCO DE DADOS")
    print("=" * 60)
    print()

    try:
        # Conectar
        print("Conectando ao Neon PostgreSQL...")
        conn = psycopg2.connect(CONNECTION_STRING)
        conn.autocommit = False
        cursor = conn.cursor()
        print("OK - Conectado com sucesso!")
        print()

        # Executar migração
        print("Executando migracao...")
        cursor.execute(MIGRATION_SQL)
        conn.commit()
        print("OK - Migracao executada com sucesso!")
        print()

        # Verificar colunas adicionadas
        print("Verificando colunas em orcamento_servico...")
        cursor.execute(VERIFY_SQL)
        rows = cursor.fetchall()
        if rows:
            print(f"OK - {len(rows)} colunas encontradas:")
            for row in rows:
                print(f"   - {row[0]} ({row[1]})")
        else:
            print("AVISO - Nenhuma coluna encontrada!")
        print()

        # Verificar tabela rateio
        print("Verificando tabela orcamento_rateio...")
        cursor.execute(VERIFY_RATEIO_SQL)
        rows = cursor.fetchall()
        if rows:
            print(f"OK - Tabela criada com {len(rows)} colunas:")
            for row in rows[:5]:  # Mostrar primeiras 5
                print(f"   - {row[0]} ({row[1]})")
            if len(rows) > 5:
                print(f"   ... e mais {len(rows) - 5} colunas")
        else:
            print("ERRO - Tabela nao foi criada!")
        print()

        cursor.close()
        conn.close()

        print("=" * 60)
        print("MIGRACAO CONCLUIDA COM SUCESSO!")
        print("=" * 60)
        return 0

    except Exception as e:
        print()
        print("=" * 60)
        print("ERRO AO EXECUTAR MIGRACAO:")
        print("=" * 60)
        print(str(e))
        print()
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return 1

if __name__ == "__main__":
    sys.exit(main())
