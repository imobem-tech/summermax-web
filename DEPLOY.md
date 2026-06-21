# 🚀 **GUIA DE DEPLOY NO RAILWAY**

**Versão:** V.2606181529

---

## 📋 **Passo a Passo:**

### **1. Preparar Repositório Git (se ainda não tiver)**

```bash
cd D:\OneDrive\GESTAO_DZ\Claude_DZ\web-app

# Inicializar git
git init

# Adicionar arquivos
git add .

# Primeiro commit
git commit -m "Initial commit - Sistema Web SUMMERMAX"
```

---

### **2. Acessar Railway**

1. Acesse: https://railway.app
2. Faça login com sua conta
3. Clique em **"New Project"**

---

### **3. Escolher Método de Deploy**

#### **Opção A: Deploy via GitHub (RECOMENDADO)**

1. No Railway, clique em **"Deploy from GitHub repo"**
2. Autorize o Railway a acessar seu GitHub
3. Crie um novo repositório no GitHub chamado `summermax-web`
4. Faça push do código:
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/summermax-web.git
   git branch -M main
   git push -u origin main
   ```
5. No Railway, selecione o repositório `summermax-web`
6. Railway vai detectar automaticamente que é Node.js

#### **Opção B: Deploy Manual (Mais Simples)**

1. No Railway, clique em **"Deploy from local directory"**
2. Instale Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```
3. Faça login:
   ```bash
   railway login
   ```
4. Inicialize o projeto:
   ```bash
   railway init
   ```
5. Faça deploy:
   ```bash
   railway up
   ```

---

### **4. Configurar Variáveis de Ambiente no Railway**

No painel do Railway, vá em **"Variables"** e adicione:

```
PORT=3000
NODE_ENV=production

DB_HOST=ep-steep-silence-acy3c620.sa-east-1.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=npg_GBncO6VelY8C
DB_SSL=true

JWT_SECRET=summermax_secret_2026_allmax_marina_ctg_graciosa
JWT_EXPIRES_IN=24h

SESSION_SECRET=summermax_session_secret_2026

TZ=America/Sao_Paulo
```

⚠️ **IMPORTANTE:** Altere `JWT_SECRET` e `SESSION_SECRET` para valores mais seguros em produção!

---

### **5. Deploy Automático**

Após configurar as variáveis:
1. Railway vai fazer deploy automaticamente
2. Aguarde 2-3 minutos
3. Você verá a URL do seu site (ex: `summermax-web-production.up.railway.app`)

---

### **6. Testar a Aplicação**

1. Acesse a URL fornecida pelo Railway
2. Você verá a tela de login
3. Teste com:
   - **Email:** diniz.novello@yahoo.com.br
   - **Senha:** Agosto197104@

---

## 🔧 **Comandos Úteis (Railway CLI):**

```bash
# Ver logs em tempo real
railway logs

# Abrir dashboard do projeto
railway open

# Fazer novo deploy
railway up

# Ver variáveis de ambiente
railway variables

# Conectar ao banco (se tiver)
railway connect
```

---

## 📊 **Estrutura Final no Railway:**

```
┌─────────────────────────────────────────┐
│ Projeto 1: calendario-allmax            │
│ URL: calendario-boat.railway.app        │
│ Função: Bot WhatsApp + APIs             │
│ Status: ✅ Running                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Projeto 2: summermax-web (NOVO)        │
│ URL: summermax-web.railway.app          │
│ Função: Site (Login/Dashboard/Orç.)    │
│ Status: ✅ Running                      │
└─────────────────────────────────────────┘

        ⬇️  Ambos acessam  ⬇️

┌─────────────────────────────────────────┐
│ NEON PostgreSQL Database                │
│ Host: ep-steep-silence...neon.tech      │
│ Tabelas: mae_*, orcamento_*, etc.       │
└─────────────────────────────────────────┘
```

---

## ⚠️ **Problemas Comuns:**

### **Erro: "Port already in use"**
- Railway define a porta automaticamente via `process.env.PORT`
- Nosso código já está preparado: `const PORT = process.env.PORT || 3000`

### **Erro: "Cannot connect to database"**
- Verifique se as variáveis `DB_*` estão corretas no Railway
- Teste a conexão com o banco localmente primeiro

### **Erro: "Module not found"**
- Certifique-se que `package.json` tem todas as dependências
- Railway roda `npm install` automaticamente

---

## 🎯 **Próximos Passos Após Deploy:**

1. ✅ Site funcionando no Railway
2. Configurar domínio personalizado (opcional)
3. Criar tela de Dashboard
4. Implementar CRUD de Orçamentos
5. Integrar com WhatsApp Bot (já rodando)

---

## 📝 **Notas:**

- Railway tem **plano gratuito** com 500h/mês (suficiente para 1 serviço 24/7)
- Se precisar de mais recursos, upgrade para plano pago ($5/mês)
- Logs ficam disponíveis por 7 dias no plano gratuito

---

**Precisa de ajuda? Me avise!**

**V.2606181529**
