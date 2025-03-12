import pymongo
from flask import current_app
from functools import lru_cache

@lru_cache(maxsize=1)
def get_db_client():
    """Obtém um cliente MongoDB compartilhado."""
    client = pymongo.MongoClient(current_app.config['MONGODB_URI'])
    return client

def get_db():
    """Obtém a instância do banco de dados."""
    client = get_db_client()
    return client["Convenios"]

def get_collection(collection_name):
    """Obtém uma coleção específica do banco de dados."""
    db = get_db()
    return db[collection_name]