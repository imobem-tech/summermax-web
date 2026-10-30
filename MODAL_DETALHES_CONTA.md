# 📋 MODAL DE DETALHES DA CONTA A RECEBER

## 🎯 ESTRUTURA COMPLETA

### 📌 **SEÇÃO 1: IDENTIFICAÇÃO**
```
┌─────────────────────────────────────────────┐
│ 🔢 CONTA #56627                             │
│ ───────────────────────────────────────────│
│ Descrição: Hora_MOTOR 573-E1 17/10/2026... │
│ Cliente: [3327] JOSE DINIZ NOVELLO          │
│ CPF/CNPJ: 123.456.789-00                    │
│ Empresa: SUMMER MARINA                      │
│ Centro de Custo: NÁUTICA                    │
│ Grupo: [ID do grupo]                        │
│ Nº Venda: 12345                             │
└─────────────────────────────────────────────┘
```

**Campos:**
- `Codigo` - Código da conta
- `Descrição` - Descrição completa
- `Código_Cliente` + nome do cliente (JOIN)
- `CPF_CNPJ_CR` - CPF/CNPJ
- `Empresa` - ID da empresa
- `Centro_Custo` - Categoria
- `id_grupo` - ID do grupo
- `Nro_Venda` - Número da venda origem

---

### 💰 **SEÇÃO 2: VALORES E FINANCEIRO**
```
┌─────────────────────────────────────────────┐
│ 💵 VALORES                                  │
│ ───────────────────────────────────────────│
│ Valor Original:     R$ 2.289,80             │
│ Multa (2%):        R$ 45,80                 │
│ Juros (0.15%/dia): R$ 65,06 (19 dias)      │
│ ─────────────────────────────────           │
│ VALOR ATUAL:       R$ 2.400,86  [VERMELHO] │
│ Valor Pago:        R$ 0,00                  │
│ ─────────────────────────────────           │
│ SALDO DEVEDOR:     R$ 2.400,86  [VERMELHO] │
│                                             │
│ Portador: PIX / BOLETO / CARTÃO / DINHEIRO │
└─────────────────────────────────────────────┘
```

**Campos:**
- `Valor` - Valor original
- **CALCULADO** - Multa (2% do valor)
- **CALCULADO** - Juros (0.15% × dias de atraso)
- **CALCULADO** - Valor Atual (Valor + Multa + Juros)
- `Total` - Valor já pago
- **CALCULADO** - Saldo Devedor (Atual - Pago)
- `Portador` - Forma de pagamento

---

### 📅 **SEÇÃO 3: DATAS E PRAZOS**
```
┌─────────────────────────────────────────────┐
│ 📆 CRONOLOGIA                               │
│ ───────────────────────────────────────────│
│ Emissão:         10/10/2026                 │
│ Vencimento:      10/10/2026                 │
│ Pagamento:       - (NÃO PAGO)               │
│ ─────────────────────────────────           │
│ ⏱️ Status: VENCIDA há 19 dias [VERMELHO]   │
└─────────────────────────────────────────────┘
```

**Campos:**
- `Data_Conta` - Data de emissão
- `Data_Vencimento` - Data de vencimento
- `Data_Pagamento` - Data do pagamento (se pago)
- **CALCULADO** - Dias de atraso
- **CALCULADO** - Status (ABERTA/VENCIDA/QUITADA)

---

### 🔗 **SEÇÃO 4: INTEGRAÇÃO ASAAS**
```
┌─────────────────────────────────────────────┐
│ 🏦 ASAAS                                    │
│ ───────────────────────────────────────────│
│ Status: PENDING [BADGE AMARELO]             │
│ ID Cobrança: pay_abc123xyz                  │
│ Link: 🔗 https://www.asaas.com/i/...        │
│                                             │
│ [🔄 SINCRONIZAR COM ASAAS]                  │
│                                             │
│ Última sincronização: 29/10/2026 12:30      │
│                                             │
│ ─── DADOS DO ASAAS ───                      │
│ Método: BOLETO + PIX                        │
│ Linha Digitável: 34191.790...              │
│ QR Code PIX: [Exibir]                       │
│ Processamento: 10/10/2026                   │
└─────────────────────────────────────────────┘
```

**Campos do Banco:**
- `agendamento_obs` - Link do Asaas
- `Boleto_Linha_Digitável` - Linha do boleto
- `Boleto_Data_Processamento` - Data processamento
- `Boleto_Código_Cedente` - Código cedente
- `Boleto_Conta` - Conta do boleto
- `codigo_boleto` - Código do boleto

**Campos da API Asaas** (buscar via botão):
- `status` - Status atual (PENDING, CONFIRMED, RECEIVED, OVERDUE)
- `paymentMethod` - Método de pagamento
- `pixQrCode` - QR Code PIX
- `pixCopyPaste` - Código PIX copia e cola
- `invoiceUrl` - URL do boleto
- `bankSlipUrl` - URL alternativa
- `transactionReceiptUrl` - Comprovante
- `confirmedDate` - Data de confirmação
- `paymentDate` - Data efetiva de pagamento
- `value` - Valor confirmado
- `netValue` - Valor líquido
- `fine` - Multa aplicada
- `interest` - Juros aplicado

---

