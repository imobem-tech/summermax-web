// ============================================================
// CONFIGURAÇÃO JWT (AUTENTICAÇÃO)
// V.2606181507
// ============================================================

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Gerar token
export const gerarToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
};

// Verificar token
export const verificarToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    throw new Error('Token inválido ou expirado');
  }
};

// Decodificar token (sem verificar)
export const decodificarToken = (token) => {
  return jwt.decode(token);
};

export default {
  gerarToken,
  verificarToken,
  decodificarToken
};

// V.2606181507
