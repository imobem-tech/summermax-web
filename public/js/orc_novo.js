// ============================================================
// SCRIPT - NOVO ORÇAMENTO
// V.2606181624
// ============================================================

let itens = [];
let cotistas = [];
let embarcacoes = [];
let embarcacoesOriginal = []; // Lista completa sem filtro

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando formulário de orçamento...');

    try {
        // Botões
        document.getElementById('btnVoltar').addEventListener('click', () => window.location.href = '/orcamentos.html');
        document.getElementById('btnCancelar').addEventListener('click', () => window.location.href = '/orcamentos.html');
        document.getElementById('btnAddItem').addEventListener('click', adicionarItem);

        // Eventos de cálculo
        document.getElementById('taxaServico').addEventListener('input', calcularResumo);
        document.getElementById('qtdParcelas').addEventListener('input', calcularResumo);

        // Seleção de embarcação
        document.getElementById('embarcacao').addEventListener('change', carregarCotistas);

        // Submit
        document.getElementById('formOrcamento').addEventListener('submit', salvarOrcamento);

        // Carregar dados iniciais
        console.log('📡 Carregando embarcações...');
        await carregarEmbarcacoes();

        console.log('📡 Carregando fornecedores...');
        await carregarFornecedores();

        // Adicionar primeiro item
        console.log('➕ Adicionando primeiro item...');
        adicionarItem();

        console.log('✅ Formulário pronto!');
    } catch (err) {
        console.error('❌ Erro ao inicializar formulário:', err);
        alert('Erro ao carregar formulário. Verifique o console (F12).');
    }
});

async function carregarEmbarcacoes() {
    try {
        console.log('  → Buscando select de embarcação...');
        const select = document.getElementById('embarcacao');
        if (!select) {
            console.error('  ❌ Select de embarcação não encontrado!');
            return;
        }

        select.innerHTML = '<option value="">Carregando...</option>';

        console.log('  → Fazendo requisição para /api/embarcacoes...');
        const response = await fetch('/api/embarcacoes', {
            credentials: 'include'
        });

        console.log('  → Status:', response.status);
        if (!response.ok) throw new Error(`Erro ${response.status}: ${await response.text()}`);

        embarcacoes = await response.json();
        embarcacoesOriginal = embarcacoes; // Salvar lista completa
        console.log(`  ✓ ${embarcacoes.length} embarcações carregadas`);

        select.innerHTML = '<option value="">Selecione uma embarcação...</option>';
        embarcacoes.forEach(emb => {
            // Formato: "576 - ALLMAX Z2"
            const option = document.createElement('option');
            option.value = emb.id;
            option.textContent = `${emb.num_pb} - ${emb.nome}`;
            option.dataset.numPb = emb.num_pb;
            option.dataset.nome = emb.nome.toLowerCase();
            select.appendChild(option);
        });

        console.log('  ✓ Select populado com sucesso');

    } catch (err) {
        console.error('  ❌ Erro ao carregar embarcações:', err);
        const select = document.getElementById('embarcacao');
        if (select) {
            select.innerHTML = '<option value="">⚠️ Erro ao carregar - Verifique console</option>';
        }
        throw err;
    }
}

async function carregarFornecedores() {
    try {
        const select = document.getElementById('fornecedor');
        select.innerHTML = '<option value="">Nenhum</option>';
        // TODO: Criar rota GET /api/fornecedores
    } catch (err) {
        console.error('Erro ao carregar fornecedores:', err);
    }
}

