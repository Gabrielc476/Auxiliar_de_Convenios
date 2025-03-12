from flask import Blueprint, request, jsonify
from app.services.auth_service import login_user, register_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    return login_user(data)

@auth_bp.route('/cadastro', methods=['POST'])
def register():
    data = request.get_json()
    return register_user(data)