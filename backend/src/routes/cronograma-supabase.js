const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Schema de validação para cronograma
const cronogramaSchema = Joi.object({
  projeto_id: Joi.number().integer().positive().required(),
  fase: Joi.string().min(3).max(255).required(),
  descricao: Joi.string().allow(''),
  data_inicio: Joi.date().required(),
  data_fim: Joi.date().required(),
  data_inicio_real: Joi.date().allow(null),
  data_fim_real: Joi.date().allow(null),
  percentual_concluido: Joi.number().integer().min(0).max(100).default(0),
  status: Joi.string().valid('nao_iniciado', 'em_andamento', 'concluido', 'atrasado', 'cancelado').default('nao_iniciado'),
  responsavel: Joi.string().allow(''),
  dependencias: Joi.string().allow(''),
  observacoes: Joi.string().allow('')
});

// GET /api/cronograma-supabase - Listar cronogramas
router.get('/', async (req, res) => {
  try {
    const { projeto_id, status, fase, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('cronograma')
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
    
    if (fase) {
      query = query.ilike('fase', `%${fase}%`);
    }
    
    // Paginação
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1).order('data_inicio', { ascending: true });
    
    const { data: cronogramasRaw, error } = await query;
    
    if (error) {
      throw error;
    }

    // Processar dados para compatibilidade
    const cronogramas = cronogramasRaw.map(cronograma => {
      const hoje = new Date();
      const dataFim = new Date(cronograma.data_fim);
      const dataInicio = new Date(cronograma.data_inicio);
      
      // Calcular se está atrasado
      let statusCalculado = cronograma.status;
      if (cronograma.status !== 'concluido' && cronograma.status !== 'cancelado' && dataFim < hoje) {
        statusCalculado = 'atrasado';
      }
      
      // Calcular duração planejada e real
      const duracaoPlanejada = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24));
      let duracaoReal = null;
      if (cronograma.data_inicio_real && cronograma.data_fim_real) {
        const dataInicioReal = new Date(cronograma.data_inicio_real);
        const dataFimReal = new Date(cronograma.data_fim_real);
        duracaoReal = Math.ceil((dataFimReal - dataInicioReal) / (1000 * 60 * 60 * 24));
      }
      
      return {
        ...cronograma,
        status: statusCalculado,
        projeto_nome: cronograma.projetos?.nome,
        nome_empresa: cronograma.projetos?.clientes?.nome_empresa,
        nome_completo: cronograma.projetos?.clientes?.nome_completo,
        duracao_planejada: duracaoPlanejada,
        duracao_real: duracaoReal
      };
    });
    
    // Contar total para paginação
    let countQuery = supabase.from('cronograma').select('*', { count: 'exact', head: true });
    
    if (projeto_id) {
      countQuery = countQuery.eq('projeto_id', projeto_id);
    }
    
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    
    if (fase) {
      countQuery = countQuery.ilike('fase', `%${fase}%`);
    }
    
    const { count: total } = await countQuery;
    
    res.json({
      data: cronogramas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar cronogramas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/cronograma-supabase/:id - Buscar cronograma por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: cronograma, error } = await supabase
      .from('cronograma')
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
        return res.status(404).json({ error: 'Cronograma não encontrado' });
      }
      throw error;
    }

    // Processar dados para compatibilidade
    const cronogramaProcessado = {
      ...cronograma,
      projeto_nome: cronograma.projetos?.nome,
      nome_empresa: cronograma.projetos?.clientes?.nome_empresa,
      nome_completo: cronograma.projetos?.clientes?.nome_completo
    };
    
    res.json({ data: cronogramaProcessado });
  } catch (error) {
    console.error('Erro ao buscar cronograma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/cronograma-supabase - Criar cronograma
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = cronogramaSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    // Verificar se data_fim é posterior a data_inicio
    if (new Date(value.data_fim) <= new Date(value.data_inicio)) {
      return res.status(400).json({ error: 'Data de fim deve ser posterior à data de início' });
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
    
    const { data: cronograma, error } = await supabase
      .from('cronograma')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'Cronograma criado com sucesso',
      data: cronograma
    });
  } catch (error) {
    console.error('Erro ao criar cronograma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/cronograma-supabase/:id - Atualizar cronograma
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = cronogramaSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    // Verificar se data_fim é posterior a data_inicio
    if (new Date(value.data_fim) <= new Date(value.data_inicio)) {
      return res.status(400).json({ error: 'Data de fim deve ser posterior à data de início' });
    }
    
    const { data: cronograma, error } = await supabase
      .from('cronograma')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Cronograma não encontrado' });
      }
      throw error;
    }
    
    res.json({
      message: 'Cronograma atualizado com sucesso',
      data: cronograma
    });
  } catch (error) {
    console.error('Erro ao atualizar cronograma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/cronograma-supabase/:id - Excluir cronograma
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: deleteError } = await supabase
      .from('cronograma')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Cronograma não encontrado' });
      }
      throw deleteError;
    }
    
    res.json({ message: 'Cronograma excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cronograma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/cronograma-supabase/:id/progresso - Atualizar progresso
router.put('/:id/progresso', async (req, res) => {
  try {
    const { id } = req.params;
    const { percentual_concluido } = req.body;
    
    if (percentual_concluido < 0 || percentual_concluido > 100) {
      return res.status(400).json({ error: 'Percentual deve estar entre 0 e 100' });
    }
    
    // Determinar status baseado no progresso
    let status = 'nao_iniciado';
    if (percentual_concluido > 0 && percentual_concluido < 100) {
      status = 'em_andamento';
    } else if (percentual_concluido === 100) {
      status = 'concluido';
    }
    
    const updateData = {
      percentual_concluido,
      status
    };
    
    // Se iniciou (> 0%), definir data_inicio_real
    if (percentual_concluido > 0) {
      const { data: cronogramaAtual } = await supabase
        .from('cronograma')
        .select('data_inicio_real')
        .eq('id', id)
        .single();
      
      if (!cronogramaAtual?.data_inicio_real) {
        updateData.data_inicio_real = new Date().toISOString().split('T')[0];
      }
    }
    
    // Se concluído (100%), definir data_fim_real
    if (percentual_concluido === 100) {
      updateData.data_fim_real = new Date().toISOString().split('T')[0];
    }
    
    const { data: cronograma, error } = await supabase
      .from('cronograma')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Cronograma não encontrado' });
      }
      throw error;
    }
    
    res.json({
      message: 'Progresso atualizado com sucesso',
      data: cronograma
    });
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/cronograma-supabase/projeto/:projeto_id/gantt - Dados para gráfico de Gantt
router.get('/projeto/:projeto_id/gantt', async (req, res) => {
  try {
    const { projeto_id } = req.params;
    
    const { data: cronogramas, error } = await supabase
      .from('cronograma')
      .select('*')
      .eq('projeto_id', projeto_id)
      .order('data_inicio', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Formatar dados para gráfico de Gantt
    const ganttData = cronogramas.map(cronograma => ({
      id: cronograma.id,
      name: cronograma.fase,
      start: cronograma.data_inicio,
      end: cronograma.data_fim,
      progress: cronograma.percentual_concluido,
      status: cronograma.status,
      dependencies: cronograma.dependencias ? cronograma.dependencias.split(',').map(dep => dep.trim()) : [],
      responsavel: cronograma.responsavel,
      descricao: cronograma.descricao
    }));
    
    res.json({ data: ganttData });
  } catch (error) {
    console.error('Erro ao buscar dados do Gantt:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 