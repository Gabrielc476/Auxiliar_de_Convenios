from app.database.connection import get_collection
from app.models.schemas import Convenio, MunicipioDados
from typing import List
from app.utils.converters import convert_object_ids
from bson import ObjectId


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


def create_municipio_dados(municipio_data: dict) -> str:
    """Criar novo município no banco de dados."""
    municipios_dados = get_collection("municipiosDados")
    try:
        # Verificar se já existe município com este nome
        existente = municipios_dados.find_one({"municipio": municipio_data["municipio"]})
        if existente:
            raise Exception(f"Já existe um município cadastrado com o nome {municipio_data['municipio']}")

        # Inserir novo município
        resultado = municipios_dados.insert_one(municipio_data)

        # Criar documento vazio na coleção principal de municípios/convênios
        municipios = get_collection("municipios")
        municipios.insert_one({
            "municipio": municipio_data["municipio"],
            "convenios": []
        })

        # Retornar ID do município criado
        return str(resultado.inserted_id)
    except Exception as e:
        raise Exception(f"Erro ao criar município: {str(e)}")


def update_municipio_dados(id: str, municipio_data: dict) -> bool:
    """Atualizar dados cadastrais de um município."""
    municipios_dados = get_collection("municipiosDados")
    try:
        # Converter string ID para ObjectId
        obj_id = ObjectId(id)

        # Verificar se existe antes de atualizar
        existente = municipios_dados.find_one({"_id": obj_id})
        if not existente:
            raise Exception(f"Município com ID {id} não encontrado")

        # Se está mudando o nome do município, atualizar também na coleção principal
        if "municipio" in municipio_data and existente["municipio"] != municipio_data["municipio"]:
            municipios = get_collection("municipios")
            municipios.update_one(
                {"municipio": existente["municipio"]},
                {"$set": {"municipio": municipio_data["municipio"]}}
            )

        # Atualizar dados do município
        municipios_dados.update_one(
            {"_id": obj_id},
            {"$set": municipio_data}
        )

        return True
    except Exception as e:
        raise Exception(f"Erro ao atualizar município: {str(e)}")


def add_convenio(municipio_nome: str, convenio_data: dict) -> bool:
    """Adicionar um convênio a um município."""
    municipios = get_collection("municipios")
    try:
        # Verificar se o município existe
        municipio = municipios.find_one({"municipio": municipio_nome})
        if not municipio:
            raise Exception(f"Município {municipio_nome} não encontrado")

        # Verificar se já existe convênio com o mesmo número
        convenio_existente = municipios.find_one({
            "municipio": municipio_nome,
            "convenios.convenio": convenio_data["convenio"]
        })

        if convenio_existente:
            raise Exception(f"Já existe um convênio com o número {convenio_data['convenio']} para este município")

        # Adicionar o convênio ao array de convênios do município
        resultado = municipios.update_one(
            {"municipio": municipio_nome},
            {"$push": {"convenios": convenio_data}}
        )

        if resultado.modified_count == 0:
            raise Exception("Falha ao adicionar convênio: nenhum documento foi modificado")

        return True
    except Exception as e:
        raise Exception(f"Erro ao adicionar convênio: {str(e)}")