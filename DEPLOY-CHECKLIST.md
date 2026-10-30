# ✅ **CHECKLIST DE DEPLOY - RAILWAY**

**Versão:** V.2610292223

---

## 📋 **PRÉ-DEPLOY:**

### **1. Verificação Local**

```powershell
cd D:\OneDrive\GESTAO_DZ\Claude_DZ\web-app
npm run verify
```

- [ ] ✅ Todos os arquivos essenciais presentes
- [ ] ✅ Dependencies instaladas
- [ ] ✅ .env configurado
- [ ] ✅ .gitignore configurado
- [ ] ✅ Servidor roda localmente (http://localhost:3000)

---

### **2. Git e GitHub**

- [ ] ✅ Git inicializado (`git init`)
- [ ] ✅ Repositório GitHub criado (`summermax-web`)
- [ ] ✅ Remote adicionado
- [ ] ✅ Primeiro commit feito
- [ ] ✅ Push para main feito

---

## 🚀 **DEPLOY:**

### **3. Railway - Configuração Inicial**

- [ ] ✅ Conta Railway criada (https://railway.app)
- [ ] ✅ Login feito
- [ ] ✅ Novo projeto criado
- [ ] ✅ Repositório GitHub conectado

---

### **4. Railway - Variáveis de Ambiente**

Copiar para Railway → **Variables**:

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

- [ ] ✅ `PORT` configurado
- [ ] ✅ `NODE_ENV` = production
- [ ] ✅ Variáveis de banco (`DB_*`) configuradas
- [ ] ✅ `JWT_SECRET` configurado
- [ ] ✅ `SESSION_SECRET` configurado
- [ ] ✅ `TZ` = America/Sao_Paulo

---

### **5. Railway - Build e Deploy**

- [ ] ✅ Build iniciado automaticamente
- [ ] ✅ Build concluído com sucesso (sem erros)
- [ ] ✅ Deploy concluído
- [ ] ✅ URL gerada (copiar para testar)

---

## 🧪 **TESTES:**

### **6. Teste de Acesso**

URL Railway: `_______________________________`

- [ ] ✅ URL abre (não dá erro 404/502)
- [ ] ✅ Tela de login aparece
- [ ] ✅ CSS carregado (página não está sem estilo)
- [ ] ✅ Logo/imagens carregam

---

### **7. Teste de Login**

Credenciais de teste:
- Email: `diniz.novello@yahoo.com.br`
- Senha: `Agosto197104@`

- [ ] ✅ Login aceito
- [ ] ✅ Redirecionamento funciona
- [ ] ✅ Dashboard carrega
- [ ] ✅ Menu lateral aparece

---

### **8. Teste de Funcionalidades**

- [ ] ✅ Lista de clientes carrega
- [ ] ✅ Modal de detalhes abre
- [ ] ✅ Contas a receber aparecem
- [ ] ✅ Botões funcionam
- [ ] ✅ Integração Asaas funciona

---

## 📊 **PÓS-DEPLOY:**

### **9. Monitoramento**

```powershell
railway logs
```

- [ ] ✅ Logs acessíveis
- [ ] ✅ Servidor rodando sem erros
- [ ] ✅ Conexão com banco OK
- [ ] ✅ Sem erros de autenticação

---

### **10. Documentação**

- [ ] ✅ URL de produção anotada
- [ ] ✅ Credenciais salvas
- [ ] ✅ Variáveis documentadas
- [ ] ✅ Processo de deploy documentado

---

## 🎯 **OPCIONAL:**

### **11. Melhorias**

- [ ] Domínio personalizado configurado
- [ ] SSL ativado (Railway faz automático)
- [ ] Alertas configurados
- [ ] Backup do banco agendado
- [ ] Monitoramento de uptime

---

## ⚠️ **ROLLBACK (SE NECESSÁRIO):**

```powershell
# Ver deployments anteriores
railway deployments

# Voltar para deployment anterior
railway rollback <deployment-id>
```

- [ ] Saber fazer rollback se necessário

---

## 📝 **NOTAS:**

### **URLs Importantes:**

| Ambiente | URL |
|----------|-----|
| **Local** | http://localhost:3000 |
| **Railway** | _________________________ |
| **GitHub** | https://github.com/SEU-USUARIO/summermax-web |

### **Comandos Rápidos:**

```powershell
# Ver logs
railway logs

# Abrir dashboard
railway open

# Novo deploy
railway up

# Status
railway status
```

---

## ✅ **DEPLOY CONCLUÍDO COM SUCESSO!**

**Data do Deploy:** ___/___/______

**Responsável:** _________________________

**Versão:** V.2610292223

---

**🎉 PARABÉNS! Sistema está no ar!**

**V.2610292223**
