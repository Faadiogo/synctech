const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// GET /api/tecnologias - Listar tecnologias
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;
    
    let query = 'SELECT * FROM tecnologias WHERE 1=1';
    const params = [];
    
    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }
    
    query += ' ORDER BY nome';
    
    const tecnologias = await executeQuery(query, params);
    
    res.json({ data: tecnologias });
  } catch (error) {
    console.error('Erro ao buscar tecnologias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 