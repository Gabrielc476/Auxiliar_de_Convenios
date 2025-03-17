from app.database.repositories.municipio_repo import (
    get_municipios,
    save_municipio,
    find_convenio,
    get_municipios_dados,
    create_municipio_dados,
    update_municipio_dados,
    add_convenio as repo_add_convenio
)
from app.services.openai_service import extract_data_from_pdf
from app.utils.converters import convert_object_ids
from app.models.schemas import MunicipioDados, ProcessingStatistics
from app.services.pendencia_service import create_new_pendencia, update_existing_pendencia, \
    find_pendencia_by_description_service
import logging
import datetime

# Configuração do logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_all_municipios():
    """Obter todos os municípios."""
    municipios = get_municipios()
    return convert_object_ids(municipios)


def get_convenio_details(municipio_nome, convenio_nome):
    """Obter detalhes de um convênio específico."""
    result = find_convenio(municipio_nome, convenio_nome)
    if result:
        result_dict = result.model_dump()
        return convert_object_ids(result_dict)
    return None


def get_all_municipio_names():
    """Retorna apenas os nomes de todos os municípios."""
    municipios = get_municipios()
    return [m.get('municipio') for m in municipios if 'municipio' in m]


def get_municipio_dados():
    """Obter dados cadastrais de todos os municípios."""
    dados = get_municipios_dados()
    return [item.model_dump() for item in dados]


def update_relatorio(pdf_file):
    """
    Atualizar relatório de convênios a partir de um arquivo PDF.

    Melhorias:
    - Conta o número de convênios no relatório
    - Garante que todos os convênios sejam processados
    - Cria pendências automaticamente
    - Verifica e atualiza pendências existentes
    """
    logger.info("Iniciando processamento de relatório PDF")

    # Extrair dados do PDF
    municipio_data = extract_data_from_pdf(pdf_file)

    # Estatísticas
    statistics = {
        "totalConvenios": len(municipio_data.convenios),
        "processedConvenios": 0,
        "pendenciasCreated": 0,
        "pendenciasUpdated": 0
    }

    logger.info(f"Encontrados {statistics['totalConvenios']} convênios no relatório")

    # Salvar dados dos convênios
    municipio_nome = municipio_data.municipio

    # Para cada convênio, verificar se precisa criar pendências
    for convenio in municipio_data.convenios:
        # Incrementar contador de convênios processados
        statistics["processedConvenios"] += 1

        logger.info(
            f"Processando convênio {convenio.convenio} ({statistics['processedConvenios']}/{statistics['totalConvenios']})")

        # Verificar critérios para criar pendências
        pendencias_criadas = criar_pendencias_automaticas(municipio_nome, convenio)

        # Atualizar estatísticas
        statistics["pendenciasCreated"] += pendencias_criadas["criadas"]
        statistics["pendenciasUpdated"] += pendencias_criadas["atualizadas"]

    # Salvar os dados do relatório
    save_municipio(municipio_data.model_dump())

    # Adicionar estatísticas ao resultado
    result = municipio_data.model_dump()
    result["statistics"] = statistics

    logger.info(f"Processamento concluído: {statistics}")
    return result


