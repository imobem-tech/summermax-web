// ============================================================
// ⚠️ BACKUP: 2606221725_orc_novo.js
// Data do backup: 22/06/2026 17:25
// Arquivo original: C:\Users\NOTEBOOK\projetos\summermax-web\public\js\orc_novo.js — V.2606221725
// ============================================================
//
// MOTIVO DO BACKUP:
// Corrigir validação de embarcação e campo required em itens vazios
//
// PROBLEMA RESOLVIDO:
// 1. Campo Descrição com required bloqueava submit quando havia item vazio
//    - Usuário adiciona Item 1 → clica "Adicionar Item" → Item 2 vazio
//    - HTML5 exigia preenchimento do Item 2 mesmo vazio
// 2. Embarcação selecionada via código mas select filtrado não tinha o value
//    - buscarPorCodigo() seta select.value mas filtro pode limpar options
//    - Validação pegava select.value vazio mesmo com cotistas carregados
//
// FUNÇÕES ALTERADAS:
// - renderizarItens(): removido atributo required do input de descrição
// - Nova variável global: embarcacaoSelecionadaId
// - carregarCotistas(): salva embarcacaoSelecionadaId
// - buscarPorCodigo(): salva embarcacaoSelecionadaId
// - carregarCotistasPorId(): salva embarcacaoSelecionadaId
// - salvarOrcamento(): usa embarcacaoSelecionadaId ao invés de select.value
// - salvarOrcamento(): filtra itens preenchidos (ignora vazios)
//
// SOLUÇÃO:
// 1. Campo descrição SEM required → valida no JS
// 2. Variável global embarcacaoSelecionadaId mantém ID mesmo com select filtrado
// 3. Envia apenas itens com descrição preenchida
// 4. Logs detalhados para debug
//
// ============================================================

// ============================================================
// SCRIPT - NOVO ORÇAMENTO
// V.2606221725
// ============================================================

