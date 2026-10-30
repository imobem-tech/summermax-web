// ============================================================
// CLIENTES.JS - V.2610291912
// JavaScript da tela de clientes
// ============================================================

let clienteAtual = null;
let contaAtual = null;  // Conta atualmente aberta no modal de detalhes
let timeoutBusca = null;

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacao();
    carregarDadosUsuario();
    inicializarEventos();
});

// ============================================================
// VERIFICAR AUTENTICAÇÃO
// ============================================================
async function verificarAutenticacao() {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = '/';
            return;
        }

        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        document.getElementById('userName').textContent = data.nome;

    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/';
    }
}

// ============================================================
// CARREGAR DADOS DO USUÁRIO
// ============================================================
async function carregarDadosUsuario() {
    try {
        const token = localStorage.getItem('token');

        if (!token) return;

        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('userName').textContent = data.nome;
        }
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
    }
}

// ============================================================
// INICIALIZAR EVENTOS
// ============================================================
function inicializarEventos() {
    // Busca por código
    const inputCodigo = document.getElementById('inputCodigo');
    inputCodigo.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarPorCodigo(inputCodigo.value);
        }
    });

    // Busca por nome (autocomplete)
    const inputNome = document.getElementById('inputNome');
    inputNome.addEventListener('input', (e) => {
        clearTimeout(timeoutBusca);
        const termo = e.target.value.trim();

        if (termo.length >= 3) {
            timeoutBusca = setTimeout(() => {
                buscarPorNome(termo);
            }, 300); // Aguarda 300ms após parar de digitar
        } else {
            esconderAutocomplete();
        }
    });

    // Navegação com teclado no autocomplete
    inputNome.addEventListener('keydown', (e) => {
        navegarAutocomplete(e);
    });

    // Fechar autocomplete ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-field')) {
            esconderAutocomplete();
        }
    });

    // Botão voltar
    document.getElementById('btnVoltar').addEventListener('click', () => {
        voltarParaBusca();
    });

    // Tabs
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            mudarTab(btn.dataset.tab);
        });
    });

    // Botão Ver Contas
    document.getElementById('btnVerContas').addEventListener('click', () => {
        mudarTab('contas');
    });

    // Logout
    document.getElementById('btnLogout').addEventListener('click', logout);
}

// ============================================================
// BUSCAR POR CÓDIGO
// ============================================================
async function buscarPorCodigo(codigo) {
    if (!codigo) {
        alert('Digite um código válido');
        return;
    }

    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`/api/clientes/${codigo}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                alert('Cliente não encontrado');
            } else {
                alert('Erro ao buscar cliente');
            }
            return;
        }

        const data = await response.json();
        mostrarCliente(data.cliente);

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao buscar cliente');
    }
}

// ============================================================
// BUSCAR POR NOME (AUTOCOMPLETE)
// ============================================================
async function buscarPorNome(termo) {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`/api/clientes/buscar?nome=${encodeURIComponent(termo)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro na busca');
        }

        const data = await response.json();
        mostrarResultadosAutocomplete(data.clientes, data.total);

    } catch (error) {
        console.error('Erro:', error);
        esconderAutocomplete();
    }
}

