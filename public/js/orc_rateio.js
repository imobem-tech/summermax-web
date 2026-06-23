// ============================================================
// SCRIPT - RATEIO DE ORÇAMENTO
// V.2606221745
// ============================================================

let orcamentoAtual = null;
let cotistasRateio = [];
let statusOrcamento = 'RASCUNHO';

const TOLERANCIA_DIFERENCA = 2.00; // R$ 2,00

// ============================================================
// ABRIR MODAL DE RATEIO
// ============================================================
async function abrirModalRateio(idOrcamento, numero) {
    console.log('📊 Abrindo modal de rateio para orçamento:', idOrcamento);

    try {
        // Buscar dados do orçamento e rateio
        const response = await fetch(`/api/orcamentos/${idOrcamento}/rateios`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        orcamentoAtual = data;

        console.log('✅ Dados do rateio carregados:', data);

        // Preencher cabeçalho
        document.getElementById('rateioNumero').textContent = `#${numero}`;
        document.getElementById('rateioTitulo').textContent = data.titulo || data.descricao;
        document.getElementById('rateioEmbarcacao').textContent = data.embarcacao;
        document.getElementById('rateioValorTotal').textContent = formatarMoeda(data.valor_total);

        // Setar status
        statusOrcamento = data.status || 'RASCUNHO';
        atualizarStatusBadge(statusOrcamento);

        // Carregar cotistas
        cotistasRateio = data.cotistas.map(c => ({
            ...c,
            participando: c.participando !== false, // default true
            valor_editado: c.valor || c.valor_calculado
        }));

        renderizarTabelaCotistas();
        calcularResumo();

        // Configurar botões conforme status
        configurarBotoesPorStatus();

        // Mostrar modal
        document.getElementById('modalRateio').style.display = 'flex';

    } catch (err) {
        console.error('❌ Erro ao carregar rateio:', err);
        alert(`Erro ao carregar rateio: ${err.message}`);
    }
}

// ============================================================
// RENDERIZAR TABELA DE COTISTAS
// ============================================================
function renderizarTabelaCotistas() {
    const tbody = document.getElementById('rateioCotistasBody');
    const travado = statusOrcamento === 'APROVADO' || statusOrcamento === 'EM_EXECUCAO' || statusOrcamento === 'FINALIZADO';

    tbody.innerHTML = cotistasRateio.map(c => `
        <tr class="${!c.participando ? 'desmarcado' : ''}" data-cotista="${c.id_cliente}">
            <td>
                <input type="checkbox"
                       class="check-cotista"
                       data-id="${c.id_cliente}"
                       ${c.participando ? 'checked' : ''}
                       ${travado ? 'disabled' : ''}>
            </td>
            <td class="cotista-nome">${c.nome || 'Nome não disponível'}</td>
            <td class="cotista-grupo">${c.grupo_letra || 'N/A'}</td>
            <td class="cotista-cotas">
                ${c.cotas_calculadas || 0}
                (<span class="percentual">${c.percentual}%</span>)
            </td>
            <td class="cotista-valor">
                ${travado
                    ? formatarMoeda(c.valor_editado)
                    : `<input type="number"
                              class="input-valor-cotista"
                              data-id="${c.id_cliente}"
                              value="${c.valor_editado.toFixed(2)}"
                              min="0"
                              step="0.01"
                              ${!c.participando ? 'disabled' : ''}>`
                }
            </td>
            <td>
                ${!travado
                    ? `<button class="btn-excluir-cotista"
                               data-id="${c.id_cliente}"
                               ${cotistasRateio.filter(x => x.participando).length <= 1 ? 'disabled' : ''}>
                          🗑️
                       </button>`
                    : '-'
                }
            </td>
        </tr>
    `).join('');

    // Event listeners
    if (!travado) {
        // Checkboxes
        tbody.querySelectorAll('.check-cotista').forEach(check => {
            check.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                toggleCotista(id, e.target.checked);
            });
        });

        // Inputs de valor
        tbody.querySelectorAll('.input-valor-cotista').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = parseInt(e.target.dataset.id);
                const valor = parseFloat(e.target.value) || 0;
                atualizarValorCotista(id, valor);
            });
        });

        // Botões de excluir
        tbody.querySelectorAll('.btn-excluir-cotista').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                excluirCotista(id);
            });
        });
    }

    // Checkbox "Todos"
    const checkTodos = document.getElementById('checkTodos');
    if (checkTodos) {
        checkTodos.disabled = travado;
        checkTodos.checked = cotistasRateio.every(c => c.participando);
        checkTodos.indeterminate = cotistasRateio.some(c => c.participando) && !cotistasRateio.every(c => c.participando);

        if (!travado) {
            checkTodos.addEventListener('change', (e) => {
                cotistasRateio.forEach(c => {
                    c.participando = e.target.checked;
                    if (!e.target.checked) {
                        c.valor_editado = 0;
                    }
                });
                recalcularRateio();
            });
        }
    }
}

