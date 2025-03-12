// Tipos predefinidos
export type PendenciaTipo = 
  | "Prestação de Contas" 
  | "Licitação" 
  | "Execução" 
  | "Documentação" 
  | "Outro";

export type PendenciaSubtipo = 
  | "Aguardando Documentos" 
  | "Em Análise" 
  | "Urgente" 
  | "Concluído" 
  | "Pendente" 
  | string; // Permite subtipos personalizados

// Interface principal para pendências
export interface PendenciaType {
  id: string;
  convenioId: string;
  municipioId: string;
  tipo: PendenciaTipo;
  subtipo: PendenciaSubtipo;
  descricao: string;
  detalhes: string;
  responsavel?: string;
  dataCriacao: string;
  dataAtualizacao: string;
  dataLimite?: string;
  status: "aberta" | "concluida";
  prioridade: "baixa" | "media" | "alta";
}

// Interface para criação de nova pendência
export interface NovaPendenciaType {
  convenioId: string;
  municipioId: string;
  tipo: PendenciaTipo;
  subtipo: PendenciaSubtipo;
  descricao: string;
  detalhes: string;
  responsavel?: string;
  dataLimite?: string;
  prioridade: "baixa" | "media" | "alta";
}