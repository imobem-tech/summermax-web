# 🚀 SISTEMA WEB SUMMERMAX

Sistema de Gestão de Cotas e Marina - Multi-tenant

**Versão:** V.2611122300

[![Deploy no Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=)

---

## 📋 **O que foi criado:**

### **Estrutura do Projeto:**
```
summermax-web/
├── config/
│   └── jwt.js                          # Configuração JWT
├── db/
│   └── connection.js                   # Conexão PostgreSQL (NEON)
├── middlewares/
│   └── auth.js                         # Autenticação e autorização
├── routes/
│   ├── auth.js                         # Rotas de login/logout
│   ├── clientes.js                     # CRUD de clientes
│   ├── embarcacoes.js                  # CRUD de embarcações
│   ├── orcamentos.js                   # Sistema de orçamentos
│   ├── contas.js                       # Contas a receber
│   ├── usuarios.js                     # Gestão de usuários
│   └── banco/
│       ├── index.js                    # Rotas do módulo bancário
│       ├── extrato-api.js             # API de extrato bancário
│       ├── gestao-financeira-api.js   # 💰 NOVO: API de gestão financeira
│       ├── categorias-crud.js         # Categorias bancárias
│       └── saldo-inicial-api.js       # Saldos iniciais
├── public/
│   ├── css/
│   │   ├── login.css                  # Estilos do login
│   │   └── dashboard.css              # Estilos do dashboard
│   └── js/
│       └── login.js                   # JavaScript do login
├── views/
│   ├── login.html                     # Tela de login (com visualizar senha)
│   ├── dashboard.html                 # Dashboard principal
│   ├── clientes.html                  # Gestão de clientes
│   ├── usuarios.html                  # Gestão de usuários
│   ├── orcamentos.html                # Sistema de orçamentos
│   ├── extrato-bancario.html          # Extrato bancário (com menu)
│   └── gestao-financeira.html         # 💰 NOVO: Análise financeira
├── server.js                          # Servidor Express
├── .env                               # Variáveis de ambiente
└── package.json                       # Dependências
```

---

## 🔧 **Tecnologias:**

- **Backend:** Node.js + Express
- **Banco de Dados:** PostgreSQL (NEON Cloud)
- **Autenticação:** JWT + bcrypt
- **Frontend:** HTML + CSS + JavaScript (vanilla)

---

## 🚀 **Como usar:**

### **💻 Desenvolvimento Local:**

#### **1. Instalar dependências:**
```bash
cd web-app
npm install
```

#### **2. Configurar .env:**
```bash
# Copiar arquivo de exemplo
copy .env.example .env

# Editar .env com suas credenciais
```

#### **3. Verificar projeto:**
```bash
npm run verify
```

#### **4. Iniciar servidor:**
```bash
npm run dev      # Modo desenvolvimento (com auto-reload)
npm start        # Modo produção
```

#### **5. Acessar aplicação:**
```
http://localhost:3000
```

---

### **☁️ Deploy em Produção (Railway):**

#### **Opção 1: Quick Deploy**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### **Opção 2: Deploy via GitHub**
Veja o guia completo: **[RAILWAY-QUICKSTART.md](RAILWAY-QUICKSTART.md)**

📋 **Checklist de Deploy:** [DEPLOY-CHECKLIST.md](DEPLOY-CHECKLIST.md)

---

## 🔐 **Credenciais de Teste:**

**Email:** diniz.novello@yahoo.com.br  
**Senha:** Agosto197104@

---

## 📡 **API Endpoints:**

### **💰 Gestão Financeira (NOVO):**

#### `GET /api/banco/gestao/resumo`
Resumo de entradas, saídas e saldo
```
Query params:
- dataInicio: YYYY-MM-DD (obrigatório)
- dataFim: YYYY-MM-DD (obrigatório)
- empresa: SUMMER | ALLMAX | TODOS (opcional)
```

**Resposta:**
```json
{
  "total_movimentacoes": 150,
  "total_entradas": 115760.00,
  "total_saidas": -66217.00,
  "saldo": 49543.00
}
```

#### `GET /api/banco/gestao/categorias`
Categorias agrupadas (receitas + despesas)
```
Query params: mesmos do /resumo
```

**Resposta:**
```json
{
  "receitas": [
    {
      "categoria": "Mensalidades",
      "categoria_id": 1,
      "quantidade": 87,
      "total": 63923.00,
      "percentual": 55.4
    }
  ],
  "despesas": [
    {
      "categoria": "Folha de Pagamento",
      "categoria_id": 21,
      "quantidade": 5,
      "total": -24566.00,
      "percentual": 37.1
    }
  ],
  "totais": {
    "receitas": 115760.00,
    "despesas": -66217.00
  }
}
```

#### `GET /api/banco/gestao/lancamentos`
Lançamentos detalhados de uma categoria
```
Query params:
- dataInicio, dataFim, empresa (mesmos anteriores)
- categoria: nome da categoria (obrigatório)
```

**Resposta:**
```json
{
  "categoria": "Mensalidades",
  "lancamentos": [
    {
      "data": "2026-10-15",
      "valor": 735.00,
      "descricao_original": "NAUTICA_Emb_PB001",
      "nome_origem": "João Silva",
      "observacoes": null
    }
  ]
}
```

---

### **Autenticação:**

#### `POST /api/auth/login`
Login do usuário
```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "sucesso": true,
  "usuario": {
    "id_usuario": 1,
    "nome": "Admin SUMMERMAX",
    "email": "diniz.novello@yahoo.com.br",
    "nivel_acesso": "MASTER_GRUPO",
    "primeiro_acesso": true,
    "grupo": "SUMMERMAX",
    "empresa": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST /api/auth/logout`
Logout do usuário (requer autenticação)

#### `GET /api/auth/me`
Dados do usuário logado (requer autenticação)

---

## 🛡️ **Níveis de Acesso:**

1. **SUPER_ADMIN** - Acesso total ao sistema
2. **MASTER_GRUPO** - Acesso a todas empresas do grupo
3. **ADMIN_EMPRESA** - Admin da sua empresa
4. **OPERADOR** - Uso diário
5. **FINANCEIRO** - Só financeiro
6. **CONSULTA** - Só visualização

---

## 📊 **Funcionalidades:**

### ✅ **Implementado:**

- [x] Sistema de autenticação (JWT + bcrypt)
- [x] Dashboard principal com menu lateral
- [x] CRUD de Clientes
- [x] CRUD de Embarcações  
- [x] CRUD de Usuários
- [x] Sistema de Orçamentos (com chat)
- [x] Extrato Bancário completo
- [x] **💰 Gestão Financeira (NOVO)**
  - Análise de receitas e despesas por período
  - Seletor de mês completo
  - Categorias dinâmicas do banco de dados
  - Drill-down com modal de lançamentos
  - Filtros: Data início/fim, Empresa
  - Cards de resumo: Entradas, Saídas, Saldo
- [x] Layout unificado com menu lateral
- [x] Botão visualizar senha no login

### 🔄 **Em Desenvolvimento:**

- [ ] Tela de Contas a Receber
- [ ] Integração com Asaas
- [ ] Envio de WhatsApp
- [ ] Relatórios e Dashboards
- [ ] Exportação Excel/PDF

---

## 📝 **Notas:**

- Todos os arquivos têm versão no formato **V.yymmddhhnn**
- Arquivos de orçamento usam prefixo **orc_**
- Timezone: **America/Sao_Paulo (GMT-3)**
- Token JWT expira em **24 horas**

---

---

## 🚀 **Deploy:**

| Ambiente | Status | URL |
|----------|--------|-----|
| **Local** | ✅ Dev | http://localhost:3000 |
| **Railway** | 🚀 Pronto | Configure seguindo [RAILWAY-QUICKSTART.md](RAILWAY-QUICKSTART.md) |

---

## 📚 **Documentação:**

- [🚀 RAILWAY-QUICKSTART.md](RAILWAY-QUICKSTART.md) - Deploy em 10 minutos
- [✅ DEPLOY-CHECKLIST.md](DEPLOY-CHECKLIST.md) - Checklist completo
- [📖 DEPLOY.md](DEPLOY.md) - Guia detalhado

---

## 🛠️ **Scripts Disponíveis:**

```bash
npm run dev        # Desenvolvimento (auto-reload)
npm start          # Produção
npm run verify     # Verificar projeto antes do deploy
npm run predeploy  # Auto-verificação antes de deploy
```

---

---

## 🎯 **Páginas Disponíveis:**

| Página | Rota | Descrição |
|--------|------|-----------|
| Login | `/login.html` | Tela de autenticação com visualizar senha |
| Dashboard | `/dashboard.html` | Página principal com resumo |
| Clientes | `/clientes.html` | Gestão de clientes |
| Embarcações | `/embarcacoes.html` | Gestão de embarcações |
| Usuários | `/usuarios.html` | Gestão de usuários |
| Orçamentos | `/orcamentos.html` | Sistema de orçamentos |
| Orçamentos Chat | `/orcamentos` | Interface estilo chat |
| Extrato Bancário | `/extrato-bancario.html` | 📊 Visualização e análise de extratos |
| **Gestão Financeira** | `/gestao-financeira.html` | 💰 **NOVO:** Análise completa de receitas/despesas |

---

**V.2611122300**