// ============================================================
// TOGGLE COTISTA (MARCAR/DESMARCAR)
// ============================================================
function toggleCotista(id, participando) {
    const cotista = cotistasRateio.find(c => c.id_cliente === id);
    if (!cotista) return;

    cotista.participando = participando;

    if (!participando) {
        cotista.valor_editado = 0;
    } else {
        // Recalcular valor proporcional
        recalcularRateio();
    }

    renderizarTabelaCotistas();
    calcularResumo();
}

// ============================================================
// ATUALIZAR VALOR DO COTISTA
// ============================================================
function atualizarValorCotista(id, valor) {
    const cotista = cotistasRateio.find(c => c.id_cliente === id);
    if (!cotista) return;

    cotista.valor_editado = valor;
    calcularResumo();
}

// ============================================================
// EXCLUIR COTISTA
// ============================================================
function excluirCotista(id) {
    const participantes = cotistasRateio.filter(c => c.participando);
    if (participantes.length <= 1) {
        alert('Não é possível excluir. Deve haver pelo menos 1 cotista participante.');
        return;
    }

    if (!confirm('Tem certeza que deseja excluir este cotista do rateio?')) {
        return;
    }

    const cotista = cotistasRateio.find(c => c.id_cliente === id);
    if (cotista) {
        cotista.participando = false;
        cotista.valor_editado = 0;
    }

    recalcularRateio();
}

// ============================================================
// RECALCULAR RATEIO (após exclusão/marcação)
// ============================================================
function recalcularRateio() {
    const participantes = cotistasRateio.filter(c => c.participando);
    if (participantes.length === 0) return;

    // Calcular total de cotas dos participantes
    const totalCotas = participantes.reduce((sum, c) => sum + (c.cotas_calculadas || 0), 0);

    if (totalCotas === 0) return;

    // Recalcular percentual e valor
    participantes.forEach(c => {
        c.percentual = ((c.cotas_calculadas / totalCotas) * 100).toFixed(2);
        c.valor_editado = (orcamentoAtual.valor_total * c.percentual / 100);
    });

    renderizarTabelaCotistas();
    calcularResumo();
}

// ============================================================
// CALCULAR RESUMO
// ============================================================
function calcularResumo() {
    const valorOrcamento = orcamentoAtual.valor_total;
    const valorDistribuido = cotistasRateio
        .filter(c => c.participando)
        .reduce((sum, c) => sum + (c.valor_editado || 0), 0);
    const diferenca = valorOrcamento - valorDistribuido;
    const qtdParticipantes = cotistasRateio.filter(c => c.participando).length;
    const qtdTotal = cotistasRateio.length;

    // Atualizar DOM
    document.getElementById('resumoOrcamento').textContent = formatarMoeda(valorOrcamento);
    document.getElementById('resumoDistribuido').textContent = formatarMoeda(valorDistribuido);
    document.getElementById('resumoDiferenca').textContent = formatarMoeda(Math.abs(diferenca));
    document.getElementById('resumoCotistas').textContent = `${qtdParticipantes} de ${qtdTotal}`;

    // Status de distribuído
    const statusDist = document.getElementById('statusDistribuido');
    if (Math.abs(diferenca) < 0.01) {
        statusDist.textContent = '✅';
        statusDist.className = 'status-ok';
    } else if (Math.abs(diferenca) <= TOLERANCIA_DIFERENCA) {
        statusDist.textContent = '⚠️';
        statusDist.className = 'status-warning';
    } else {
        statusDist.textContent = '❌';
        statusDist.className = 'status-error';
    }

    // Status de diferença
    const statusDif = document.getElementById('statusDiferenca');
    if (Math.abs(diferenca) < 0.01) {
        statusDif.textContent = '✅ Fechado!';
        statusDif.className = 'status-ok';
    } else if (Math.abs(diferenca) <= TOLERANCIA_DIFERENCA) {
        statusDif.textContent = '⚠️ Dentro da tolerância';
        statusDif.className = 'status-warning';
    } else if (diferenca > 0) {
        statusDif.textContent = `❌ Faltam ${formatarMoeda(diferenca)}!`;
        statusDif.className = 'status-error';
    } else {
        statusDif.textContent = `❌ Excesso de ${formatarMoeda(Math.abs(diferenca))}!`;
        statusDif.className = 'status-error';
    }

    // Habilitar/desabilitar botão Aprovar
    const btnAprovar = document.getElementById('btnAprovarRateio');
    if (statusOrcamento !== 'APROVADO' && statusOrcamento !== 'EM_EXECUCAO' && statusOrcamento !== 'FINALIZADO') {
        if (Math.abs(diferenca) <= TOLERANCIA_DIFERENCA && qtdParticipantes > 0) {
            btnAprovar.disabled = false;
            btnAprovar.title = '';
        } else {
            btnAprovar.disabled = true;
            btnAprovar.title = `Diferença deve ser ≤ R$ ${TOLERANCIA_DIFERENCA.toFixed(2)}`;
        }
    }
}

