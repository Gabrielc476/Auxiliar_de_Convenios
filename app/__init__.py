from flask import Flask
from flask_cors import CORS
from config import get_config


def create_app():
    app = Flask(__name__)

    # Carregar configurações
    app.config.from_object(get_config())

    # Configurar CORS de forma mais específica
    CORS(app,
         resources={r"/*": {
             "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],  # Origens permitidas
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
             "supports_credentials": True
         }})

    # Adicionar rota específica para OPTIONS
    @app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
    @app.route('/<path:path>', methods=['OPTIONS'])
    def handle_options(path):
        return '', 200

    # Registrar blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.convenio_routes import convenio_bp
    from app.routes.pendencia_routes import pendencia_bp
    from app.routes.reminder_routes import reminder_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(convenio_bp)
    app.register_blueprint(pendencia_bp)
    app.register_blueprint(reminder_bp)

    return app