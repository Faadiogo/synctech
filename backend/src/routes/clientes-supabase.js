const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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
  foto_url: Joi.string().uri().allow(''),
  ativo: Joi.boolean().default(true)
});

// GET /api/clientes-supabase - Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const { ativo, tipo_pessoa, busca, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('clientes')
      .select(`
        *,
        projetos_count:projetos(count)
      `);
    
    if (ativo !== undefined) {
      query = query.eq('ativo', ativo === 'true');
    }
    
    if (tipo_pessoa) {
      query = query.eq('tipo_pessoa', tipo_pessoa);
    }
    
    if (busca) {
      query = query.or(`nome_empresa.ilike.%${busca}%,nome_completo.ilike.%${busca}%,email.ilike.%${busca}%`);
    }
    
    // Paginação
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1).order('created_at', { ascending: false });
    
    const { data: clientesRaw, error } = await query;
    
    if (error) {
      throw error;
    }

    // Processar dados para extrair a contagem de projetos
    const clientes = clientesRaw.map(cliente => ({
      ...cliente,
      projetos_count: cliente.projetos_count?.[0]?.count || 0
    }));
    
    // Contar total para paginação
    let countQuery = supabase.from('clientes').select('*', { count: 'exact', head: true });
    
    if (ativo !== undefined) {
      countQuery = countQuery.eq('ativo', ativo === 'true');
    }
    
    if (tipo_pessoa) {
      countQuery = countQuery.eq('tipo_pessoa', tipo_pessoa);
    }
    
    if (busca) {
      countQuery = countQuery.or(`nome_empresa.ilike.%${busca}%,nome_completo.ilike.%${busca}%,email.ilike.%${busca}%`);
    }
    
    const { count: total } = await countQuery;
    
    res.json({
      data: clientes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/clientes-supabase/:id - Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      throw error;
    }
    
    res.json({ data: cliente });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/clientes-supabase - Criar novo cliente
router.post('/', async (req, res) => {
  try {
    console.log('🆕 Criando cliente - dados recebidos:', req.body);
    console.log('🖼️ foto_url recebida:', req.body.foto_url);
    
    const { error: validationError, value } = clienteSchema.validate(req.body);
    
    if (validationError) {
      console.error('❌ Erro de validação:', validationError.details);
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    console.log('✅ Dados validados:', value);
    console.log('🖼️ foto_url validada:', value.foto_url);
    
    const { data: cliente, error } = await supabase
      .from('clientes')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro do Supabase:', error);
      throw error;
    }
    
    console.log('✅ Cliente criado com sucesso:', cliente);
    
    res.status(201).json({
      message: 'Cliente criado com sucesso',
      data: cliente
    });
  } catch (error) {
    console.error('💥 Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/clientes-supabase/:id - Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✏️ Atualizando cliente ${id} - dados recebidos:`, req.body);
    console.log('🖼️ foto_url recebida:', req.body.foto_url);
    
    const { error: validationError, value } = clienteSchema.validate(req.body);
    
    if (validationError) {
      console.error('❌ Erro de validação:', validationError.details);
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    console.log('✅ Dados validados:', value);
    console.log('🖼️ foto_url validada:', value.foto_url);
    
    const { data: cliente, error } = await supabase
      .from('clientes')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.error('❌ Cliente não encontrado:', id);
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      console.error('❌ Erro do Supabase:', error);
      throw error;
    }
    
    console.log('✅ Cliente atualizado com sucesso:', cliente);
    
    res.json({ 
      message: 'Cliente atualizado com sucesso',
      data: cliente
    });
  } catch (error) {
    console.error('💥 Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/clientes-supabase/:id - Desativar cliente (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const hard = req.query.hard === 'true';

    if (hard) {
      const { error: deleteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        if (deleteError.code === 'PGRST116') {
          return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        throw deleteError;
      }

      return res.json({ message: 'Cliente excluído permanentemente' });
    }

    const { data: cliente, error } = await supabase
      .from('clientes')
      .update({ ativo: false })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      throw error;
    }
    
    res.json({ message: 'Cliente desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 