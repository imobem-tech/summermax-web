// V.2610292330

console.log('✅ USUARIOS.JS CARREGADO - V.2610292330');

// ============================================================
// INICIALIZAÇÃO
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    carregarGrupos();
    carregarEmpresas();
    listarUsuarios();
});

// ============================================================
// CARREGAR GRUPOS
// ============================================================
async function carregarGrupos() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/usuarios/grupos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar grupos');
        }

        const data = await response.json();
        const select = document.getElementById('grupo');

        select.innerHTML = '<option value="">Selecione um grupo</option>';

        data.grupos.forEach(grupo => {
            const option = document.createElement('option');
            option.value = grupo.id_grupo;
            option.textContent = grupo.nome;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Erro ao carregar grupos:', error);
        alert('❌ Erro ao carregar grupos');
    }
}

// ============================================================
// CARREGAR EMPRESAS
// ============================================================
async function carregarEmpresas() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/usuarios/empresas', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar empresas');
        }

        const data = await response.json();
        const select = document.getElementById('empresa');

        select.innerHTML = '<option value="">Todas (opcional)</option>';

        data.empresas.forEach(empresa => {
            const option = document.createElement('option');
            option.value = empresa.id_empresa;
            option.textContent = empresa.nome;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        alert('❌ Erro ao carregar empresas');
    }
}

// ============================================================
// LISTAR USUÁRIOS
// ============================================================
async function listarUsuarios() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/usuarios', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao listar usuários');
        }

        const data = await response.json();
        const container = document.getElementById('listaUsuarios');

        if (data.usuarios.length === 0) {
            container.innerHTML = '<p class="vazio">Nenhum usuário cadastrado</p>';
            return;
        }

        let html = '<table class="tabela-usuarios">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>Nome</th>';
        html += '<th>Email</th>';
        html += '<th>Grupo</th>';
        html += '<th>Empresa</th>';
        html += '<th>Nível</th>';
        html += '<th>Status</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';

        data.usuarios.forEach(usuario => {
            const statusClass = usuario.ativo ? 'status-ativo' : 'status-inativo';
            const statusText = usuario.ativo ? '✅ Ativo' : '❌ Inativo';

            html += '<tr>';
            html += `<td>${usuario.nome}</td>`;
            html += `<td>${usuario.email}</td>`;
            html += `<td>${usuario.nome_grupo || '-'}</td>`;
            html += `<td>${usuario.nome_empresa || 'Todas'}</td>`;
            html += `<td>${usuario.nivel_acesso}</td>`;
            html += `<td><span class="${statusClass}">${statusText}</span></td>`;
            html += '</tr>';
        });

        html += '</tbody>';
        html += '</table>';

        container.innerHTML = html;

    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        document.getElementById('listaUsuarios').innerHTML =
            '<p class="erro">❌ Erro ao carregar usuários</p>';
    }
}

// ============================================================
// CADASTRAR USUÁRIO
// ============================================================
async function cadastrarUsuario(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const grupo = document.getElementById('grupo').value;
    const empresa = document.getElementById('empresa').value;
    const nivelAcesso = document.getElementById('nivelAcesso').value;

    // Validar senha
    if (senha !== confirmarSenha) {
        alert('❌ As senhas não coincidem!');
        return;
    }

    if (senha.length < 8) {
        alert('❌ A senha deve ter no mínimo 8 caracteres!');
        return;
    }

    // Confirmação
    if (!confirm(`✅ Confirma o cadastro do usuário?\n\nNome: ${nome}\nEmail: ${email}\nNível: ${nivelAcesso}`)) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/usuarios', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome,
                email,
                senha,
                id_grupo: parseInt(grupo),
                id_empresa: empresa ? parseInt(empresa) : null,
                nivel_acesso: nivelAcesso
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensagem || 'Erro ao cadastrar usuário');
        }

        alert(`✅ USUÁRIO CADASTRADO COM SUCESSO!\n\nNome: ${data.usuario.nome}\nEmail: ${data.usuario.email}\n\n💡 O usuário pode fazer login agora com as credenciais cadastradas.`);

        // Limpar formulário e recarregar lista
        limparFormulario();
        listarUsuarios();

    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        alert(`❌ ${error.message}`);
    }
}

// ============================================================
// TOGGLE SENHA (MOSTRAR/OCULTAR)
// ============================================================
function toggleSenha(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// ============================================================
// LIMPAR FORMULÁRIO
// ============================================================
function limparFormulario() {
    document.getElementById('formNovoUsuario').reset();
    document.getElementById('primeiroAcesso').checked = true;
    document.getElementById('ativo').checked = true;
}

// ============================================================
// VOLTAR AO DASHBOARD
// ============================================================
function voltarDashboard() {
    window.location.href = '/dashboard.html';
}

// V.2610292330
