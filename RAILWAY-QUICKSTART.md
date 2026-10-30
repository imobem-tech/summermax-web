# ⚡ **RAILWAY - DEPLOY EM 10 MINUTOS**

**Versão:** V.2610292223

---

## 🚀 **OPÇÃO 1: Deploy Via GitHub (RECOMENDADO)**

### **Passo 1: Criar Repositório GitHub**

```powershell
cd D:\OneDrive\GESTAO_DZ\Claude_DZ\web-app

# Inicializar Git (se ainda não tiver)
git init

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "Deploy inicial - Sistema Web SUMMERMAX

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

Crie um repositório no GitHub:
- Nome: `summermax-web`
- Privado ou Público (sua escolha)
- **NÃO** adicione README, .gitignore ou license

```powershell
# Adicionar remote e fazer push
git remote add origin https://github.com/SEU-USUARIO/summermax-web.git
git branch -M main
git push -u origin main
```

---

### **Passo 2: Conectar Railway ao GitHub**

1. Acesse: https://railway.app
2. Faça login (GitHub, Google ou Email)
3. Clique em **"New Project"**
4. Escolha **"Deploy from GitHub repo"**
5. Autorize o Railway a acessar seus repositórios
6. Selecione `summermax-web`

---

### **Passo 3: Configurar Variáveis de Ambiente**

No Railway, vá em **"Variables"** e adicione:

```env
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

⚠️ **IMPORTANTE:** Em produção, gere novos valores para `JWT_SECRET` e `SESSION_SECRET`!

**Como gerar secrets seguros:**
```powershell
# PowerShell - gerar string aleatória
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

### **Passo 4: Deploy Automático**

✅ Railway vai:
1. Detectar Node.js automaticamente
2. Rodar `npm install`
3. Executar `node server.js`
4. Gerar URL (ex: `summermax-web-production.up.railway.app`)

⏱️ Aguarde 2-3 minutos

---

### **Passo 5: Testar**

1. Acesse a URL fornecida
2. Deve aparecer a tela de login
3. Teste com:
   - **Email:** diniz.novello@yahoo.com.br
   - **Senha:** Agosto197104@

✅ **SUCESSO!** Sistema no ar!

---

## 🚀 **OPÇÃO 2: Deploy Via Railway CLI (Mais Rápido)**

### **Instalação:**

```powershell
# Instalar Railway CLI
npm install -g @railway/cli

# Verificar instalação
railway --version
```

### **Deploy:**

```powershell
cd D:\OneDrive\GESTAO_DZ\Claude_DZ\web-app

# Login
railway login

# Criar projeto
railway init

# Adicionar variáveis (copie do .env)
railway variables set PORT=3000
railway variables set NODE_ENV=production
# ... adicione todas as outras

# Fazer deploy
railway up
```

✅ Pronto! Railway vai gerar a URL automaticamente.

---

## 📊 **Comandos Úteis:**

```powershell
# Ver logs em tempo real
railway logs

# Abrir dashboard
railway open

# Listar variáveis
railway variables

# Fazer novo deploy
railway up

# Verificar status
railway status
```

---

## ⚙️ **Verificar Antes de Deploy:**

```powershell
# Rodar verificação automática
npm run verify
```

Vai checar:
- ✅ Arquivos essenciais
- ✅ Dependencies corretas
- ✅ .gitignore configurado
- ✅ Scripts de start

---

## 🌐 **Domínio Personalizado (Opcional):**

No Railway Dashboard:
1. Vá em **"Settings"**
2. Clique em **"Custom Domain"**
3. Adicione seu domínio (ex: `app.summermax.com.br`)
4. Configure DNS conforme instruções

---

## 🔄 **Deploy Contínuo:**

Após configurar GitHub:
1. Toda mudança no repositório
2. Automaticamente faz deploy
3. ✅ Zero configuração adicional

---

## 💰 **Custos:**

| Plano | Preço | Recursos |
|-------|-------|----------|
| **Trial** | $0 | 500h/mês (grátis por 1 mês) |
| **Hobby** | $5/mês | Uso ilimitado |
| **Pro** | $20/mês | Mais recursos |

💡 Para este projeto: **Hobby ($5/mês)** é mais que suficiente.

---

## ⚠️ **Problemas Comuns:**

### **Build falha:**
```
❌ Error: Cannot find module 'express'
```
**Solução:** Verifique se `package.json` tem todas as dependencies

### **Não conecta ao banco:**
```
❌ Error: Connection refused
```
**Solução:** Verifique variáveis `DB_*` no Railway

### **Timeout:**
```
❌ Error: Application failed to respond
```
**Solução:** Verifique se server.js usa `process.env.PORT`

---

## 📝 **Checklist Final:**

- [ ] Git inicializado
- [ ] Repositório GitHub criado
- [ ] Push feito para GitHub
- [ ] Railway conectado ao repo
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído com sucesso
- [ ] URL acessível
- [ ] Login funcionando
- [ ] Dashboard carregando

---

## 🎯 **Próximos Passos:**

1. ✅ Sistema no ar
2. Configurar domínio personalizado
3. Implementar SSL (Railway faz automático)
4. Monitorar logs
5. Configurar alertas

---

**Precisa de ajuda? Abra uma issue ou entre em contato!**

**V.2610292223**
