// ============================================================
// SCRIPT DE ORÇAMENTOS - LISTAGEM
// V.2606181609
// ============================================================

let paginaAtual = 1;
const limite = 20;

document.addEventListener('DOMContentLoaded', () => {
    // Botões
    document.getElementById('btnNovo').addEventListener('click', () => {
        window.location.href = '/orcamentos-novo.html';
    });

    document.getElementById('btnFiltrar').addEventListener('click', carregarOrcamentos);
    document.getElementById('btnLimpar').addEventListener('click', limparFiltros);

    // Enter no campo de busca
    document.getElementById('filtroBusca').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') carregarOrcamentos();
    });

    // Carregar orçamentos
    carregarOrcamentos();
});

async function carregarOrcamentos(pagina = 1) {
    paginaAtual = pagina;

    const status = document.getElementById('filtroStatus').value;
    const busca = document.getElementById('filtroBusca').value;

    const tbody = document.getElementById('tabelaOrcamentos');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Carregando...</td></tr>';

    try {
        const params = new URLSearchParams({
            limite,
            pagina: paginaAtual
        });

        if (status) params.append('status', status);

        const response = await fetch(`/api/orcamentos?${params}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar orçamentos');
        }

        const data = await response.json();

        if (data.orcamentos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">Nenhum orçamento encontrado</td></tr>';
            document.getElementById('paginacao').innerHTML = '';
            return;
        }

        // Filtro local por busca
        let orcamentos = data.orcamentos;
        if (busca) {
            const buscaLower = busca.toLowerCase();
            orcamentos = orcamentos.filter(orc =>
                orc.numero.toLowerCase().includes(buscaLower) ||
                orc.nome_embarcacao?.toLowerCase().includes(buscaLower) ||
                orc.descricao?.toLowerCase().includes(buscaLower)
            );
        }

        // Renderizar tabela
        tbody.innerHTML = orcamentos.map(orc => `
            <tr>
                <td><strong>${orc.numero}</strong></td>
                <td>${formatarData(orc.data_orcamento)}</td>
                <td>${orc.nome_embarcacao} <small>(${orc.num_pb})</small></td>
                <td>${orc.descricao}</td>
                <td><strong>${formatarMoeda(orc.valor_total)}</strong></td>
                <td><span class="status-badge status-${orc.status.toLowerCase()}">${orc.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="verOrcamento(${orc.id_orcamento})" title="Ver">
                            👁️
                        </button>
                        <button class="btn-icon btn-edit" onclick="editarOrcamento(${orc.id_orcamento})" title="Editar">
                            ✏️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Renderizar paginação
        renderizarPaginacao(data.total, data.pagina, data.limite);

    } catch (err) {
        console.error('Erro ao carregar orçamentos:', err);
        tbody.innerHTML = '<tr><td colspan="7" class="loading" style="color: red;">Erro ao carregar orçamentos</td></tr>';
    }
}

function renderizarPaginacao(total, paginaAtual, limite) {
    const totalPaginas = Math.ceil(total / limite);
    const paginacaoDiv = document.getElementById('paginacao');

    if (totalPaginas <= 1) {
        paginacaoDiv.innerHTML = '';
        return;
    }

    let html = `
        <button ${paginaAtual === 1 ? 'disabled' : ''} onclick="carregarOrcamentos(${paginaAtual - 1})">
            ‹ Anterior
        </button>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaAtual - 2 && i <= paginaAtual + 2)) {
            html += `
                <button class="${i === paginaAtual ? 'active' : ''}" onclick="carregarOrcamentos(${i})">
                    ${i}
                </button>
            `;
        } else if (i === paginaAtual - 3 || i === paginaAtual + 3) {
            html += '<button disabled>...</button>';
        }
    }

    html += `
        <button ${paginaAtual === totalPaginas ? 'disabled' : ''} onclick="carregarOrcamentos(${paginaAtual + 1})">
            Próxima ›
        </button>
    `;

    paginacaoDiv.innerHTML = html;
}

function limparFiltros() {
    document.getElementById('filtroStatus').value = '';
    document.getElementById('filtroBusca').value = '';
    carregarOrcamentos(1);
}

function verOrcamento(id) {
    window.location.href = `/orcamentos-ver.html?id=${id}`;
}

async function editarOrcamento(id) {
    console.log('✏️ Editando orçamento:', id);

    try {
        // Buscar dados do orçamento
        const response = await fetch(`/api/orcamentos/${id}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }

        const orc = await response.json();

        // Carregar modal HTML (se não estiver carregado)
        await carregarModalRateio();

        // Abrir modal de rateio
        await abrirModalRateio(id, orc.numero);

    } catch (err) {
        console.error('❌ Erro ao editar:', err);
        alert('Erro ao abrir orçamento para edição');
    }
}

// Carregar modal de rateio (mesma função do orc_novo.js)
async function carregarModalRateio() {
    const container = document.getElementById('modalRateioContainer');
    if (container && container.innerHTML) {
        return; // Já carregado
    }

    try {
        const response = await fetch('/orc_rateio_modal.html');
        const html = await response.text();
        if (container) {
            container.innerHTML = html;
        } else {
            // Criar container se não existir
            const div = document.createElement('div');
            div.id = 'modalRateioContainer';
            div.innerHTML = html;
            document.body.appendChild(div);
        }
    } catch (err) {
        console.error('❌ Erro ao carregar modal:', err);
    }
}

function formatarData(data) {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
}

function formatarMoeda(valor) {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// V.2606181609
