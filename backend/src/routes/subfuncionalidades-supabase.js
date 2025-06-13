const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Schema de validação para subfuncionalidade
const subfuncionalidadeSchema = Joi.object({
  nivel2_id: Joi.number().integer().positive().required(),
  nome: Joi.string().min(3).max(255).required(),
  descricao: Joi.string().allow(''),
  status: Joi.string().valid('planejado', 'em_andamento', 'concluido', 'cancelado').default('planejado'),
  data_inicio: Joi.date().allow(null),
  data_alvo: Joi.date().allow(null),
  ordem: Joi.number().integer().min(0).default(0)
});

// GET /api/subfuncionalidades-supabase/nivel2/:nivel2Id - Listar por nivel2
router.get('/nivel2/:nivel2Id', async (req, res) => {
  try {
    const { nivel2Id } = req.params;
    
    const { data: subfuncionalidades, error } = await supabase
      .from('nivel3')
      .select('*')
      .eq('nivel2_id', nivel2Id)
      .order('ordem');
    
    if (error) {
      throw error;
    }
    
    res.json({ data: subfuncionalidades });
  } catch (error) {
    console.error('Erro ao buscar subfuncionalidades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/subfuncionalidades-supabase/:id - Buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: subfuncionalidade, error } = await supabase
      .from('nivel3')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Subfuncionalidade não encontrada' });
      }
      throw error;
    }
    
    res.json({ data: subfuncionalidade });
  } catch (error) {
    console.error('Erro ao buscar subfuncionalidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/subfuncionalidades-supabase - Criar subfuncionalidade
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = subfuncionalidadeSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    // Verificar se nivel2 existe
    const { data: nivel2, error: nivel2Error } = await supabase
      .from('nivel2')
      .select('id')
      .eq('id', value.nivel2_id)
      .single();
    
    if (nivel2Error || !nivel2) {
      return res.status(400).json({ error: 'Nivel2 não encontrado' });
    }
    
    const { data: subfuncionalidade, error } = await supabase
      .from('nivel3')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'Subfuncionalidade criada com sucesso',
      data: subfuncionalidade
    });
  } catch (error) {
    console.error('Erro ao criar subfuncionalidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/subfuncionalidades-supabase/:id - Atualizar subfuncionalidade
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = subfuncionalidadeSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    const { data: subfuncionalidade, error } = await supabase
      .from('nivel3')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Subfuncionalidade não encontrada' });
      }
      throw error;
    }
    
    res.json({
      message: 'Subfuncionalidade atualizada com sucesso',
      data: subfuncionalidade
    });
  } catch (error) {
    console.error('Erro ao atualizar subfuncionalidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/subfuncionalidades-supabase/:id - Excluir subfuncionalidade
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: deleteError } = await supabase
      .from('nivel3')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Subfuncionalidade não encontrada' });
      }
      throw deleteError;
    }
    
    res.json({ message: 'Subfuncionalidade excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir subfuncionalidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 