// ============================================================
// CONFIGURAR BOTÕES POR STATUS
// ============================================================
function configurarBotoesPorStatus() {
    const btnSalvar = document.getElementById('btnSalvarRateio');
    const btnAprovar = document.getElementById('btnAprovarRateio');
    const btnCobrancas = document.getElementById('btnGerarCobrancas');

    if (statusOrcamento === 'APROVADO' || statusOrcamento === 'EM_EXECUCAO' || statusOrcamento === 'FINALIZADO') {
        // Travado
        btnSalvar.style.display = 'none';
        btnAprovar.style.display = 'none';
        btnCobrancas.disabled = false;
    } else {
        // Editável
        btnSalvar.style.display = 'inline-block';
        btnAprovar.style.display = 'inline-block';
        btnCobrancas.disabled = true;
    }
}

// ============================================================
// ATUALIZAR STATUS BADGE
// ============================================================
function atualizarStatusBadge(status) {
    const badge = document.getElementById('rateioStatus');
    const statusMap = {
        'RASCUNHO': { icon: '🟡', text: 'RASCUNHO', class: 'status-rascunho' },
        'EM_APROVACAO': { icon: '🟠', text: 'EM APROVAÇÃO', class: 'status-em-aprovacao' },
        'APROVADO': { icon: '🟢', text: 'APROVADO 🔒', class: 'status-aprovado' },
        'EM_EXECUCAO': { icon: '🔵', text: 'EM EXECUÇÃO', class: 'status-em-execucao' },
        'FINALIZADO': { icon: '⚫', text: 'FINALIZADO', class: 'status-finalizado' }
    };

    const info = statusMap[status] || statusMap['RASCUNHO'];
    badge.className = `status-badge ${info.class}`;
    badge.innerHTML = `
        <span class="status-icon">${info.icon}</span>
        <span class="status-text">${info.text}</span>
    `;
}

// ============================================================
// SALVAR RATEIO
// ============================================================
async function salvarRateio() {
    console.log('💾 Salvando rateio...');

    const dados = {
        cotistas: cotistasRateio.map(c => ({
            id_cliente: c.id_cliente,
            id_autorizado: c.id,
            nome: c.nome,
            grupo_letra: c.grupo_letra,
            cotas: c.cotas_calculadas,
            percentual: parseFloat(c.percentual),
            valor: c.valor_editado,
            participando: c.participando
        })),
        resumo: {
            valor_orcamento: orcamentoAtual.valor_total,
            valor_distribuido: cotistasRateio.filter(c => c.participando).reduce((sum, c) => sum + c.valor_editado, 0),
            diferenca: orcamentoAtual.valor_total - cotistasRateio.filter(c => c.participando).reduce((sum, c) => sum + c.valor_editado, 0),
            qtd_participantes: cotistasRateio.filter(c => c.participando).length
        }
    };

    console.log('📤 Dados a enviar:', dados);

    try {
        const response = await fetch(`/api/orcamentos/${orcamentoAtual.id_orcamento}/rateios`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(dados)
        });

        const result = await response.json();

        if (response.ok) {
            alert(`✅ ${result.mensagem}`);

            // Atualizar status
            if (result.status_novo) {
                statusOrcamento = result.status_novo;
                atualizarStatusBadge(statusOrcamento);
                configurarBotoesPorStatus();
            }
        } else {
            alert(`❌ Erro: ${result.erro}`);
        }

    } catch (err) {
        console.error('❌ Erro ao salvar rateio:', err);
        alert('Erro ao salvar rateio. Verifique o console (F12).');
    }
}

