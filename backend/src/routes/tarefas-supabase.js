const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Schema de validação para tarefa
const tarefaSchema = Joi.object({
  projeto_id: Joi.number().integer().positive().required(),
  escopo_id: Joi.number().integer().positive().allow(null),
  titulo: Joi.string().min(3).max(255).required(),
  descricao: Joi.string().allow(''),
  prioridade: Joi.string().valid('baixa', 'media', 'alta', 'critica').default('media'),
  status: Joi.string().valid('pendente', 'em_andamento', 'concluida', 'cancelada', 'bloqueada').default('pendente'),
  data_vencimento: Joi.date().allow(null),
  data_conclusao: Joi.date().allow(null),
  responsavel: Joi.string().allow(''),
  horas_estimadas: Joi.number().integer().min(0).allow(null),
  horas_trabalhadas: Joi.number().integer().min(0).default(0),
  tags: Joi.string().allow(''),
  observacoes: Joi.string().allow('')
});

// GET /api/tarefas-supabase - Listar tarefas
router.get('/', async (req, res) => {
  try {
    const { projeto_id, escopo_id, status, prioridade, responsavel, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('tarefas')
      .select(`
        *,
        projetos:projeto_id (
          nome,
          clientes:cliente_id (
            nome_empresa,
            nome_completo
          )
        ),
        escopos:escopo_id (
          funcionalidade
        )
      `);
    
    if (projeto_id) {
      query = query.eq('projeto_id', projeto_id);
    }
    
    if (escopo_id) {
      query = query.eq('escopo_id', escopo_id);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (prioridade) {
      query = query.eq('prioridade', prioridade);
    }
    
    if (responsavel) {
      query = query.ilike('responsavel', `%${responsavel}%`);
    }
    
    // Paginação
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1).order('created_at', { ascending: false });
    
    const { data: tarefasRaw, error } = await query;
    
    if (error) {
      throw error;
    }

    // Processar dados para compatibilidade
    const tarefas = tarefasRaw.map(tarefa => {
      const hoje = new Date();
      const vencimento = tarefa.data_vencimento ? new Date(tarefa.data_vencimento) : null;
      
      // Calcular se está atrasada
      let statusCalculado = tarefa.status;
      if (tarefa.status !== 'concluida' && tarefa.status !== 'cancelada' && vencimento && vencimento < hoje) {
        statusCalculado = 'atrasada';
      }
      
      // Calcular progresso se houver estimativa
      const progresso = tarefa.horas_estimadas > 0 ? 
        Math.round((tarefa.horas_trabalhadas / tarefa.horas_estimadas) * 100) : 0;
      
      return {
        ...tarefa,
        status_calculado: statusCalculado,
        progresso,
        projeto_nome: tarefa.projetos?.nome,
        nome_empresa: tarefa.projetos?.clientes?.nome_empresa,
        nome_completo: tarefa.projetos?.clientes?.nome_completo,
        escopo_funcionalidade: tarefa.escopos?.funcionalidade
      };
    });
    
    // Contar total para paginação
    let countQuery = supabase.from('tarefas').select('*', { count: 'exact', head: true });
    
    if (projeto_id) {
      countQuery = countQuery.eq('projeto_id', projeto_id);
    }
    
    if (escopo_id) {
      countQuery = countQuery.eq('escopo_id', escopo_id);
    }
    
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    
    if (prioridade) {
      countQuery = countQuery.eq('prioridade', prioridade);
    }
    
    if (responsavel) {
      countQuery = countQuery.ilike('responsavel', `%${responsavel}%`);
    }
    
    const { count: total } = await countQuery;
    
    res.json({
      data: tarefas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tarefas-supabase/:id - Buscar tarefa por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: tarefa, error } = await supabase
      .from('tarefas')
      .select(`
        *,
        projetos:projeto_id (
          nome,
          descricao,
          clientes:cliente_id (
            nome_empresa,
            nome_completo
          )
        ),
        escopos:escopo_id (
          funcionalidade,
          descricao
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }
      throw error;
    }

    // Processar dados para compatibilidade
    const tarefaProcessada = {
      ...tarefa,
      projeto_nome: tarefa.projetos?.nome,
      nome_empresa: tarefa.projetos?.clientes?.nome_empresa,
      nome_completo: tarefa.projetos?.clientes?.nome_completo,
      escopo_funcionalidade: tarefa.escopos?.funcionalidade
    };
    
    res.json({ data: tarefaProcessada });
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/tarefas-supabase - Criar tarefa
router.post('/', async (req, res) => {
  try {
    const { error: validationError, value } = tarefaSchema.validate(req.body);
    
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
    
    // Verificar se escopo existe (se fornecido)
    if (value.escopo_id) {
      const { data: escopo, error: escopoError } = await supabase
        .from('escopos')
        .select('id')
        .eq('id', value.escopo_id)
        .single();
      
      if (escopoError || !escopo) {
        return res.status(400).json({ error: 'Escopo não encontrado' });
      }
    }
    
    const { data: tarefa, error } = await supabase
      .from('tarefas')
      .insert([value])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'Tarefa criada com sucesso',
      data: tarefa
    });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/tarefas-supabase/:id - Atualizar tarefa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = tarefaSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationError.details.map(d => d.message)
      });
    }
    
    // Se marcando como concluída, definir data_conclusao
    if (value.status === 'concluida' && !value.data_conclusao) {
      value.data_conclusao = new Date().toISOString().split('T')[0];
    }
    
    const { data: tarefa, error } = await supabase
      .from('tarefas')
      .update(value)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }
      throw error;
    }
    
    res.json({
      message: 'Tarefa atualizada com sucesso',
      data: tarefa
    });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/tarefas-supabase/:id - Excluir tarefa
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: deleteError } = await supabase
      .from('tarefas')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }
      throw deleteError;
    }
    
    res.json({ message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/tarefas-supabase/:id/status - Atualizar status da tarefa
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const statusValidos = ['pendente', 'em_andamento', 'concluida', 'cancelada', 'bloqueada'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    const updateData = { status };
    
    // Se marcando como concluída, definir data_conclusao
    if (status === 'concluida') {
      updateData.data_conclusao = new Date().toISOString().split('T')[0];
    }
    
    const { data: tarefa, error } = await supabase
      .from('tarefas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }
      throw error;
    }
    
    res.json({
      message: 'Status atualizado com sucesso',
      data: tarefa
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tarefas-supabase/kanban - Visualização Kanban
router.get('/kanban', async (req, res) => {
  try {
    const { projeto_id } = req.query;
    
    let query = supabase
      .from('tarefas')
      .select(`
        *,
        projetos:projeto_id (
          nome
        ),
        escopos:escopo_id (
          funcionalidade
        )
      `);
    
    if (projeto_id) {
      query = query.eq('projeto_id', projeto_id);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data: tarefas, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Agrupar por status
    const kanban = {
      pendente: [],
      em_andamento: [],
      concluida: [],
      cancelada: [],
      bloqueada: []
    };
    
    tarefas.forEach(tarefa => {
      if (kanban[tarefa.status]) {
        kanban[tarefa.status].push({
          ...tarefa,
          projeto_nome: tarefa.projetos?.nome,
          escopo_funcionalidade: tarefa.escopos?.funcionalidade
        });
      }
    });
    
    res.json({ data: kanban });
  } catch (error) {
    console.error('Erro ao buscar kanban:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tarefas-supabase/dashboard - Estatísticas para dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const { projeto_id, responsavel } = req.query;
    
    let query = supabase.from('tarefas').select('*');
    
    if (projeto_id) {
      query = query.eq('projeto_id', projeto_id);
    }
    
    if (responsavel) {
      query = query.ilike('responsavel', `%${responsavel}%`);
    }
    
    const { data: tarefas, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Calcular estatísticas
    const total = tarefas.length;
    const pendentes = tarefas.filter(t => t.status === 'pendente').length;
    const em_andamento = tarefas.filter(t => t.status === 'em_andamento').length;
    const concluidas = tarefas.filter(t => t.status === 'concluida').length;
    const canceladas = tarefas.filter(t => t.status === 'cancelada').length;
    const bloqueadas = tarefas.filter(t => t.status === 'bloqueada').length;
    
    const hoje = new Date();
    const atrasadas = tarefas.filter(tarefa => {
      const vencimento = tarefa.data_vencimento ? new Date(tarefa.data_vencimento) : null;
      return tarefa.status !== 'concluida' && tarefa.status !== 'cancelada' && vencimento && vencimento < hoje;
    }).length;
    
    const horas_estimadas_total = tarefas.reduce((sum, t) => sum + (t.horas_estimadas || 0), 0);
    const horas_trabalhadas_total = tarefas.reduce((sum, t) => sum + (t.horas_trabalhadas || 0), 0);
    
    // Agrupar por prioridade
    const por_prioridade = {
      baixa: tarefas.filter(t => t.prioridade === 'baixa').length,
      media: tarefas.filter(t => t.prioridade === 'media').length,
      alta: tarefas.filter(t => t.prioridade === 'alta').length,
      critica: tarefas.filter(t => t.prioridade === 'critica').length
    };
    
    res.json({
      data: {
        total,
        pendentes,
        em_andamento,
        concluidas,
        canceladas,
        bloqueadas,
        atrasadas,
        horas_estimadas_total,
        horas_trabalhadas_total,
        por_prioridade
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 