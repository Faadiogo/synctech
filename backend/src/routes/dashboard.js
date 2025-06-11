const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// GET /api/dashboard/overview - Visão geral do dashboard
router.get('/overview', async (req, res) => {
  try {
    // Estatísticas gerais
    const stats = await Promise.all([
      executeQuery('SELECT COUNT(*) as total FROM clientes WHERE ativo = TRUE'),
      executeQuery('SELECT COUNT(*) as total FROM projetos'),
      executeQuery('SELECT COUNT(*) as total FROM projetos WHERE status IN ("em_andamento", "contrato_assinado")'),
      executeQuery('SELECT COUNT(*) as total FROM tarefas WHERE status = "concluida"'),
      executeQuery('SELECT SUM(valor_estimado) as total FROM projetos WHERE valor_estimado IS NOT NULL'),
      executeQuery('SELECT COUNT(*) as total FROM financeiro WHERE status = "em_aberto" AND tipo_movimento = "entrada"')
    ]);

    const [
      clientes, projetos, projetosAtivos, tarefasConcluidas, 
      valorTotal, contasReceber
    ] = stats;

    // Projetos por status
    const projetosPorStatus = await executeQuery(`
      SELECT status, COUNT(*) as quantidade
      FROM projetos
      GROUP BY status
      ORDER BY quantidade DESC
    `);

    // Tarefas por prioridade
    const tarefasPorPrioridade = await executeQuery(`
      SELECT prioridade, COUNT(*) as quantidade
      FROM tarefas
      WHERE status != 'concluida'
      GROUP BY prioridade
    `);

    // Receita mensal
    const receitaMensal = await executeQuery(`
      SELECT 
        YEAR(data_pagamento) as ano,
        MONTH(data_pagamento) as mes,
        SUM(valor) as total
      FROM financeiro
      WHERE tipo_movimento = 'entrada' AND status = 'pago'
        AND data_pagamento >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY YEAR(data_pagamento), MONTH(data_pagamento)
      ORDER BY ano DESC, mes DESC
    `);

    // Próximas tarefas
    const proximasTarefas = await executeQuery(`
      SELECT t.*, p.nome as projeto_nome, c.nome_empresa, c.nome_completo
      FROM tarefas t
      LEFT JOIN projetos p ON t.projeto_id = p.id
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE t.status IN ('nao_iniciada', 'em_andamento')
      ORDER BY t.data_alvo ASC
      LIMIT 10
    `);

    res.json({
      data: {
        estatisticas: {
          totalClientes: clientes[0].total,
          totalProjetos: projetos[0].total,
          projetosAtivos: projetosAtivos[0].total,
          tarefasConcluidas: tarefasConcluidas[0].total,
          valorTotalProjetos: valorTotal[0].total || 0,
          contasReceber: contasReceber[0].total
        },
        projetosPorStatus,
        tarefasPorPrioridade,
        receitaMensal,
        proximasTarefas
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/dashboard/financeiro - Dados financeiros
router.get('/financeiro', async (req, res) => {
  try {
    const { periodo = '6' } = req.query; // meses

    // Receitas vs Despesas
    const fluxoCaixa = await executeQuery(`
      SELECT 
        DATE_FORMAT(data_vencimento, '%Y-%m') as periodo,
        tipo_movimento,
        SUM(valor) as total,
        COUNT(*) as quantidade
      FROM financeiro
      WHERE data_vencimento >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(data_vencimento, '%Y-%m'), tipo_movimento
      ORDER BY periodo DESC
    `, [parseInt(periodo)]);

    // Contas a receber
    const contasReceber = await executeQuery(`
      SELECT f.*, c.nome_empresa, c.nome_completo, p.nome as projeto_nome
      FROM financeiro f
      LEFT JOIN contratos ct ON f.contrato_id = ct.id
      LEFT JOIN clientes c ON ct.cliente_id = c.id
      LEFT JOIN projetos p ON ct.projeto_id = p.id
      WHERE f.tipo_movimento = 'entrada' AND f.status = 'em_aberto'
      ORDER BY f.data_vencimento ASC
      LIMIT 20
    `);

    // Contas em atraso
    const contasAtrasadas = await executeQuery(`
      SELECT f.*, c.nome_empresa, c.nome_completo, p.nome as projeto_nome,
        DATEDIFF(NOW(), f.data_vencimento) as dias_atraso
      FROM financeiro f
      LEFT JOIN contratos ct ON f.contrato_id = ct.id
      LEFT JOIN clientes c ON ct.cliente_id = c.id
      LEFT JOIN projetos p ON ct.projeto_id = p.id
      WHERE f.status = 'em_aberto' AND f.data_vencimento < NOW()
      ORDER BY f.data_vencimento ASC
    `);

    // Receita por projeto
    const receitaPorProjeto = await executeQuery(`
      SELECT p.nome, SUM(f.valor) as total_receita, COUNT(f.id) as parcelas
      FROM projetos p
      LEFT JOIN contratos ct ON p.id = ct.projeto_id
      LEFT JOIN financeiro f ON ct.id = f.contrato_id
      WHERE f.tipo_movimento = 'entrada' AND f.status = 'pago'
      GROUP BY p.id, p.nome
      ORDER BY total_receita DESC
      LIMIT 10
    `);

    res.json({
      data: {
        fluxoCaixa,
        contasReceber,
        contasAtrasadas,
        receitaPorProjeto
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/dashboard/produtividade - Dados de produtividade
router.get('/produtividade', async (req, res) => {
  try {
    // Horas trabalhadas vs estimadas por projeto
    const horasProjetos = await executeQuery(`
      SELECT p.nome, p.horas_estimadas, p.horas_trabalhadas,
        ROUND((p.horas_trabalhadas / NULLIF(p.horas_estimadas, 0)) * 100, 2) as percentual_horas
      FROM projetos p
      WHERE p.horas_estimadas > 0
      ORDER BY p.created_at DESC
      LIMIT 15
    `);

    // Tarefas concluídas por período
    const tarefasPorPeriodo = await executeQuery(`
      SELECT 
        DATE_FORMAT(data_conclusao, '%Y-%m-%d') as data,
        COUNT(*) as quantidade
      FROM tarefas
      WHERE status = 'concluida' AND data_conclusao >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE_FORMAT(data_conclusao, '%Y-%m-%d')
      ORDER BY data DESC
    `);

    // Distribuição de tarefas por status
    const distribuicaoTarefas = await executeQuery(`
      SELECT status, COUNT(*) as quantidade
      FROM tarefas
      GROUP BY status
    `);

    // Projetos com maior atraso
    const projetosAtrasados = await executeQuery(`
      SELECT p.nome, p.data_alvo, 
        DATEDIFF(NOW(), p.data_alvo) as dias_atraso,
        c.nome_empresa, c.nome_completo
      FROM projetos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE p.data_alvo < NOW() AND p.status NOT IN ('concluido', 'entregue')
      ORDER BY dias_atraso DESC
      LIMIT 10
    `);

    res.json({
      data: {
        horasProjetos,
        tarefasPorPeriodo,
        distribuicaoTarefas,
        projetosAtrasados
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados de produtividade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 