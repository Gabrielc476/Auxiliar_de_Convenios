from app.database.connection import get_collection
from bson import ObjectId
from app.utils.converters import convert_object_ids
from app.models.schemas import Pendencia, PendenciaCreate, PendenciaUpdate
from datetime import datetime
import uuid


def get_pendencias_by_convenio(convenio_id: str, municipio_id: str = None):
    """Buscar todas as pendências de um convênio."""
    try:
        pendencias = get_collection("pendencias")
        query = {"convenioId": convenio_id}

        if municipio_id:
            query["municipioId"] = municipio_id

        results = pendencias.find(query)
        return list(results)
    except Exception as e:
        print(f"Erro no repositório ao buscar pendências: {e}")
        return []  # Retornar lista vazia em caso de erro


def get_pendencia_by_id(pendencia_id: str):
    """Buscar uma pendência pelo ID."""
    try:
        pendencias = get_collection("pendencias")
        try:
            # Tentar converter para ObjectId
            _id = ObjectId(pendencia_id)
            result = pendencias.find_one({"_id": _id})
        except:
            # Se não for um ObjectId válido, tenta buscar pelo id como string
            result = pendencias.find_one({"id": pendencia_id})

        return result
    except Exception as e:
        print(f"Erro ao buscar pendência por ID: {e}")
        return None


def create_pendencia(data: PendenciaCreate):
    """Criar uma nova pendência."""
    pendencias = get_collection("pendencias")

    # Preparar dados para inserção
    pendencia_data = data.model_dump()
    pendencia_data["dataCriacao"] = datetime.now().isoformat()
    pendencia_data["dataAtualizacao"] = datetime.now().isoformat()
    pendencia_data["status"] = "aberta"  # Status padrão para novas pendências

    # Converter ObjectId para string, se necessário
    if "convenioId" in pendencia_data and isinstance(pendencia_data["convenioId"], ObjectId):
        pendencia_data["convenioId"] = str(pendencia_data["convenioId"])

    if "municipioId" in pendencia_data and isinstance(pendencia_data["municipioId"], ObjectId):
        pendencia_data["municipioId"] = str(pendencia_data["municipioId"])

    # Inserir no banco
    result = pendencias.insert_one(pendencia_data)

    # Buscar a pendência criada para retornar
    created_pendencia = pendencias.find_one({"_id": result.inserted_id})
    return convert_object_ids(created_pendencia)


def update_pendencia(pendencia_id: str, data: PendenciaUpdate):
    """Atualizar uma pendência existente."""
    try:
        pendencias = get_collection("pendencias")

        # Preparar dados para atualização
        update_data = data.model_dump(exclude_unset=True)
        update_data["dataAtualizacao"] = datetime.now().isoformat()

        # Atualizar no banco
        try:
            # Tentar converter para ObjectId
            _id = ObjectId(pendencia_id)
            result = pendencias.update_one(
                {"_id": _id},
                {"$set": update_data}
            )
        except:
            # Se não for um ObjectId válido, tenta atualizar pelo id como string
            result = pendencias.update_one(
                {"id": pendencia_id},
                {"$set": update_data}
            )

        if result.modified_count == 0:
            # Verificar se o documento existe
            doc = get_pendencia_by_id(pendencia_id)
            if doc:
                # Documento existe, mas nenhum campo foi modificado
                return True
            else:
                # Documento não existe
                return False

        return True
    except Exception as e:
        print(f"Erro ao atualizar pendência: {e}")
        return False


def delete_pendencia(pendencia_id: str):
    """Excluir uma pendência."""
    try:
        pendencias = get_collection("pendencias")
        try:
            # Tentar converter para ObjectId
            _id = ObjectId(pendencia_id)
            result = pendencias.delete_one({"_id": _id})
        except:
            # Se não for um ObjectId válido, tenta excluir pelo id como string
            result = pendencias.delete_one({"id": pendencia_id})

        return result.deleted_count > 0
    except Exception as e:
        print(f"Erro ao excluir pendência: {e}")
        return False