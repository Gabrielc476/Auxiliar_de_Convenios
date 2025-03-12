from flask import Blueprint, request, jsonify
from app.utils.decorators import token_required
from app.services.pendencia_service import (
    get_pendencias_for_convenio,
    get_pendencia_details,
    create_new_pendencia,
    update_existing_pendencia,
    delete_existing_pendencia
)
from app.models.schemas import PendenciaCreate, PendenciaUpdate
import traceback

pendencia_bp = Blueprint('pendencia', __name__)


@pendencia_bp.route('/pendencias/convenio/<path:convenio_id>', methods=['GET'])
@token_required
def get_pendencias_by_convenio(current_user, convenio_id):
    """Obter todas as pendências de um convênio."""
    try:
        # Obter parâmetro opcional de municipio_id
        municipio_id = request.args.get('municipio_id')

        print(f"Buscando pendências para convênio: {convenio_id}, município: {municipio_id}")

        # Não verificar se o convênio existe, apenas retornar as pendências
        # que correspondem ao ID do convênio fornecido
        pendencias = get_pendencias_for_convenio(convenio_id, municipio_id)

        print(f"Pendências encontradas: {len(pendencias)}")
        return jsonify(pendencias)
    except Exception as e:
        print(f"Erro ao buscar pendências: {str(e)}")
        print(traceback.format_exc())
        return jsonify([])  # Retornar lista vazia em caso de erro


@pendencia_bp.route('/pendencias/<pendencia_id>', methods=['GET'])
@token_required
def get_pendencia(current_user, pendencia_id):
    """Obter detalhes de uma pendência específica."""
    try:
        pendencia = get_pendencia_details(pendencia_id)
        if pendencia:
            return jsonify(pendencia)
        return jsonify({"error": "Pendência não encontrada"}), 404
    except Exception as e:
        print(f"Erro ao buscar pendência: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Erro ao buscar pendência: {str(e)}"}), 500


@pendencia_bp.route('/pendencias', methods=['POST'])
@token_required
def create_pendencia(current_user):
    """Criar uma nova pendência."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        print(f"Criando pendência com dados: {data}")

        # Validar dados usando o modelo Pydantic
        pendencia_data = PendenciaCreate(**data)

        resultado = create_new_pendencia(pendencia_data)
        return jsonify(resultado), 201
    except Exception as e:
        print(f"Erro ao criar pendência: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Erro ao criar pendência: {str(e)}"}), 500


@pendencia_bp.route('/pendencias/<pendencia_id>', methods=['PUT'])
@token_required
def update_pendencia(current_user, pendencia_id):
    """Atualizar uma pendência existente."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        # Validar dados usando o modelo Pydantic
        pendencia_data = PendenciaUpdate(**data)

        resultado = update_existing_pendencia(pendencia_id, pendencia_data)
        return jsonify(resultado)
    except Exception as e:
        print(f"Erro ao atualizar pendência: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Erro ao atualizar pendência: {str(e)}"}), 500


@pendencia_bp.route('/pendencias/<pendencia_id>', methods=['DELETE'])
@token_required
def delete_pendencia(current_user, pendencia_id):
    """Excluir uma pendência."""
    try:
        resultado = delete_existing_pendencia(pendencia_id)
        return jsonify(resultado)
    except Exception as e:
        print(f"Erro ao excluir pendência: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Erro ao excluir pendência: {str(e)}"}), 500