// ============================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// V.2606181509
// ============================================================

import { verificarToken } from '../config/jwt.js';

// Verificar se usuário está autenticado
export const autenticar = (req, res, next) => {
  try {
    // Pegar token do cookie ou header
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    // Verificar token
    const decoded = verificarToken(token);
    req.usuario = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

// Verificar nível de acesso
export const autorizar = (...niveisPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }

    if (!niveisPermitidos.includes(req.usuario.nivel_acesso)) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    next();
  };
};

// Verificar se pode acessar grupo
export const verificarGrupo = (req, res, next) => {
  const { id_grupo } = req.params;

  // SUPER_ADMIN acessa tudo
  if (req.usuario.nivel_acesso === 'SUPER_ADMIN') {
    return next();
  }

  // Verificar se usuário pertence ao grupo
  if (req.usuario.id_grupo !== parseInt(id_grupo)) {
    return res.status(403).json({ erro: 'Acesso negado a este grupo' });
  }

  next();
};

// Verificar se pode acessar empresa
export const verificarEmpresa = (req, res, next) => {
  const { id_empresa } = req.params;

  // SUPER_ADMIN e MASTER_GRUPO acessam tudo
  if (['SUPER_ADMIN', 'MASTER_GRUPO'].includes(req.usuario.nivel_acesso)) {
    return next();
  }

  // Verificar se usuário pertence à empresa
  if (req.usuario.id_empresa !== parseInt(id_empresa)) {
    return res.status(403).json({ erro: 'Acesso negado a esta empresa' });
  }

  next();
};

export default {
  autenticar,
  autorizar,
  verificarGrupo,
  verificarEmpresa
};

// V.2606181509
