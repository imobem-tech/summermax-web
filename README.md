# 🚤 SUMMERMAX WEB

Sistema de Orçamentos para Embarcações

## 📋 **Descrição**

Sistema web para gerenciamento de orçamentos de embarcações com:
- Listagem de embarcações
- Busca de cotistas por embarcação
- Criação de orçamentos
- Rateio automático entre cotistas

---

## 🛠️ **Stack Tecnológica**

- **Backend:** Node.js + Express
- **Database:** PostgreSQL (NEON)
- **Frontend:** HTML + JavaScript (Vanilla)
- **Deploy:** Railway

---

## 🚀 **Deploy**

### **Produção:**
- URL: https://summermax-web-production.up.railway.app
- Branch: `main`

---

## 📁 **Estrutura do Projeto**

```
summermax-web/
├── server.js              # Servidor Express
├── package.json           # Dependências
├── db/
│   └── connection.js      # Conexão PostgreSQL
├── routes/
│   └── orc_orcamentos.js  # Rotas de orçamentos
└── public/
    └── orcamentos-novo.html  # Interface web
```

---

## 🔑 **Variáveis de Ambiente**

```env
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=production
TZ=America/Sao_Paulo
```

---

## 🐛 **Correções Aplicadas (V.2606211555)**

### **1. Relacionamento de Cotistas Corrigido:**
```sql
-- ❌ ERRADO (antes):
WHERE embarcacao."Código" = $1

-- ✅ CORRETO (agora):
WHERE a."Cod_Embarcacao" = $1  -- Usa Num_PB
```

**Relacionamento:**
```
P_BOAT_1_Embarcacao.Num_PB = P_BOAT_4_Autorizados.Cod_Embarcacao
P_BOAT_4_Autorizados.Cod_Pessoa = Cliente.Código
```

### **2. Erro "forn.Nome does not exist" Corrigido:**
```sql
-- Removido alias "forn" inexistente
-- Query de orçamentos simplificada
```

### **3. Barra de Versionamento Adicionada:**
- Mostra nome do arquivo e versão (yymmddhhnn)
- Status da API em tempo real (verde/vermelho)
- Debug completo no console

---

## 📊 **API Endpoints**

### **Embarcações:**
```
GET /api/orcamentos/embarcacoes
GET /api/orcamentos/embarcacao/:num_pb
```

### **Cotistas:**
```
GET /api/orcamentos/embarcacao/:num_pb/cotistas
```

### **Orçamentos:**
```
GET /api/orcamentos
POST /api/orcamentos
```

---

## 👨‍💻 **Desenvolvido por:**

ALLMAX - 2026
