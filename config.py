import os
from datetime import timedelta


class Config:
    """Configurações base para a aplicação."""
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://username:password@host/?retryWrites=true&w=majority")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev_secret_key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


class DevelopmentConfig(Config):
    """Configurações para ambiente de desenvolvimento."""
    DEBUG = True


class ProductionConfig(Config):
    """Configurações para ambiente de produção."""
    DEBUG = False


# Configuração a ser utilizada com base no ambiente
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}


def get_config():
    """Retorna a configuração com base no ambiente."""
    env = os.getenv("FLASK_ENV", "development")
    return config_by_name[env]