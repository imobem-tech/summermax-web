-- ============================================================
-- INSERIR DADOS DE TESTE - GRUPOS E EMPRESAS
-- V.2610292335
-- ============================================================

-- INSERIR GRUPOS (se não existirem)
INSERT INTO public."Grupos" (nome, descricao, ativo)
VALUES
    ('SUMMERMAX', 'Grupo SUMMERMAX - Marina e Embarcações', true),
    ('ALLMAX', 'Grupo ALLMAX', true),
    ('IMOBEM', 'Grupo IMOBEM', true)
ON CONFLICT DO NOTHING;

-- INSERIR EMPRESAS (se não existirem)
INSERT INTO public."Empresas" (id_grupo, nome, cnpj, ativo)
SELECT
    g.id_grupo,
    e.nome,
    e.cnpj,
    true
FROM (
    VALUES
        ('ALLMAX', '00.000.000/0001-01'),
        ('SUMMER MARINA', '00.000.000/0001-02'),
        ('IMOBEM TECH', '00.000.000/0001-03')
) AS e(nome, cnpj)
CROSS JOIN public."Grupos" g
WHERE g.nome = 'SUMMERMAX'
LIMIT 3
ON CONFLICT DO NOTHING;

-- VERIFICAR O QUE FOI INSERIDO
SELECT 'GRUPOS:' as tipo, id_grupo, nome FROM public."Grupos"
UNION ALL
SELECT 'EMPRESAS:' as tipo, id_empresa::int, nome FROM public."Empresas";
