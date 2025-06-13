const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Schema de validação para funcionalidade
const funcionalidadeSchema = Joi.object({
  nivel1_id: Joi.number().integer().positive().required(),
  nome: Joi.string().min(3).max(255).required(),
  descricao: Joi.string().allow(''),
  status: Joi.string().valid('planejado', 'em_andamento', 'concluido', 'cancelado').default('planejado'),
  data_inicio: Joi.date().allow(null),
  data_alvo: Joi.date().allow(null),
  ordem: Joi.number().integer().min(0).default(0)
});

// GET /api/funcionalidades-supabase/nivel1/:nivel1Id - Listar por nivel1
router.get('/nivel1/:nivel1Id', async (req, res) => {
  try {
    const { nivel1Id } = req.params;
    
    const { data: funcionalidades, error } = await supabase
      .from('nivel2')
      .select('*')
      .eq('nivel1_id', nivel1Id)
      .order('ordem');
    
    if (error) {
      throw error;
    }
    
    res.json({ data: funcionalidades });
  } catch (error) {
    console.error('Erro ao buscar funcionalidades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/funcionalidades-supabase/escopo/:escopoId - Listar por escopo
router.get('/escopo/:escopoId', async (req, res) => {
  try {
    const { escopoId } = req.params;
    
    // Buscar todos os nivel1 deste escopo e suas funcionalidades
    const { data: nivel1s, error: nivel1Error } = await supabase
      .from('nivel1')
      .select('id')
      .eq('escopo_funcional_id', escopoId);
    
    if (nivel1Error) {
      throw nivel1Error;
    }
    
    if (!nivel1s || nivel1s.length === 0) {
      return res.json({ data: [] });
    }
    
    const nivel1Ids = nivel1s.map(n => n.id);
    
    const { data: funcionalidades, error } = await supabase
      .from('nivel2')
      .select('*')
      .in('nivel1_id', nivel1Ids)
      .order('ordem');
    
    if (error) {
      throw error;
    }
    
    res.json({ data: funcionalidades });
  } catch (error) {
    console.error('Erro ao buscar funcionalidades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/funcionalidades-supabase/:id - Buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: funcionalidade, error } = await supabase
      .from('nivel2')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Funcionalidade não encontrada' });
      }
      throw error;
    }
    
    res.json({ data: funcionalidade });
  } catch (error) {
    console.error('Erro ao buscar funcionalidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/funcionalidades-supabase - Criar funcionalidade
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = funcionalidadeSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    // Verificar se nivel1 existe
    const { data: nivel1, error: nivel1Error } = await supabase
      .from('nivel1')
      .select('id')
      .eq('id', value.nivel1_id)
      .single();
    
    if (nivel1Error || !nivel1) {
      return res.status(400).json({ error: 'Nivel1 não encontrado' });
    }
    
    const { data: funcionalidade, error } = await supabase
      .from('nivel2')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'Funcionalidade criada com sucesso',
      data: funcionalidade
    });
  } catch (error) {
    console.error('Erro ao criar funcionalidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/funcionalidades-supabase/:id - Atualizar funcionalidade
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = funcionalidadeSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    const { data: funcionalidade, error } = await supabase
      .from('nivel2')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Funcionalidade não encontrada' });
      }
      throw error;
    }
    
    res.json({
      message: 'Funcionalidade atualizada com sucesso',
      data: funcionalidade
    });
  } catch (error) {
    console.error('Erro ao atualizar funcionalidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/funcionalidades-supabase/:id - Excluir funcionalidade
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: deleteError } = await supabase
      .from('nivel2')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Funcionalidade não encontrada' });
      }
      throw deleteError;
    }
    
    res.json({ message: 'Funcionalidade excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir funcionalidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 