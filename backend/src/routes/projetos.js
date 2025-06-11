const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const Joi = require('joi');

// Schema de validação para projeto
const projetoSchema = Joi.object({
  cliente_id: Joi.number().integer().positive().required(),
  nome: Joi.string().min(3).max(255).required(),
  descricao: Joi.string().allow(''),
  tecnologias: Joi.array().items(Joi.string()).default([]),
  status: Joi.string().valid(
    'nao_iniciado', 'planejamento', 'apresentado', 'orcamento_entregue',
    'orcamento_aprovado', 'contrato_assinado', 'entregue', 'suporte_garantia', 'concluido'
  ).default('nao_iniciado'),
  data_inicio: Joi.date().allow(null),
  data_alvo: Joi.date().allow(null),
  data_conclusao: Joi.date().allow(null),
  horas_estimadas: Joi.number().precision(2).min(0).allow(null),
  valor_estimado: Joi.number().precision(2).min(0).allow(null),
  observacoes: Joi.string().allow('')
});

// GET /api/projetos - Listar todos os projetos
router.get('/', async (req, res) => {
  try {
    const { status, cliente_id, busca, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT p.*, c.nome_empresa, c.nome_completo,
        COUNT(DISTINCT t.id) as total_tarefas,
        COUNT(CASE WHEN t.status = 'concluida' THEN 1 END) as tarefas_concluidas,
        ROUND(COUNT(CASE WHEN t.status = 'concluida' THEN 1 END) * 100.0 / NULLIF(COUNT(DISTINCT t.id), 0), 2) as progresso_calculado
      FROM projetos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN escopos_funcionais ef ON p.id = ef.projeto_id
      LEFT JOIN funcionalidades f ON ef.id = f.escopo_funcional_id
      LEFT JOIN subfuncionalidades sf ON f.id = sf.funcionalidade_id
      LEFT JOIN subitens si ON sf.id = si.subfuncionalidade_id
      LEFT JOIN tarefas t ON si.id = t.subitem_id
      WHERE 1=1
    `;
    
    const params = [];
    
    let paramIndex = 1;
    
    if (status) {
      query += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (cliente_id) {
      query += ` AND p.cliente_id = $${paramIndex}`;
      params.push(cliente_id);
      paramIndex++;
    }
    
    if (busca) {
      query += ` AND (p.nome ILIKE $${paramIndex} OR p.descricao ILIKE $${paramIndex + 1} OR c.nome_empresa ILIKE $${paramIndex + 2} OR c.nome_completo ILIKE $${paramIndex + 3})`;
      const searchTerm = `%${busca}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      paramIndex += 4;
    }
    
    query += ' GROUP BY p.id ORDER BY p.created_at DESC';
    
    // Paginação
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const projetos = await executeQuery(query, params);
    
    // Contar total para paginação
    let countQuery = 'SELECT COUNT(DISTINCT p.id) as total FROM projetos p LEFT JOIN clientes c ON p.cliente_id = c.id WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;
    
    if (status) {
      countQuery += ` AND p.status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }
    
    if (cliente_id) {
      countQuery += ` AND p.cliente_id = $${countParamIndex}`;
      countParams.push(cliente_id);
      countParamIndex++;
    }
    
    if (busca) {
      countQuery += ` AND (p.nome ILIKE $${countParamIndex} OR p.descricao ILIKE $${countParamIndex + 1} OR c.nome_empresa ILIKE $${countParamIndex + 2} OR c.nome_completo ILIKE $${countParamIndex + 3})`;
      const searchTerm = `%${busca}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const totalResult = await executeQuery(countQuery, countParams);
    const total = totalResult[0].total;
    
    res.json({
      data: projetos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/projetos/:id - Buscar projeto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const projetos = await executeQuery(`
      SELECT p.*, c.nome_empresa, c.nome_completo, c.email, c.telefone,
        COUNT(DISTINCT t.id) as total_tarefas,
        COUNT(CASE WHEN t.status = 'concluida' THEN 1 END) as tarefas_concluidas,
        ROUND(COUNT(CASE WHEN t.status = 'concluida' THEN 1 END) * 100.0 / NULLIF(COUNT(DISTINCT t.id), 0), 2) as progresso_calculado
      FROM projetos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN escopos_funcionais ef ON p.id = ef.projeto_id
      LEFT JOIN funcionalidades f ON ef.id = f.escopo_funcional_id
      LEFT JOIN subfuncionalidades sf ON f.id = sf.funcionalidade_id
      LEFT JOIN subitens si ON sf.id = si.subfuncionalidade_id
      LEFT JOIN tarefas t ON si.id = t.subitem_id
      WHERE p.id = $1
      GROUP BY p.id
    `, [id]);
    
    if (projetos.length === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    res.json({ data: projetos[0] });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/projetos - Criar novo projeto
router.post('/', async (req, res) => {
  try {
    const { error, value } = projetoSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => d.message)
      });
    }
    
    // Verificar se cliente existe
    const clientes = await executeQuery('SELECT id FROM clientes WHERE id = $1 AND ativo = true', [value.cliente_id]);
    if (clientes.length === 0) {
      return res.status(400).json({ error: 'Cliente não encontrado ou inativo' });
    }
    
    const query = `
      INSERT INTO projetos (
        cliente_id, nome, descricao, tecnologias, status,
        data_inicio, data_alvo, data_conclusao, horas_estimadas,
        valor_estimado, observacoes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `;
    
    const params = [
      value.cliente_id, value.nome, value.descricao,
      JSON.stringify(value.tecnologias), value.status,
      value.data_inicio, value.data_alvo, value.data_conclusao,
      value.horas_estimadas, value.valor_estimado, value.observacoes
    ];
    
    const result = await executeQuery(query, params);
    
    res.status(201).json({
      message: 'Projeto criado com sucesso',
      data: { id: result[0].id, ...value }
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/projetos/:id - Atualizar projeto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = projetoSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => d.message)
      });
    }
    
    // Verificar se cliente existe
    const clientes = await executeQuery('SELECT id FROM clientes WHERE id = $1 AND ativo = true', [value.cliente_id]);
    if (clientes.length === 0) {
      return res.status(400).json({ error: 'Cliente não encontrado ou inativo' });
    }
    
    const query = `
      UPDATE projetos SET
        cliente_id = $1, nome = $2, descricao = $3, tecnologias = $4,
        status = $5, data_inicio = $6, data_alvo = $7, data_conclusao = $8,
        horas_estimadas = $9, valor_estimado = $10, observacoes = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
    `;
    
    const params = [
      value.cliente_id, value.nome, value.descricao,
      JSON.stringify(value.tecnologias), value.status,
      value.data_inicio, value.data_alvo, value.data_conclusao,
      value.horas_estimadas, value.valor_estimado, value.observacoes, id
    ];
    
    const result = await executeQuery(query, params);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    res.json({
      message: 'Projeto atualizado com sucesso',
      data: { id: parseInt(id), ...value }
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/projetos/:id - Excluir projeto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se há contratos vinculados
    const contratos = await executeQuery('SELECT id FROM contratos WHERE projeto_id = $1', [id]);
    if (contratos.length > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir projeto com contratos vinculados'
      });
    }
    
    const result = await executeQuery('DELETE FROM projetos WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    res.json({ message: 'Projeto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/projetos/:id/escopos - Buscar escopos do projeto
router.get('/:id/escopos', async (req, res) => {
  try {
    const { id } = req.params;
    
    const escopos = await executeQuery(`
      SELECT ef.*, te.nome as tipo_nome, te.cor_hex,
        COUNT(DISTINCT f.id) as total_funcionalidades,
        COUNT(DISTINCT t.id) as total_tarefas,
        COUNT(CASE WHEN t.status = 'concluida' THEN 1 END) as tarefas_concluidas
      FROM escopos_funcionais ef
      LEFT JOIN tipos_escopo te ON ef.tipo_escopo_id = te.id
      LEFT JOIN funcionalidades f ON ef.id = f.escopo_funcional_id
      LEFT JOIN subfuncionalidades sf ON f.id = sf.funcionalidade_id
      LEFT JOIN subitens si ON sf.id = si.subfuncionalidade_id
      LEFT JOIN tarefas t ON si.id = t.subitem_id
      WHERE ef.projeto_id = ?
      GROUP BY ef.id
      ORDER BY ef.ordem, ef.created_at
    `, [id]);
    
    res.json({ data: escopos });
  } catch (error) {
    console.error('Erro ao buscar escopos do projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/projetos/:id/tarefas - Buscar tarefas do projeto
router.get('/:id/tarefas', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, prioridade } = req.query;
    
    let query = `
      SELECT t.*, si.nome as subitem_nome, sf.nome as subfuncionalidade_nome,
        f.nome as funcionalidade_nome, ef.nome as escopo_nome
      FROM tarefas t
      LEFT JOIN subitens si ON t.subitem_id = si.id
      LEFT JOIN subfuncionalidades sf ON si.subfuncionalidade_id = sf.id
      LEFT JOIN funcionalidades f ON sf.funcionalidade_id = f.id
      LEFT JOIN escopos_funcionais ef ON f.escopo_funcional_id = ef.id
      WHERE t.projeto_id = ?
    `;
    
    const params = [id];
    
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    
    if (prioridade) {
      query += ' AND t.prioridade = ?';
      params.push(prioridade);
    }
    
    query += ' ORDER BY t.data_alvo, t.prioridade DESC, t.created_at';
    
    const tarefas = await executeQuery(query, params);
    
    res.json({ data: tarefas });
  } catch (error) {
    console.error('Erro ao buscar tarefas do projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/projetos/:id/status - Atualizar status do projeto
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = [
      'nao_iniciado', 'planejamento', 'apresentado', 'orcamento_entregue',
      'orcamento_aprovado', 'contrato_assinado', 'entregue', 'suporte_garantia', 'concluido'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    const result = await executeQuery(
      'UPDATE projetos SET status = ? WHERE id = ?',
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
    
    res.json({ message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 