async function carregarCotistas() {
    const idEmbarcacao = document.getElementById('embarcacao').value;
    console.log('👥 Carregando cotistas para embarcação:', idEmbarcacao);

    if (!idEmbarcacao) {
        document.getElementById('cotistasSection').style.display = 'none';
        cotistas = [];
        return;
    }

    try {
        const url = `/api/embarcacoes/${idEmbarcacao}/cotistas`;
        console.log('  → URL:', url);

        const response = await fetch(url, {
            credentials: 'include'
        });

        console.log('  → Status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('  ❌ Erro:', errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('  → Dados recebidos:', data);

        cotistas = data.cotistas || [];
        console.log(`  ✓ ${cotistas.length} cotistas encontrados`);

        const lista = document.getElementById('listaCotistas');
        if (cotistas.length === 0) {
            lista.innerHTML = '<p style="color: #666; padding: 12px;">⚠️ Nenhum cotista encontrado para esta embarcação</p>';
        } else {
            lista.innerHTML = cotistas.map(c => `
                <div class="cotista-card">
                    <div class="nome">${c.nome || 'Nome não disponível'}</div>
                    <div class="info">Grupo: ${c.grupo_letra || 'N/A'} • ${c.percentual}%</div>
                </div>
            `).join('');
        }

        document.getElementById('cotistasSection').style.display = 'block';
        console.log('  ✓ Cotistas exibidos');

    } catch (err) {
        console.error('  ❌ Erro ao carregar cotistas:', err);
        alert(`Erro ao carregar cotistas: ${err.message}\n\nVeja o console (F12) para mais detalhes.`);
    }
}

function adicionarItem() {
    const id = Date.now();
    const item = {
        id,
        descricao: '',
        quantidade: 1,
        valor_unitario: 0,
        valor_total: 0
    };

    itens.push(item);
    renderizarItens();
}

function removerItem(id) {
    itens = itens.filter(i => i.id !== id);
    renderizarItens();
    calcularResumo();
}

function renderizarItens() {
    const container = document.getElementById('listaItens');

    container.innerHTML = itens.map((item, index) => `
        <div class="item-row">
            <div class="item-header">
                <h5>Item ${index + 1}</h5>
                ${itens.length > 1 ? `<button type="button" class="btn-remove-item" onclick="removerItem(${item.id})">🗑️ Remover</button>` : ''}
            </div>
            <div class="form-row">
                <div class="form-group" style="flex: 3;">
                    <label>Descrição *</label>
                    <input type="text" data-item="${item.id}" data-field="descricao" value="${item.descricao}" required placeholder="Ex: Troca de óleo e filtros">
                </div>
                <div class="form-group">
                    <label>Quantidade</label>
                    <input type="number" data-item="${item.id}" data-field="quantidade" value="${item.quantidade}" min="0.01" step="0.01">
                </div>
                <div class="form-group">
                    <label>Valor Unitário</label>
                    <input type="number" data-item="${item.id}" data-field="valor_unitario" value="${item.valor_unitario}" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label>Total</label>
                    <input type="text" value="${formatarMoeda(item.valor_total)}" disabled>
                </div>
            </div>
        </div>
    `).join('');

    // Adicionar event listeners
    container.querySelectorAll('input[data-item]').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = parseInt(e.target.dataset.item);
            const field = e.target.dataset.field;
            const valor = e.target.value;

            const item = itens.find(i => i.id === id);
            if (item) {
                item[field] = field === 'descricao' ? valor : parseFloat(valor) || 0;

                // Recalcular total do item
                if (field === 'quantidade' || field === 'valor_unitario') {
                    item.valor_total = item.quantidade * item.valor_unitario;
                    renderizarItens();
                    calcularResumo();
                }
            }
        });
    });
}

function calcularResumo() {
    const valorServicos = itens.reduce((sum, item) => sum + item.valor_total, 0);
    const taxaPerc = parseFloat(document.getElementById('taxaServico').value) || 0;
    const taxaValor = valorServicos * (taxaPerc / 100);
    const valorTotal = valorServicos + taxaValor;
    const qtdParcelas = parseInt(document.getElementById('qtdParcelas').value) || 1;
    const valorParcela = valorTotal / qtdParcelas;

    document.getElementById('resumoServicos').textContent = formatarMoeda(valorServicos);
    document.getElementById('resumoTaxaPerc').textContent = taxaPerc.toFixed(2);
    document.getElementById('resumoTaxa').textContent = formatarMoeda(taxaValor);
    document.getElementById('resumoTotal').textContent = formatarMoeda(valorTotal);
    document.getElementById('resumoParcela').textContent = formatarMoeda(valorParcela);
}