// ============================================================
// MOSTRAR RESULTADOS AUTOCOMPLETE
// ============================================================
function mostrarResultadosAutocomplete(clientes, total) {
    const container = document.getElementById('autocompleteResults');

    if (!clientes || clientes.length === 0) {
        container.innerHTML = '<div class="autocomplete-vazio">Nenhum cliente encontrado</div>';
        container.classList.add('show');
        return;
    }

    let html = `<div class="autocomplete-header">${total} cliente${total > 1 ? 's' : ''} encontrado${total > 1 ? 's' : ''}</div>`;

    clientes.forEach((cliente, index) => {
        html += `
            <div class="autocomplete-item ${index === 0 ? 'active' : ''}"
                 onclick="selecionarCliente(${cliente.Codigo})"
                 data-codigo="${cliente.Codigo}">
                <div class="autocomplete-nome">👤 ${cliente.Cliente_Nome}</div>
                <div class="autocomplete-info">
                    Código: ${cliente.Codigo} •
                    CPF: ${formatarCPF(cliente.Cliente_CPF) || 'Não informado'}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    container.classList.add('show');
}

// ============================================================
// ESCONDER AUTOCOMPLETE
// ============================================================
function esconderAutocomplete() {
    const container = document.getElementById('autocompleteResults');
    container.classList.remove('show');
    container.innerHTML = '';
}

// ============================================================
// NAVEGAR AUTOCOMPLETE COM TECLADO
// ============================================================
function navegarAutocomplete(e) {
    const container = document.getElementById('autocompleteResults');
    const items = container.querySelectorAll('.autocomplete-item');

    if (items.length === 0) return;

    let currentIndex = Array.from(items).findIndex(item => item.classList.contains('active'));

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentIndex = (currentIndex + 1) % items.length;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentIndex >= 0) {
            const codigo = items[currentIndex].dataset.codigo;
            selecionarCliente(parseInt(codigo));
        }
        return;
    } else {
        return;
    }

    items.forEach((item, index) => {
        item.classList.toggle('active', index === currentIndex);
    });
}

// ============================================================
// SELECIONAR CLIENTE
// ============================================================
async function selecionarCliente(codigo) {
    esconderAutocomplete();
    await buscarPorCodigo(codigo);
}

// ============================================================
// MOSTRAR DETALHES DO CLIENTE
// ============================================================
function mostrarCliente(cliente) {
    clienteAtual = cliente;

    // Esconder busca, mostrar detalhes
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('clienteDetalhes').style.display = 'block';

    // Header
    document.getElementById('clienteNome').textContent = cliente.Cliente_Nome || 'Nome não informado';

    // Resumo (placeholder - depois conectar com API real)
    document.getElementById('resumoAberto').textContent = 'R$ 0,00';
    document.getElementById('resumoSaidas').textContent = '0';
    document.getElementById('resumoStatus').textContent = 'ADIMPLENTE';

    // Dados
    document.getElementById('dadoNome').textContent = cliente.Cliente_Nome || '-';
    document.getElementById('dadoCodigo').textContent = cliente.Codigo || '-';
    document.getElementById('dadoCpf').textContent = formatarCPF(cliente.Cliente_CPF) || '-';
    document.getElementById('dadoApelido').textContent = cliente.Cliente_Apelido || '-';

    // Contato
    document.getElementById('dadoEmail').textContent = cliente.Cliente_e_mail || '-';
    document.getElementById('dadoTelefone').textContent = formatarTelefone(cliente.Cliente_Telefone_fixo) || '-';
    document.getElementById('dadoCelular').textContent = formatarTelefone(cliente.Cliente_Telefone_Celular) || '-';

    // Endereço
    document.getElementById('dadoEndereco').textContent = cliente.Cliente_Endereco || '-';
    document.getElementById('dadoBairro').textContent = cliente.Cliente_Bairro || '-';
    document.getElementById('dadoCidade').textContent =
        `${cliente.Cliente_Cidade || '-'} / ${cliente.Cliente_UF || '-'}`;
    document.getElementById('dadoCep').textContent = formatarCEP(cliente.Cliente_CEP) || '-';

    // Observações
    const obsElement = document.getElementById('dadoObservacoes');
    if (cliente.Cliente_Obs && cliente.Cliente_Obs.trim()) {
        obsElement.innerHTML = `<p>${cliente.Cliente_Obs.replace(/\n/g, '<br>')}</p>`;
    } else {
        obsElement.innerHTML = '<p>Sem observações</p>';
    }

    // Limpar inputs
    document.getElementById('inputCodigo').value = '';
    document.getElementById('inputNome').value = '';

    // Carregar dados das tabs
    carregarContasReceber(cliente.Codigo);
    carregarSaidas(cliente.Codigo);
}

// ============================================================
// VOLTAR PARA BUSCA
// ============================================================
function voltarParaBusca() {
    document.getElementById('searchSection').style.display = 'block';
    document.getElementById('clienteDetalhes').style.display = 'none';
    clienteAtual = null;

    // Voltar para tab Dados
    mudarTab('dados');
}

// ============================================================
// MUDAR TAB
// ============================================================
function mudarTab(tabName) {
    // Atualizar botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Atualizar conteúdo
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = 'none';
        pane.classList.remove('active');
    });

    const paneAtivo = document.getElementById(`tab${capitalize(tabName)}`);
    if (paneAtivo) {
        paneAtivo.style.display = 'block';
        paneAtivo.classList.add('active');
    }
}

// ============================================================
// CARREGAR CONTAS A RECEBER
// ============================================================
async function carregarContasReceber(codigoCliente) {
    if (!codigoCliente) return;

    // Definir data de hoje como padrão
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('filtroDataAte').value = hoje;

    // Carregar vencidas por padrão
    await filtrarContas(codigoCliente);

    // Event listener para botão filtrar
    document.getElementById('btnFiltrarContas').onclick = () => {
        filtrarContas(codigoCliente);
    };
}

async function filtrarContas(codigoCliente) {
    const container = document.getElementById('listaContas');
    container.innerHTML = '<p class="loading">Carregando</p>';

    try {
        const token = localStorage.getItem('token');
        const dataDe = document.getElementById('filtroDataDe').value;
        const dataAte = document.getElementById('filtroDataAte').value;
        const status = document.getElementById('filtroStatus').value;

        let url = `/api/clientes/${codigoCliente}/contas?status=${status}`;
        if (dataDe) url += `&dataDe=${dataDe}`;
        if (dataAte) url += `&dataAte=${dataAte}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar contas');
        }

        const data = await response.json();
        mostrarContas(data.contas);

    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = '<p class="texto-vazio">Erro ao carregar contas</p>';
    }
}

