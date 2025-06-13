const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Schema de validação para escopo
const escopoSchema = Joi.object({
  projeto_id: Joi.number().integer().positive().required(),
  funcionalidade: Joi.string().min(3).max(255).required(),
  descricao: Joi.string().allow(''),
  categoria: Joi.string().valid('frontend', 'backend', 'design', 'integracao', 'teste', 'documentacao', 'outro').default('outro'),
  prioridade: Joi.string().valid('baixa', 'media', 'alta', 'critica').default('media'),
  complexidade: Joi.string().valid('simples', 'media', 'complexa', 'muito_complexa').default('media'),
  horas_estimadas: Joi.number().integer().min(0).allow(null),
  horas_trabalhadas: Joi.number().integer().min(0).default(0),
  status: Joi.string().valid('nao_iniciado', 'em_andamento', 'concluido', 'cancelado', 'em_revisao').default('nao_iniciado'),
  data_inicio: Joi.date().allow(null),
  data_conclusao: Joi.date().allow(null),
  responsavel: Joi.string().allow(''),
  observacoes: Joi.string().allow('')
});

// GET /api/escopos-supabase - Listar escopos
router.get('/', async (req, res) => {
  try {
    const { projeto_id, status, categoria, prioridade, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('escopos')
      .select(`
        *,
        projetos:projeto_id (
          nome,
          clientes:cliente_id (
            nome_empresa,
            nome_completo
          )
        )
      `);
    
    if (projeto_id) {
      query = query.eq('projeto_id', projeto_id);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (categoria) {
      query = query.eq('categoria', categoria);
    }
    
    if (prioridade) {
      query = query.eq('prioridade', prioridade);
    }
    
    // Paginação
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1).order('created_at', { ascending: false });
    
    const { data: escoposRaw, error } = await query;
    
    if (error) {
      throw error;
    }

    // Processar dados para compatibilidade
    const escopos = escoposRaw.map(escopo => ({
      ...escopo,
      projeto_nome: escopo.projetos?.nome,
      nome_empresa: escopo.projetos?.clientes?.nome_empresa,
      nome_completo: escopo.projetos?.clientes?.nome_completo,
      progresso: escopo.horas_estimadas > 0 ? 
        Math.round((escopo.horas_trabalhadas / escopo.horas_estimadas) * 100) : 0
    }));
    
    // Contar total para paginação
    let countQuery = supabase.from('escopos').select('*', { count: 'exact', head: true });
    
    if (projeto_id) {
      countQuery = countQuery.eq('projeto_id', projeto_id);
    }
    
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    
    if (categoria) {
      countQuery = countQuery.eq('categoria', categoria);
    }
    
    if (prioridade) {
      countQuery = countQuery.eq('prioridade', prioridade);
    }
    
    const { count: total } = await countQuery;
    
    res.json({
      data: escopos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar escopos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/escopos-supabase/:id - Buscar escopo por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: escopo, error } = await supabase
      .from('escopos')
      .select(`
        *,
        projetos:projeto_id (
          nome,
          descricao,
          clientes:cliente_id (
            nome_empresa,
            nome_completo
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Escopo não encontrado' });
      }
      throw error;
    }

    // Processar dados para compatibilidade
    const escopoProcessado = {
      ...escopo,
      projeto_nome: escopo.projetos?.nome,
      nome_empresa: escopo.projetos?.clientes?.nome_empresa,
      nome_completo: escopo.projetos?.clientes?.nome_completo,
      progresso: escopo.horas_estimadas > 0 ? 
        Math.round((escopo.horas_trabalhadas / escopo.horas_estimadas) * 100) : 0
    };
    
    res.json({ data: escopoProcessado });
  } catch (error) {
    console.error('Erro ao buscar escopo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/escopos-supabase - Criar escopo
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = escopoSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    // Verificar se projeto existe
    const { data: projeto, error: projetoError } = await supabase
      .from('projetos')
      .select('id')
      .eq('id', value.projeto_id)
      .single();
    
    if (projetoError || !projeto) {
      return res.status(400).json({ error: 'Projeto não encontrado' });
    }
    
    const { data: escopo, error } = await supabase
      .from('escopos')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'Escopo criado com sucesso',
      data: escopo
    });
  } catch (error) {
    console.error('Erro ao criar escopo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/escopos-supabase/:id - Atualizar escopo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = escopoSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    const { data: escopo, error } = await supabase
      .from('escopos')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Escopo não encontrado' });
      }
      throw error;
    }
    
    res.json({
      message: 'Escopo atualizado com sucesso',
      data: escopo
    });
  } catch (error) {
    console.error('Erro ao atualizar escopo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/escopos-supabase/:id - Excluir escopo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: deleteError } = await supabase
      .from('escopos')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Escopo não encontrado' });
      }
      throw deleteError;
    }
    
    res.json({ message: 'Escopo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir escopo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/escopos-supabase/projeto/:projeto_id/resumo - Resumo do projeto
router.get('/projeto/:projeto_id/resumo', async (req, res) => {
  try {
    const { projeto_id } = req.params;
    
    const { data: escopos, error } = await supabase
      .from('escopos')
      .select('*')
      .eq('projeto_id', projeto_id);
    
    if (error) {
      throw error;
    }
    
    // Calcular estatísticas
    const total = escopos.length;
    const concluidos = escopos.filter(e => e.status === 'concluido').length;
    const em_andamento = escopos.filter(e => e.status === 'em_andamento').length;
    const nao_iniciados = escopos.filter(e => e.status === 'nao_iniciado').length;
    
    const horas_estimadas_total = escopos.reduce((sum, e) => sum + (e.horas_estimadas || 0), 0);
    const horas_trabalhadas_total = escopos.reduce((sum, e) => sum + (e.horas_trabalhadas || 0), 0);
    
    const progresso_geral = horas_estimadas_total > 0 ? 
      Math.round((horas_trabalhadas_total / horas_estimadas_total) * 100) : 0;
    
    // Agrupar por categoria
    const por_categoria = {};
    escopos.forEach(escopo => {
      if (!por_categoria[escopo.categoria]) {
        por_categoria[escopo.categoria] = {
          total: 0,
          concluidos: 0,
          horas_estimadas: 0,
          horas_trabalhadas: 0
        };
      }
      por_categoria[escopo.categoria].total++;
      if (escopo.status === 'concluido') por_categoria[escopo.categoria].concluidos++;
      por_categoria[escopo.categoria].horas_estimadas += escopo.horas_estimadas || 0;
      por_categoria[escopo.categoria].horas_trabalhadas += escopo.horas_trabalhadas || 0;
    });
    
    // Agrupar por prioridade
    const por_prioridade = {};
    escopos.forEach(escopo => {
      if (!por_prioridade[escopo.prioridade]) {
        por_prioridade[escopo.prioridade] = 0;
      }
      por_prioridade[escopo.prioridade]++;
    });
    
    res.json({
      data: {
        total_escopos: total,
        concluidos,
        em_andamento,
        nao_iniciados,
        horas_estimadas_total,
        horas_trabalhadas_total,
        progresso_geral,
        por_categoria,
        por_prioridade
      }
    });
  } catch (error) {
    console.error('Erro ao buscar resumo do projeto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 