'use client';

import { useState } from 'react';
import { ClientList } from './client-list';
import { ClientForm } from './client-form';
import { ProjectForm } from '../projects/project-form';

type ViewMode = 'list' | 'client-form' | 'project-form';

export function ClientPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingClientId, setEditingClientId] = useState<number | undefined>();
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handler para criar novo cliente
  const handleNewClient = () => {
    setEditingClientId(undefined);
    setViewMode('client-form');
  };

  // Handler para editar cliente existente
  const handleEditClient = (clientId: number) => {
    setEditingClientId(clientId);
    setViewMode('client-form');
  };

  // Handler para visualizar projetos do cliente
  const handleViewProjects = (clientId: number, clientName: string) => {
    // Esta funcionalidade pode ser implementada como uma modal ou nova página
    console.log(`Visualizar projetos do cliente ${clientName} (ID: ${clientId})`);
    // Exemplo: window.location.href = `/projetos?cliente=${clientId}`;
  };

  // Handler para criar novo projeto para um cliente específico
  const handleNewProject = (clientId: number, clientName: string) => {
    setSelectedClientId(clientId);
    setViewMode('project-form');
  };

  // Handler para fechar formulários
  const handleFormClose = () => {
    setViewMode('list');
    setEditingClientId(undefined);
    setSelectedClientId(undefined);
  };

  // Handler para sucesso em formulários
  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setViewMode('list');
    setEditingClientId(undefined);
    setSelectedClientId(undefined);
  };

  return (
    <div className="container mx-auto p-6">
      {viewMode === 'list' && (
        <ClientList
          onNewClient={handleNewClient}
          onEditClient={handleEditClient}
          onViewProjects={handleViewProjects}
          onNewProject={handleNewProject}
          refreshTrigger={refreshTrigger}
        />
      )}

      {viewMode === 'client-form' && (
        <ClientForm
          onClose={handleFormClose}
          clienteId={editingClientId}
          onSuccess={handleFormSuccess}
        />
      )}

      {viewMode === 'project-form' && (
        <ProjectForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          clienteId={selectedClientId}
        />
      )}
    </div>
  );
} 