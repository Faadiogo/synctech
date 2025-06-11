const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const Joi = require('joi');

// Schema de validação para cliente
const clienteSchema = Joi.object({
  tipo_pessoa: Joi.string().valid('PF', 'PJ').required(),
  nome_empresa: Joi.string().when('tipo_pessoa', {
    is: 'PJ',
    then: Joi.required(),
    otherwise: Joi.allow('')
  }),
  nome_completo: Joi.string().when('tipo_pessoa', {
    is: 'PF',
    then: Joi.required(),
    otherwise: Joi.allow('')
  }),
  representante_legal: Joi.string().allow(''),
  razao_social: Joi.string().allow(''),
  cpf: Joi.string().when('tipo_pessoa', {
    is: 'PF',
    then: Joi.required(),
    otherwise: Joi.allow('')
  }),
  cnpj: Joi.string().when('tipo_pessoa', {
    is: 'PJ',
    then: Joi.required(),
    otherwise: Joi.allow('')
  }),
  cep: Joi.string().allow(''),
  numero: Joi.string().allow(''),
  endereco: Joi.string().allow(''),
  cidade: Joi.string().allow(''),
  uf: Joi.string().max(2).allow(''),
  telefone: Joi.string().allow(''),
  email: Joi.string().email().allow(''),
  observacoes: Joi.string().allow(''),
  ativo: Joi.boolean().default(true)
});

// GET /api/clientes - Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const { ativo, tipo_pessoa, busca, page = 1, limit = 10 } = req.query;
    
    let query = 'SELECT * FROM clientes WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (ativo !== undefined) {
      query += ` AND ativo = $${paramIndex}`;
      params.push(ativo === 'true');
      paramIndex++;
    }
    
    if (tipo_pessoa) {
      query += ` AND tipo_pessoa = $${paramIndex}`;
      params.push(tipo_pessoa);
      paramIndex++;
    }
    
    if (busca) {
      query += ` AND (nome_empresa ILIKE $${paramIndex} OR nome_completo ILIKE $${paramIndex + 1} OR email ILIKE $${paramIndex + 2})`;
      const searchTerm = `%${busca}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }
    
    query += ' ORDER BY created_at DESC';
    
    // Paginação
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const clientes = await executeQuery(query, params);
    
    // Contar total para paginação
    let countQuery = 'SELECT COUNT(*) as total FROM clientes WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;
    
    if (ativo !== undefined) {
      countQuery += ` AND ativo = $${countParamIndex}`;
      countParams.push(ativo === 'true');
      countParamIndex++;
    }
    
    if (tipo_pessoa) {
      countQuery += ` AND tipo_pessoa = $${countParamIndex}`;
      countParams.push(tipo_pessoa);
      countParamIndex++;
    }
    
    if (busca) {
      countQuery += ` AND (nome_empresa ILIKE $${countParamIndex} OR nome_completo ILIKE $${countParamIndex + 1} OR email ILIKE $${countParamIndex + 2})`;
      const searchTerm = `%${busca}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const totalResult = await executeQuery(countQuery, countParams);
    const total = totalResult[0].total;
    
    res.json({
      data: clientes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/clientes/:id - Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const clientes = await executeQuery(
      'SELECT * FROM clientes WHERE id = $1',
      [id]
    );
    
    if (clientes.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json({ data: clientes[0] });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/clientes - Criar novo cliente
router.post('/', async (req, res) => {
  try {
    const { error, value } = clienteSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => d.message)
      });
    }
    
    const query = `
      INSERT INTO clientes (
        tipo_pessoa, nome_empresa, nome_completo, representante_legal,
        razao_social, cpf, cnpj, cep, numero, endereco, cidade, uf,
        telefone, email, observacoes, ativo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `;
    
    const params = [
      value.tipo_pessoa, value.nome_empresa, value.nome_completo,
      value.representante_legal, value.razao_social, value.cpf, value.cnpj,
      value.cep, value.numero, value.endereco, value.cidade, value.uf,
      value.telefone, value.email, value.observacoes, value.ativo
    ];
    
    const result = await executeQuery(query, params);
    
    res.status(201).json({
      message: 'Cliente criado com sucesso',
      data: { id: result[0].id, ...value }
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/clientes/:id - Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = clienteSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(d => d.message)
      });
    }
    
    const query = `
      UPDATE clientes SET
        tipo_pessoa = $1, nome_empresa = $2, nome_completo = $3,
        representante_legal = $4, razao_social = $5, cpf = $6, cnpj = $7,
        cep = $8, numero = $9, endereco = $10, cidade = $11, uf = $12,
        telefone = $13, email = $14, observacoes = $15, ativo = $16,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $17
    `;
    
    const params = [
      value.tipo_pessoa, value.nome_empresa, value.nome_completo,
      value.representante_legal, value.razao_social, value.cpf, value.cnpj,
      value.cep, value.numero, value.endereco, value.cidade, value.uf,
      value.telefone, value.email, value.observacoes, value.ativo, id
    ];
    
    const result = await executeQuery(query, params);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json({ 
      message: 'Cliente atualizado com sucesso',
      data: { id: parseInt(id), ...value }
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/clientes/:id - Desativar cliente (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery(
      'UPDATE clientes SET ativo = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json({ message: 'Cliente desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/clientes/:id/projetos - Buscar projetos do cliente
router.get('/:id/projetos', async (req, res) => {
  try {
    const { id } = req.params;
    
    const projetos = await executeQuery(`
      SELECT p.*, 
        COUNT(t.id) as total_tarefas,
        COUNT(CASE WHEN t.status = 'concluida' THEN 1 END) as tarefas_concluidas
      FROM projetos p
      LEFT JOIN escopos_funcionais ef ON p.id = ef.projeto_id
      LEFT JOIN funcionalidades f ON ef.id = f.escopo_funcional_id
      LEFT JOIN subfuncionalidades sf ON f.id = sf.funcionalidade_id
      LEFT JOIN subitens si ON sf.id = si.subfuncionalidade_id
      LEFT JOIN tarefas t ON si.id = t.subitem_id
      WHERE p.cliente_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [id]);
    
    res.json({ data: projetos });
  } catch (error) {
    console.error('Erro ao buscar projetos do cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 