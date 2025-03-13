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

# Enums para pendências
class PendenciaTipo(str, Enum):
    PRESTACAO_CONTAS = "Prestação de Contas"
    LICITACAO = "Licitação"
    EXECUCAO = "Execução"
    DOCUMENTACAO = "Documentação"
    OUTRO = "Outro"


class PendenciaSubtipo(str, Enum):
    AGUARDANDO_DOCUMENTOS = "Aguardando Documentos"
    EM_ANALISE = "Em Análise"
    URGENTE = "Urgente"
    CONCLUIDO = "Concluído"
    PENDENTE = "Pendente"
    OUTRO = "Outro"


class PendenciaStatus(str, Enum):
    ABERTA = "aberta"
    CONCLUIDA = "concluida"


class PendenciaPrioridade(str, Enum):
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"


# Esquema para criação de pendência
class PendenciaCreate(BaseModel):
    convenioId: str
    municipioId: str
    tipo: str  # Usando string para permitir valores fora do enum
    subtipo: str  # Usando string para permitir valores fora do enum
    descricao: str
    detalhes: str
    responsavel: Optional[str] = None
    dataLimite: Optional[str] = None
    prioridade: str  # baixa, media, alta


# Esquema para atualização de pendência
class PendenciaUpdate(BaseModel):
    tipo: Optional[str] = None
    subtipo: Optional[str] = None
    descricao: Optional[str] = None
    detalhes: Optional[str] = None
    responsavel: Optional[str] = None
    dataLimite: Optional[str] = None
    status: Optional[str] = None
    prioridade: Optional[str] = None


# Esquema para pendência completa (resposta)
class Pendencia(BaseModel):
    id: str
    convenioId: str
    municipioId: str
    tipo: str
    subtipo: str
    descricao: str
    detalhes: str
    responsavel: Optional[str] = None
    dataCriacao: str
    dataAtualizacao: str
    dataLimite: Optional[str] = None
    status: str  # aberta, concluida
    prioridade: str  # baixa, media, alta