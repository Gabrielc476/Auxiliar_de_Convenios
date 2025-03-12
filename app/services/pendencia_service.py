from app.database.repositories.pendencia_repo import (
    get_pendencias_by_convenio,
    get_pendencia_by_id,
    create_pendencia,
    update_pendencia,
    delete_pendencia
)
from app.utils.converters import convert_object_ids
from app.models.schemas import Pendencia, PendenciaCreate, PendenciaUpdate


def get_pendencias_for_convenio(convenio_id: str, municipio_id: str = None):
    """Obter todas as pendências de um convênio."""
    try:
        pendencias = get_pendencias_by_convenio(convenio_id, municipio_id)

        # Converter IDs de ObjectId para string e retornar, mesmo se for lista vazia
        return convert_object_ids(pendencias)
    except Exception as e:
        print(f"Erro no serviço ao buscar pendências: {e}")
        return []  # Retornar lista vazia em caso de erro


def get_pendencia_details(pendencia_id: str):
    """Obter detalhes de uma pendência específica."""
    pendencia = get_pendencia_by_id(pendencia_id)
    if not pendencia:
        return None

    # Converter IDs de ObjectId para string
    return convert_object_ids(pendencia)


def create_new_pendencia(pendencia_data: PendenciaCreate):
    """Criar uma nova pendência."""
    try:
        # Validar dados da pendência
        new_pendencia = create_pendencia(pendencia_data)

        if not new_pendencia:
            raise Exception("Falha ao criar pendência")

        return new_pendencia
    except Exception as e:
        raise Exception(f"Erro ao criar pendência: {str(e)}")


def update_existing_pendencia(pendencia_id: str, pendencia_data: PendenciaUpdate):
    """Atualizar uma pendência existente."""
    try:
        # Verificar se a pendência existe
        existing = get_pendencia_by_id(pendencia_id)
        if not existing:
            raise Exception(f"Pendência com ID {pendencia_id} não encontrada")

        # Atualizar a pendência
        success = update_pendencia(pendencia_id, pendencia_data)

        if not success:
            raise Exception(f"Falha ao atualizar pendência com ID {pendencia_id}")

        # Buscar e retornar a pendência atualizada
        updated = get_pendencia_by_id(pendencia_id)
        return convert_object_ids(updated)
    except Exception as e:
        raise Exception(f"Erro ao atualizar pendência: {str(e)}")


def delete_existing_pendencia(pendencia_id: str):
    """Excluir uma pendência."""
    try:
        # Verificar se a pendência existe
        existing = get_pendencia_by_id(pendencia_id)
        if not existing:
            raise Exception(f"Pendência com ID {pendencia_id} não encontrada")

        # Excluir a pendência
        success = delete_pendencia(pendencia_id)

        if not success:
            raise Exception(f"Falha ao excluir pendência com ID {pendencia_id}")

        return {"success": True, "message": "Pendência excluída com sucesso"}
    except Exception as e:
        raise Exception(f"Erro ao excluir pendência: {str(e)}")