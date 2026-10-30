// ============================================================
// SCRIPT DO DASHBOARD
// V.2606181544
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    if (!usuario) {
        window.location.href = '/';
        return;
    }

    // Exibir dados do usuário no header
    document.getElementById('nomeUsuario').textContent = usuario.nome;

    // Exibir dados do usuário na seção de informações
    document.getElementById('infoNome').textContent = usuario.nome;
    document.getElementById('infoEmail').textContent = usuario.email;
    document.getElementById('infoNivel').textContent = formatarNivelAcesso(usuario.nivel_acesso);
    document.getElementById('infoGrupo').textContent = usuario.grupo || '-';
    document.getElementById('infoEmpresa').textContent = usuario.empresa || '-';

    // Botão de logout
    document.getElementById('btnLogout').addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            console.error('Erro ao fazer logout:', err);
        } finally {
            localStorage.removeItem('usuario');
            window.location.href = '/';
        }
    });

    // Carregar estatísticas
    await carregarEstatisticas();
});

// Formatar nível de acesso
function formatarNivelAcesso(nivel) {
    const niveis = {
        'SUPER_ADMIN': 'Super Administrador',
        'MASTER_GRUPO': 'Master do Grupo',
        'ADMIN_EMPRESA': 'Administrador da Empresa',
        'OPERADOR': 'Operador',
        'FINANCEIRO': 'Financeiro',
        'CONSULTA': 'Consulta'
    };
    return niveis[nivel] || nivel;
}

// Carregar estatísticas do dashboard
async function carregarEstatisticas() {
    try {
        // Por enquanto, valores fixos
        // Depois vamos criar APIs para buscar do banco
        document.getElementById('totalClientes').textContent = '...';
        document.getElementById('totalEmbarcacoes').textContent = '...';
        document.getElementById('totalOrcamentos').textContent = '...';
        document.getElementById('totalContasReceber').textContent = '...';

        // TODO: Implementar chamadas para APIs de estatísticas
        // const stats = await fetch('/api/dashboard/stats').then(r => r.json());
        // document.getElementById('totalClientes').textContent = stats.clientes;
        // etc...

    } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
    }
}

// V.2606181544
