const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const Joi = require('joi');

const orcamentoSchema = Joi.object({
  cliente_id: Joi.number().integer().positive().required(),
  projeto_id: Joi.number().integer().positive().allow(null),
  arquivo_pdf_path: Joi.string().allow(''),
  data_envio: Joi.date().allow(null),
  data_validade: Joi.date().allow(null),
  valor_total: Joi.number().precision(2).min(0).required(),
  desconto: Joi.number().precision(2).min(0).default(0),
  valor_final: Joi.number().precision(2).min(0).required(),
  status: Joi.string().valid('rascunho', 'enviado', 'aprovado', 'recusado', 'expirado').default('rascunho'),
  observacoes: Joi.string().allow('')
});

// GET /api/orcamentos - Listar orçamentos
router.get('/', async (req, res) => {
  try {
    const { status, cliente_id, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT o.*, c.nome_empresa, c.nome_completo, p.nome as projeto_nome
      FROM orcamentos o
      LEFT JOIN clientes c ON o.cliente_id = c.id
      LEFT JOIN projetos p ON o.projeto_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    
    if (cliente_id) {
      query += ' AND o.cliente_id = ?';
      params.push(cliente_id);
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const orcamentos = await executeQuery(query, params);
    
    res.json({
      data: orcamentos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: orcamentos.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/orcamentos - Criar orçamento
router.post('/', async (req, res) => {
  try {
    const { error, value } = orcamentoSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => d.message)
      });
    }
    
    const query = `
      INSERT INTO orcamentos (
        cliente_id, projeto_id, arquivo_pdf_path, data_envio, data_validade,
        valor_total, desconto, valor_final, status, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      value.cliente_id, value.projeto_id, value.arquivo_pdf_path,
      value.data_envio, value.data_validade, value.valor_total,
      value.desconto, value.valor_final, value.status, value.observacoes
    ];
    
    const result = await executeQuery(query, params);
    
    res.status(201).json({
      message: 'Orçamento criado com sucesso',
      data: { id: result.insertId, ...value }
    });
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 