function mostrarContas(contas) {
    const container = document.getElementById('listaContas');

    if (!contas || contas.length === 0) {
        container.innerHTML = '<p class="texto-vazio">Nenhuma conta encontrada</p>';
        return;
    }

    const hoje = new Date();

    let html = `
        <div class="tabela-contas-container">
            <table class="tabela-contas">
                <thead>
                    <tr>
                        <th>Conta</th>
                        <th>Descrição</th>
                        <th>Vencimento</th>
                        <th>Atual</th>
                        <th>Valor</th>
                        <th>DT_PGTO</th>
                        <th>Pago</th>
                        <th>Link_Asaas</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;

    contas.forEach(conta => {
        const dataVenc = new Date(conta.data_vencimento);
        const diasAtraso = Math.floor((hoje - dataVenc) / (1000 * 60 * 60 * 24));

        // Calcular ATUAL: Valor + 2% multa + 0.15% juros ao dia de atraso
        let valorAtual = parseFloat(conta.valor);
        if (!conta.data_pagamento && diasAtraso > 0) {
            const multa = valorAtual * 0.02;
            const juros = valorAtual * 0.0015 * diasAtraso;
            valorAtual = valorAtual + multa + juros;
        }

        const linkAsaas = conta.link_asaas
            ? `<a href="${conta.link_asaas}" target="_blank" style="color: #667eea; text-decoration: none;">🔗 Ver</a>`
            : '-';

        // Formatar Pago: "-" se for 0 ou null
        const valorPago = conta.pago && parseFloat(conta.pago) > 0
            ? `R$ ${formatarValor(conta.pago)}`
            : '-';

        html += `
            <tr>
                <td>${conta.Codigo}</td>
                <td>${conta.descricao || '-'}</td>
                <td>${formatarData(conta.data_vencimento)}</td>
                <td class="${!conta.data_pagamento && diasAtraso > 0 ? 'valor-negativo' : ''}">R$ ${formatarValor(valorAtual)}</td>
                <td>R$ ${formatarValor(conta.valor)}</td>
                <td>${conta.data_pagamento ? formatarData(conta.data_pagamento) : '-'}</td>
                <td>${valorPago}</td>
                <td>${linkAsaas}</td>
                <td><button class="btn-detalhes" onclick="verDetalhesConta(${conta.Codigo})">📋 Detalhes</button></td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

function formatarData(data) {
    if (!data) return '-';

    // Se for apenas data (YYYY-MM-DD), não fazer conversão de timezone
    if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    // Caso contrário, usar conversão normal
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
}

function formatarValor(valor) {
    if (!valor) return '0,00';
    return parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ============================================================
// CARREGAR SAÍDAS
// ============================================================
async function carregarSaidas(codigoCliente) {
    const container = document.getElementById('listaSaidas');
    container.innerHTML = '<p class="loading">Carregando</p>';

    try {
        // TODO: Implementar API de saídas
        setTimeout(() => {
            container.innerHTML = '<p class="texto-vazio">Funcionalidade em desenvolvimento</p>';
        }, 500);

    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = '<p class="texto-vazio">Erro ao carregar saídas</p>';
    }
}

// ============================================================
// FORMATAÇÃO
// ============================================================
function formatarCPF(cpf) {
    if (!cpf) return null;
    const numeros = cpf.toString().replace(/\D/g, '');
    if (numeros.length !== 11) return cpf;
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarCEP(cep) {
    if (!cep) return null;
    const numeros = cep.toString().replace(/\D/g, '');
    if (numeros.length !== 8) return cep;
    return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
}

function formatarTelefone(tel) {
    if (!tel) return null;
    const numeros = tel.toString().replace(/\D/g, '');

    if (numeros.length === 11) {
        return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numeros.length === 10) {
        return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return tel;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
// VER DETALHES DA CONTA
// ============================================================
async function verDetalhesConta(codigoConta) {
    try {
        const modal = document.getElementById('modalDetalhesConta');
        modal.classList.add('show');

        // Resetar dados
        limparModalDetalhes();

        // Buscar detalhes completos
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/clientes/${clienteAtual.Codigo}/contas/${codigoConta}/detalhes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar detalhes');
        }

        const data = await response.json();
        preencherModalDetalhes(data.conta);

        // Buscar dados do Asaas
        buscarDadosAsaasDetalhes(codigoConta);

        // Inicializar tabs
        inicializarModalTabs();

        /*
        // Listener para sincronizar Asaas (REMOVIDO - botão não existe mais)
        document.getElementById('btnSincronizarAsaas').onclick = () => {
            sincronizarComAsaas(codigoConta);
        };
        */

    } catch (error) {
        console.error('Erro ao abrir detalhes:', error);
        alert('Erro ao carregar detalhes da conta');
    }
}

function limparModalDetalhes() {
    // Limpar todos os campos
    document.querySelectorAll('#modalDetalhesConta span[id^="det"]').forEach(el => {
        el.textContent = '-';
    });
    document.querySelectorAll('#modalDetalhesConta span[id^="asaas"]').forEach(el => {
        el.textContent = '-';
    });
    document.getElementById('detObservacoes').innerHTML = '<p>Sem observações</p>';
    document.getElementById('detObservacoesPagamento').innerHTML = '<p>Sem observações de pagamento</p>';
}

function preencherModalDetalhes(conta) {
    // Salvar conta atual globalmente para uso em outras funções
    contaAtual = conta;

    const hoje = new Date();
    const dataVenc = new Date(conta.Data_Vencimento);
    const diasAtraso = Math.floor((hoje - dataVenc) / (1000 * 60 * 60 * 24));

    // ===== PREENCHER CABEÇALHO (IGUAL À TABELA) =====
    document.getElementById('cabCodigoCliente').textContent = conta.Código_Cliente || '-';
    document.getElementById('cabCentroCusto').textContent = conta.Centro_Custo || '-';
    document.getElementById('cabCodigo').textContent = conta.Codigo;
    document.getElementById('cabDescricao').textContent = conta.Descrição || '-';
    document.getElementById('cabVencimento').textContent = formatarData(conta.Data_Vencimento);
    document.getElementById('cabValor').textContent = `R$ ${formatarValor(conta.Valor)}`;

    // Calcular valores
    let valorAtual = parseFloat(conta.Valor);
    let multa = 0;
    let juros = 0;

    if (!conta.Data_Pagamento && diasAtraso > 0) {
        multa = valorAtual * 0.02;
        juros = valorAtual * 0.0015 * diasAtraso;
        valorAtual = valorAtual + multa + juros;
    }

    const valorPago = conta.Total ? parseFloat(conta.Total) : 0;
    const saldoDevedor = valorAtual - valorPago;

    // Completar cabeçalho
    document.getElementById('cabValorAtual').textContent = `R$ ${formatarValor(valorAtual)}`;
    document.getElementById('cabDataPgto').textContent = conta.Data_Pagamento ? formatarData(conta.Data_Pagamento) : '-';
    document.getElementById('cabPago').textContent = valorPago > 0 ? `R$ ${formatarValor(valorPago)}` : '-';

    // Status - APENAS CRITÉRIO MATEMÁTICO
    const cabStatusEl = document.getElementById('cabStatus');

    if (conta.Data_Pagamento && conta.Total && parseFloat(conta.Total) > 0) {
        // Tem Data_Pagamento E Total → QUITADA
        cabStatusEl.textContent = 'QUITADA';
        cabStatusEl.className = 'status-badge status-quitada';
    } else if (diasAtraso > 0) {
        // Venceu e não está paga → VENCIDA
        cabStatusEl.textContent = 'VENCIDA';
        cabStatusEl.className = 'status-badge status-vencida';
    } else {
        // Caso contrário → ABERTA
        cabStatusEl.textContent = 'ABERTA';
        cabStatusEl.className = 'status-badge status-aberta';
    }

    // ========================================
    // CONTROLE DE BOTÕES DE AÇÃO
    // ========================================

    // 💰 Botão "Marcar como Paga" - desabilitar se já estiver paga
    const btnMarcarPaga = document.getElementById('btnMarcarPaga');
    const btnCancelarCobranca = document.getElementById('btnCancelarCobranca');
    const contaQuitada = conta.Data_Pagamento || (conta.Total && parseFloat(conta.Total) >= parseFloat(conta.Valor));

    console.log('🔍 DEBUG - Status da conta:');
    console.log('   Data_Pagamento:', conta.Data_Pagamento);
    console.log('   Total:', conta.Total);
    console.log('   Valor:', conta.Valor);
    console.log('   Observações_Pagamento:', conta.Observacões_Pagamento);
    console.log('   ✅ contaQuitada?', contaQuitada);

    if (contaQuitada) {
        // Já está paga - desabilitar AMBOS botões
        btnMarcarPaga.disabled = true;
        btnMarcarPaga.classList.add('btn-construcao');
        btnMarcarPaga.style.opacity = '0.4';
        btnMarcarPaga.style.cursor = 'not-allowed';

        if (btnCancelarCobranca) {
            btnCancelarCobranca.disabled = true;
            btnCancelarCobranca.classList.add('btn-construcao');
            btnCancelarCobranca.style.opacity = '0.4';
            btnCancelarCobranca.style.cursor = 'not-allowed';
        }
    } else {
        // Ainda não está paga - habilitar botão "Marcar como Paga"
        btnMarcarPaga.disabled = false;
        btnMarcarPaga.classList.remove('btn-construcao');
        btnMarcarPaga.style.opacity = '1';
        btnMarcarPaga.style.cursor = 'pointer';
    }

    // ========================================
    // BOTÃO "CANCELAR COBRANÇA"
    // Habilitar se NÃO estiver quitada
    // ========================================
    if (!contaQuitada && btnCancelarCobranca) {
        btnCancelarCobranca.disabled = false;
        btnCancelarCobranca.classList.remove('btn-construcao');
        btnCancelarCobranca.style.opacity = '1';
        btnCancelarCobranca.style.cursor = 'pointer';
    }

    // ========================================
    // ELEMENTOS DA ABA "GERAL" FORAM REMOVIDOS
    // Comentados pois não existem mais no HTML
    // ========================================

    /*
    // Identificação
    document.getElementById('detCodigo').textContent = `#${conta.Codigo}`;
    document.getElementById('detDescricao').textContent = conta.Descrição || '-';
    document.getElementById('detCliente').textContent =
        conta.Cliente_Nome ? `[${conta.Código_Cliente}] ${conta.Cliente_Nome}` : '-';
    document.getElementById('detCpfCnpj').textContent =
        conta.CPF_CNPJ_CR ? formatarCPF(conta.CPF_CNPJ_CR) : '-';
    document.getElementById('detCentroCusto').textContent = conta.centro_custo_nome || conta.Centro_Custo || '-';
    document.getElementById('detNroVenda').textContent = conta.Nro_Venda || '-';

    // Valores
    document.getElementById('detValorOriginal').textContent = `R$ ${formatarValor(conta.Valor)}`;
    const multaJurosTotal = multa + juros;
    document.getElementById('detMultaJuros').textContent = multaJurosTotal > 0 ? `R$ ${formatarValor(multaJurosTotal)}` : '-';
    document.getElementById('detDiasAtraso').textContent = diasAtraso > 0 ? `${diasAtraso} dias` : '-';

    const valorAtualEl = document.getElementById('detValorAtual');
    valorAtualEl.textContent = `R$ ${formatarValor(valorAtual)}`;
    valorAtualEl.className = 'valor-grande' + (diasAtraso > 0 && !conta.Data_Pagamento ? ' valor-negativo' : '');

    document.getElementById('detValorPago').textContent = valorPago > 0 ? `R$ ${formatarValor(valorPago)}` : '-';

    const saldoEl = document.getElementById('detSaldoDevedor');
    saldoEl.textContent = `R$ ${formatarValor(saldoDevedor)}`;
    saldoEl.className = 'valor-grande' + (saldoDevedor > 0 ? ' valor-negativo' : ' valor-positivo');

    document.getElementById('detPortador').textContent = conta.Portador || '-';

    // Datas
    document.getElementById('detDataEmissao').textContent = formatarData(conta.Data_Conta);
    document.getElementById('detDataVencimento').textContent = formatarData(conta.Data_Vencimento);
    document.getElementById('detDataPagamento').textContent =
        conta.Data_Pagamento ? formatarData(conta.Data_Pagamento) : 'NÃO PAGO';

    // Status
    const detStatusEl = document.getElementById('detStatus');
    let statusClass = 'status-aberta';
    let statusTexto = 'ABERTA';

    if (conta.Data_Pagamento) {
        statusClass = 'status-quitada';
        statusTexto = 'QUITADA';
    } else if (diasAtraso > 0) {
        statusClass = 'status-vencida';
        statusTexto = `VENCIDA (${diasAtraso} dias)`;
    }

    if (detStatusEl) {
        detStatusEl.className = `status-badge ${statusClass}`;
        detStatusEl.textContent = statusTexto;
    }
    */

    /*
    // Asaas básico (REMOVIDO - aba Asaas não existe mais)
    if (conta.agendamento_obs && conta.agendamento_obs.includes('asaas.com')) {
        const linkEl = document.getElementById('asaasLink');
        linkEl.href = conta.agendamento_obs;
        linkEl.textContent = '🔗 Abrir no Asaas';

        document.getElementById('asaasId').textContent = conta.agendamento_obs.split('/').pop();
        document.getElementById('asaasLinhaDigitavel').textContent = conta.Boleto_Linha_Digitável || '-';
    }
    */

    // Observações (MANTIDO - aba Observações ainda existe)
    if (conta.Observações && conta.Observações.trim()) {
        document.getElementById('detObservacoes').innerHTML =
            `<p>${conta.Observações.replace(/\n/g, '<br>')}</p>`;
    } else {
        document.getElementById('detObservacoes').innerHTML =
            `<p style="color: #9ca3af; font-style: italic;">Sem observações</p>`;
    }

    if (conta.Observacões_Pagamento && conta.Observacões_Pagamento.trim()) {
        document.getElementById('detObservacoesPagamento').innerHTML =
            `<p>${conta.Observacões_Pagamento.replace(/\n/g, '<br>')}</p>`;
    } else {
        document.getElementById('detObservacoesPagamento').innerHTML =
            `<p style="color: #9ca3af; font-style: italic;">Sem observações</p>`;
    }

    /*
    // Documento (REMOVIDO - não existe mais na aba Observações)
    document.getElementById('detDocumento').textContent = conta.Documento || '-';
    */
}

/*
// ============================================================
// FUNÇÃO REMOVIDA - ABA ASAAS NÃO EXISTE MAIS
// ============================================================
async function sincronizarComAsaas(codigoConta) {
    const btnSync = document.getElementById('btnSincronizarAsaas');
    const btnTextoOriginal = btnSync.textContent;

    try {
        btnSync.disabled = true;
        btnSync.textContent = '⏳ Sincronizando...';

        const token = localStorage.getItem('token');
        const response = await fetch(`/api/clientes/${clienteAtual.Codigo}/contas/${codigoConta}/asaas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensagem || 'Erro ao sincronizar');
        }

        const data = await response.json();
        preencherDadosAsaas(data.asaas, data.ambiente, data.ultimaSincronizacao);

        alert('✅ Sincronizado com sucesso!');

    } catch (error) {
        console.error('Erro ao sincronizar:', error);
        alert(`❌ Erro: ${error.message}`);
    } finally {
        btnSync.disabled = false;
        btnSync.textContent = btnTextoOriginal;
    }
}
*/

/*
function preencherDadosAsaas(asaas, ambiente, ultimaSync) {
    // Status
    const statusEl = document.getElementById('asaasStatus');
    const statusMap = {
        'PENDING': { class: 'status-aberta', text: 'AGUARDANDO' },
        'CONFIRMED': { class: 'status-quitada', text: 'CONFIRMADO' },
        'RECEIVED': { class: 'status-quitada', text: 'RECEBIDO' },
        'OVERDUE': { class: 'status-vencida', text: 'VENCIDO' },
        'REFUNDED': { class: 'status-badge', text: 'ESTORNADO' }
    };

    const statusInfo = statusMap[asaas.status] || { class: 'status-badge', text: asaas.status };
    statusEl.className = `status-badge ${statusInfo.class}`;
    statusEl.textContent = statusInfo.text;

    document.getElementById('asaasAmbiente').textContent = ambiente;
    document.getElementById('asaasMetodo').textContent = asaas.billingType || '-';
    document.getElementById('asaasValor').textContent =
        asaas.value ? `R$ ${formatarValor(asaas.value)}` : '-';
    document.getElementById('asaasDataConfirmacao').textContent =
        asaas.confirmedDate ? formatarData(asaas.confirmedDate) : '-';
    document.getElementById('asaasMulta').textContent =
        asaas.fine && asaas.fine.value ? `R$ ${formatarValor(asaas.fine.value)}` : '-';
    document.getElementById('asaasJuros').textContent =
        asaas.interest && asaas.interest.value ? `R$ ${formatarValor(asaas.interest.value)}` : '-';

    // PIX
    if (asaas.pixQrCodeId || asaas.pixCopyPaste) {
        const pixSection = document.getElementById('asaasPix');
        pixSection.style.display = 'block';

        if (asaas.pixCopyPaste) {
            document.getElementById('pixCopyPaste').value = asaas.pixCopyPaste;
        }

        // TODO: Exibir QR Code se tiver pixQrCodeId
    }

    // Última sincronização
    const dataSync = new Date(ultimaSync);
    document.getElementById('ultimaSincronizacao').textContent =
        `Última sincronização: ${dataSync.toLocaleString('pt-BR')}`;
}
*/

function fecharModalDetalhes() {
    const modal = document.getElementById('modalDetalhesConta');
    modal.classList.remove('show');
}

function inicializarModalTabs() {
    const tabs = document.querySelectorAll('.modal-tab, .modal-tab-compact');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.modalTab;

            // Atualizar botões
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Atualizar conteúdo
            document.querySelectorAll('.modal-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`modalTab${capitalize(targetTab)}`).classList.add('active');
        });
    });
}

function copiarPixCopyPaste() {
    const input = document.getElementById('pixCopyPaste');
    input.select();
    document.execCommand('copy');
    alert('✅ Código PIX copiado!');
}

// Fechar modal ao clicar fora
window.addEventListener('click', (event) => {
    const modal = document.getElementById('modalDetalhesConta');
    if (event.target === modal) {
        fecharModalDetalhes();
    }

    const modalPag = document.getElementById('modalMarcarPaga');
    if (event.target === modalPag) {
        fecharModalPagamento();
    }
});

// ============================================================
// MARCAR CONTA COMO PAGA
// ============================================================
let contaAtualPagamento = null;

async function abrirModalPagamento() {
    // Usar dados da variável global contaAtual (elementos foram removidos)
    if (!contaAtual) {
        alert('⚠️ Erro: nenhuma conta selecionada!');
        return;
    }

    const codigoConta = contaAtual.Codigo;
    const valorOriginal = `R$ ${formatarValor(contaAtual.Valor)}`;
    const descricao = contaAtual.Descrição || '-';

    contaAtualPagamento = {
        codigo: codigoConta,
        valor: valorOriginal,
        descricao: descricao
    };

    // Preencher campos do modal
    document.getElementById('pagConta').textContent = `#${codigoConta} - ${descricao}`;
    document.getElementById('pagValor').textContent = valorOriginal;

    // Preencher data de hoje
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('pagDataPagamento').value = hoje;

    // Preencher valor sugerido (sem formatação R$)
    const valorNumerico = valorOriginal.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    document.getElementById('pagValorPago').value = valorNumerico;

    // Limpar observações
    document.getElementById('pagObservacoes').value = '';

    // Resetar status Asaas
    document.getElementById('asaasStatusPagamento').style.display = 'block';
    document.getElementById('asaasDadosPagamento').style.display = 'none';
    document.getElementById('asaasSemIntegracao').style.display = 'none';

    // Abrir modal
    document.getElementById('modalMarcarPaga').classList.add('show');

    // Buscar dados do Asaas
    await buscarDadosAsaasPagamento(codigoConta);
}

async function buscarDadosAsaasDetalhes(codigoConta) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/clientes/${clienteAtual.Codigo}/contas/${codigoConta}/asaas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // ELEMENTOS REMOVIDOS - aba Asaas não existe mais
            // document.getElementById('detAsaasCarregando').style.display = 'none';
            // document.getElementById('detAsaasSemIntegracao').style.display = 'block';
            console.log('❌ Erro ao buscar Asaas:', response.status);
            return;
        }

        const data = await response.json();
        const asaas = data.asaas;

        // 🔍 VALIDAÇÃO: Verificar se externalReference bate com a conta
        console.log('📋 VALIDAÇÃO ASAAS:', {
            ContaBanco: codigoConta,
            ExternalRef: asaas.externalReference,
            PaymentID: asaas.id,
            Bate: asaas.externalReference == codigoConta
        });

        // ⚠️ ALERTA se não bater
        if (asaas.externalReference != codigoConta) {
            console.warn('⚠️ DADOS DO ASAAS SÃO DE OUTRA CONTA!');
            console.warn('   Conta atual:', codigoConta);
            console.warn('   External Ref:', asaas.externalReference);
            alert(`⚠️ ATENÇÃO: Os dados do Asaas são de outra conta!\n\nConta atual: ${codigoConta}\nExternal Reference: ${asaas.externalReference}`);
        }

        // Verificar se foi deletada primeiro
        let statusInfo;
        if (asaas.deleted === true) {
            statusInfo = { class: 'status-badge', text: 'CANCELADA', aviso: true };
        } else {
            const statusMap = {
                'PENDING': { class: 'status-aberta', text: 'AGUARDANDO' },
                'CONFIRMED': { class: 'status-quitada', text: 'CONFIRMADO' },
                'RECEIVED': { class: 'status-quitada', text: 'RECEBIDO' },
                'OVERDUE': { class: 'status-vencida', text: 'VENCIDO' }
            };
            statusInfo = statusMap[asaas.status] || { class: 'status-badge', text: asaas.status };
        }

        /*
        // Elementos da aba GERAL removidos - comentados
        document.getElementById('detAsaasStatus').className = `status-badge ${statusInfo.class}`;
        document.getElementById('detAsaasStatus').textContent = statusInfo.text;
        document.getElementById('detAsaasAvisoCancelada').style.display = statusInfo.aviso ? 'block' : 'none';

        document.getElementById('detAsaasId').textContent = asaas.id || '-';
        document.getElementById('detAsaasValor').textContent = asaas.value ? `R$ ${formatarValor(asaas.value)}` : '-';
        document.getElementById('detAsaasVencimento').textContent = asaas.dueDate ? formatarData(asaas.dueDate) : '-';
        document.getElementById('detAsaasForma').textContent = asaas.billingType || '-';
        document.getElementById('detAsaasLink').href = asaas.invoiceUrl || '#';

        document.getElementById('detAsaasCarregando').style.display = 'none';
        document.getElementById('detAsaasDados').style.display = 'block';
        */

        // Popular aba AÇÕES (MANTIDO)
        document.getElementById('acoesAsaasStatus').className = `status-badge ${statusInfo.class}`;
        document.getElementById('acoesAsaasStatus').textContent = statusInfo.text;
        document.getElementById('acoesAsaasAvisoCancelada').style.display = statusInfo.aviso ? 'block' : 'none';

        document.getElementById('acoesAsaasId').textContent = asaas.id || '-';
        document.getElementById('acoesAsaasValor').textContent = asaas.value ? `R$ ${formatarValor(asaas.value)}` : '-';
        document.getElementById('acoesAsaasVencimento').textContent = asaas.dueDate ? formatarData(asaas.dueDate) : '-';
        document.getElementById('acoesAsaasForma').textContent = asaas.billingType || '-';
        document.getElementById('acoesAsaasLink').href = asaas.invoiceUrl || '#';

        document.getElementById('acoesAsaasCarregando').style.display = 'none';
        document.getElementById('acoesAsaasDados').style.display = 'block';

    } catch (error) {
        console.error('Erro ao buscar Asaas (detalhes):', error);
        /*
        // Elementos da aba GERAL removidos
        document.getElementById('detAsaasCarregando').style.display = 'none';
        document.getElementById('detAsaasSemIntegracao').style.display = 'block';
        */
        // Aba ações (MANTIDO)
        document.getElementById('acoesAsaasCarregando').style.display = 'none';
        document.getElementById('acoesAsaasSemIntegracao').style.display = 'block';
    }
}