let itens = [];
let cotistas = [];
let embarcacoes = [];
let embarcacoesOriginal = []; // Lista completa sem filtro
let embarcacaoSelecionadaId = null; // ID da embarcação selecionada

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando formulário de orçamento...');

    try {
        // Botões
        document.getElementById('btnVoltar').addEventListener('click', () => window.location.href = '/orcamentos.html');
        document.getElementById('btnCancelar').addEventListener('click', () => window.location.href = '/orcamentos.html');
        document.getElementById('btnAddItem').addEventListener('click', adicionarItem);

        // Eventos de cálculo
        document.getElementById('taxaServico').addEventListener('input', calcularResumo);

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

        // Inicializar filtros APÓS carregar a lista
        inicializarFiltros();

        select.innerHTML = '<option value="">Selecione uma embarcação...</option>';
        embarcacoes.forEach(emb => {
            // Formato: "576 - ALLMAX Z2"
            const option = document.createElement('option');
            option.value = emb.id;
            option.textContent = `${emb.num_pb} - ${emb.nome || 'SEM NOME'}`;
            option.dataset.numPb = emb.num_pb;
            option.dataset.nome = (emb.nome || '').toLowerCase();
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
        embarcacaoSelecionadaId = null;
        return;
    }

    // Salvar ID selecionado
    embarcacaoSelecionadaId = parseInt(idEmbarcacao);

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
        <div class="item-row" data-item-row="${item.id}">
            <div class="item-header">
                <h5>Item ${index + 1}</h5>
                ${itens.length > 1 ? `<button type="button" class="btn-remove-item" onclick="removerItem(${item.id})">🗑️ Remover</button>` : ''}
            </div>
            <div class="form-row">
                <div class="form-group" style="flex: 3;">
                    <label>Descrição *</label>
                    <input type="text" data-item="${item.id}" data-field="descricao" value="${item.descricao}" placeholder="Ex: Troca de óleo e filtros">
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
                    <input type="text" class="campo-total" data-item-total="${item.id}" value="${formatarMoeda(item.valor_total)}" disabled>
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

                    // ✅ Atualizar apenas o campo Total (sem re-renderizar tudo)
                    const campoTotal = document.querySelector(`input[data-item-total="${item.id}"]`);
                    if (campoTotal) {
                        campoTotal.value = formatarMoeda(item.valor_total);
                    }

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

    document.getElementById('resumoServicos').textContent = formatarMoeda(valorServicos);
    document.getElementById('resumoTaxaPerc').textContent = taxaPerc.toFixed(2);
    document.getElementById('resumoTaxa').textContent = formatarMoeda(taxaValor);
    document.getElementById('resumoTotal').textContent = formatarMoeda(valorTotal);
}

async function salvarOrcamento(e) {
    e.preventDefault();

    // ✅ Usar variável global ao invés do select (pode estar filtrado)
    if (!embarcacaoSelecionadaId) {
        alert('Selecione uma embarcação');
        document.getElementById('filtroCodigo').focus();
        return;
    }

    // ✅ Validar itens preenchidos (ignora linhas vazias)
    const itensPreenchidos = itens.filter(i => i.descricao && i.descricao.trim());
    if (itensPreenchidos.length === 0) {
        alert('Adicione pelo menos um item ao orçamento');
        return;
    }

    const valorFornecedor = document.getElementById('fornecedor').value;

    const dados = {
        id_embarcacao: embarcacaoSelecionadaId,
        id_fornecedor: valorFornecedor && valorFornecedor !== '' ? parseInt(valorFornecedor) : null,
        titulo: document.getElementById('titulo').value,
        observacao: document.getElementById('observacao').value || '',
        taxa_servico_perc: parseFloat(document.getElementById('taxaServico').value) || 20,
        itens: itensPreenchidos.map(i => ({
            descricao: i.descricao.trim(),
            quantidade: i.quantidade || 1,
            valor_unitario: i.valor_unitario || 0,
            valor_total: i.valor_total || 0
        }))
    };

    console.log('📤 Enviando dados:', dados);
    console.log(`   → Embarcação ID: ${embarcacaoSelecionadaId}`);
    console.log(`   → Total de itens: ${itensPreenchidos.length}`);

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

// V.2606221725

// ============================================================
// Função de filtro de embarcações - V.2606211805
// ============================================================
function filtrarEmbarcacoes(abrirCombo = false) {
    const filtroCodigo = document.getElementById('filtroCodigo');
    const filtroNome = document.getElementById('filtroNome');
    const select = document.getElementById('embarcacao');

    const valorCodigo = filtroCodigo.value.trim();
    const valorNome = filtroNome.value.trim().toLowerCase();

    // Filtrar lista (busca parcial)
    let listaFiltrada = embarcacoesOriginal;

    if (valorCodigo) {
        listaFiltrada = listaFiltrada.filter(emb =>
            String(emb.num_pb).includes(valorCodigo)
        );
    }

    if (valorNome) {
        listaFiltrada = listaFiltrada.filter(emb =>
            (emb.nome || '').toLowerCase().includes(valorNome)
        );
    }

    // Atualizar select
    select.innerHTML = '<option value="">Selecione...</option>';
    listaFiltrada.forEach(emb => {
        const option = document.createElement('option');
        option.value = emb.id;
        option.textContent = `${emb.num_pb} - ${emb.nome}`;
        option.dataset.numPb = emb.num_pb;
        select.appendChild(option);
    });

    console.log(`🔍 Filtro aplicado: ${listaFiltrada.length} embarcações`);

    // Abrir combo apenas se solicitado (ao sair do campo nome)
    if (abrirCombo && listaFiltrada.length > 0) {
        select.focus();
        select.size = Math.min(listaFiltrada.length + 1, 10); // Abrir como lista
        setTimeout(() => { select.size = 1; }, 5000); // Fechar após 5s
    }
}

// Buscar embarcação por código e carregar cotistas direto
async function buscarPorCodigo() {
    const filtroCodigo = document.getElementById('filtroCodigo');
    const valorCodigo = filtroCodigo.value.trim();

    if (!valorCodigo) return;

    // Buscar embarcação com esse Num_PB
    const embarcacao = embarcacoesOriginal.find(emb =>
        String(emb.num_pb) === valorCodigo
    );

    if (embarcacao) {
        console.log(`✅ Embarcação ${valorCodigo} encontrada, carregando cotistas...`);

        // Salvar ID selecionado
        embarcacaoSelecionadaId = embarcacao.id;

        // Selecionar no combo (sem triggerar o evento)
        const select = document.getElementById('embarcacao');
        select.value = embarcacao.id;

        // Carregar cotistas direto
        await carregarCotistasPorId(embarcacao.id);
    } else {
        console.log(`⚠️ Embarcação ${valorCodigo} não encontrada`);
    }
}

// Função auxiliar para carregar cotistas por ID
async function carregarCotistasPorId(idEmbarcacao) {
    if (!idEmbarcacao) {
        document.getElementById('cotistasSection').style.display = 'none';
        cotistas = [];
        embarcacaoSelecionadaId = null;
        return;
    }

    // Salvar ID selecionado
    embarcacaoSelecionadaId = parseInt(idEmbarcacao);

    try {
        const url = `/api/embarcacoes/${idEmbarcacao}/cotistas`;
        console.log('👥 Carregando cotistas:', url);

        const response = await fetch(url, { credentials: 'include' });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        cotistas = data.cotistas || [];
        console.log(`✅ ${cotistas.length} cotistas encontrados`);

        const lista = document.getElementById('listaCotistas');
        if (cotistas.length === 0) {
            lista.innerHTML = '<p style="color: #666; padding: 12px;">⚠️ Nenhum cotista encontrado</p>';
        } else {
            lista.innerHTML = cotistas.map(c => `
                <div class="cotista-card">
                    <div class="nome">${c.nome || 'Nome não disponível'}</div>
                    <div class="info">Grupo: ${c.grupo_letra || 'N/A'} • ${c.percentual}%</div>
                </div>
            `).join('');
        }

        document.getElementById('cotistasSection').style.display = 'block';

    } catch (err) {
        console.error('❌ Erro ao carregar cotistas:', err);
        alert(`Erro: ${err.message}`);
    }
}

// Inicializar event listeners dos filtros APÓS carregar embarcações
function inicializarFiltros() {
    const filtroCodigo = document.getElementById('filtroCodigo');
    const filtroNome = document.getElementById('filtroNome');

    if (filtroCodigo) {
        // Ao focar no campo Embarcação: limpar ambos os campos
        filtroCodigo.addEventListener('focus', () => {
            filtroCodigo.value = '';
            filtroNome.value = '';
            if (embarcacoesOriginal.length > 0) {
                filtrarEmbarcacoes(false);
            }
        });

        // Ao digitar: filtrar
        filtroCodigo.addEventListener('input', () => {
            if (embarcacoesOriginal.length > 0) {
                filtrarEmbarcacoes(false);
            }
        });

        // Ao sair (blur) ou Enter: buscar e carregar cotistas
        filtroCodigo.addEventListener('blur', buscarPorCodigo);
        filtroCodigo.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarPorCodigo();
            }
        });
    }

    if (filtroNome) {
        // Ao focar no Buscar Nome: limpar ambos os campos
        filtroNome.addEventListener('focus', () => {
            filtroCodigo.value = '';
            filtroNome.value = '';
            if (embarcacoesOriginal.length > 0) {
                filtrarEmbarcacoes(false); // NÃO abrir combo ainda
            }
        });

        // Ao digitar: apenas filtrar (NÃO abrir combo)
        filtroNome.addEventListener('input', () => {
            if (embarcacoesOriginal.length > 0) {
                filtrarEmbarcacoes(false);
            }
        });

        // Ao sair do campo: aplicar filtro E abrir combo
        filtroNome.addEventListener('blur', () => {
            if (filtroNome.value.trim() && embarcacoesOriginal.length > 0) {
                setTimeout(() => {
                    filtrarEmbarcacoes(true); // AGORA SIM abre o combo
                }, 100);
            }
        });
    }

    console.log('✅ Filtros inicializados');
}
