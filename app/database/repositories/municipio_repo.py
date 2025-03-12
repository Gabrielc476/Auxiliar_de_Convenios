from app.database.connection import get_collection
from app.models.schemas import Convenio, MunicipioDados
from typing import List
from app.utils.converters import convert_object_ids


def get_municipios():
    """Buscar todos os municípios."""
    municipios = get_collection("municipios")
    return list(municipios.find({}))


def find_convenio(municipio_nome: str, convenio_nome: str) -> Convenio:
    """Buscar um convênio específico de um município."""
    municipios = get_collection("municipios")
    try:
        # Encontrar o município e filtrar o array de convênios na query
        result = municipios.find_one(
            {
                "municipio": municipio_nome,
                "convenios.convenio": convenio_nome
            },
            {"convenios.$": 1}  # Projetar apenas o elemento correspondente do array
        )

        if result and 'convenios' in result:
            # Retornar o primeiro match convertido para modelo Pydantic
            return Convenio(**result['convenios'][0])

        return None
    except Exception as e:
        print(f"Erro ao buscar convênio: {str(e)}")
        return None


def save_municipio(relatorio):
    """Salvar ou atualizar dados de um município."""
    municipios = get_collection("municipios")
    query_filtro = {'municipio': relatorio["municipio"]}
    atualizacao = {"$set": {'convenios': relatorio["convenios"]}}

    municipios.update_one(query_filtro, atualizacao, upsert=True)
    return True


def get_municipios_dados() -> List[MunicipioDados]:
    """Buscar dados cadastrais de todos os municípios."""
    municipios_dados = get_collection("municipiosDados")
    try:
        documentos = list(municipios_dados.find({}))
        return [MunicipioDados(**convert_object_ids(doc)) for doc in documentos]
    except Exception as e:
        raise Exception(f"Erro ao acessar banco de dados: {str(e)}")