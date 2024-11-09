from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from devotional_generator import DevotionalGenerator
from datetime import datetime
import json
import os

app = Flask(__name__, static_folder='../../')
CORS(app)

generator = DevotionalGenerator()
HISTORY_FILE = 'devotional_history.json'

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

@app.route('/')
def serve_html():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/themes', methods=['GET'])
def get_themes():
    history = load_history()
    recent_themes = [item['theme'] for item in history[-10:]]
    themes = generator.generate_themes()
    unique_themes = [theme for theme in themes if theme not in recent_themes]
    return jsonify(unique_themes[:10])

@app.route('/generate', methods=['POST'])
def generate_devotional():
    theme = request.json.get('theme')
    if not theme:
        return jsonify({'error': 'Theme is required'}), 400
    
    content = generator.generate_content(theme)
    return jsonify(content)

@app.route('/save-to-history', methods=['POST'])
def save_to_history():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'Data is required'}), 400
        
        history = load_history()
        new_entry = {
            'theme': data['theme'],
            'devotional': data['devotional'],
            'prayer': data['prayer'],
            'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        history.append(new_entry)
        
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=4)
        
        return jsonify({'message': 'Devocional salvo com sucesso!'}), 200
    
    except Exception as e:
        print(f"Erro ao salvar no histórico: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/history', methods=['GET'])
def get_history():
    history = load_history()
    return jsonify(history)

@app.route('/clear-history', methods=['POST'])
def clear_history():
    if os.path.exists(HISTORY_FILE):
        os.remove(HISTORY_FILE)
    return jsonify({'message': 'Histórico limpo com sucesso'})

if __name__ == '__main__':
    app.run(debug=True)