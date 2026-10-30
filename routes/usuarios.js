// ============================================================
// ROTAS DE USUÁRIOS - V.2610292330
// API de gerenciamento de usuários
// ============================================================

import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db/connection.js';
import { autenticar } from '../middlewares/auth.js';

const router = express.Router();

// ============================================================
// LISTAR USUÁRIOS
// GET /api/usuarios
// ============================================================
router.get('/', autenticar, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id_usuario,
                u.id_grupo,
                u.id_empresa,
                u.nome,
                u.email,
                u.nivel_acesso,
                u.primeiro_acesso,
                u.ativo,
                u.data_criacao,
                u.ultimo_login,
                g.nome as nome_grupo,
                e.nome as nome_empresa
            FROM public."Usuarios" u
            LEFT JOIN public."Grupos" g ON u.id_grupo = g.id_grupo
            LEFT JOIN public."Empresas" e ON u.id_empresa = e.id_empresa
            ORDER BY u.nome
        `);

        res.json({
            sucesso: true,
            usuarios: result.rows
        });

    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar usuários',
            erro: error.message
        });
    }
});

// ============================================================
// CRIAR NOVO USUÁRIO
// POST /api/usuarios
// ============================================================
router.post('/', autenticar, async (req, res) => {
    try {
        const {
            nome,
            email,
            senha,
            id_grupo,
            id_empresa,
            nivel_acesso
        } = req.body;

        // Validações
        if (!nome || !email || !senha || !id_grupo || !nivel_acesso) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Campos obrigatórios: nome, email, senha, id_grupo, nivel_acesso'
            });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Email inválido'
            });
        }

        // Validar senha (mínimo 8 caracteres)
        if (senha.length < 8) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Senha deve ter no mínimo 8 caracteres'
            });
        }

        // Verificar se email já existe
        const emailExiste = await pool.query(`
            SELECT id_usuario
            FROM public."Usuarios"
            WHERE email = $1
        `, [email.toLowerCase()]);

        if (emailExiste.rows.length > 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Este email já está cadastrado'
            });
        }

        // Hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Inserir usuário
        const result = await pool.query(`
            INSERT INTO public."Usuarios" (
                id_grupo,
                id_empresa,
                nome,
                email,
                senha_hash,
                nivel_acesso,
                primeiro_acesso,
                ativo,
                data_criacao
            ) VALUES ($1, $2, $3, $4, $5, $6, true, true, NOW())
            RETURNING
                id_usuario,
                nome,
                email,
                nivel_acesso,
                ativo,
                data_criacao
        `, [
            id_grupo,
            id_empresa || null,
            nome,
            email.toLowerCase(),
            senhaHash,
            nivel_acesso
        ]);

        const novoUsuario = result.rows[0];

        res.status(201).json({
            sucesso: true,
            mensagem: 'Usuário cadastrado com sucesso',
            usuario: novoUsuario
        });

    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao criar usuário',
            erro: error.message
        });
    }
});

// ============================================================
// BUSCAR GRUPOS (para o select)
// GET /api/usuarios/grupos
// ============================================================
router.get('/grupos', autenticar, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id_grupo, nome
            FROM public."Grupos"
            ORDER BY nome
        `);

        res.json({
            sucesso: true,
            grupos: result.rows
        });

    } catch (error) {
        console.error('Erro ao buscar grupos:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar grupos',
            erro: error.message
        });
    }
});

// ============================================================
// BUSCAR EMPRESAS (para o select)
// GET /api/usuarios/empresas
// ============================================================
router.get('/empresas', autenticar, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id_empresa, nome
            FROM public."Empresas"
            ORDER BY nome
        `);

        res.json({
            sucesso: true,
            empresas: result.rows
        });

    } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar empresas',
            erro: error.message
        });
    }
});

export default router;

// V.2610292330
