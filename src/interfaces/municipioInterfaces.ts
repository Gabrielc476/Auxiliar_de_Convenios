export interface Dado {
  valor_repasse: string;
  valor_contrapartida: string;
  percentual_recurso_repassado: string;
  valor_desbloqueado_empresa: string;
  percentual_execucao_obra: string;
  vigencia_convenio: string;
  dados_bancarios: string;
  vigencia_lac: string;
  processo_licitatorio: string;
  empresa_executora: string;
  valor_contrato_empresa: string;
  vigencia_contrato_empresa: string;
  prazo_pagamento_empresa: string;
  outros_dados: string[];
}

export interface Convenio {
  convenio: string;
  objeto: string;
  dados: Dado[];
}

export interface Municipio {
  municipio: string;
  convenios: Convenio[];
}
