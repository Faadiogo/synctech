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
const clientesRoutes = require('./routes/clientes');
const clientesSupabaseRoutes = require('./routes/clientes-supabase');
const projetosRoutes = require('./routes/projetos');
const orcamentosRoutes = require('./routes/orcamentos');
const contratosRoutes = require('./routes/contratos');
const financeiroRoutes = require('./routes/financeiro');
const reunioesRoutes = require('./routes/reunioes');
const escoposRoutes = require('./routes/escopos');
const cronogramaRoutes = require('./routes/cronograma');
const tarefasRoutes = require('./routes/tarefas');
const tecnologiasRoutes = require('./routes/tecnologias');
const templatesRoutes = require('./routes/templates');
const dashboardRoutes = require('./routes/dashboard');

// Documentação da API
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Usar rotas
app.use('/api/clientes', clientesRoutes);
app.use('/api/clientes-supabase', clientesSupabaseRoutes);
app.use('/api/projetos', projetosRoutes);
app.use('/api/orcamentos', orcamentosRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/reunioes', reunioesRoutes);
app.use('/api/escopos', escoposRoutes);
app.use('/api/cronograma', cronogramaRoutes);
app.use('/api/tarefas', tarefasRoutes);
app.use('/api/tecnologias', tecnologiasRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/dashboard', dashboardRoutes);

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