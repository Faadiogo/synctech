const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limite de 100 requests por windowMs
  message: {
    error: 'Muitas requisições realizadas, tente novamente em alguns minutos.'
  }
});

app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para arquivos estáticos
app.use('/uploads', express.static('uploads'));

// Importar rotas
const clientesSupabaseRoutes = require('./routes/clientes-supabase');
const projetosSupabaseRoutes = require('./routes/projetos-supabase');
const orcamentosSupabaseRoutes = require('./routes/orcamentos-supabase');
const contratosSupabaseRoutes = require('./routes/contratos-supabase');
const financeiroSupabaseRoutes = require('./routes/financeiro-supabase');
const reunioesSupabaseRoutes = require('./routes/reunioes-supabase');
const escoposSupabaseRoutes = require('./routes/escopos-supabase');
const cronogramaSupabaseRoutes = require('./routes/cronograma-supabase');
const tarefasSupabaseRoutes = require('./routes/tarefas-supabase');
const tecnologiasSupabaseRoutes = require('./routes/tecnologias-supabase');
const dashboardSupabaseRoutes = require('./routes/dashboard-supabase');
const templatesRoutes = require('./routes/templates');

// Documentação da API
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Usar rotas
app.use('/api/clientes-supabase', clientesSupabaseRoutes);
app.use('/api/projetos-supabase', projetosSupabaseRoutes);
app.use('/api/orcamentos-supabase', orcamentosSupabaseRoutes);
app.use('/api/contratos-supabase', contratosSupabaseRoutes);
app.use('/api/financeiro-supabase', financeiroSupabaseRoutes);
app.use('/api/reunioes-supabase', reunioesSupabaseRoutes);
app.use('/api/escopos-supabase', escoposSupabaseRoutes);
app.use('/api/cronograma-supabase', cronogramaSupabaseRoutes);
app.use('/api/tarefas-supabase', tarefasSupabaseRoutes);
app.use('/api/tecnologias-supabase', tecnologiasSupabaseRoutes);
app.use('/api/dashboard-supabase', dashboardSupabaseRoutes);
app.use('/api/templates', templatesRoutes);

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'SyncTech API', 
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro na aplicação:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON inválido na requisição'
    });
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe nesta API`
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📚 Documentação disponível em http://localhost:${PORT}/api-docs`);
  console.log(`🔍 Health check em http://localhost:${PORT}/health`);
}); 