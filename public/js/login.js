// ============================================================
// SCRIPT DA TELA DE LOGIN
// V.2610291127
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const erroDiv = document.getElementById('erro');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Limpar erro anterior
        erroDiv.style.display = 'none';
        erroDiv.textContent = '';

        // Pegar dados do formulário
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;

        if (!email || !senha) {
            mostrarErro('Por favor, preencha todos os campos');
            return;
        }

        // Desabilitar botão
        const btn = form.querySelector('.btn-login');
        const textoOriginal = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Entrando...';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (response.ok) {
                // Login bem-sucedido
                console.log('Login bem-sucedido:', data);

                // Salvar token JWT e dados do usuário no localStorage
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                localStorage.setItem('usuario', JSON.stringify(data.usuario));

                // Redirecionar para dashboard
                window.location.href = '/dashboard.html';
            } else {
                // Erro no login
                mostrarErro(data.erro || 'Erro ao fazer login');
                btn.disabled = false;
                btn.textContent = textoOriginal;
            }

        } catch (err) {
            console.error('Erro no login:', err);
            mostrarErro('Erro ao conectar com o servidor');
            btn.disabled = false;
            btn.textContent = textoOriginal;
        }
    });

    function mostrarErro(mensagem) {
        erroDiv.textContent = mensagem;
        erroDiv.style.display = 'block';
    }
});

// V.2610291127
