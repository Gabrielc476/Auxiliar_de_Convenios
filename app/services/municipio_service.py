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
from app.models.schemas import MunicipioDados


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
    print(dados)
    return [item.model_dump() for item in dados]


def update_relatorio(pdf_file):
    """Atualizar relatório de convênios a partir de um arquivo PDF."""
    municipio_data = extract_data_from_pdf(pdf_file)
    save_municipio(municipio_data.model_dump())
    return municipio_data.model_dump()


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