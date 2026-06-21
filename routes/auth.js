// ============================================================
// ROTAS DE AUTENTICAÇÃO (LOGIN/LOGOUT)
// V.2606181511
// ============================================================

import express from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db/connection.js';
import { gerarToken } from '../config/jwt.js';
import { autenticar } from '../middlewares/auth.js';

const router = express.Router();

// ============================================================
// POST /api/auth/login
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const result = await query(`
      SELECT
        u.id_usuario,
        u.id_grupo,
        u.id_empresa,
        u.nome,
        u.email,
        u.senha_hash,
        u.nivel_acesso,
        u.ativo,
        u.primeiro_acesso,
        g.nome as nome_grupo,
        e.nome as nome_empresa
      FROM mae_usuario u
      INNER JOIN mae_grupo g ON u.id_grupo = g.id_grupo
      LEFT JOIN mae_empresa e ON u.id_empresa = e.id_empresa
      WHERE u.email = $1
      AND u.ativo = TRUE
      AND g.ativo = TRUE
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    const usuario = result.rows[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    // Atualizar último acesso
    await query(`
      UPDATE mae_usuario
      SET ultimo_acesso = NOW()
      WHERE id_usuario = $1
    `, [usuario.id_usuario]);

    // Registrar auditoria
    await query(`
      INSERT INTO mae_auditoria (id_grupo, id_empresa, id_usuario, acao, descricao, ip_origem, user_agent)
      VALUES ($1, $2, $3, 'LOGIN', 'Login realizado com sucesso', $4, $5)
    `, [
      usuario.id_grupo,
      usuario.id_empresa,
      usuario.id_usuario,
      req.ip,
      req.headers['user-agent']
    ]);

    // Gerar token
    const token = gerarToken({
      id_usuario: usuario.id_usuario,
      id_grupo: usuario.id_grupo,
      id_empresa: usuario.id_empresa,
      email: usuario.email,
      nivel_acesso: usuario.nivel_acesso
    });

    // Enviar cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24h
    });

    // Retornar dados do usuário
    res.json({
      sucesso: true,
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        nivel_acesso: usuario.nivel_acesso,
        primeiro_acesso: usuario.primeiro_acesso,
        grupo: usuario.nome_grupo,
        empresa: usuario.nome_empresa
      },
      token
    });

  } catch (err) {
    console.error('❌ Erro no login:', err);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// ============================================================
// POST /api/auth/logout
// ============================================================
router.post('/logout', autenticar, async (req, res) => {
  try {
    // Registrar auditoria
    await query(`
      INSERT INTO mae_auditoria (id_grupo, id_empresa, id_usuario, acao, descricao, ip_origem)
      VALUES ($1, $2, $3, 'LOGOUT', 'Logout realizado', $4)
    `, [
      req.usuario.id_grupo,
      req.usuario.id_empresa,
      req.usuario.id_usuario,
      req.ip
    ]);

    // Limpar cookie
    res.clearCookie('token');

    res.json({ sucesso: true, mensagem: 'Logout realizado com sucesso' });

  } catch (err) {
    console.error('❌ Erro no logout:', err);
    res.status(500).json({ erro: 'Erro ao fazer logout' });
  }
});

// ============================================================
// GET /api/auth/me - Dados do usuário logado
// ============================================================
router.get('/me', autenticar, async (req, res) => {
  try {
    const result = await query(`
      SELECT
        u.id_usuario,
        u.id_grupo,
        u.id_empresa,
        u.nome,
        u.email,
        u.nivel_acesso,
        u.primeiro_acesso,
        g.nome as nome_grupo,
        e.nome as nome_empresa,
        e.logo_url,
        e.cor_primaria
      FROM mae_usuario u
      INNER JOIN mae_grupo g ON u.id_grupo = g.id_grupo
      LEFT JOIN mae_empresa e ON u.id_empresa = e.id_empresa
      WHERE u.id_usuario = $1
    `, [req.usuario.id_usuario]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error('❌ Erro ao buscar usuário:', err);
    res.status(500).json({ erro: 'Erro ao buscar dados do usuário' });
  }
});

export default router;

// V.2606181511
