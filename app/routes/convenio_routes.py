from flask import Blueprint, request, jsonify, current_app
from app.utils.decorators import token_required
from app.services.municipio_service import (
    get_all_municipios,
    get_convenio_details,
    get_municipio_dados,
    update_relatorio,
    create_new_municipio,
    update_municipio,
    add_convenio
)
import os
import tempfile
import traceback
from werkzeug.utils import secure_filename

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
    try:
        if 'file' not in request.files:
            return jsonify({"error": "Nenhum arquivo enviado"}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({"error": "Nenhum arquivo selecionado"}), 400

        if file and file.filename.endswith('.pdf'):
            # Salvar o arquivo temporariamente
            temp_dir = tempfile.gettempdir()
            temp_filename = secure_filename(file.filename)
            temp_path = os.path.join(temp_dir, temp_filename)

            print(f"Salvando arquivo temporário em: {temp_path}")
            file.save(temp_path)

            try:
                # Processar o arquivo do disco em vez do objeto de streaming
                with open(temp_path, 'rb') as f:
                    relatorio = update_relatorio(f)

                # Remover arquivo temporário
                if os.path.exists(temp_path):
                    os.remove(temp_path)

                return jsonify(relatorio)
            except Exception as processing_error:
                # Se houver erro, garantir que o arquivo temporário seja removido
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                print(f"Erro no processamento: {str(processing_error)}")
                print(traceback.format_exc())
                return jsonify({"error": f"Erro ao processar PDF: {str(processing_error)}"}), 500
        else:
            return jsonify({"error": "Tipo de arquivo inválido. Por favor, envie um PDF."}), 400
    except Exception as e:
        print(f"Erro geral na rota: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Erro no servidor: {str(e)}"}), 500


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
        print(resultado)
        return jsonify(resultado)
    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@convenio_bp.route('/municipios/dados', methods=['POST'])
@token_required
def create_municipio(current_user):
    """Criar novo município."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        resultado = create_new_municipio(data)
        return jsonify(resultado), 201
    except Exception as e:
        print(f"Erro ao criar município: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Erro ao criar município: {str(e)}"}), 500


@convenio_bp.route('/municipios/dados/<id>', methods=['PUT'])
@token_required
def update_municipio_route(current_user, id):
    """Atualizar dados de um município."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        resultado = update_municipio(id, data)
        return jsonify(resultado)
    except Exception as e:
        print(f"Erro ao atualizar município: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Erro ao atualizar município: {str(e)}"}), 500


@convenio_bp.route('/convenios/<path:municipio>', methods=['POST'])
@token_required
def add_convenio_route(current_user, municipio):
    """Adicionar um convênio a um município."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        resultado = add_convenio(municipio, data)
        return jsonify(resultado), 201
    except Exception as e:
        print(f"Erro ao adicionar convênio: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Erro ao adicionar convênio: {str(e)}"}), 500