const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Schema de validação para nivel1
const nivel1Schema = Joi.object({
  escopo_funcional_id: Joi.number().integer().positive().required(),
  nivel1_tipo_id: Joi.number().integer().positive().required(),
  nome: Joi.string().min(1).max(255).allow(''),
  descricao: Joi.string().allow(''),
  status: Joi.string().valid('planejado', 'em_andamento', 'concluido', 'cancelado').default('planejado'),
  data_inicio: Joi.date().allow(null),
  data_alvo: Joi.date().allow(null),
  ordem: Joi.number().integer().min(0).default(0)
});

// GET /api/nivel1-supabase/escopo/:escopoId - Listar por escopo funcional
router.get('/escopo/:escopoId', async (req, res) => {
  try {
    const { escopoId } = req.params;
    
    const { data: nivel1s, error } = await supabase
      .from('nivel1')
      .select(`
        *,
        nivel1_tipos (
          nome,
          descricao,
          cor_hex,
          icon_name
        )
      `)
      .eq('escopo_funcional_id', escopoId)
      .order('ordem');
    
    if (error) {
      throw error;
    }
    
    res.json({ data: nivel1s });
  } catch (error) {
    console.error('Erro ao buscar nivel1s:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/nivel1-supabase/:id - Buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: nivel1, error } = await supabase
      .from('nivel1')
      .select(`
        *,
        nivel1_tipos (
          nome,
          descricao,
          cor_hex,
          icon_name
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Nivel1 não encontrado' });
      }
      throw error;
    }
    
    res.json({ data: nivel1 });
  } catch (error) {
    console.error('Erro ao buscar nivel1:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/nivel1-supabase - Criar nivel1
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = nivel1Schema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    // Verificar se escopo funcional existe
    const { data: escopo, error: escopoError } = await supabase
      .from('escopos_funcionais')
      .select('id')
      .eq('id', value.escopo_funcional_id)
      .single();
    
    if (escopoError || !escopo) {
      return res.status(400).json({ error: 'Escopo funcional não encontrado' });
    }
    
    // Verificar se tipo de nivel1 existe
    const { data: tipo, error: tipoError } = await supabase
      .from('nivel1_tipos')
      .select('id')
      .eq('id', value.nivel1_tipo_id)
      .single();
    
    if (tipoError || !tipo) {
      return res.status(400).json({ error: 'Tipo de nivel1 não encontrado' });
    }
    
    const { data: nivel1, error } = await supabase
      .from('nivel1')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'Nivel1 criado com sucesso',
      data: nivel1
    });
  } catch (error) {
    console.error('Erro ao criar nivel1:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/nivel1-supabase/:id - Atualizar nivel1
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = nivel1Schema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    const { data: nivel1, error } = await supabase
      .from('nivel1')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Nivel1 não encontrado' });
      }
      throw error;
    }
    
    res.json({
      message: 'Nivel1 atualizado com sucesso',
      data: nivel1
    });
  } catch (error) {
    console.error('Erro ao atualizar nivel1:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/nivel1-supabase/:id - Excluir nivel1
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: deleteError } = await supabase
      .from('nivel1')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Nivel1 não encontrado' });
      }
      throw deleteError;
    }
    
    res.json({ message: 'Nivel1 excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir nivel1:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 