const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// GET /api/reunioes - Listar reuniões
router.get('/', async (req, res) => {
  try {
    const { status, projeto_id, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT r.*, p.nome as projeto_nome, c.nome_empresa, c.nome_completo
      FROM reunioes r
      LEFT JOIN projetos p ON r.projeto_id = p.id
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }
    
    if (projeto_id) {
      query += ' AND r.projeto_id = ?';
      params.push(projeto_id);
    }
    
    query += ' ORDER BY r.data_reuniao DESC LIMIT ? OFFSET ?';
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), parseInt(offset));
    
    const reunioes = await executeQuery(query, params);
    
    res.json({ data: reunioes });
  } catch (error) {
    console.error('Erro ao buscar reuniões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 