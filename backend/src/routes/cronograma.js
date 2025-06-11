const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// GET /api/cronograma - Listar cronograma de entregas
router.get('/', async (req, res) => {
  try {
    const { projeto_id } = req.query;
    
    if (!projeto_id) {
      return res.status(400).json({ error: 'projeto_id é obrigatório' });
    }
    
    const cronograma = await executeQuery(`
      SELECT * FROM cronograma_entregas
      WHERE projeto_id = ?
      ORDER BY fase_numero
    `, [projeto_id]);
    
    res.json({ data: cronograma });
  } catch (error) {
    console.error('Erro ao buscar cronograma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 