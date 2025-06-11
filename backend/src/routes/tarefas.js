const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const Joi = require('joi');

// Schema de validação para tarefa
const tarefaSchema = Joi.object({
  projeto_id: Joi.number().integer().positive().required(),
  subitem_id: Joi.number().integer().positive().allow(null),
  cronograma_item_id: Joi.number().integer().positive().allow(null),
  titulo: Joi.string().min(3).max(255).required(),
  descricao: Joi.string().allow(''),
  status: Joi.string().valid('nao_iniciada', 'em_andamento', 'concluida', 'cancelada').default('nao_iniciada'),
  prioridade: Joi.string().valid('baixa', 'media', 'alta', 'critica').default('media'),
  data_inicio: Joi.date().allow(null),
  data_alvo: Joi.date().allow(null),
  data_conclusao: Joi.date().allow(null),
  horas_estimadas: Joi.number().precision(2).min(0).allow(null),
  horas_trabalhadas: Joi.number().precision(2).min(0).default(0),
  responsavel: Joi.string().allow(''),
  observacoes: Joi.string().allow('')
});

// GET /api/tarefas - Listar tarefas com filtros
router.get('/', async (req, res) => {
  try {
    const { 
      status, prioridade, projeto_id, responsavel, 
      busca, page = 1, limit = 10, ordenar = 'data_alvo'
    } = req.query;
    
    let query = `
      SELECT t.*, p.nome as projeto_nome, c.nome_empresa, c.nome_completo,
        si.nome as subitem_nome, sf.nome as subfuncionalidade_nome,
        f.nome as funcionalidade_nome, ef.nome as escopo_nome
      FROM tarefas t
      LEFT JOIN projetos p ON t.projeto_id = p.id
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN subitens si ON t.subitem_id = si.id
      LEFT JOIN subfuncionalidades sf ON si.subfuncionalidade_id = sf.id
      LEFT JOIN funcionalidades f ON sf.funcionalidade_id = f.id
      LEFT JOIN escopos_funcionais ef ON f.escopo_funcional_id = ef.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    
    if (prioridade) {
      query += ' AND t.prioridade = ?';
      params.push(prioridade);
    }
    
    if (projeto_id) {
      query += ' AND t.projeto_id = ?';
      params.push(projeto_id);
    }
    
    if (responsavel) {
      query += ' AND t.responsavel LIKE ?';
      params.push(`%${responsavel}%`);
    }
    
    if (busca) {
      query += ' AND (t.titulo LIKE ? OR t.descricao LIKE ? OR p.nome LIKE ?)';
      const searchTerm = `%${busca}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Ordenação
    const validOrders = ['data_alvo', 'prioridade', 'status', 'created_at'];
    const orderBy = validOrders.includes(ordenar) ? ordenar : 'data_alvo';
    
    if (orderBy === 'prioridade') {
      query += ' ORDER BY FIELD(t.prioridade, "critica", "alta", "media", "baixa"), t.data_alvo';
    } else {
      query += ` ORDER BY t.${orderBy}`;
    }
    
    // Paginação
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const tarefas = await executeQuery(query, params);
    
    // Contar total
    let countQuery = `
      SELECT COUNT(*) as total FROM tarefas t
      LEFT JOIN projetos p ON t.projeto_id = p.id
      WHERE 1=1
    `;
    const countParams = [];
    
    if (status) {
      countQuery += ' AND t.status = ?';
      countParams.push(status);
    }
    
    if (prioridade) {
      countQuery += ' AND t.prioridade = ?';
      countParams.push(prioridade);
    }
    
    if (projeto_id) {
      countQuery += ' AND t.projeto_id = ?';
      countParams.push(projeto_id);
    }
    
    if (responsavel) {
      countQuery += ' AND t.responsavel LIKE ?';
      countParams.push(`%${responsavel}%`);
    }
    
    if (busca) {
      countQuery += ' AND (t.titulo LIKE ? OR t.descricao LIKE ? OR p.nome LIKE ?)';
      const searchTerm = `%${busca}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const [{ total }] = await executeQuery(countQuery, countParams);
    
    res.json({
      data: tarefas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tarefas/:id - Buscar tarefa por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const tarefas = await executeQuery(`
      SELECT t.*, p.nome as projeto_nome, c.nome_empresa, c.nome_completo,
        si.nome as subitem_nome, sf.nome as subfuncionalidade_nome,
        f.nome as funcionalidade_nome, ef.nome as escopo_nome
      FROM tarefas t
      LEFT JOIN projetos p ON t.projeto_id = p.id
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN subitens si ON t.subitem_id = si.id
      LEFT JOIN subfuncionalidades sf ON si.subfuncionalidade_id = sf.id
      LEFT JOIN funcionalidades f ON sf.funcionalidade_id = f.id
      LEFT JOIN escopos_funcionais ef ON f.escopo_funcional_id = ef.id
      WHERE t.id = ?
    `, [id]);
    
    if (tarefas.length === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    res.json({ data: tarefas[0] });
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/tarefas - Criar nova tarefa
router.post('/', async (req, res) => {
  try {
    const { error, value } = tarefaSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => d.message)
      });
    }
    
    // Verificar se projeto existe
    const projetos = await executeQuery('SELECT id FROM projetos WHERE id = ?', [value.projeto_id]);
    if (projetos.length === 0) {
      return res.status(400).json({ error: 'Projeto não encontrado' });
    }
    
    const query = `
      INSERT INTO tarefas (
        projeto_id, subitem_id, cronograma_item_id, titulo, descricao,
        status, prioridade, data_inicio, data_alvo, data_conclusao,
        horas_estimadas, horas_trabalhadas, responsavel, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      value.projeto_id, value.subitem_id, value.cronograma_item_id,
      value.titulo, value.descricao, value.status, value.prioridade,
      value.data_inicio, value.data_alvo, value.data_conclusao,
      value.horas_estimadas, value.horas_trabalhadas, value.responsavel,
      value.observacoes
    ];
    
    const result = await executeQuery(query, params);
    
    res.status(201).json({
      message: 'Tarefa criada com sucesso',
      data: { id: result.insertId, ...value }
    });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/tarefas/:id - Atualizar tarefa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = tarefaSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => d.message)
      });
    }
    
    // Se status mudou para concluída, definir data de conclusão
    if (value.status === 'concluida' && !value.data_conclusao) {
      value.data_conclusao = new Date();
    }
    
    const query = `
      UPDATE tarefas SET
        projeto_id = ?, subitem_id = ?, cronograma_item_id = ?,
        titulo = ?, descricao = ?, status = ?, prioridade = ?,
        data_inicio = ?, data_alvo = ?, data_conclusao = ?,
        horas_estimadas = ?, horas_trabalhadas = ?, responsavel = ?,
        observacoes = ?
      WHERE id = ?
    `;
    
    const params = [
      value.projeto_id, value.subitem_id, value.cronograma_item_id,
      value.titulo, value.descricao, value.status, value.prioridade,
      value.data_inicio, value.data_alvo, value.data_conclusao,
      value.horas_estimadas, value.horas_trabalhadas, value.responsavel,
      value.observacoes, id
    ];
    
    const result = await executeQuery(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    res.json({
      message: 'Tarefa atualizada com sucesso',
      data: { id: parseInt(id), ...value }
    });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/tarefas/:id - Excluir tarefa
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery('DELETE FROM tarefas WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    res.json({ message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/tarefas/:id/status - Atualizar apenas status da tarefa
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['nao_iniciada', 'em_andamento', 'concluida', 'cancelada'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    let query = 'UPDATE tarefas SET status = ?';
    const params = [status];
    
    // Se status for concluída, definir data de conclusão
    if (status === 'concluida') {
      query += ', data_conclusao = NOW()';
    } else if (status !== 'concluida') {
      query += ', data_conclusao = NULL';
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    const result = await executeQuery(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    res.json({ message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tarefas/kanban/:projeto_id - Buscar tarefas em formato Kanban
router.get('/kanban/:projeto_id', async (req, res) => {
  try {
    const { projeto_id } = req.params;
    
    const tarefas = await executeQuery(`
      SELECT t.*, si.nome as subitem_nome, sf.nome as subfuncionalidade_nome,
        f.nome as funcionalidade_nome, ef.nome as escopo_nome
      FROM tarefas t
      LEFT JOIN subitens si ON t.subitem_id = si.id
      LEFT JOIN subfuncionalidades sf ON si.subfuncionalidade_id = sf.id
      LEFT JOIN funcionalidades f ON sf.funcionalidade_id = f.id
      LEFT JOIN escopos_funcionais ef ON f.escopo_funcional_id = ef.id
      WHERE t.projeto_id = ?
      ORDER BY t.prioridade DESC, t.data_alvo
    `, [projeto_id]);
    
    // Organizar tarefas por status
    const kanban = {
      nao_iniciada: [],
      em_andamento: [],
      concluida: [],
      cancelada: []
    };
    
    tarefas.forEach(tarefa => {
      if (kanban[tarefa.status]) {
        kanban[tarefa.status].push(tarefa);
      }
    });
    
    res.json({ data: kanban });
  } catch (error) {
    console.error('Erro ao buscar tarefas kanban:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 