from openai import OpenAI
from flask import current_app
from app.models.schemas import Municipio, Convenio, Dado
from app.services.pdf_service import extract_text_from_pdf
import json
import time


def extract_data_from_pdf(pdf_file):
    """Extrair e estruturar dados do PDF usando OpenAI."""
    # Obter texto do PDF
    prompt = extract_text_from_pdf(pdf_file)

    if not prompt or len(prompt) < 100:
        print(f"Texto extraído muito curto ({len(prompt)} caracteres)")
        # Criar um modelo básico para evitar falha total
        return Municipio(
            municipio="Não identificado",
            convenios=[
                Convenio(
                    convenio="Erro na extração",
                    objeto="Não foi possível extrair dados do PDF",
                    dados=[
                        Dado(
                            valor_repasse="N/A",
                            valor_contrapartida="N/A",
                            percentual_recurso_repassado="N/A",
                            valor_desbloqueado_empresa="N/A",
                            percentual_execucao_obra="N/A",
                            vigencia_convenio="N/A",
                            dados_bancarios="N/A",
                            vigencia_lac="N/A",
                            processo_licitatorio="N/A",
                            empresa_executora="N/A",
                            valor_contrato_empresa="N/A",
                            vigencia_contrato_empresa="N/A",
                            prazo_pagamento_empresa="N/A",
                            outros_dados=["Erro na extração do PDF"]
                        )
                    ]
                )
            ]
        )

    # Configurar cliente OpenAI com timeout mais longo
    client = OpenAI(
        api_key=current_app.config['OPENAI_API_KEY'],
        timeout=120.0  # 45 segundos de timeout
    )

    # Tentar extrair dados, com retry em caso de falha
    max_retries = 2
    retry_count = 0

    while retry_count <= max_retries:
        try:
            # Enviar solicitação para a OpenAI
            completion = client.chat.completions.create(
                model="gpt-4o-mini-2024-07-18",
                messages=[
                    {"role": "system",
                     "content": """Você é um consultor de prefeituras especializado em extrair dados de relatórios.
                     Extraia do texto as seguintes informações:
                     - Nome do município 
                     - Lista de convênios com seus detalhes

                     Retorne em formato JSON seguindo exatamente esta estrutura:
                     {
                        "municipio": "Nome do Município",
                        "convenios": [
                            {
                                "convenio": "Número do Convênio",
                                "objeto": "Objeto do Convênio",
                                "dados": [
                                    {
                                        "valor_repasse": "Valor",
                                        "valor_contrapartida": "Valor",
                                        "percentual_recurso_repassado": "Percentual",
                                        "valor_desbloqueado_empresa": "Valor",
                                        "percentual_execucao_obra": "Percentual",
                                        "vigencia_convenio": "Data",
                                        "dados_bancarios": "Conta",
                                        "vigencia_lac": "Data",
                                        "processo_licitatorio": "Processo",
                                        "empresa_executora": "Empresa",
                                        "valor_contrato_empresa": "Valor",
                                        "vigencia_contrato_empresa": "Data",
                                        "prazo_pagamento_empresa": "Data",
                                        "outros_dados": []
                                    }
                                ]
                            }
                        ]
                     }
                     """
                     },
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )

            # Extrair a resposta JSON
            response_content = completion.choices[0].message.content
            print(f"Resposta da OpenAI: {response_content[:100]}...")  # Depuração

            try:
                response_json = json.loads(response_content)

                # Validar usando o modelo Pydantic
                municipio_data = Municipio.model_validate(response_json)
                return municipio_data

            except json.JSONDecodeError as json_err:
                print(f"Erro ao decodificar JSON: {json_err}")
                raise ValueError(f"A resposta da OpenAI não é um JSON válido: {response_content[:100]}...")

            except Exception as validation_err:
                print(f"Erro de validação: {validation_err}")

                # Tentar corrigir o formato básico
                if "municipio" not in response_json:
                    response_json["municipio"] = "Não identificado"
                if "convenios" not in response_json:
                    response_json["convenios"] = []

                # Tentar novamente
                return Municipio.model_validate(response_json)

        except Exception as e:
            print(f"Tentativa {retry_count + 1} falhou: {e}")
            retry_count += 1
            if retry_count <= max_retries:
                print(f"Aguardando 5 segundos antes de tentar novamente...")
                time.sleep(5)  # Esperar 5 segundos antes de tentar novamente
            else:
                print("Todas as tentativas falharam")
                raise

    # Se chegou aqui, todas as tentativas falharam
    raise Exception("Não foi possível processar o documento após várias tentativas")