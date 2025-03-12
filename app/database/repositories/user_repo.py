from pymongo.errors import DuplicateKeyError
from app.database.connection import get_collection


def find_user_by_email(data):
    """Buscar usuário pelo email."""
    users = get_collection("users")

    # Se data for um dicionário, extrair o email
    if isinstance(data, dict) and 'email' in data:
        email = data['email']
    else:
        # Se for uma string, usar diretamente
        email = data

    print(f"Buscando usuário com email: {email}")
    user = users.find_one({'email': email})

    if user:
        print(f"Usuário encontrado: {user['email']}")
    else:
        print(f"Nenhum usuário encontrado com email: {email}")

    return user

def create_user(data, hashed_password):
    """Criar um novo usuário."""
    users = get_collection("users")
    try:
        users.insert_one({
            'email': data['email'],
            'password': hashed_password,
            'nome': data.get('nome', ''),
            'municipios': data.get('municipios', [])
        })
        return "sucesso"
    except DuplicateKeyError:
        return "Email já cadastrado"