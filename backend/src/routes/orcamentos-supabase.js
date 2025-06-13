const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Schema de validação para orçamento
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

// GET /api/orcamentos-supabase - Listar orçamentos
router.get('/', async (req, res) => {
  try {
    const { status, cliente_id, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('orcamentos')
      .select(`
        *,
        clientes:cliente_id (
          nome_empresa,
          nome_completo
        ),
        projetos:projeto_id (
          nome
        )
      `);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (cliente_id) {
      query = query.eq('cliente_id', cliente_id);
    }
    
    // Paginação
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1).order('created_at', { ascending: false });
    
    const { data: orcamentosRaw, error } = await query;
    
    if (error) {
      throw error;
    }

    // Processar dados para compatibilidade
    const orcamentos = orcamentosRaw.map(orcamento => ({
      ...orcamento,
      nome_empresa: orcamento.clientes?.nome_empresa,
      nome_completo: orcamento.clientes?.nome_completo,
      projeto_nome: orcamento.projetos?.nome
    }));
    
    // Contar total para paginação
    let countQuery = supabase.from('orcamentos').select('*', { count: 'exact', head: true });
    
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    
    if (cliente_id) {
      countQuery = countQuery.eq('cliente_id', cliente_id);
    }
    
    const { count: total } = await countQuery;
    
    res.json({
      data: orcamentos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/orcamentos-supabase/:id - Buscar orçamento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: orcamento, error } = await supabase
      .from('orcamentos')
      .select(`
        *,
        clientes:cliente_id (
          nome_empresa,
          nome_completo,
          email,
          telefone
        ),
        projetos:projeto_id (
          nome,
          descricao
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }
      throw error;
    }

    // Processar dados para compatibilidade
    const orcamentoProcessado = {
      ...orcamento,
      nome_empresa: orcamento.clientes?.nome_empresa,
      nome_completo: orcamento.clientes?.nome_completo,
      projeto_nome: orcamento.projetos?.nome
    };
    
    res.json({ data: orcamentoProcessado });
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/orcamentos-supabase - Criar orçamento
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = orcamentoSchema.validate(req.body);
    
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
    
    // Verificar se projeto existe (se fornecido)
    if (value.projeto_id) {
      const { data: projeto, error: projetoError } = await supabase
        .from('projetos')
        .select('id')
        .eq('id', value.projeto_id)
        .single();
      
      if (projetoError || !projeto) {
        return res.status(400).json({ error: 'Projeto não encontrado' });
      }
    }
    
    const { data: orcamento, error } = await supabase
      .from('orcamentos')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'Orçamento criado com sucesso',
      data: orcamento
    });
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/orcamentos-supabase/:id - Atualizar orçamento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = orcamentoSchema.validate(req.body);
    
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
    
    const { data: orcamento, error } = await supabase
      .from('orcamentos')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }
      throw error;
    }
    
    res.json({ 
      message: 'Orçamento atualizado com sucesso',
      data: orcamento
    });
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/orcamentos-supabase/:id - Excluir orçamento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: deleteError } = await supabase
      .from('orcamentos')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }
      throw deleteError;
    }
    
    res.json({ message: 'Orçamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 