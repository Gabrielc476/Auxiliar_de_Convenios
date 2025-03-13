from datetime import datetime
from typing import List, Optional
from app.database.connection import get_collection
from app.utils.converters import convert_object_ids
from bson import ObjectId


def get_reminders(user_id: Optional[str] = None) -> List[dict]:
    """Buscar todos os lembretes de um usuário."""
    reminders = get_collection("reminders")
    query = {}

    if user_id:
        query["userId"] = user_id

    results = list(reminders.find(query).sort("reminderDate", 1))
    return convert_object_ids(results)


def get_reminder_by_id(reminder_id: str) -> Optional[dict]:
    """Buscar um lembrete específico pelo ID."""
    reminders = get_collection("reminders")
    try:
        obj_id = ObjectId(reminder_id)
        result = reminders.find_one({"_id": obj_id})
        return convert_object_ids(result) if result else None
    except Exception as e:
        print(f"Erro ao buscar lembrete: {str(e)}")
        return None


def create_reminder(reminder_data: dict) -> dict:
    """Criar um novo lembrete."""
    reminders = get_collection("reminders")

    # Adicionar campos de controle
    reminder_data["created"] = datetime.now().isoformat()
    reminder_data["status"] = "pending"

    # Inserir no banco
    result = reminders.insert_one(reminder_data)

    # Buscar o documento inserido
    created_reminder = reminders.find_one({"_id": result.inserted_id})
    return convert_object_ids(created_reminder)


def update_reminder(reminder_id: str, reminder_data: dict) -> Optional[dict]:
    """Atualizar um lembrete existente."""
    reminders = get_collection("reminders")
    try:
        obj_id = ObjectId(reminder_id)

        # Verificar se o lembrete existe
        existing = reminders.find_one({"_id": obj_id})
        if not existing:
            return None

        # Atualizar o documento
        reminders.update_one(
            {"_id": obj_id},
            {"$set": reminder_data}
        )

        # Buscar o documento atualizado
        updated_reminder = reminders.find_one({"_id": obj_id})
        return convert_object_ids(updated_reminder)
    except Exception as e:
        print(f"Erro ao atualizar lembrete: {str(e)}")
        return None


def delete_reminder(reminder_id: str) -> bool:
    """Excluir um lembrete."""
    reminders = get_collection("reminders")
    try:
        obj_id = ObjectId(reminder_id)
        result = reminders.delete_one({"_id": obj_id})
        return result.deleted_count > 0
    except Exception as e:
        print(f"Erro ao excluir lembrete: {str(e)}")
        return False