# ✅ **CHECKLIST - DEPLOY NO RAILWAY**

**Versão:** V.2606181535

---

## 📋 **Antes do Deploy:**

- [ ] Servidor local rodando corretamente (`npm run dev`)
- [ ] Teste de login funcionando
- [ ] Arquivo `.env` configurado
- [ ] Dependências instaladas (`npm install`)
- [ ] Porta configurada via `process.env.PORT`

---

## 🚀 **Durante o Deploy:**

- [ ] Railway CLI instalado
- [ ] Login no Railway feito
- [ ] Projeto criado/inicializado
- [ ] Deploy executado (`railway up`)
- [ ] Aguardar build completar (2-3 min)

---

## ⚙️ **Configuração no Railway:**

### **Variáveis de Ambiente (copiar e colar):**

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

- [ ] Todas as variáveis adicionadas
- [ ] Valores corretos (sem espaços extras)
- [ ] Deploy reiniciado após adicionar variáveis

---

## 🧪 **Testes Pós-Deploy:**

- [ ] Site abre (URL fornecida pelo Railway)
- [ ] Tela de login carrega
- [ ] CSS está aplicado
- [ ] Console do navegador sem erros (F12)
- [ ] Teste de login funciona
  - **Email:** diniz.novello@yahoo.com.br
  - **Senha:** Agosto197104@
- [ ] Redireciona após login (mesmo que dashboard não exista ainda)

---

## 📊 **Monitoramento:**

- [ ] Logs sem erros críticos (`railway logs`)
- [ ] Conexão com banco OK
- [ ] Status "Running" no dashboard
- [ ] CPU/RAM dentro do normal

---

## 🎯 **URLs para Salvar:**

```
Railway Dashboard:
https://railway.app/dashboard

Seu Site (após deploy):
https://[seu-projeto].up.railway.app

Banco NEON:
https://console.neon.tech
```

---

## 🔄 **Próximos Deploys (atualizar código):**

```powershell
# Método 1: Script automático
.\deploy-railway.ps1
# Escolha opção 2

# Método 2: Comando direto
railway up
```

---

## ⚠️ **Importante:**

- ✅ Bot WhatsApp continua rodando (serviço separado)
- ✅ Ambos acessam o mesmo banco NEON
- ✅ Não precisa parar nada para fazer deploy
- ✅ Cada serviço tem sua própria URL

---

## 🎉 **Conclusão:**

Quando tudo estiver ✅:
- Site rodando no Railway
- Bot rodando no Railway (já estava)
- Banco NEON funcionando
- Pode acessar de qualquer lugar!

---

**V.2606181535**
