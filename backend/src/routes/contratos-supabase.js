const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Schema de validação para contrato
const contratoSchema = Joi.object({
  cliente_id: Joi.number().integer().positive().required(),
  projeto_id: Joi.number().integer().positive().allow(null),
  orcamento_id: Joi.number().integer().positive().allow(null),
  valor_orcado: Joi.number().precision(2).min(0).allow(null),
  desconto: Joi.number().precision(2).min(0).default(0),
  valor_contrato: Joi.number().precision(2).min(0).required(),
  data_assinatura: Joi.date().allow(null),
  qtd_parcelas: Joi.number().integer().min(1).default(1),
  arquivo_pdf_path: Joi.string().allow(''),
  status: Joi.string().valid('ativo', 'concluido', 'cancelado').default('ativo'),
  observacoes: Joi.string().allow('')
});

// GET /api/contratos-supabase - Listar contratos
router.get('/', async (req, res) => {
  try {
    const { status, cliente_id, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('contratos')
      .select(`
        *,
        clientes:cliente_id (
          nome_empresa,
          nome_completo
        ),
        projetos:projeto_id (
          nome
        ),
        orcamentos:orcamento_id (
          numero_orcamento,
          valor_total
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
    
    const { data: contratosRaw, error } = await query;
    
    if (error) {
      throw error;
    }

    // Processar dados para compatibilidade
    const contratos = contratosRaw.map(contrato => ({
      ...contrato,
      nome_empresa: contrato.clientes?.nome_empresa,
      nome_completo: contrato.clientes?.nome_completo,
      projeto_nome: contrato.projetos?.nome,
      numero_orcamento: contrato.orcamentos?.numero_orcamento,
      valor_orcamento: contrato.orcamentos?.valor_total
    }));
    
    // Contar total para paginação
    let countQuery = supabase.from('contratos').select('*', { count: 'exact', head: true });
    
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    
    if (cliente_id) {
      countQuery = countQuery.eq('cliente_id', cliente_id);
    }
    
    const { count: total } = await countQuery;
    
    res.json({
      data: contratos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/contratos-supabase/:id - Buscar contrato por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: contrato, error } = await supabase
      .from('contratos')
      .select(`
        *,
        clientes:cliente_id (
          nome_empresa,
          nome_completo,
          email,
          telefone,
          endereco,
          cidade,
          uf
        ),
        projetos:projeto_id (
          nome,
          descricao
        ),
        orcamentos:orcamento_id (
          numero_orcamento,
          valor_total
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Contrato não encontrado' });
      }
      throw error;
    }

    // Processar dados para compatibilidade
    const contratoProcessado = {
      ...contrato,
      nome_empresa: contrato.clientes?.nome_empresa,
      nome_completo: contrato.clientes?.nome_completo,
      projeto_nome: contrato.projetos?.nome
    };
    
    res.json({ data: contratoProcessado });
  } catch (error) {
    console.error('Erro ao buscar contrato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/contratos-supabase - Criar contrato
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = contratoSchema.validate(req.body);
    
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
    
    // Verificar se orçamento existe (se fornecido)
    if (value.orcamento_id) {
      const { data: orcamento, error: orcamentoError } = await supabase
        .from('orcamentos')
        .select('id')
        .eq('id', value.orcamento_id)
        .single();
      
      if (orcamentoError || !orcamento) {
        return res.status(400).json({ error: 'Orçamento não encontrado' });
      }
    }
    
    const { data: contrato, error } = await supabase
      .from('contratos')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'Contrato criado com sucesso',
      data: contrato
    });
  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/contratos-supabase/:id - Atualizar contrato
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = contratoSchema.validate(req.body);
    
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
    
    const { data: contrato, error } = await supabase
      .from('contratos')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Contrato não encontrado' });
      }
      throw error;
    }
    
    res.json({ 
      message: 'Contrato atualizado com sucesso',
      data: contrato
    });
  } catch (error) {
    console.error('Erro ao atualizar contrato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/contratos-supabase/:id - Excluir contrato
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: deleteError } = await supabase
      .from('contratos')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Contrato não encontrado' });
      }
      throw deleteError;
    }
    
    res.json({ message: 'Contrato excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir contrato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 