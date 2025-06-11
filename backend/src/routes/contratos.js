const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// GET /api/contratos - Listar contratos
router.get('/', async (req, res) => {
  try {
    const { status, cliente_id, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT c.*, cl.nome_empresa, cl.nome_completo, p.nome as projeto_nome
      FROM contratos c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN projetos p ON c.projeto_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }
    
    if (cliente_id) {
      query += ' AND c.cliente_id = ?';
      params.push(cliente_id);
    }
    
    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), parseInt(offset));
    
    const contratos = await executeQuery(query, params);
    
    res.json({ data: contratos });
  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 