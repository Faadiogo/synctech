const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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

// GET /api/financeiro-supabase - Listar movimentos financeiros
router.get('/', async (req, res) => {
  try {
    const { 
      tipo_movimento, status, contrato_id, 
      data_inicio, data_fim, page = 1, limit = 10 
    } = req.query;
    
    let query = supabase
      .from('financeiro')
      .select(`
        *,
        contratos:contrato_id (
          numero_contrato,
          valor_contrato,
          projetos:projeto_id (
            nome
          ),
          clientes:cliente_id (
            nome_empresa,
            nome_completo
          )
        )
      `);
    
    if (tipo_movimento) {
      query = query.eq('tipo_movimento', tipo_movimento);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (contrato_id) {
      query = query.eq('contrato_id', contrato_id);
    }
    
    if (data_inicio) {
      query = query.gte('data_vencimento', data_inicio);
    }
    
    if (data_fim) {
      query = query.lte('data_vencimento', data_fim);
    }
    
    // Paginação
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1).order('data_vencimento', { ascending: false });
    
    const { data: movimentosRaw, error } = await query;
    
    if (error) {
      throw error;
    }

    // Processar dados para compatibilidade
    const movimentos = movimentosRaw.map(movimento => ({
      ...movimento,
      numero_contrato: movimento.contratos?.numero_contrato,
      projeto_nome: movimento.contratos?.projetos?.nome,
      nome_empresa: movimento.contratos?.clientes?.nome_empresa,
      nome_completo: movimento.contratos?.clientes?.nome_completo
    }));
    
    // Contar total para paginação
    let countQuery = supabase.from('financeiro').select('*', { count: 'exact', head: true });
    
    if (tipo_movimento) {
      countQuery = countQuery.eq('tipo_movimento', tipo_movimento);
    }
    
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    
    if (contrato_id) {
      countQuery = countQuery.eq('contrato_id', contrato_id);
    }
    
    if (data_inicio) {
      countQuery = countQuery.gte('data_vencimento', data_inicio);
    }
    
    if (data_fim) {
      countQuery = countQuery.lte('data_vencimento', data_fim);
    }
    
    const { count: total } = await countQuery;
    
    res.json({
      data: movimentos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar movimentos financeiros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/financeiro-supabase/:id - Buscar movimento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: movimento, error } = await supabase
      .from('financeiro')
      .select(`
        *,
        contratos:contrato_id (
          numero_contrato,
          valor_contrato,
          projetos:projeto_id (
            nome,
            descricao
          ),
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
        return res.status(404).json({ error: 'Movimento não encontrado' });
      }
      throw error;
    }

    // Processar dados para compatibilidade
    const movimentoProcessado = {
      ...movimento,
      numero_contrato: movimento.contratos?.numero_contrato,
      valor_contrato: movimento.contratos?.valor_contrato,
      projeto_nome: movimento.contratos?.projetos?.nome,
      nome_empresa: movimento.contratos?.clientes?.nome_empresa,
      nome_completo: movimento.contratos?.clientes?.nome_completo
    };
    
    res.json({ data: movimentoProcessado });
  } catch (error) {
    console.error('Erro ao buscar movimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/financeiro-supabase - Criar novo movimento
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = financeiroSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    // Verificar se contrato existe
    const { data: contrato, error: contratoError } = await supabase
      .from('contratos')
      .select('id')
      .eq('id', value.contrato_id)
      .single();
    
    if (contratoError || !contrato) {
      return res.status(400).json({ error: 'Contrato não encontrado' });
    }
    
    const { data: movimento, error } = await supabase
      .from('financeiro')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'Movimento criado com sucesso',
      data: movimento
    });
  } catch (error) {
    console.error('Erro ao criar movimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/financeiro-supabase/:id - Atualizar movimento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = financeiroSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    const { data: movimento, error } = await supabase
      .from('financeiro')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Movimento não encontrado' });
      }
      throw error;
    }
    
    res.json({
      message: 'Movimento atualizado com sucesso',
      data: movimento
    });
  } catch (error) {
    console.error('Erro ao atualizar movimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/financeiro-supabase/:id - Excluir movimento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: deleteError } = await supabase
      .from('financeiro')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Movimento não encontrado' });
      }
      throw deleteError;
    }
    
    res.json({ message: 'Movimento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir movimento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/financeiro-supabase/:id/pagar - Marcar como pago
router.put('/:id/pagar', async (req, res) => {
  try {
    const { id } = req.params;
    const { data_pagamento, forma_pagamento } = req.body;
    
    const updateData = {
      status: 'pago',
      data_pagamento: data_pagamento || new Date().toISOString().split('T')[0]
    };
    
    if (forma_pagamento) {
      updateData.forma_pagamento = forma_pagamento;
    }
    
    const { data: movimento, error } = await supabase
      .from('financeiro')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Movimento não encontrado' });
      }
      throw error;
    }
    
    res.json({ message: 'Movimento marcado como pago' });
  } catch (error) {
    console.error('Erro ao marcar como pago:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/financeiro-supabase/contas-receber - Contas a receber
router.get('/contas-receber', async (req, res) => {
  try {
    const { status = 'em_aberto', vencidas = 'false' } = req.query;
    
    let query = supabase
      .from('financeiro')
      .select(`
        *,
        contratos:contrato_id (
          numero_contrato,
          projetos:projeto_id (
            nome
          ),
          clientes:cliente_id (
            nome_empresa,
            nome_completo
          )
        )
      `)
      .eq('tipo_movimento', 'entrada');
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (vencidas === 'true') {
      query = query.lt('data_vencimento', new Date().toISOString().split('T')[0]);
    }
    
    query = query.order('data_vencimento', { ascending: true });
    
    const { data: contasReceberRaw, error } = await query;
    
    if (error) {
      throw error;
    }

    // Processar dados e calcular dias de vencimento
    const contasReceber = contasReceberRaw.map(conta => {
      const hoje = new Date();
      const vencimento = new Date(conta.data_vencimento);
      const diffTime = vencimento.getTime() - hoje.getTime();
      const dias_vencimento = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...conta,
        numero_contrato: conta.contratos?.numero_contrato,
        projeto_nome: conta.contratos?.projetos?.nome,
        nome_empresa: conta.contratos?.clientes?.nome_empresa,
        nome_completo: conta.contratos?.clientes?.nome_completo,
        dias_vencimento
      };
    });
    
    res.json({ data: contasReceber });
  } catch (error) {
    console.error('Erro ao buscar contas a receber:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 