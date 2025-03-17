from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from datetime import datetime

class Dado(BaseModel):
    valor_repasse: str
    valor_contrapartida: str
    percentual_recurso_repassado: str
    valor_desbloqueado_empresa: str
    percentual_execucao_obra: str
    vigencia_convenio: str
    dados_bancarios: str
    vigencia_lac: str
    processo_licitatorio: str
    empresa_executora: str
    valor_contrato_empresa: str
    vigencia_contrato_empresa: str
    prazo_pagamento_empresa: str
    outros_dados: list[str]

class Convenio(BaseModel):
    convenio: str
    objeto: str
    dados: list[Dado]

class Municipio(BaseModel):
    municipio: str
    convenios: list[Convenio]

class MunicipioDados(BaseModel):
    id: Optional[str] = None
    municipio: str
    cnpj: str
    prefeito: str
    endereco: str
    e_mail: str
    telefone: str
    rg_prefeito: str
    cpf_prefeito: str
    operacional: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    nome: str
    municipios: Optional[List[str]] = []

class UserResponse(BaseModel):
    email: str
    nome: str
    municipios: List[str]
    token: Optional[str] = None

from typing import List, Optional, Literal
from pydantic import BaseModel, validator
from datetime import datetime

# Define literals para tipos restritos
PendenciaTipo = Literal["Prestação de Contas", "Licitação", "Execução", "Documentação", "Outro"]
PendenciaSubtipo = Literal["Aguardando Documentos", "Em Análise", "Urgente", "Concluído", "Pendente"]
PendenciaStatus = Literal["aberta", "concluida"]
PendenciaPrioridade = Literal["baixa", "media", "alta"]

class NovaPendenciaType(BaseModel):
    convenioId: str
    municipioId: str
    tipo: PendenciaTipo
    subtipo: str
    descricao: str
    detalhes: str
    responsavel: Optional[str] = None
    dataLimite: Optional[str] = None
    prioridade: PendenciaPrioridade

class PendenciaType(BaseModel):
    id: str
    convenioId: str
    municipioId: str
    tipo: PendenciaTipo
    subtipo: str
    descricao: str
    detalhes: str
    responsavel: Optional[str] = None
    dataCriacao: str
    dataAtualizacao: str
    dataLimite: Optional[str] = None
    status: PendenciaStatus
    prioridade: PendenciaPrioridade

    @validator('dataCriacao', 'dataAtualizacao', pre=True)
    def validate_dates(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v

# Para operações de criação e atualização
class PendenciaCreate(BaseModel):
    convenioId: str
    municipioId: str
    tipo: PendenciaTipo
    subtipo: str
    descricao: str
    detalhes: str
    responsavel: Optional[str] = None
    dataLimite: Optional[str] = None
    prioridade: PendenciaPrioridade

class PendenciaUpdate(BaseModel):
    tipo: Optional[PendenciaTipo] = None
    subtipo: Optional[str] = None
    descricao: Optional[str] = None
    detalhes: Optional[str] = None
    responsavel: Optional[str] = None
    dataLimite: Optional[str] = None
    status: Optional[PendenciaStatus] = None
    prioridade: Optional[PendenciaPrioridade] = None

# Estruturas para estatísticas de processamento
class ProcessingStatistics(BaseModel):
    totalConvenios: int
    processedConvenios: int
    pendenciasCreated: int
    pendenciasUpdated: int

class MunicipioWithStats(Municipio):  # Assumindo que Municipio já está definido
    statistics: Optional[ProcessingStatistics] = None