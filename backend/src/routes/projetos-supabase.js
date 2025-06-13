const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Schema de validação para projeto
const projetoSchema = Joi.object({
  cliente_id: Joi.number().integer().positive().required(),
  nome: Joi.string().min(3).max(255).required(),
  descricao: Joi.string().allow(''),
  tecnologias: Joi.array().items(Joi.string()).default([]),
  status: Joi.string().valid(
    'nao_iniciado', 'planejamento', 'apresentado', 'orcamento_entregue',
    'orcamento_aprovado', 'contrato_assinado', 'em_andamento', 'entregue', 'suporte_garantia', 'concluido'
  ).default('nao_iniciado'),
  data_inicio: Joi.date().allow(null),
  data_alvo: Joi.date().allow(null),
  data_conclusao: Joi.date().allow(null),
  horas_estimadas: Joi.number().precision(2).min(0).allow(null),
  valor_estimado: Joi.number().precision(2).min(0).allow(null),
  observacoes: Joi.string().allow('')
});

// GET /api/projetos-supabase - Listar todos os projetos
router.get('/', async (req, res) => {
  try {
    const { status, cliente_id, busca, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('projetos')
      .select(`
        *,
        clientes:cliente_id (
          nome_empresa,
          nome_completo,
          foto_url
        )
      `);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (cliente_id) {
      query = query.eq('cliente_id', cliente_id);
    }
    
    if (busca) {
      query = query.or(`nome.ilike.%${busca}%,descricao.ilike.%${busca}%`);
    }
    
    // Paginação
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1).order('created_at', { ascending: false });
    
    const { data: projetos, error } = await query;
    
    if (error) {
      throw error;
    }

    // Processar dados para compatibilidade
    const projetosProcessados = projetos.map(projeto => ({
      ...projeto,
      nome_empresa: projeto.clientes?.nome_empresa,
      nome_completo: projeto.clientes?.nome_completo,
      cliente_nome: projeto.clientes?.nome_empresa || projeto.clientes?.nome_completo,
      cliente_foto: projeto.clientes?.foto_url,
      progresso_calculado: 0, // Será calculado quando tivermos tarefas implementadas
      total_tarefas: 0,
      tarefas_concluidas: 0
    }));
    
    // Contar total para paginação
    let countQuery = supabase.from('projetos').select('*', { count: 'exact', head: true });
    
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    
    if (cliente_id) {
      countQuery = countQuery.eq('cliente_id', cliente_id);
    }
    
    if (busca) {
      countQuery = countQuery.or(`nome.ilike.%${busca}%,descricao.ilike.%${busca}%`);
    }
    
    const { count: total } = await countQuery;
    
    res.json({
      data: projetosProcessados,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/projetos-supabase/:id - Buscar projeto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: projeto, error } = await supabase
      .from('projetos')
      .select(`
        *,
        clientes:cliente_id (
          nome_empresa,
          nome_completo,
          email,
          telefone,
          foto_url
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }
      throw error;
    }

    // Processar dados para compatibilidade
    const projetoProcessado = {
      ...projeto,
      nome_empresa: projeto.clientes?.nome_empresa,
      nome_completo: projeto.clientes?.nome_completo,
      cliente_nome: projeto.clientes?.nome_empresa || projeto.clientes?.nome_completo,
      cliente_foto: projeto.clientes?.foto_url,
      progresso_calculado: 0,
      total_tarefas: 0,
      tarefas_concluidas: 0
    };
    
    res.json({ data: projetoProcessado });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/projetos-supabase - Criar novo projeto
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = projetoSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    // Verificar se cliente existe
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', value.cliente_id)
      .eq('ativo', true)
      .single();
    
    if (clienteError || !cliente) {
      return res.status(400).json({ error: 'Cliente não encontrado ou inativo' });
    }
    
    const { data: projeto, error } = await supabase
      .from('projetos')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'Projeto criado com sucesso',
      data: projeto
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/projetos-supabase/:id - Atualizar projeto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = projetoSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    // Verificar se cliente existe
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', value.cliente_id)
      .eq('ativo', true)
      .single();
    
    if (clienteError || !cliente) {
      return res.status(400).json({ error: 'Cliente não encontrado ou inativo' });
    }
    
    const { data: projeto, error } = await supabase
      .from('projetos')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }
      throw error;
    }
    
    res.json({ 
      message: 'Projeto atualizado com sucesso',
      data: projeto
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/projetos-supabase/:id - Excluir projeto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: deleteError } = await supabase
      .from('projetos')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }
      throw deleteError;
    }
    
    res.json({ message: 'Projeto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 