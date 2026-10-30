// ============================================================
// ROTAS DE EMBARCAÇÕES (temporário para orçamentos)
// V.2606181626
// ============================================================

import express from 'express';
import { query } from '../db/connection.js';
import { autenticar } from '../middlewares/auth.js';

const router = express.Router();
router.use(autenticar);

// ============================================================
// GET /api/embarcacoes - Listar embarcações
// ============================================================
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        "Código" as id,
        "Nome_Embar" as nome,
        "Num_PB" as num_pb,
        "Tipo_Embar" as tipo,
        "Marca" as marca,
        "Modelo" as modelo
      FROM "P_BOAT_1_Embarcacao"
      WHERE id_grupo = $1
      ORDER BY "Nome_Embar"
      LIMIT 100
    `, [req.usuario.id_grupo]);

    res.json(result.rows);

  } catch (err) {
    console.error('❌ Erro ao listar embarcações:', err);
    res.status(500).json({ erro: 'Erro ao listar embarcações' });
  }
});

export default router;

// V.2606181626
