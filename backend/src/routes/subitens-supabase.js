const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Schema de validação para subitem
const subitemSchema = Joi.object({
  nivel3_id: Joi.number().integer().positive().required(),
  nome: Joi.string().min(3).max(255).required(),
  descricao: Joi.string().allow(''),
  status: Joi.string().valid('planejado', 'em_andamento', 'concluido', 'cancelado').default('planejado'),
  data_inicio: Joi.date().allow(null),
  data_alvo: Joi.date().allow(null),
  horas_estimadas: Joi.number().min(0).allow(null),
  ordem: Joi.number().integer().min(0).default(0)
});

// GET /api/subitens-supabase/nivel3/:nivel3Id - Listar por nivel3
router.get('/nivel3/:nivel3Id', async (req, res) => {
  try {
    const { nivel3Id } = req.params;
    
    const { data: subitens, error } = await supabase
      .from('nivel4')
      .select('*')
      .eq('nivel3_id', nivel3Id)
      .order('ordem');
    
    if (error) {
      throw error;
    }
    
    res.json({ data: subitens });
  } catch (error) {
    console.error('Erro ao buscar subitens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/subitens-supabase/subfuncionalidade/:subfuncionalidadeId - Listar por subfuncionalidade
router.get('/subfuncionalidade/:subfuncionalidadeId', async (req, res) => {
  try {
    const { subfuncionalidadeId } = req.params;
    
    // Manter compatibilidade com rota antiga
    const { data: subitens, error } = await supabase
      .from('nivel4')
      .select('*')
      .eq('nivel3_id', subfuncionalidadeId)
      .order('ordem');
    
    if (error) {
      throw error;
    }
    
    res.json({ data: subitens });
  } catch (error) {
    console.error('Erro ao buscar subitens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/subitens-supabase/:id - Buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: subitem, error } = await supabase
      .from('nivel4')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Subitem não encontrado' });
      }
      throw error;
    }
    
    res.json({ data: subitem });
  } catch (error) {
    console.error('Erro ao buscar subitem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/subitens-supabase - Criar subitem
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = subitemSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    // Verificar se nivel3 existe
    const { data: nivel3, error: nivel3Error } = await supabase
      .from('nivel3')
      .select('id')
      .eq('id', value.nivel3_id)
      .single();
    
    if (nivel3Error || !nivel3) {
      return res.status(400).json({ error: 'Nivel3 não encontrado' });
    }
    
    const { data: subitem, error } = await supabase
      .from('nivel4')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'Subitem criado com sucesso',
      data: subitem
    });
  } catch (error) {
    console.error('Erro ao criar subitem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/subitens-supabase/:id - Atualizar subitem
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = subitemSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    const { data: subitem, error } = await supabase
      .from('nivel4')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Subitem não encontrado' });
      }
      throw error;
    }
    
    res.json({
      message: 'Subitem atualizado com sucesso',
      data: subitem
    });
  } catch (error) {
    console.error('Erro ao atualizar subitem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/subitens-supabase/:id - Excluir subitem
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: deleteError } = await supabase
      .from('nivel4')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Subitem não encontrado' });
      }
      throw deleteError;
    }
    
    res.json({ message: 'Subitem excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir subitem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 