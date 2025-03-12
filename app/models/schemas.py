from pydantic import BaseModel
from typing import List, Optional

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