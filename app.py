import os
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from backend.agents.devotional_generator import DevotionalGenerator

# Inicialização do Flask com caminhos relativos
app = Flask(__name__)  # Removendo os parâmetros de template e static
CORS(app)

# Inicialização do gerador
generator = DevotionalGenerator()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/themes', methods=['GET'])
def get_themes():
    try:
        themes = generator.generate_themes()
        return jsonify(themes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate', methods=['POST'])
def generate():
    try:
        theme = request.json.get('theme')
        result = generator.generate_content(theme)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Configuração para produção
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)