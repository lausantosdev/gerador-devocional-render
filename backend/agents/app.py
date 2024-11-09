from flask import Flask, render_template, jsonify, request

app = Flask(__name__, template_folder='../../templates', static_folder='../../static')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    theme = request.json.get('theme')
    # Aqui você pode adicionar a lógica de geração do devocional
    return jsonify({
        'devotional': 'Texto do devocional aqui...',
        'prayer': 'Texto da oração aqui...'
    })

if __name__ == '__main__':
    app.run(debug=True)