### 📝 **SEÇÃO 5: OBSERVAÇÕES E HISTÓRICO**
```
┌─────────────────────────────────────────────┐
│ 📝 OBSERVAÇÕES                              │
│ ───────────────────────────────────────────│
│ [Observações gerais]                        │
│ Cliente solicitou parcelamento...           │
│                                             │
│ ─── OBSERVAÇÕES DE PAGAMENTO ───            │
│ Pago via PIX em 15/10/2026                  │
│                                             │
│ ─── HISTÓRICO ───                           │
│ 29/10 12:30 - Sincronizado com Asaas        │
│ 15/10 14:22 - Pagamento confirmado (Asaas) │
│ 10/10 10:00 - Cobrança criada               │
└─────────────────────────────────────────────┘
```

**Campos:**
- `Observações` - Observações gerais
- `Observacões_Pagamento` - Obs. do pagamento
- `Documento` - Número do documento
- **HISTÓRICO** - Eventos de webhook Asaas (nova tabela?)

---

### ⚡ **SEÇÃO 6: AÇÕES**
```
┌─────────────────────────────────────────────┐
│ ⚡ AÇÕES DISPONÍVEIS                        │
│ ───────────────────────────────────────────│
│ [💰 Marcar como Paga]  [✏️ Editar]          │
│ [📱 Enviar por WhatsApp] [📧 Enviar Email]  │
│ [🔄 Atualizar Vencimento] [❌ Cancelar]     │
│ [🖨️ Imprimir Boleto] [📋 Copiar PIX]        │
│                                             │
│                         [❌ Fechar Modal]   │
└─────────────────────────────────────────────┘
```

---

## 🔧 INTEGRAÇÃO COM ASAAS

### **API Backend - Buscar Dados Asaas**

**Endpoint:** `GET /api/contas/:codigo/asaas`

```javascript
// routes/contas.js
router.get('/:codigo/asaas', autenticar, async (req, res) => {
    try {
        const { codigo } = req.params;

        // 1. Buscar conta no banco
        const conta = await pool.query(`
            SELECT 
                "Codigo",
                "agendamento_obs",
                "Centro_Custo"
            FROM public."Contas_Receber"
            WHERE "Codigo" = $1
        `, [codigo]);

        if (conta.rows.length === 0) {
            return res.status(404).json({ erro: 'Conta não encontrada' });
        }

        // 2. Extrair ID do Asaas do link
        const linkAsaas = conta.rows[0].agendamento_obs;
        if (!linkAsaas) {
            return res.status(400).json({ erro: 'Conta sem integração Asaas' });
        }

        const paymentId = linkAsaas.split('/').pop();

        // 3. Buscar API Key do Centro de Custo
        const centroCusto = conta.rows[0].Centro_Custo;
        const apiKeyResult = await pool.query(`
            SELECT "API_Asaas"
            FROM public."Centros_Custos"
            WHERE "Centro_Custo" = $1
        `, [centroCusto]);

        if (apiKeyResult.rows.length === 0) {
            return res.status(400).json({ erro: 'API Key não encontrada' });
        }

        const apiKey = apiKeyResult.rows[0].API_Asaas;

        // 4. Buscar dados no Asaas
        const asaasResponse = await fetch(
            `https://www.asaas.com/api/v3/payments/${paymentId}`,
            {
                headers: {
                    'access_token': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!asaasResponse.ok) {
            return res.status(500).json({ erro: 'Erro ao consultar Asaas' });
        }

        const asaasData = await asaasResponse.json();

        // 5. Retornar dados combinados
        res.json({
            sucesso: true,
            asaas: asaasData,
            ultimaSincronizacao: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ erro: error.message });
    }
});
```

---

## 📊 ESTRUTURA DO MODAL (HTML/CSS)

### **Layout Responsivo:**
- Largura: 900px (max)
- Altura: 80vh (scroll interno)
- Tabs para organizar seções
- Design moderno com cards

### **Tabs:**
1. 📋 **Geral** - Identificação + Valores + Datas
2. 🏦 **Asaas** - Integração completa
3. 📝 **Observações** - Obs + Histórico
4. ⚡ **Ações** - Botões de ação

---

## 🎨 CORES E BADGES

### **Status:**
- 🟢 **QUITADA** - Verde (#10b981)
- 🟡 **ABERTA** - Amarelo (#f59e0b)
- 🔴 **VENCIDA** - Vermelho (#ef4444)

### **Status Asaas:**
- 🟡 **PENDING** - Aguardando pagamento
- 🟢 **CONFIRMED** - Confirmado
- 🟢 **RECEIVED** - Recebido
- 🔴 **OVERDUE** - Vencido
- ⚫ **REFUNDED** - Estornado
- ❌ **RECEIVED_IN_CASH** - Recebido em dinheiro

---

## ✅ PRÓXIMOS PASSOS

1. ✅ Criar endpoint `/api/contas/:codigo/detalhes` (dados completos)
2. ✅ Criar endpoint `/api/contas/:codigo/asaas` (sincronizar)
3. ✅ Criar HTML do modal com tabs
4. ✅ Criar CSS responsivo
5. ✅ Implementar JavaScript das ações
6. ✅ Testar integração Asaas

---

**Quer que eu implemente o modal agora?** 🚀
