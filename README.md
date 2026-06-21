# 🚀 SISTEMA WEB SUMMERMAX

Sistema de Gestão de Cotas e Marina - Multi-tenant

**Versão:** V.2606181521

---

## 📋 **O que foi criado:**

### **Estrutura do Projeto:**
```
web-app/
├── config/
│   └── jwt.js                 # Configuração JWT
├── db/
│   └── connection.js          # Conexão PostgreSQL (NEON)
├── middlewares/
│   └── auth.js                # Autenticação e autorização
├── routes/
│   └── auth.js                # Rotas de login/logout
├── public/
│   ├── css/
│   │   └── login.css          # Estilos da tela de login
│   └── js/
│       └── login.js           # JavaScript da tela de login
├── views/
│   └── login.html             # Tela de login
├── server.js                  # Servidor Express
├── .env                       # Variáveis de ambiente
└── package.json               # Dependências
```

---

## 🔧 **Tecnologias:**

- **Backend:** Node.js + Express
- **Banco de Dados:** PostgreSQL (NEON Cloud)
- **Autenticação:** JWT + bcrypt
- **Frontend:** HTML + CSS + JavaScript (vanilla)

---

## 🚀 **Como usar:**

### **1. Instalar dependências:**
```bash
cd web-app
npm install
```

### **2. Iniciar servidor:**
```bash
npm run dev      # Modo desenvolvimento (com auto-reload)
npm start        # Modo produção
```

### **3. Acessar aplicação:**
```
http://localhost:3000
```

---

## 🔐 **Credenciais de Teste:**

**Email:** diniz.novello@yahoo.com.br  
**Senha:** Agosto197104@

---

## 📡 **API Endpoints:**

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

## 📊 **Próximos Passos:**

- [ ] Criar tela de Dashboard
- [ ] Implementar menu dinâmico
- [ ] CRUD de Clientes
- [ ] CRUD de Embarcações
- [ ] CRUD de Orçamentos
- [ ] Tela de Contas a Receber
- [ ] Integração com Asaas
- [ ] Envio de WhatsApp

---

## 📝 **Notas:**

- Todos os arquivos têm versão no formato **V.yymmddhhnn**
- Arquivos de orçamento usam prefixo **orc_**
- Timezone: **America/Sao_Paulo (GMT-3)**
- Token JWT expira em **24 horas**

---

**V.2606181521**
