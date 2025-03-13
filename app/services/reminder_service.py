from typing import List, Optional
from app.database.repositories.reminder_repo import (
    get_reminders,
    get_reminder_by_id,
    create_reminder,
    update_reminder,
    delete_reminder,
)
from app.models.reminder_schemas import ReminderCreate, ReminderUpdate, ReminderResponse
from app.utils.converters import convert_object_ids


def get_all_reminders(user_id: Optional[str] = None) -> List[dict]:
    """Obter todos os lembretes de um usuário."""
    reminders = get_reminders(user_id)
    return reminders


def get_reminder(reminder_id: str) -> Optional[dict]:
    """Obter um lembrete específico pelo ID."""
    reminder = get_reminder_by_id(reminder_id)
    return reminder


def create_new_reminder(reminder_data: dict) -> dict:
    """Criar um novo lembrete."""
    try:
        # Validar os dados de entrada (se necessário)
        # Poderíamos ter uma função de validação adicional aqui

        # Criar o lembrete no banco
        created_reminder = create_reminder(reminder_data)

        if not created_reminder:
            raise Exception("Erro ao criar lembrete no banco de dados")

        return convert_object_ids(created_reminder)
    except Exception as e:
        raise Exception(f"Erro ao criar lembrete: {str(e)}")


def update_existing_reminder(reminder_id: str, reminder_data: dict) -> Optional[dict]:
    """Atualizar um lembrete existente."""
    try:
        # Atualizar o lembrete no banco
        updated_reminder = update_reminder(reminder_id, reminder_data)

        if not updated_reminder:
            raise Exception(f"Lembrete com ID {reminder_id} não encontrado")

        return convert_object_ids(updated_reminder)
    except Exception as e:
        raise Exception(f"Erro ao atualizar lembrete: {str(e)}")


def remove_reminder(reminder_id: str) -> bool:
    """Excluir um lembrete."""
    try:
        # Verificar se o lembrete existe
        reminder = get_reminder_by_id(reminder_id)
        if not reminder:
            raise Exception(f"Lembrete com ID {reminder_id} não encontrado")

        # Excluir o lembrete
        success = delete_reminder(reminder_id)

        if not success:
            raise Exception(f"Erro ao excluir lembrete com ID {reminder_id}")

        return True
    except Exception as e:
        raise Exception(f"Erro ao excluir lembrete: {str(e)}")