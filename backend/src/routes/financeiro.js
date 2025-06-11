const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const Joi = require('joi');

// Schema de validação para movimento financeiro
const financeiroSchema = Joi.object({
  contrato_id: Joi.number().integer().positive().required(),
  tipo_movimento: Joi.string().valid('entrada', 'saida').required(),
  descricao: Joi.string().min(3).max(255).required(),
  valor: Joi.number().precision(2).positive().required(),
  forma_pagamento: Joi.string().valid('pix', 'cartao_credito', 'boleto', 'dinheiro').allow(null),
  data_vencimento: Joi.date().allow(null),
  data_pagamento: Joi.date().allow(null),
  status: Joi.string().valid('em_aberto', 'pago', 'atrasado', 'cancelado').default('em_aberto'),
  numero_parcela: Joi.number().integer().min(1).allow(null),
  observacoes: Joi.string().allow('')
});

// GET /api/financeiro - Listar movimentos financeiros
router.get('/', async (req, res) => {
  try {
    const { 
      tipo_movimento, status, contrato_id, 
      data_inicio, data_fim, page = 1, limit = 10 
    } = req.query;
    
    let query = `
      SELECT f.*, c.numero_contrato, p.nome as projeto_nome,
        cl.nome_empresa, cl.nome_completo
      FROM financeiro f
      LEFT JOIN contratos c ON f.contrato_id = c.id
      LEFT JOIN projetos p ON c.projeto_id = p.id
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (tipo_movimento) {
      query += ' AND f.tipo_movimento = ?';
      params.push(tipo_movimento);
    }
    
    if (status) {
      query += ' AND f.status = ?';
      params.push(status);
    }
    
    if (contrato_id) {
      query += ' AND f.contrato_id = ?';
      params.push(contrato_id);
    }
    
    if (data_inicio) {
      query += ' AND f.data_vencimento >= ?';
      params.push(data_inicio);
    }
    
    if (data_fim) {
      query += ' AND f.data_vencimento <= ?';
      params.push(data_fim);
    }
    
    query += ' ORDER BY f.data_vencimento DESC, f.created_at DESC';
    
    // Paginação
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const movimentos = await executeQuery(query, params);
    
    // Contar total
    let countQuery = `
      SELECT COUNT(*) as total FROM financeiro f
      LEFT JOIN contratos c ON f.contrato_id = c.id
      WHERE 1=1
    `;
    const countParams = [];
    
    if (tipo_movimento) {
      countQuery += ' AND f.tipo_movimento = ?';
      countParams.push(tipo_movimento);
    }
    
    if (status) {
      countQuery += ' AND f.status = ?';
      countParams.push(status);
    }
    
    if (contrato_id) {
      countQuery += ' AND f.contrato_id = ?';
      countParams.push(contrato_id);
    }
    
    if (data_inicio) {
      countQuery += ' AND f.data_vencimento >= ?';
      countParams.push(data_inicio);
    }
    
    if (data_fim) {
      countQuery += ' AND f.data_vencimento <= ?';
      countParams.push(data_fim);
    }
    
    const [{ total }] = await executeQuery(countQuery, countParams);
    
    res.json({
      data: movimentos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar movimentos financeiros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/financeiro/:id - Buscar movimento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const movimentos = await executeQuery(`
      SELECT f.*, c.numero_contrato, c.valor_contrato,
        p.nome as projeto_nome, cl.nome_empresa, cl.nome_completo
      FROM financeiro f
      LEFT JOIN contratos c ON f.contrato_id = c.id
      LEFT JOIN projetos p ON c.projeto_id = p.id
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      WHERE f.id = ?
    `, [id]);
    
    if (movimentos.length === 0) {
      return res.status(404).json({ error: 'Movimento não encontrado' });
    }
    
    res.json({ data: movimentos[0] });
  } catch (error) {
    console.error('Erro ao buscar movimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/financeiro - Criar novo movimento
router.post('/', async (req, res) => {
  try {
    const { error, value } = financeiroSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => d.message)
      });
    }
    
    // Verificar se contrato existe
    const contratos = await executeQuery('SELECT id FROM contratos WHERE id = ?', [value.contrato_id]);
    if (contratos.length === 0) {
      return res.status(400).json({ error: 'Contrato não encontrado' });
    }
    
    const query = `
      INSERT INTO financeiro (
        contrato_id, tipo_movimento, descricao, valor, forma_pagamento,
        data_vencimento, data_pagamento, status, numero_parcela, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      value.contrato_id, value.tipo_movimento, value.descricao, value.valor,
      value.forma_pagamento, value.data_vencimento, value.data_pagamento,
      value.status, value.numero_parcela, value.observacoes
    ];
    
    const result = await executeQuery(query, params);
    
    res.status(201).json({
      message: 'Movimento criado com sucesso',
      data: { id: result.insertId, ...value }
    });
  } catch (error) {
    console.error('Erro ao criar movimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/financeiro/:id - Atualizar movimento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = financeiroSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => d.message)
      });
    }
    
    const query = `
      UPDATE financeiro SET
        contrato_id = ?, tipo_movimento = ?, descricao = ?, valor = ?,
        forma_pagamento = ?, data_vencimento = ?, data_pagamento = ?,
        status = ?, numero_parcela = ?, observacoes = ?
      WHERE id = ?
    `;
    
    const params = [
      value.contrato_id, value.tipo_movimento, value.descricao, value.valor,
      value.forma_pagamento, value.data_vencimento, value.data_pagamento,
      value.status, value.numero_parcela, value.observacoes, id
    ];
    
    const result = await executeQuery(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Movimento não encontrado' });
    }
    
    res.json({
      message: 'Movimento atualizado com sucesso',
      data: { id: parseInt(id), ...value }
    });
  } catch (error) {
    console.error('Erro ao atualizar movimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/financeiro/:id - Excluir movimento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery('DELETE FROM financeiro WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Movimento não encontrado' });
    }
    
    res.json({ message: 'Movimento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir movimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/financeiro/:id/pagar - Marcar como pago
router.put('/:id/pagar', async (req, res) => {
  try {
    const { id } = req.params;
    const { data_pagamento, forma_pagamento } = req.body;
    
    const query = `
      UPDATE financeiro SET
        status = 'pago',
        data_pagamento = ?,
        forma_pagamento = COALESCE(?, forma_pagamento)
      WHERE id = ?
    `;
    
    const params = [
      data_pagamento || new Date().toISOString().split('T')[0],
      forma_pagamento,
      id
    ];
    
    const result = await executeQuery(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Movimento não encontrado' });
    }
    
    res.json({ message: 'Movimento marcado como pago' });
  } catch (error) {
    console.error('Erro ao marcar como pago:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/financeiro/relatorio/fluxo-caixa - Relatório de fluxo de caixa
router.get('/relatorio/fluxo-caixa', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    
    const query = `
      SELECT 
        DATE_FORMAT(data_vencimento, '%Y-%m') as periodo,
        tipo_movimento,
        SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END) as realizado,
        SUM(CASE WHEN status != 'cancelado' THEN valor ELSE 0 END) as previsto,
        COUNT(*) as quantidade
      FROM financeiro
      WHERE data_vencimento BETWEEN COALESCE(?, DATE_SUB(NOW(), INTERVAL 6 MONTH)) 
        AND COALESCE(?, DATE_ADD(NOW(), INTERVAL 6 MONTH))
      GROUP BY DATE_FORMAT(data_vencimento, '%Y-%m'), tipo_movimento
      ORDER BY periodo DESC
    `;
    
    const fluxoCaixa = await executeQuery(query, [data_inicio, data_fim]);
    
    res.json({ data: fluxoCaixa });
  } catch (error) {
    console.error('Erro ao gerar relatório de fluxo de caixa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/financeiro/contas-receber - Contas a receber
router.get('/contas-receber', async (req, res) => {
  try {
    const { status = 'em_aberto', vencidas = 'false' } = req.query;
    
    let query = `
      SELECT f.*, c.numero_contrato, p.nome as projeto_nome,
        cl.nome_empresa, cl.nome_completo,
        DATEDIFF(f.data_vencimento, NOW()) as dias_vencimento
      FROM financeiro f
      LEFT JOIN contratos c ON f.contrato_id = c.id
      LEFT JOIN projetos p ON c.projeto_id = p.id
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      WHERE f.tipo_movimento = 'entrada'
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND f.status = ?';
      params.push(status);
    }
    
    if (vencidas === 'true') {
      query += ' AND f.data_vencimento < NOW()';
    }
    
    query += ' ORDER BY f.data_vencimento ASC';
    
    const contasReceber = await executeQuery(query, params);
    
    res.json({ data: contasReceber });
  } catch (error) {
    console.error('Erro ao buscar contas a receber:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 