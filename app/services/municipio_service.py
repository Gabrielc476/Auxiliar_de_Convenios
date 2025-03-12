from app.database.repositories.municipio_repo import (
    get_municipios,
    save_municipio,
    find_convenio,
    get_municipios_dados
)
from app.services.openai_service import extract_data_from_pdf
from app.utils.converters import convert_object_ids

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

def get_municipio_dados():
    """Obter dados cadastrais de todos os municípios."""
    dados = get_municipios_dados()
    return [item.model_dump() for item in dados]

def update_relatorio():
    """Atualizar relatório de convênios."""
    municipio_data = extract_data_from_pdf()
    save_municipio(municipio_data.model_dump())
    return municipio_data.model_dump()