async function buscarDadosAsaasPagamento(codigoConta) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/clientes/${clienteAtual.Codigo}/contas/${codigoConta}/asaas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // Sem integração Asaas
            document.getElementById('asaasStatusPagamento').style.display = 'none';
            document.getElementById('asaasSemIntegracao').style.display = 'block';
            return;
        }

        const data = await response.json();
        const asaas = data.asaas;

        // Armazenar ID do Asaas para usar na baixa
        contaAtualPagamento.asaasId = asaas.id;
        contaAtualPagamento.ambiente = data.ambiente;

        // Preencher dados
        // ⚠️ IMPORTANTE: Verificar PRIMEIRO se foi deletada/cancelada
        let statusInfo;

        if (asaas.deleted === true) {
            // Cobrança foi CANCELADA/EXCLUÍDA no Asaas
            statusInfo = {
                class: 'status-badge',
                text: 'CANCELADA',
                aviso: true
            };
        } else {
            // Cobrança ativa - verificar status normal
            const statusMap = {
                'PENDING': { class: 'status-aberta', text: 'AGUARDANDO' },
                'CONFIRMED': { class: 'status-quitada', text: 'CONFIRMADO' },
                'RECEIVED': { class: 'status-quitada', text: 'RECEBIDO' },
                'OVERDUE': { class: 'status-vencida', text: 'VENCIDO' },
                'CANCELED': { class: 'status-badge', text: 'CANCELADA', aviso: true }
            };
            statusInfo = statusMap[asaas.status] || { class: 'status-badge', text: asaas.status };
        }

        const statusEl = document.getElementById('asaasPagStatus');
        statusEl.className = `status-badge ${statusInfo.class}`;
        statusEl.textContent = statusInfo.text;

        // Mostrar aviso se cobrança está cancelada
        const avisoEl = document.getElementById('asaasAvisoCancelada');
        if (avisoEl) {
            avisoEl.style.display = statusInfo.aviso ? 'block' : 'none';
        }

        document.getElementById('asaasPagId').textContent = asaas.id || '-';
        document.getElementById('asaasPagValor').textContent =
            asaas.value ? `R$ ${formatarValor(asaas.value)}` : '-';
        document.getElementById('asaasPagVencimento').textContent =
            asaas.dueDate ? formatarData(asaas.dueDate) : '-';
        document.getElementById('asaasPagForma').textContent = asaas.billingType || '-';

        // Mostrar Data de Pagamento e Valor Líquido se existirem
        if (asaas.paymentDate) {
            document.getElementById('asaasPagDataPagamento').textContent = formatarData(asaas.paymentDate);
            document.getElementById('asaasPagDataPagamentoField').style.display = 'block';
        } else {
            document.getElementById('asaasPagDataPagamentoField').style.display = 'none';
        }

        if (asaas.netValue) {
            document.getElementById('asaasPagValorLiquido').textContent = `R$ ${formatarValor(asaas.netValue)}`;
            document.getElementById('asaasPagValorLiquidoField').style.display = 'block';
        } else {
            document.getElementById('asaasPagValorLiquidoField').style.display = 'none';
        }

        const linkEl = document.getElementById('asaasPagLink');
        linkEl.href = asaas.invoiceUrl || '#';

        // Mostrar dados
        document.getElementById('asaasStatusPagamento').style.display = 'none';
        document.getElementById('asaasDadosPagamento').style.display = 'block';

    } catch (error) {
        console.error('Erro ao buscar Asaas:', error);
        document.getElementById('asaasStatusPagamento').style.display = 'none';
        document.getElementById('asaasSemIntegracao').style.display = 'block';
    }
}

