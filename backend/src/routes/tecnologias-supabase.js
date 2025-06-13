const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Schema de validação para tecnologia
const tecnologiaSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required(),
  categoria: Joi.string().valid('frontend', 'backend', 'database', 'devops', 'mobile', 'design', 'teste', 'outro').default('outro'),
  versao: Joi.string().allow(''),
  descricao: Joi.string().allow(''),
  url_documentacao: Joi.string().uri().allow(''),
  nivel_conhecimento: Joi.string().valid('basico', 'intermediario', 'avancado', 'expert').default('basico'),
  ativo: Joi.boolean().default(true)
});

// GET /api/tecnologias-supabase - Listar tecnologias
router.get('/', async (req, res) => {
  try {
    const { categoria, nivel_conhecimento, ativo, busca, page = 1, limit = 50 } = req.query;
    
    let query = supabase.from('tecnologias').select('*');
    
    if (categoria) {
      query = query.eq('categoria', categoria);
    }
    
    if (nivel_conhecimento) {
      query = query.eq('nivel_conhecimento', nivel_conhecimento);
    }
    
    if (ativo !== undefined) {
      query = query.eq('ativo', ativo === 'true');
    }
    
    if (busca) {
      query = query.or(`nome.ilike.%${busca}%,descricao.ilike.%${busca}%`);
    }
    
    // Paginação
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1).order('nome', { ascending: true });
    
    const { data: tecnologias, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Contar total para paginação
    let countQuery = supabase.from('tecnologias').select('*', { count: 'exact', head: true });
    
    if (categoria) {
      countQuery = countQuery.eq('categoria', categoria);
    }
    
    if (nivel_conhecimento) {
      countQuery = countQuery.eq('nivel_conhecimento', nivel_conhecimento);
    }
    
    if (ativo !== undefined) {
      countQuery = countQuery.eq('ativo', ativo === 'true');
    }
    
    if (busca) {
      countQuery = countQuery.or(`nome.ilike.%${busca}%,descricao.ilike.%${busca}%`);
    }
    
    const { count: total } = await countQuery;
    
    res.json({
      data: tecnologias,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar tecnologias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tecnologias-supabase/:id - Buscar tecnologia por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: tecnologia, error } = await supabase
      .from('tecnologias')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tecnologia não encontrada' });
      }
      throw error;
    }
    
    res.json({ data: tecnologia });
  } catch (error) {
    console.error('Erro ao buscar tecnologia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/tecnologias-supabase - Criar tecnologia
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = tecnologiaSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    // Verificar se já existe uma tecnologia com o mesmo nome
    const { data: existente } = await supabase
      .from('tecnologias')
      .select('id')
      .eq('nome', value.nome)
      .single();
    
    if (existente) {
      return res.status(400).json({ error: 'Já existe uma tecnologia com este nome' });
    }
    
    const { data: tecnologia, error } = await supabase
      .from('tecnologias')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'Tecnologia criada com sucesso',
      data: tecnologia
    });
  } catch (error) {
    console.error('Erro ao criar tecnologia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/tecnologias-supabase/:id - Atualizar tecnologia
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = tecnologiaSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    // Verificar se já existe outra tecnologia com o mesmo nome
    const { data: existente } = await supabase
      .from('tecnologias')
      .select('id')
      .eq('nome', value.nome)
      .neq('id', id)
      .single();
    
    if (existente) {
      return res.status(400).json({ error: 'Já existe uma tecnologia com este nome' });
    }
    
    const { data: tecnologia, error } = await supabase
      .from('tecnologias')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tecnologia não encontrada' });
      }
      throw error;
    }
    
    res.json({
      message: 'Tecnologia atualizada com sucesso',
      data: tecnologia
    });
  } catch (error) {
    console.error('Erro ao atualizar tecnologia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/tecnologias-supabase/:id - Excluir tecnologia
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: deleteError } = await supabase
      .from('tecnologias')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tecnologia não encontrada' });
      }
      throw deleteError;
    }
    
    res.json({ message: 'Tecnologia excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tecnologia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tecnologias-supabase/categorias - Listar categorias disponíveis
router.get('/categorias', async (req, res) => {
  try {
    const categorias = [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
      { value: 'database', label: 'Database' },
      { value: 'devops', label: 'DevOps' },
      { value: 'mobile', label: 'Mobile' },
      { value: 'design', label: 'Design' },
      { value: 'teste', label: 'Teste' },
      { value: 'outro', label: 'Outro' }
    ];
    
    res.json({ data: categorias });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tecnologias-supabase/estatisticas - Estatísticas das tecnologias
router.get('/estatisticas', async (req, res) => {
  try {
    const { data: tecnologias, error } = await supabase
      .from('tecnologias')
      .select('*')
      .eq('ativo', true);
    
    if (error) {
      throw error;
    }
    
    // Calcular estatísticas
    const total = tecnologias.length;
    
    // Agrupar por categoria
    const por_categoria = {};
    tecnologias.forEach(tech => {
      if (!por_categoria[tech.categoria]) {
        por_categoria[tech.categoria] = 0;
      }
      por_categoria[tech.categoria]++;
    });
    
    // Agrupar por nível de conhecimento
    const por_nivel = {};
    tecnologias.forEach(tech => {
      if (!por_nivel[tech.nivel_conhecimento]) {
        por_nivel[tech.nivel_conhecimento] = 0;
      }
      por_nivel[tech.nivel_conhecimento]++;
    });
    
    res.json({
      data: {
        total,
        por_categoria,
        por_nivel
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 