def criar_pendencias_automaticas(municipio_nome, convenio):
    """
    Cria pendências automaticamente com base em critérios definidos.
    Verifica se as pendências já existem e atualiza se necessário.

    Retorna um dicionário com o número de pendências criadas e atualizadas.
    """
    stats = {"criadas": 0, "atualizadas": 0}

    # Lista para armazenar pendências a serem verificadas/criadas
    pendencias_para_criar = []

    # Obtém dados do primeiro item do array
    dados = convenio.dados[0] if convenio.dados else None
    if not dados:
        return stats

    # Critério 1: Percentual de execução da obra baixo (menos de 30%)
    percentual_execucao = dados.percentual_execucao_obra.replace("%", "").strip()
    try:
        percentual_execucao = float(percentual_execucao)
        if percentual_execucao < 30:
            pendencias_para_criar.append({
                "descricao": f"Baixa execução da obra - Convênio {convenio.convenio}",
                "detalhes": f"A execução da obra está em apenas {dados.percentual_execucao_obra}. Verificar possíveis atrasos ou impedimentos.",
                "tipo": "Execução",
                "subtipo": "Pendente",
                "prioridade": "alta" if percentual_execucao < 10 else "media"
            })
    except (ValueError, TypeError):
        # Se não conseguir converter o percentual, ignora este critério
        logger.warning(f"Não foi possível verificar o percentual de execução para o convênio {convenio.convenio}")

    # Critério 2: Verificar vigência do convênio próxima do fim (menos de 60 dias)
    if dados.vigencia_convenio:
        try:
            # Converter data no formato DD/MM/AAAA para objeto datetime
            partes = dados.vigencia_convenio.split('/')
            if len(partes) == 3:
                data_vigencia = datetime.datetime(int(partes[2]), int(partes[1]), int(partes[0]))
                hoje = datetime.datetime.now()
                dias_restantes = (data_vigencia - hoje).days

                if dias_restantes < 60 and dias_restantes >= 0:
                    pendencias_para_criar.append({
                        "descricao": f"Vigência do convênio {convenio.convenio} próxima do fim",
                        "detalhes": f"A vigência do convênio expira em {dias_restantes} dias ({dados.vigencia_convenio}). "
                                    f"Avaliar necessidade de aditivo de prazo.",
                        "tipo": "Documentação",
                        "subtipo": "Urgente" if dias_restantes < 30 else "Pendente",
                        "prioridade": "alta" if dias_restantes < 30 else "media",
                        "dataLimite": (data_vigencia - datetime.timedelta(days=15)).isoformat()
                    })
                elif dias_restantes < 0:
                    pendencias_para_criar.append({
                        "descricao": f"Vigência do convênio {convenio.convenio} expirada",
                        "detalhes": f"A vigência do convênio expirou em {dados.vigencia_convenio}. "
                                    f"Verificar situação e tomar providências urgentes.",
                        "tipo": "Documentação",
                        "subtipo": "Urgente",
                        "prioridade": "alta"
                    })
        except (ValueError, IndexError) as e:
            logger.warning(f"Erro ao processar data de vigência: {e}")

    # Critério 3: Percentual de recurso repassado significativamente maior que a execução da obra
    percentual_recurso = dados.percentual_recurso_repassado.replace("%", "").strip()
    try:
        percentual_recurso = float(percentual_recurso)
        if isinstance(percentual_execucao, float) and percentual_recurso > percentual_execucao + 30:
            pendencias_para_criar.append({
                "descricao": f"Divergência entre repasse e execução - Convênio {convenio.convenio}",
                "detalhes": f"O percentual de recurso repassado ({dados.percentual_recurso_repassado}) é "
                            f"significativamente maior que o percentual de execução da obra ({dados.percentual_execucao_obra}). "
                            f"Verificar justificativa para o atraso na execução.",
                "tipo": "Execução",
                "subtipo": "Em Análise",
                "prioridade": "media"
            })
    except (ValueError, TypeError):
        logger.warning(f"Não foi possível comparar percentuais para o convênio {convenio.convenio}")

    # Criar ou atualizar cada pendência
    for pendencia_info in pendencias_para_criar:
        # Verificar se a pendência já existe (com mesma descrição para o mesmo convênio)
        pendencia_existente = find_pendencia_by_description_service(
            convenio_id=convenio.convenio,
            municipio_id=municipio_nome,
            descricao=pendencia_info["descricao"]
        )

        if pendencia_existente:
            # Atualiza a pendência existente
            update_data = {
                "detalhes": pendencia_info["detalhes"],
                "tipo": pendencia_info["tipo"],
                "subtipo": pendencia_info["subtipo"],
                "prioridade": pendencia_info["prioridade"],
                "dataAtualizacao": datetime.datetime.now().isoformat()
            }

            # Adiciona data limite se houver
            if "dataLimite" in pendencia_info:
                update_data["dataLimite"] = pendencia_info["dataLimite"]

            update_existing_pendencia(pendencia_existente["id"], update_data)
            stats["atualizadas"] += 1
            logger.info(f"Pendência atualizada: {pendencia_info['descricao']}")
        else:
            # Cria uma nova pendência
            nova_pendencia = {
                "convenioId": convenio.convenio,
                "municipioId": municipio_nome,
                "descricao": pendencia_info["descricao"],
                "detalhes": pendencia_info["detalhes"],
                "tipo": pendencia_info["tipo"],
                "subtipo": pendencia_info["subtipo"],
                "status": "aberta",
                "prioridade": pendencia_info["prioridade"],
                "dataCriacao": datetime.datetime.now().isoformat(),
                "dataAtualizacao": datetime.datetime.now().isoformat()
            }

            # Adiciona data limite se houver
            if "dataLimite" in pendencia_info:
                nova_pendencia["dataLimite"] = pendencia_info["dataLimite"]

            create_new_pendencia(nova_pendencia)
            stats["criadas"] += 1
            logger.info(f"Pendência criada: {pendencia_info['descricao']}")

    return stats


def create_new_municipio(municipio_data):
    """Criar novo município."""
    # Validar dados do município
    try:
        # Criar uma instância do modelo para validação
        municipio_model = MunicipioDados(**municipio_data)

        # Se a validação passar, criar o município no banco de dados
        municipio_id = create_municipio_dados(municipio_data)

        # Adicionar o ID ao objeto que será retornado
        result = municipio_model.model_dump()
        result['id'] = municipio_id

        return result
    except Exception as e:
        raise Exception(f"Erro ao criar município: {str(e)}")


def update_municipio(municipio_id, municipio_data):
    """Atualizar dados de um município."""
    try:
        # Validar dados do município
        MunicipioDados(**municipio_data)

        # Atualizar no banco de dados
        success = update_municipio_dados(municipio_id, municipio_data)

        if success:
            return {"success": True, "message": "Município atualizado com sucesso"}
        else:
            return {"success": False, "message": "Falha ao atualizar município"}
    except Exception as e:
        raise Exception(f"Erro ao atualizar município: {str(e)}")


def add_convenio(municipio_nome, convenio_data):
    """Adicionar um convênio a um município."""
    try:
        # Validar dados básicos do convênio
        if not convenio_data.get("convenio"):
            raise ValueError("Número do convênio é obrigatório")

        if not convenio_data.get("objeto"):
            raise ValueError("Objeto do convênio é obrigatório")

        if not convenio_data.get("dados") or not isinstance(convenio_data["dados"], list):
            raise ValueError("Dados do convênio devem ser uma lista")

        # Adicionar o convênio ao município
        success = repo_add_convenio(municipio_nome, convenio_data)

        if success:
            return {"success": True, "message": "Convênio adicionado com sucesso"}
        else:
            return {"success": False, "message": "Falha ao adicionar convênio"}
    except Exception as e:
        raise Exception(f"Erro ao adicionar convênio: {str(e)}")