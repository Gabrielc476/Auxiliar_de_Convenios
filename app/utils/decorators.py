from flask import request, jsonify, current_app  # Adicione current_app aqui
from functools import wraps
import jwt
from app.database.repositories.user_repo import find_user_by_email


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Verificar o token no cabeçalho de Autorização
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            print(f"Auth header: {auth_header}")

            # Verificar formato: Bearer token
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]

        if not token:
            print("Token ausente!")
            return jsonify({'message': 'Token ausente!'}), 401

        try:
            print(f"Decodificando token: {token[:10]}...")
            # Use current_app em vez de app
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            current_user = find_user_by_email({'email': data['email']})

            if not current_user:
                print(f"Usuário não encontrado para: {data['email']}")
                raise Exception("Usuário não encontrado")

            print(f"Autenticação bem-sucedida para: {data['email']}")

        except Exception as e:
            print(f"Erro na validação do token: {str(e)}")
            return jsonify({'message': f'Token inválido! {str(e)}'}), 401

        return f(current_user, *args, **kwargs)

    return decorated