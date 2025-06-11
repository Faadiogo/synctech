const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// GET /api/escopos - Listar escopos funcionais
router.get('/', async (req, res) => {
  try {
    const { projeto_id, status } = req.query;
    
    let query = `
      SELECT ef.*, te.nome as tipo_nome, te.cor_hex, p.nome as projeto_nome
      FROM escopos_funcionais ef
      LEFT JOIN tipos_escopo te ON ef.tipo_escopo_id = te.id
      LEFT JOIN projetos p ON ef.projeto_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (projeto_id) {
      query += ' AND ef.projeto_id = ?';
      params.push(projeto_id);
    }
    
    if (status) {
      query += ' AND ef.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY ef.ordem, ef.created_at';
    
    const escopos = await executeQuery(query, params);
    
    res.json({ data: escopos });
  } catch (error) {
    console.error('Erro ao buscar escopos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 