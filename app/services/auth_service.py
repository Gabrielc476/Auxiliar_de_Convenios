import jwt
import datetime
from flask import current_app, jsonify
from app.database.repositories.user_repo import find_user_by_email, create_user
from app.utils.security import hash_password, verify_password


def login_user(auth_data):
    """Autenticar usuário e gerar token JWT."""
    user = find_user_by_email(auth_data['email'])

    if not user or not verify_password(auth_data['password'], user['password']):
        return jsonify({'message': 'Credenciais inválidas!'}), 401

    # Gerar token JWT
    token = jwt.encode({
        'email': user['email'],
        'exp': datetime.datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }, current_app.config['JWT_SECRET_KEY'])

    # Retornar token e dados do usuário
    return jsonify({
        'token': token,
        'user': {
            'email': user['email'],
            'nome': user['nome'],
            'municipios': user.get('municipios', [])
        }
    }), 200


def register_user(user_data):
    """Cadastrar novo usuário."""
    # Validar dados recebidos
    if not user_data.get('email') or not user_data.get('password'):
        return jsonify({'message': 'Dados incompletos!'}), 400

    # Hash da senha
    hashed_password = hash_password(user_data['password'])

    # Cadastrar usuário
    result = create_user(user_data, hashed_password)

    if result == "sucesso":
        return jsonify({'success': True, 'message': 'Usuário cadastrado com sucesso!'}), 201
    else:
        return jsonify({'success': False, 'message': result}), 400