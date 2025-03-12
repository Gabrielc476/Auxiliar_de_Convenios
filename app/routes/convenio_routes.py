from flask import Blueprint, request, jsonify
from app.utils.decorators import token_required
from app.services.municipio_service import (
    get_all_municipios,
    get_convenio_details,
    get_municipio_dados,
    update_relatorio
)

convenio_bp = Blueprint('convenio', __name__)

@convenio_bp.route('/', methods=['GET'])
@token_required
def get_all(current_user):
    """Obter todos os municípios."""
    municipios = get_all_municipios()
    return jsonify(municipios)

@convenio_bp.route('/', methods=['POST'])
@token_required
def generate_report(current_user):
    """Gerar/atualizar relatório."""
    relatorio = update_relatorio()
    return jsonify(relatorio)

@convenio_bp.route('/<path:municipio>/<path:convenio>', methods=['GET'])
@token_required
def get_convenio(current_user, municipio, convenio):
    """Obter detalhes de um convênio específico."""
    resultado = get_convenio_details(municipio, convenio)
    if resultado:
        return jsonify(resultado)
    return jsonify({"error": "Convênio não encontrado"}), 404

@convenio_bp.route('/municipios/dados', methods=['GET'])
@token_required
def get_all_municipio_data(current_user):
    """Obter dados de todos os municípios."""
    try:
        resultado = get_municipio_dados()
        return jsonify(resultado)
    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500