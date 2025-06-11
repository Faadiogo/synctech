# SyncTech Backend

Backend Node.js para o sistema de gerenciamento de projetos SyncTech, utilizando **Supabase** (PostgreSQL) como banco de dados.

## 🚀 Tecnologias

- **Node.js** + **Express.js**
- **Supabase** (PostgreSQL gerenciado)
- **Joi** (validação de dados)
- **JWT** (autenticação)
- **Swagger** (documentação da API)
- **Helmet** + **CORS** (segurança)

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Supabase
- npm ou yarn

## 🛠️ Configuração do Supabase

1. **Criar projeto no Supabase:**
   - Acesse [supabase.com](https://supabase.com)
   - Crie uma nova organização e projeto
   - Anote a URL e chave anônima do projeto

2. **Obter credenciais de conexão:**
   - No painel do Supabase, vá em Settings > Database
   - Copie as informações de conexão PostgreSQL

## ⚙️ Instalação

1. **Clone e instale dependências:**
```bash
cd backend
npm install
```

2. **Configure variáveis de ambiente:**
```bash
cp env.example .env
```

3. **Preencha o arquivo `.env` com suas credenciais do Supabase:**
```env
# Configuração da Aplicação
PORT=3001
NODE_ENV=development

# Configuração do Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima-aqui

# Configuração direta do PostgreSQL
SUPABASE_HOST=sua-db-host.supabase.co
SUPABASE_PORT=5432
SUPABASE_DATABASE=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=sua-senha-aqui

# JWT Secret
JWT_SECRET=sua-chave-secreta-jwt-super-segura-aqui
```

4. **Execute as migrações do banco de dados:**
```bash
npm run migrate
```

5. **Inicie o servidor:**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📊 Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas principais:

### Tabelas Core
- **clientes** - Clientes PF/PJ
- **projetos** - Projetos de desenvolvimento
- **orcamentos** - Orçamentos gerados
- **contratos** - Contratos assinados
- **financeiro** - Controle de pagamentos

### Tabelas de Gestão
- **reunioes** - Reuniões do projeto
- **tarefas** - Tarefas kanban
- **cronograma_entregas** - Fases de entrega
- **escopos_funcionais** - Escopos e funcionalidades

### Tabelas de Apoio
- **tecnologias** - Stack tecnológico
- **templates_contrato** - Templates de contrato
- **tipos_escopo** - Tipos de escopo

## 🔌 API Endpoints

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `GET /api/clientes/:id` - Buscar cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Remover cliente

### Projetos
- `GET /api/projetos` - Listar projetos
- `POST /api/projetos` - Criar projeto
- `GET /api/projetos/:id` - Buscar projeto
- `PUT /api/projetos/:id` - Atualizar projeto

### Dashboard
- `GET /api/dashboard/overview` - Estatísticas gerais
- `GET /api/dashboard/financeiro` - Dashboard financeiro
- `GET /api/dashboard/produtividade` - Métricas de produtividade

### Tarefas
- `GET /api/tarefas/kanban/:projetoId` - Board Kanban
- `PUT /api/tarefas/:id/status` - Atualizar status da tarefa

E muitas outras rotas para orçamentos, contratos, reuniões, etc.

## 📚 Documentação da API

Acesse a documentação Swagger em: `http://localhost:3001/api-docs`

## 🔐 Segurança

- Rate limiting configurado
- Headers de segurança com Helmet
- CORS configurado
- Validação de entrada com Joi
- Prepared statements para prevenir SQL injection

## 🏗️ Estrutura do Projeto

```
backend/
├── src/
│   ├── config/           # Configurações
│   │   └── database.js   # Config Supabase
│   │   └── migrate.js    # Script de migração
│   │   └── routes/       # Rotas da API
│   │       ├── clientes.js
│   │       ├── projetos.js
│   │       ├── dashboard.js
│   │       └── ...
│   └── server.js         # Servidor principal
├── package.json
├── .env.example
└── README.md
```

## 🚦 Scripts Disponíveis

```bash
npm start          # Produção
npm run dev        # Desenvolvimento com nodemon  
npm run migrate    # Executar migrações
```

## 🌐 Vantagens do Supabase

- **PostgreSQL gerenciado** - Sem necessidade de configurar servidor
- **Backups automáticos** - Dados sempre seguros
- **Escalabilidade** - Cresce conforme a demanda
- **Dashboard visual** - Interface para gerenciar dados
- **API REST automática** - Opcional para operações simples
- **Real-time** - Subscriptions em tempo real
- **Autenticação** - Sistema de auth integrado
- **Storage** - Para arquivos e documentos

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para suporte, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento. 