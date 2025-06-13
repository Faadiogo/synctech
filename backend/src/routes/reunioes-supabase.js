const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Schema de validação para reunião
const reuniaoSchema = Joi.object({
  projeto_id: Joi.number().integer().positive().required(),
  titulo: Joi.string().min(3).max(255).required(),
  descricao: Joi.string().allow(''),
  data_reuniao: Joi.date().required(),
  hora_inicio: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  hora_fim: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(null),
  local: Joi.string().allow(''),
  tipo: Joi.string().valid('presencial', 'online', 'hibrida').default('presencial'),
  link_reuniao: Joi.string().uri().allow(''),
  participantes: Joi.string().allow(''),
  ata: Joi.string().allow(''),
  status: Joi.string().valid('agendada', 'realizada', 'cancelada', 'adiada').default('agendada'),
  observacoes: Joi.string().allow('')
});

// GET /api/reunioes-supabase - Listar reuniões
router.get('/', async (req, res) => {
  try {
    const { projeto_id, status, data_inicio, data_fim, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('reunioes')
      .select(`
        *,
        projetos:projeto_id (
          nome,
          clientes:cliente_id (
            nome_empresa,
            nome_completo
          )
        )
      `);
    
    if (projeto_id) {
      query = query.eq('projeto_id', projeto_id);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (data_inicio) {
      query = query.gte('data_reuniao', data_inicio);
    }
    
    if (data_fim) {
      query = query.lte('data_reuniao', data_fim);
    }
    
    // Paginação
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1).order('data_reuniao', { ascending: false });
    
    const { data: reunioesRaw, error } = await query;
    
    if (error) {
      throw error;
    }

    // Processar dados para compatibilidade
    const reunioes = reunioesRaw.map(reuniao => ({
      ...reuniao,
      projeto_nome: reuniao.projetos?.nome,
      nome_empresa: reuniao.projetos?.clientes?.nome_empresa,
      nome_completo: reuniao.projetos?.clientes?.nome_completo
    }));
    
    // Contar total para paginação
    let countQuery = supabase.from('reunioes').select('*', { count: 'exact', head: true });
    
    if (projeto_id) {
      countQuery = countQuery.eq('projeto_id', projeto_id);
    }
    
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    
    if (data_inicio) {
      countQuery = countQuery.gte('data_reuniao', data_inicio);
    }
    
    if (data_fim) {
      countQuery = countQuery.lte('data_reuniao', data_fim);
    }
    
    const { count: total } = await countQuery;
    
    res.json({
      data: reunioes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar reuniões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/reunioes-supabase/:id - Buscar reunião por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: reuniao, error } = await supabase
      .from('reunioes')
      .select(`
        *,
        projetos:projeto_id (
          nome,
          descricao,
          clientes:cliente_id (
            nome_empresa,
            nome_completo,
            email,
            telefone
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Reunião não encontrada' });
      }
      throw error;
    }

    // Processar dados para compatibilidade
    const reuniaoProcessada = {
      ...reuniao,
      projeto_nome: reuniao.projetos?.nome,
      nome_empresa: reuniao.projetos?.clientes?.nome_empresa,
      nome_completo: reuniao.projetos?.clientes?.nome_completo
    };
    
    res.json({ data: reuniaoProcessada });
  } catch (error) {
    console.error('Erro ao buscar reunião:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/reunioes-supabase - Criar reunião
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = reuniaoSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    // Verificar se projeto existe
    const { data: projeto, error: projetoError } = await supabase
      .from('projetos')
      .select('id')
      .eq('id', value.projeto_id)
      .single();
    
    if (projetoError || !projeto) {
      return res.status(400).json({ error: 'Projeto não encontrado' });
    }
    
    const { data: reuniao, error } = await supabase
      .from('reunioes')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'Reunião criada com sucesso',
      data: reuniao
    });
  } catch (error) {
    console.error('Erro ao criar reunião:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/reunioes-supabase/:id - Atualizar reunião
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = reuniaoSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    const { data: reuniao, error } = await supabase
      .from('reunioes')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Reunião não encontrada' });
      }
      throw error;
    }
    
    res.json({
      message: 'Reunião atualizada com sucesso',
      data: reuniao
    });
  } catch (error) {
    console.error('Erro ao atualizar reunião:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/reunioes-supabase/:id - Excluir reunião
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: deleteError } = await supabase
      .from('reunioes')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Reunião não encontrada' });
      }
      throw deleteError;
    }
    
    res.json({ message: 'Reunião excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir reunião:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/reunioes-supabase/agenda - Agenda de reuniões
router.get('/agenda', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    const hoje = new Date().toISOString().split('T')[0];
    
    let query = supabase
      .from('reunioes')
      .select(`
        *,
        projetos:projeto_id (
          nome,
          clientes:cliente_id (
            nome_empresa,
            nome_completo
          )
        )
      `)
      .eq('status', 'agendada');
    
    if (data_inicio) {
      query = query.gte('data_reuniao', data_inicio);
    } else {
      query = query.gte('data_reuniao', hoje);
    }
    
    if (data_fim) {
      query = query.lte('data_reuniao', data_fim);
    }
    
    query = query.order('data_reuniao', { ascending: true }).order('hora_inicio', { ascending: true });
    
    const { data: reunioesRaw, error } = await query;
    
    if (error) {
      throw error;
    }

    // Processar dados
    const reunioes = reunioesRaw.map(reuniao => ({
      ...reuniao,
      projeto_nome: reuniao.projetos?.nome,
      nome_empresa: reuniao.projetos?.clientes?.nome_empresa,
      nome_completo: reuniao.projetos?.clientes?.nome_completo
    }));
    
    res.json({ data: reunioes });
  } catch (error) {
    console.error('Erro ao buscar agenda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 