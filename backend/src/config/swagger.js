const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SyncTech API',
      version: '1.0.0',
      description: 'API para sistema de gerenciamento de projetos SyncTech',
      contact: {
        name: 'SyncTech',
        email: 'contato@synctech.com.br'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.synctech.com.br'
          : `http://localhost:${process.env.PORT || 3001}`,
        description: process.env.NODE_ENV === 'production' ? 'Produção' : 'Desenvolvimento'
      }
    ],
    components: {
      schemas: {
        Cliente: {
          type: 'object',
          required: ['tipo_pessoa'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do cliente'
            },
            tipo_pessoa: {
              type: 'string',
              enum: ['PF', 'PJ'],
              description: 'Tipo de pessoa: Física ou Jurídica'
            },
            nome_empresa: {
              type: 'string',
              description: 'Nome da empresa (obrigatório para PJ)'
            },
            nome_completo: {
              type: 'string',
              description: 'Nome completo (obrigatório para PF)'
            },
            cpf: {
              type: 'string',
              description: 'CPF (obrigatório para PF)'
            },
            cnpj: {
              type: 'string',
              description: 'CNPJ (obrigatório para PJ)'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do cliente'
            },
            telefone: {
              type: 'string',
              description: 'Telefone do cliente'
            },
            ativo: {
              type: 'boolean',
              description: 'Status ativo/inativo do cliente'
            }
          }
        },
        Projeto: {
          type: 'object',
          required: ['cliente_id', 'nome'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do projeto'
            },
            cliente_id: {
              type: 'integer',
              description: 'ID do cliente associado'
            },
            nome: {
              type: 'string',
              description: 'Nome do projeto'
            },
            descricao: {
              type: 'string',
              description: 'Descrição detalhada do projeto'
            },
            status: {
              type: 'string',
              enum: [
                'nao_iniciado', 'planejamento', 'apresentado', 'orcamento_entregue',
                'orcamento_aprovado', 'contrato_assinado', 'entregue', 'suporte_garantia', 'concluido'
              ],
              description: 'Status atual do projeto'
            },
            valor_estimado: {
              type: 'number',
              format: 'float',
              description: 'Valor estimado do projeto'
            },
            horas_estimadas: {
              type: 'number',
              format: 'float',
              description: 'Horas estimadas para conclusão'
            }
          }
        },
        Tarefa: {
          type: 'object',
          required: ['projeto_id', 'titulo'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único da tarefa'
            },
            projeto_id: {
              type: 'integer',
              description: 'ID do projeto associado'
            },
            titulo: {
              type: 'string',
              description: 'Título da tarefa'
            },
            descricao: {
              type: 'string',
              description: 'Descrição da tarefa'
            },
            status: {
              type: 'string',
              enum: ['nao_iniciada', 'em_andamento', 'concluida', 'cancelada'],
              description: 'Status da tarefa'
            },
            prioridade: {
              type: 'string',
              enum: ['baixa', 'media', 'alta', 'critica'],
              description: 'Prioridade da tarefa'
            },
            data_alvo: {
              type: 'string',
              format: 'date',
              description: 'Data alvo para conclusão'
            },
            responsavel: {
              type: 'string',
              description: 'Responsável pela tarefa'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro'
            },
            details: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Detalhes específicos do erro'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem de sucesso'
            },
            data: {
              type: 'object',
              description: 'Dados retornados'
            }
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Requisição inválida',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Clientes',
        description: 'Operações relacionadas a clientes'
      },
      {
        name: 'Projetos',
        description: 'Operações relacionadas a projetos'
      },
      {
        name: 'Tarefas',
        description: 'Operações relacionadas a tarefas'
      },
      {
        name: 'Financeiro',
        description: 'Operações financeiras'
      },
      {
        name: 'Dashboard',
        description: 'Dados para dashboard e relatórios'
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Caminhos para arquivos com anotações do Swagger
};

const specs = swaggerJsdoc(options);

module.exports = specs; 