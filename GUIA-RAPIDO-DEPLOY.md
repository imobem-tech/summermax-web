# ⚡ **GUIA RÁPIDO - DEPLOY EM 5 MINUTOS**

**Versão:** V.2606181533

---

## 🎯 **Método Mais Simples (Recomendado):**

### **1️⃣ Abrir PowerShell na pasta web-app**

```powershell
cd D:\OneDrive\GESTAO_DZ\Claude_DZ\web-app
```

---

### **2️⃣ Executar script automático**

```powershell
.\deploy-railway.ps1
```

---

### **3️⃣ Seguir menu interativo:**

```
1. Inicializar projeto Railway (primeira vez)
   ↓
   - Vai abrir navegador para login
   - Escolha o workspace
   - Crie novo projeto "summermax-web"
   
2. Fazer deploy (atualizar código)
   ↓
   - Aguarde 2-3 minutos
   - Vai mostrar a URL do site
   
3. Configurar variáveis de ambiente
   ↓
   - Abre dashboard automaticamente
   - Cole as variáveis (já prontas no script)
```

---

## 🌐 **Resultado Final:**

```
✅ Site rodando em:
https://summermax-web-production.up.railway.app

✅ Tela de login funcionando
✅ API de autenticação ativa
✅ Conectado ao banco NEON
```

---

## 📱 **Estrutura Completa no Railway:**

```
┌─────────────────────────────────────┐
│ 🤖 calendario-allmax                │
│ Bot WhatsApp (já rodando)           │
│ https://calendario-boat.railway.app │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🌐 summermax-web (NOVO)             │
│ Site/Dashboard/Orçamentos           │
│ https://summermax-web.railway.app   │
└─────────────────────────────────────┘

        ⬇️ Ambos conectam ⬇️

┌─────────────────────────────────────┐
│ 🗄️ NEON PostgreSQL                  │
│ ep-steep-silence...neon.tech        │
└─────────────────────────────────────┘
```

---

## ⏱️ **Tempo Total:** ~5 minutos

1. Executar script: 30 segundos
2. Login Railway: 1 minuto
3. Deploy: 2-3 minutos
4. Configurar variáveis: 1 minuto

---

## 🆘 **Problemas?**

### **"railway: command not found"**
```powershell
npm install -g @railway/cli
```

### **"Erro ao conectar banco"**
- Verifique as variáveis de ambiente no Railway Dashboard
- Use as mesmas credenciais do arquivo `.env`

### **Site não abre**
- Aguarde 3-5 minutos após primeiro deploy
- Veja os logs: `railway logs`

---

## 📞 **Precisa de Ajuda?**

Me chame que eu ajudo! 😊

**V.2606181533**
