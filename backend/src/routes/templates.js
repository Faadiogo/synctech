const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// GET /api/templates - Listar templates de contrato
router.get('/', async (req, res) => {
  try {
    const { ativo } = req.query;
    
    let query = 'SELECT * FROM templates_contrato WHERE 1=1';
    const params = [];
    
    if (ativo !== undefined) {
      query += ' AND ativo = ?';
      params.push(ativo === 'true');
    }
    
    query += ' ORDER BY nome';
    
    const templates = await executeQuery(query, params);
    
    res.json({ data: templates });
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 