from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='.')
CORS(app)


def safe_calculate(expression: str):
    allowed_chars = set('0123456789+-*/.() ')
    if not all(c in allowed_chars for c in expression):
        raise ValueError("Invalid characters in expression")

    result = eval(expression)

    if isinstance(result, float):
        if result == int(result):
            return int(result)
        return round(result, 10)

    return result


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()

    if not data or 'expression' not in data:
        return jsonify({'error': 'No expression provided'}), 400

    expression = data['expression'].strip()

    if not expression:
        return jsonify({'error': 'Empty expression'}), 400

    try:
        result = safe_calculate(expression)
        return jsonify({'result': result})

    except ZeroDivisionError:
        return jsonify({'error': 'Division by zero'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
