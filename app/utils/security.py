import bcrypt

def hash_password(password):
    """Gerar hash da senha."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def verify_password(plain_password, hashed_password):
    """Verificar se a senha está correta."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)