// ============================================================
// APROVAR RATEIO
// ============================================================
function abrirConfirmacaoAprovacao() {
    const valorOrcamento = orcamentoAtual.valor_total;
    const valorDistribuido = cotistasRateio.filter(c => c.participando).reduce((sum, c) => sum + c.valor_editado, 0);
    const diferenca = valorOrcamento - valorDistribuido;
    const qtdParticipantes = cotistasRateio.filter(c => c.participando).length;

    // Validar
    if (Math.abs(diferenca) > TOLERANCIA_DIFERENCA) {
        alert(`❌ Não é possível aprovar.\n\nDiferença atual: ${formatarMoeda(Math.abs(diferenca))}\nDiferença máxima permitida: R$ ${TOLERANCIA_DIFERENCA.toFixed(2)}`);
        return;
    }

    // Preencher modal de confirmação
    document.getElementById('aprovOrcamento').textContent = formatarMoeda(valorOrcamento);
    document.getElementById('aprovDistribuido').textContent = formatarMoeda(valorDistribuido);
    document.getElementById('aprovDiferenca').textContent = formatarMoeda(Math.abs(diferenca));
    document.getElementById('aprovCotistas').textContent = qtdParticipantes;

    const aprovStatus = document.getElementById('aprovStatus');
    if (Math.abs(diferenca) < 0.01) {
        aprovStatus.textContent = '✅';
        aprovStatus.className = 'status-ok';
    } else {
        aprovStatus.textContent = '⚠️';
        aprovStatus.className = 'status-warning';
    }

    // Mostrar modal
    document.getElementById('modalConfirmarAprovacao').style.display = 'flex';
}

async function confirmarAprovacao() {
    console.log('✅ Confirmando aprovação...');

    try {
        const response = await fetch(`/api/orcamentos/${orcamentoAtual.id_orcamento}/aprovar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok) {
            alert(`✅ ${result.mensagem}`);

            // Fechar modal de confirmação
            document.getElementById('modalConfirmarAprovacao').style.display = 'none';

            // Atualizar status
            statusOrcamento = 'APROVADO';
            atualizarStatusBadge(statusOrcamento);
            configurarBotoesPorStatus();
            renderizarTabelaCotistas();

        } else {
            alert(`❌ Erro: ${result.erro}`);
        }

    } catch (err) {
        console.error('❌ Erro ao aprovar:', err);
        alert('Erro ao aprovar. Verifique o console (F12).');
    }
}

// ============================================================
// FORMATAÇÃO
// ============================================================
function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// ============================================================
// EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Fechar modal rateio
    document.getElementById('btnFecharRateio')?.addEventListener('click', () => {
        document.getElementById('modalRateio').style.display = 'none';
    });

    document.getElementById('btnCancelarRateio')?.addEventListener('click', () => {
        document.getElementById('modalRateio').style.display = 'none';
    });

    // Salvar rateio
    document.getElementById('btnSalvarRateio')?.addEventListener('click', salvarRateio);

    // Aprovar
    document.getElementById('btnAprovarRateio')?.addEventListener('click', abrirConfirmacaoAprovacao);

    // Confirmação de aprovação
    document.getElementById('btnNaoAprovar')?.addEventListener('click', () => {
        document.getElementById('modalConfirmarAprovacao').style.display = 'none';
    });

    document.getElementById('btnSimAprovar')?.addEventListener('click', confirmarAprovacao);

    // Gerar cobranças (placeholder)
    document.getElementById('btnGerarCobrancas')?.addEventListener('click', () => {
        alert('🚧 Funcionalidade de geração de cobranças será implementada em breve!');
    });

    // Fechar modal ao clicar fora
    document.getElementById('modalRateio')?.addEventListener('click', (e) => {
        if (e.target.id === 'modalRateio') {
            document.getElementById('modalRateio').style.display = 'none';
        }
    });

    document.getElementById('modalConfirmarAprovacao')?.addEventListener('click', (e) => {
        if (e.target.id === 'modalConfirmarAprovacao') {
            document.getElementById('modalConfirmarAprovacao').style.display = 'none';
        }
    });
});

// V.2606221745