function fecharModalPagamento() {
    document.getElementById('modalMarcarPaga').classList.remove('show');
    contaAtualPagamento = null;
}

async function confirmarPagamento() {
    try {
        // Validar campos
        const dataPagamento = document.getElementById('pagDataPagamento').value;
        const valorPago = document.getElementById('pagValorPago').value;
        const observacoes = document.getElementById('pagObservacoes').value.trim();
        const formaPagamento = document.getElementById('pagPortador').value;

        if (!dataPagamento || !valorPago || !formaPagamento) {
            alert('⚠️ Preencha todos os campos obrigatórios!');
            return;
        }

        if (parseFloat(valorPago) <= 0) {
            alert('⚠️ O valor pago deve ser maior que zero!');
            return;
        }

        // Confirmar ação
        if (!confirm('✅ Confirma o registro deste pagamento manual?')) {
            return;
        }

        // Enviar para API
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/contas/${contaAtualPagamento.codigo}/marcar-paga`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dataPagamento,
                valorPago: parseFloat(valorPago),
                formaPagamento,
                observacoes
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensagem || 'Erro ao registrar pagamento');
        }

        const data = await response.json();

        // Mensagem de sucesso detalhada
        let mensagem = '✅ PAGAMENTO REGISTRADO COM SUCESSO!\n\n';

        // Detalhes do Banco Local
        if (data.resumo && data.resumo.bancoLocal) {
            mensagem += '📊 ALTERADO NO BANCO DE DADOS:\n';
            const campos = data.resumo.bancoLocal.campos;
            for (const [campo, valor] of Object.entries(campos)) {
                mensagem += `   • ${campo}: ${valor}\n`;
            }
            mensagem += '\n';
        }

        // Detalhes do Asaas
        if (data.resumo && data.resumo.asaas) {
            if (data.resumo.asaas.alterado) {
                mensagem += '🏦 ALTERADO NO ASAAS:\n';
                mensagem += `   • Ação: ${data.resumo.asaas.acao}\n`;
                mensagem += `   • Status: ${data.resumo.asaas.status}\n`;
                mensagem += `   • Payment ID: ${data.resumo.asaas.paymentId}\n`;
            } else {
                mensagem += '⚠️ ASAAS:\n';
                mensagem += `   • Não alterado - ${data.resumo.asaas.motivo}\n`;
            }
            mensagem += '\n';
        }

        mensagem += '💡 Para ver esta conta novamente, mude o filtro para "Quitadas" ou "Todas".';

        alert(mensagem);

        // Fechar modais e recarregar lista
        fecharModalPagamento();
        fecharModalDetalhes();

        // Recarregar contas
        if (clienteAtual) {
            filtrarContas(clienteAtual.Codigo);
        }

    } catch (error) {
        console.error('Erro ao registrar pagamento:', error);
        alert(`❌ Erro: ${error.message}`);
    }
}

// ============================================================
// ADICIONAR OBSERVAÇÃO
// ============================================================
let contaAtualObservacao = null;

function abrirModalObservacao() {
    if (!contaAtual || !contaAtual.Codigo) {
        alert('⚠️ Nenhuma conta selecionada!');
        return;
    }

    contaAtualObservacao = { codigo: contaAtual.Codigo };
    document.getElementById('obsTexto').value = '';
    document.getElementById('modalObservacao').classList.add('show');
}

function fecharModalObservacao() {
    document.getElementById('modalObservacao').classList.remove('show');
    contaAtualObservacao = null;
}

async function salvarObservacao() {
    try {
        const obsTexto = document.getElementById('obsTexto').value.trim();

        if (!obsTexto) {
            alert('⚠️ Digite uma observação!');
            return;
        }

        if (!contaAtualObservacao) {
            alert('⚠️ Erro: conta não identificada!');
            return;
        }

        if (!confirm('✅ Salvar esta observação?')) {
            return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`/api/contas/${contaAtualObservacao.codigo}/observacao`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ observacao: obsTexto })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensagem || 'Erro ao salvar observação');
        }

        alert('✅ Observação salva com sucesso!');
        fecharModalObservacao();

        if (contaAtual) {
            await verDetalhesConta(contaAtual.Codigo);
        }
    } catch (error) {
        console.error('Erro ao salvar observação:', error);
        alert(`❌ Erro: ${error.message}`);
    }
}

// ============================================================
// ADICIONAR OBSERVAÇÕES (DIRETO NA ABA)
// ============================================================
async function adicionarObservacaoGeral() {
    try {
        const obsTexto = document.getElementById('obsGeralTexto').value.trim();

        if (!obsTexto) {
            alert('⚠️ Digite uma observação!');
            return;
        }

        if (!contaAtual) {
            alert('⚠️ Erro: conta não identificada!');
            return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`/api/contas/${contaAtual.Codigo}/observacao`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ observacao: obsTexto })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensagem || 'Erro ao salvar observação');
        }

        // Limpar textarea
        document.getElementById('obsGeralTexto').value = '';

        // Recarregar detalhes
        await verDetalhesConta(contaAtual.Codigo);

        alert('✅ Observação adicionada com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar observação:', error);
        alert(`❌ Erro: ${error.message}`);
    }
}

async function adicionarObservacaoPagamento() {
    try {
        const obsTexto = document.getElementById('obsPagamentoTexto').value.trim();

        if (!obsTexto) {
            alert('⚠️ Digite uma observação de pagamento!');
            return;
        }

        if (!contaAtual) {
            alert('⚠️ Erro: conta não identificada!');
            return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`/api/contas/${contaAtual.Codigo}/observacao-pagamento`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ observacao: obsTexto })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensagem || 'Erro ao salvar observação de pagamento');
        }

        // Limpar textarea
        document.getElementById('obsPagamentoTexto').value = '';

        // Recarregar detalhes
        await verDetalhesConta(contaAtual.Codigo);

        alert('✅ Observação de pagamento adicionada com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar observação de pagamento:', error);
        alert(`❌ Erro: ${error.message}`);
    }
}

// ============================================================
// CANCELAR COBRANÇA
// ============================================================
let contaAtualCancelamento = null;

function abrirModalCancelamento() {
    console.log('🔴 CLIQUE NO BOTÃO CANCELAR DETECTADO!');
    console.log('   contaAtual:', contaAtual);

    // Usar dados da variável global contaAtual
    if (!contaAtual) {
        alert('⚠️ Erro: nenhuma conta selecionada!');
        return;
    }

    const codigoConta = contaAtual.Codigo;
    const valorOriginal = `R$ ${formatarValor(contaAtual.Valor)}`;
    const descricao = contaAtual.Descrição || '-';

    contaAtualCancelamento = {
        codigo: codigoConta,
        valor: valorOriginal,
        descricao: descricao
    };

    // Preencher campos do modal
    document.getElementById('cancelConta').textContent = `#${codigoConta} - ${descricao}`;
    document.getElementById('cancelValor').textContent = valorOriginal;

    // Limpar campos
    document.getElementById('cancelMotivo').value = '';
    document.getElementById('cancelAsaas').checked = true;

    // Mostrar loading do Asaas
    document.getElementById('asaasStatusCancelamento').style.display = 'block';
    document.getElementById('asaasDadosCancelamento').style.display = 'none';

    // Abrir modal
    const modal = document.getElementById('modalCancelarCobranca');
    console.log('🔍 Modal encontrado?', !!modal);
    if (modal) {
        modal.classList.add('show');
        console.log('✅ MODAL ABERTO!');

        // Buscar dados do Asaas
        buscarDadosAsaasCancelamento(codigoConta);
    } else {
        console.error('❌ MODAL NÃO ENCONTRADO NO HTML!');
    }
}

function fecharModalCancelamento() {
    document.getElementById('modalCancelarCobranca').classList.remove('show');
    contaAtualCancelamento = null;
}

async function buscarDadosAsaasCancelamento(codigoConta) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/clientes/${clienteAtual.Codigo}/contas/${codigoConta}/asaas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // Sem integração Asaas
            document.getElementById('asaasStatusCancelamento').innerHTML = '<p style="color: #6b7280;">Sem integração com Asaas</p>';
            return;
        }

        const data = await response.json();
        const asaas = data.asaas;

        // Ocultar loading e mostrar dados
        document.getElementById('asaasStatusCancelamento').style.display = 'none';
        document.getElementById('asaasDadosCancelamento').style.display = 'block';

        // Preencher status
        let statusInfo;
        if (asaas.deleted === true) {
            statusInfo = { class: 'status-badge', text: 'CANCELADA', aviso: true };
            document.getElementById('asaasAvisoCanceladaCancel').style.display = 'block';
        } else {
            const statusMap = {
                'PENDING': { class: 'status-aberta', text: 'AGUARDANDO' },
                'CONFIRMED': { class: 'status-quitada', text: 'CONFIRMADO' },
                'RECEIVED': { class: 'status-quitada', text: 'RECEBIDO' },
                'OVERDUE': { class: 'status-vencida', text: 'VENCIDO' }
            };
            statusInfo = statusMap[asaas.status] || { class: 'status-badge', text: asaas.status };
            document.getElementById('asaasAvisoCanceladaCancel').style.display = 'none';
        }

        document.getElementById('asaasCancelStatus').textContent = statusInfo.text;
        document.getElementById('asaasCancelStatus').className = `status-badge ${statusInfo.class}`;

        // Preencher outros campos
        document.getElementById('asaasCancelId').textContent = asaas.id || '-';
        document.getElementById('asaasCancelValor').textContent = asaas.value ? `R$ ${asaas.value.toFixed(2)}` : '-';
        document.getElementById('asaasCancelVencimento').textContent = asaas.dueDate ? formatarData(asaas.dueDate) : '-';

    } catch (error) {
        console.error('Erro ao buscar Asaas (cancelamento):', error);
        document.getElementById('asaasStatusCancelamento').innerHTML = '<p style="color: #ef4444;">Erro ao buscar dados do Asaas</p>';
    }
}

