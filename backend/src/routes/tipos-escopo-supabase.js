const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Schema de validação para tipo de escopo
const tipoEscopoSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required(),
  descricao: Joi.string().allow(''),
  cor_hex: Joi.string().pattern(/^#[0-9A-F]{6}$/i).allow(''),
  icon_name: Joi.string().max(50).default('FolderTree')
});

// GET /api/tipos-escopo-supabase - Listar tipos de escopo
router.get('/', async (req, res) => {
  try {
    const { data: tipos, error } = await supabase
      .from('nivel1_tipos')
      .select('*')
      .order('nome');
    
    if (error) {
      throw error;
    }
    
    res.json({ data: tipos });
  } catch (error) {
    console.error('Erro ao buscar tipos de escopo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tipos-escopo-supabase/:id - Buscar tipo por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: tipo, error } = await supabase
      .from('nivel1_tipos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tipo de escopo não encontrado' });
      }
      throw error;
    }
    
    res.json({ data: tipo });
  } catch (error) {
    console.error('Erro ao buscar tipo de escopo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/tipos-escopo-supabase - Criar tipo de escopo
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = tipoEscopoSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    const { data: tipo, error } = await supabase
      .from('nivel1_tipos')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'Tipo de escopo criado com sucesso',
      data: tipo
    });
  } catch (error) {
    console.error('Erro ao criar tipo de escopo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/tipos-escopo-supabase/:id - Atualizar tipo de escopo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = tipoEscopoSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    const { data: tipo, error } = await supabase
      .from('nivel1_tipos')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tipo de escopo não encontrado' });
      }
      throw error;
    }
    
    res.json({
      message: 'Tipo de escopo atualizado com sucesso',
      data: tipo
    });
  } catch (error) {
    console.error('Erro ao atualizar tipo de escopo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/tipos-escopo-supabase/:id - Excluir tipo de escopo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: deleteError } = await supabase
      .from('nivel1_tipos')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tipo de escopo não encontrado' });
      }
      throw deleteError;
    }
    
    res.json({ message: 'Tipo de escopo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tipo de escopo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 