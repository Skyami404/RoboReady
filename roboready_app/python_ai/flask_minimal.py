#!/usr/bin/env python3
# Simple Flask API that works without heavy ML dependencies

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'VEX Assistant API running'}), 200

@app.route('/status', methods=['GET'])
def status():
    return jsonify({'ready': True, 'status': 'ready', 'message': 'API operational'}), 200

@app.route('/test', methods=['POST'])
def test():
    data = request.get_json() or {}
    return jsonify({'success': True, 'data': 'Flask is working!'}), 200

@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json() or {}
    question = data.get('question', 'What is VEX?')
    
    # Temporary response while AI loads
    return jsonify({
        'answer': 'VEX Robotics is a global robotics platform. The AI model is still loading - please try again in a moment.',
        'sources': ['VEX Official Website']
    }), 200

if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("VEX ASSISTANT API - MINIMAL MODE")
    logger.info("Running on http://127.0.0.1:8000")
    logger.info("=" * 60)
    app.run(host='127.0.0.1', port=8000, debug=False, threaded=True)
