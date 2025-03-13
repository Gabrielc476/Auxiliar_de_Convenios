from flask import Blueprint, request, jsonify
from app.services.reminder_service import (
    get_all_reminders,
    get_reminder,
    create_new_reminder,
    update_existing_reminder,
    remove_reminder
)
from app.utils.decorators import token_required
import traceback

reminder_bp = Blueprint('reminder', __name__)


@reminder_bp.route('/reminders', methods=['GET'])
@token_required
def get_reminders(current_user):
    """Obter todos os lembretes do usuário."""
    try:
        # Obter o ID do usuário atual
        user_id = current_user.get('_id', None)
        if not user_id:
            user_id = current_user.get('email', None)

        # Buscar lembretes
        reminders = get_all_reminders(user_id)

        return jsonify(reminders)
    except Exception as e:
        print(f"Erro ao obter lembretes: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@reminder_bp.route('/reminders/<reminder_id>', methods=['GET'])
@token_required
def get_single_reminder(current_user, reminder_id):
    """Obter um lembrete específico."""
    try:
        reminder = get_reminder(reminder_id)

        if not reminder:
            return jsonify({"error": "Lembrete não encontrado"}), 404

        # Verificar se o lembrete pertence ao usuário
        user_id = current_user.get('_id', current_user.get('email', None))
        if reminder.get('userId') != user_id:
            return jsonify({"error": "Acesso não autorizado"}), 403

        return jsonify(reminder)
    except Exception as e:
        print(f"Erro ao obter lembrete: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@reminder_bp.route('/reminders', methods=['POST'])
@token_required
def create_reminder(current_user):
    """Criar um novo lembrete."""
    try:
        # Obter dados do corpo da requisição
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Definir o usuário atual como dono do lembrete
        data['userId'] = current_user.get('_id', current_user.get('email', None))

        # Criar o lembrete
        new_reminder = create_new_reminder(data)

        return jsonify(new_reminder), 201
    except Exception as e:
        print(f"Erro ao criar lembrete: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@reminder_bp.route('/reminders/<reminder_id>', methods=['PUT'])
@token_required
def update_reminder(current_user, reminder_id):
    """Atualizar um lembrete existente."""
    try:
        # Verificar se o lembrete existe e pertence ao usuário
        existing = get_reminder(reminder_id)
        if not existing:
            return jsonify({"error": "Lembrete não encontrado"}), 404

        user_id = current_user.get('_id', current_user.get('email', None))
        if existing.get('userId') != user_id:
            return jsonify({"error": "Acesso não autorizado"}), 403

        # Obter dados do corpo da requisição
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Atualizar o lembrete
        updated_reminder = update_existing_reminder(reminder_id, data)

        return jsonify(updated_reminder)
    except Exception as e:
        print(f"Erro ao atualizar lembrete: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@reminder_bp.route('/reminders/<reminder_id>', methods=['DELETE'])
@token_required
def delete_reminder(current_user, reminder_id):
    """Excluir um lembrete."""
    try:
        # Verificar se o lembrete existe e pertence ao usuário
        existing = get_reminder(reminder_id)
        if not existing:
            return jsonify({"error": "Lembrete não encontrado"}), 404

        user_id = current_user.get('_id', current_user.get('email', None))
        if existing.get('userId') != user_id:
            return jsonify({"error": "Acesso não autorizado"}), 403

        # Excluir o lembrete
        success = remove_reminder(reminder_id)

        if success:
            return jsonify({"success": True, "message": "Lembrete excluído com sucesso"}), 200
        else:
            return jsonify({"success": False, "error": "Erro ao excluir lembrete"}), 500
    except Exception as e:
        print(f"Erro ao excluir lembrete: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500