async function confirmarCancelamento() {
    try {
        const motivo = document.getElementById('cancelMotivo').value.trim();
        const cancelarAsaas = document.getElementById('cancelAsaas').checked;

        // Validações
        if (!motivo) {
            alert('⚠️ Por favor, informe o motivo do cancelamento!');
            document.getElementById('cancelMotivo').focus();
            return;
        }

        if (!contaAtualCancelamento) {
            alert('⚠️ Erro: nenhuma conta selecionada!');
            return;
        }

        // Confirmar ação
        const confirma = confirm(`⚠️ ATENÇÃO!\n\nDeseja realmente CANCELAR esta cobrança?\n\nConta: #${contaAtualCancelamento.codigo}\nValor: ${contaAtualCancelamento.valor}\n\n${cancelarAsaas ? '✓ Será cancelada no Asaas também' : '✗ NÃO será cancelada no Asaas'}`);

        if (!confirma) {
            return;
        }

        // Desabilitar botão
        const btnConfirmar = event.target;
        btnConfirmar.disabled = true;
        btnConfirmar.textContent = '⏳ Cancelando...';

        // Enviar requisição
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/contas/${contaAtualCancelamento.codigo}/cancelar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                motivo: motivo,
                cancelarAsaas: cancelarAsaas
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensagem || 'Erro ao cancelar cobrança');
        }

        // Fechar modal
        fecharModalCancelamento();

        // Mostrar resultado
        let mensagem = '✅ Cobrança cancelada com sucesso!\n\n';

        if (data.resumo) {
            mensagem += '📋 RESUMO:\n\n';

            if (data.resumo.bancoLocal?.alterado) {
                mensagem += '✓ Registro local atualizado\n';
            }

            if (data.resumo.asaas?.alterado) {
                mensagem += `✓ Cancelada no Asaas (${data.resumo.asaas.status})\n`;
            } else if (data.resumo.asaas?.motivo) {
                mensagem += `⚠️ Asaas: ${data.resumo.asaas.motivo}\n`;
            }
        }

        alert(mensagem);

        // Recarregar lista de contas
        await carregarContasReceber(clienteAtual.Codigo);

        // Recarregar detalhes (se modal ainda aberto)
        if (document.getElementById('modalDetalhesConta').style.display === 'flex') {
            await verDetalhesConta(contaAtualCancelamento.codigo);
        }

    } catch (error) {
        console.error('Erro ao cancelar cobrança:', error);
        alert(`❌ Erro ao cancelar: ${error.message}`);

        // Reabilitar botão
        const btnConfirmar = document.querySelector('.btn-modal-danger');
        if (btnConfirmar) {
            btnConfirmar.disabled = false;
            btnConfirmar.textContent = '❌ Confirmar Cancelamento';
        }
    }
}

// ============================================================
// LOGOUT
// ============================================================
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Erro no logout:', error);
    } finally {
        window.location.href = '/';
    }
}

// V.2610292257

// Debug: Confirmar que funções foram carregadas
console.log('✅ CLIENTES.JS CARREGADO - V.2610292257');
console.log('✅ Função abrirModalCancelamento existe?', typeof abrirModalCancelamento === 'function');
console.log('✅ Função fecharModalCancelamento existe?', typeof fecharModalCancelamento === 'function');
console.log('✅ Função confirmarCancelamento existe?', typeof confirmarCancelamento === 'function');