async function salvarOrcamento(e) {
    e.preventDefault();

    const idEmbarcacao = document.getElementById('embarcacao').value;
    if (!idEmbarcacao) {
        alert('Selecione uma embarcação');
        return;
    }

    if (itens.length === 0 || itens.every(i => !i.descricao)) {
        alert('Adicione pelo menos um item ao orçamento');
        return;
    }

    const dados = {
        id_embarcacao: parseInt(idEmbarcacao),
        id_fornecedor: document.getElementById('fornecedor').value || null,
        descricao: document.getElementById('descricao').value,
        observacao: document.getElementById('observacao').value,
        taxa_servico_perc: parseFloat(document.getElementById('taxaServico').value),
        forma_pagamento: document.getElementById('formaPagamento').value,
        qtd_parcelas: parseInt(document.getElementById('qtdParcelas').value),
        dias_vencimento: parseInt(document.getElementById('diasVencimento').value),
        itens: itens.filter(i => i.descricao).map(i => ({
            descricao: i.descricao,
            quantidade: i.quantidade,
            valor_unitario: i.valor_unitario,
            valor_total: i.valor_total
        }))
    };

    const btnSalvar = document.getElementById('btnSalvar');
    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';

    try {
        const response = await fetch('/api/orcamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(dados)
        });

        const result = await response.json();

        if (response.ok) {
            alert(`✅ Orçamento ${result.numero} criado com sucesso!`);
            window.location.href = '/orcamentos.html';
        } else {
            alert(`❌ Erro: ${result.erro}`);
            btnSalvar.disabled = false;
            btnSalvar.textContent = 'Salvar Orçamento';
        }

    } catch (err) {
        console.error('Erro ao salvar orçamento:', err);
        alert('❌ Erro ao salvar orçamento');
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'Salvar Orçamento';
    }
}

function formatarMoeda(valor) {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// V.2606181624

// ============================================================
// Função de filtro de embarcações - V.2606211755
// ============================================================
function filtrarEmbarcacoes() {
    const filtroCodigo = document.getElementById('filtroCodigo').value.trim();
    const filtroNome = document.getElementById('filtroNome').value.trim().toLowerCase();
    const select = document.getElementById('embarcacao');
    
    // Filtrar lista
    let listaFiltrada = embarcacoesOriginal;
    
    if (filtroCodigo) {
        listaFiltrada = listaFiltrada.filter(emb => 
            String(emb.num_pb).includes(filtroCodigo)
        );
    }
    
    if (filtroNome) {
        listaFiltrada = listaFiltrada.filter(emb => 
            emb.nome.toLowerCase().includes(filtroNome)
        );
    }
    
    // Atualizar select
    select.innerHTML = '<option value="">Selecione uma embarcação...</option>';
    listaFiltrada.forEach(emb => {
        const option = document.createElement('option');
        option.value = emb.id;
        option.textContent = `${emb.num_pb} - ${emb.nome}`;
        select.appendChild(option);
    });
    
    console.log(`🔍 Filtro aplicado: ${listaFiltrada.length} embarcações encontradas`);
}

// Adicionar event listeners para os filtros ao carregar
document.addEventListener('DOMContentLoaded', () => {
    const filtroCodigo = document.getElementById('filtroCodigo');
    const filtroNome = document.getElementById('filtroNome');
    
    if (filtroCodigo) {
        filtroCodigo.addEventListener('input', filtrarEmbarcacoes);
    }
    
    if (filtroNome) {
        filtroNome.addEventListener('input', filtrarEmbarcacoes);
    }
});
