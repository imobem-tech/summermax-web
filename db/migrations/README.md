# Migrações do Banco de Dados

## Como Executar

### Via psql (PostgreSQL CLI):
```bash
psql -U seu_usuario -d seu_banco -f 003_add_status_aprovacao.sql
```

### Via Neon Console:
1. Acesse https://console.neon.tech
2. Selecione seu projeto
3. Vá em "SQL Editor"
4. Cole o conteúdo do arquivo `.sql`
5. Execute

### Via pgAdmin:
1. Conecte ao banco
2. Query Tool
3. Abra o arquivo ou cole o SQL
4. Execute (F5)

## Ordem de Execução

Execute as migrações na ordem numérica:
- 001_inicial.sql (se existir)
- 002_rateios.sql (se existir)
- **003_add_status_aprovacao.sql** ← Nova migração

## Verificar se foi aplicada

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'orcamento_servico'
  AND column_name IN ('status', 'aprovado_em', 'aprovado_por');
```

Deve retornar 3 linhas.
