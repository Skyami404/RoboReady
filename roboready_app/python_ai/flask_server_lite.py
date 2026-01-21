#!/usr/bin/env python3
# python_ai/flask_server_lite.py
# Lightweight Flask API server - AI loads asynchronously

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import logging
import threading
import time
import sys
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app IMMEDIATELY (before AI loads)
app = Flask(__name__)
CORS(app)

# Global state
assistant = None
is_initializing = True
initialization_error = None
initialization_time = time.time()

logger.info("=" * 60)
logger.info("VEX ASSISTANT - FLASK SERVER (LITE MODE)")
logger.info("=" * 60)
logger.info("Flask server started - AI models loading in background...")

# ============================================================================
# ENDPOINTS AVAILABLE IMMEDIATELY (No AI needed)
# ============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint - Available immediately"""
    return jsonify({
        'status': 'ok',
        'message': 'VEX Assistant API is running',
        'timestamp': time.time()
    }), 200

@app.route('/status', methods=['GET'])
def check_status():
    """Check AI model status"""
    global assistant, is_initializing, initialization_error
    
    elapsed = time.time() - initialization_time
    
    if is_initializing:
        return jsonify({
            'ready': False,
            'status': 'initializing',
            'message': 'Loading AI models... please wait',
            'elapsed_seconds': elapsed
        }), 202  # Accepted - processing
    
    if initialization_error:
        return jsonify({
            'ready': False,
            'status': 'error',
            'message': f'Initialization failed: {initialization_error}',
            'elapsed_seconds': elapsed
        }), 503  # Service unavailable
    
    if assistant is None:
        return jsonify({
            'ready': False,
            'status': 'not_initialized',
            'message': 'Assistant not initialized',
            'elapsed_seconds': elapsed
        }), 503
    
    return jsonify({
        'ready': True,
        'status': 'ready',
        'message': 'AI models loaded and ready',
        'elapsed_seconds': elapsed
    }), 200

@app.route('/test', methods=['POST'])
def test_endpoint():
    """Test endpoint to verify API works"""
    try:
        data = request.get_json() or {}
        return jsonify({
            'test': 'success',
            'data': 'Flask is working!',
            'received': data,
            'timestamp': time.time()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ============================================================================
# AI ENDPOINTS (Only work after initialization)
# ============================================================================

@app.route('/ask', methods=['POST'])
def ask_question():
    """Ask VEX Assistant a question"""
    global assistant, is_initializing
    
    if is_initializing:
        return jsonify({
            'error': 'AI models still loading',
            'message': 'Please wait a moment and try again'
        }), 202
    
    if assistant is None:
        return jsonify({
            'error': 'AI not initialized',
            'message': 'Failed to load AI models'
        }), 503
    
    try:
        data = request.get_json() or {}
        question = data.get('question', '')
        
        if not question:
            return jsonify({'error': 'No question provided'}), 400
        
        response = assistant.ask(question)
        return jsonify({
            'success': True,
            'question': question,
            'answer': response.get('answer', ''),
            'sources': response.get('sources', []),
            'confidence': response.get('confidence', 0)
        }), 200
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/initialize', methods=['POST'])
def initialize_manually():
    """Manually trigger AI initialization"""
    global assistant, is_initializing
    
    if assistant is not None:
        return jsonify({'message': 'AI already initialized'}), 200
    
    if is_initializing:
        return jsonify({'message': 'AI initialization already in progress'}), 202
    
    # Start initialization
    init_thread = threading.Thread(target=_initialize_assistant, daemon=True)
    init_thread.start()
    
    return jsonify({'message': 'Initialization started'}), 202

# ============================================================================
# BACKGROUND INITIALIZATION
# ============================================================================

def _initialize_assistant():
    """Initialize VEX Assistant in background"""
    global assistant, is_initializing, initialization_error
    
    try:
        logger.info("⏳ Starting AI model initialization...")
        
        # Import here (in background thread) so it doesn't block server
        from vex_assistant import VexAssistant
        
        logger.info("Loading VEX knowledge base and embeddings...")
        start_time = time.time()
        
        assistant = VexAssistant()
        
        elapsed = time.time() - start_time
        logger.info(f"✅ VEX Assistant initialized in {elapsed:.1f}s")
        logger.info("📚 AI Ready for questions!")
        
        is_initializing = False
        
    except Exception as e:
        logger.error(f"❌ AI initialization failed: {e}", exc_info=True)
        initialization_error = str(e)
        is_initializing = False

# Start background initialization thread
logger.info("Starting background AI initialization thread...")
init_thread = threading.Thread(target=_initialize_assistant, daemon=True)
init_thread.start()

# ============================================================================
# SERVER STARTUP
# ============================================================================

if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("Starting Flask server on http://127.0.0.1:8000")
    logger.info("Health check: GET /health")
    logger.info("Status: GET /status")
    logger.info("Test: POST /test")
    logger.info("=" * 60)
    
    # Run Flask
    app.run(
        host='127.0.0.1',
        port=8000,
        debug=False,
        use_reloader=False,
        threaded=True
    )
