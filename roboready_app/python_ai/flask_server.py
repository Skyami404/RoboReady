# python_ai/flask_server.py
# Flask API server for React Native integration

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import logging
from vex_assistant import VexAssistant, initialize_assistant, get_answer, get_status

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

# Global assistant instance
assistant = None
is_initializing = False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'VEX Assistant API is running'
    })

@app.route('/status', methods=['GET'])
def check_status():
    """Check if assistant is ready"""
    global assistant
    
    if is_initializing:
        return jsonify({
            'ready': False,
            'message': 'Initializing AI models... please wait'
        })
    
    if assistant is None:
        return jsonify({
            'ready': False,
            'message': 'Assistant not initialized'
        })
    
    return jsonify({
        'ready': True,
        'knowledge_base_size': len(assistant.knowledge_base.passages),
        'model_loaded': True
    })

@app.route('/initialize', methods=['POST'])
def initialize():
    """Initialize the AI assistant"""
    global assistant, is_initializing
    
    if assistant is not None:
        return jsonify({
            'success': True,
            'message': 'Already initialized'
        })
    
    if is_initializing:
        return jsonify({
            'success': False,
            'message': 'Initialization in progress'
        })
    
    try:
        is_initializing = True
        logger.info("Starting assistant initialization...")
        
        assistant = VexAssistant()
        
        is_initializing = False
        logger.info("Assistant initialized successfully!")
        
        return jsonify({
            'success': True,
            'message': 'Assistant initialized successfully'
        })
        
    except Exception as e:
        is_initializing = False
        logger.error(f"Initialization error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/ask', methods=['POST'])
def ask_question():
    """Answer a question"""
    global assistant
    
    if assistant is None:
        return jsonify({
            'error': 'Assistant not initialized',
            'answer': 'Please wait for the AI to initialize...'
        }), 503
    
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        
        if not question:
            return jsonify({
                'error': 'No question provided'
            }), 400
        
        logger.info(f"Question: {question}")
        
        # Check if VEX-related
        if not assistant.is_robotics_question(question):
            return jsonify({
                'answer': "I'm designed to help with VEX Robotics questions! Ask me about competitions, building, programming, rules, or strategies.",
                'sources': [],
                'confidence': 0.0
            })
        
        # Get answer using RAG
        result = assistant.ask(question)
        logger.info(f"Answer generated (confidence: {result['confidence']:.2f})")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        return jsonify({
            'error': str(e),
            'answer': 'I encountered an error processing your question. Please try again.'
        }), 500

@app.route('/suggestions', methods=['GET'])
def get_suggestions():
    """Get suggested questions"""
    suggestions = [
        "How does tournament structure work?",
        "How do I score points in High Stakes?",
        "What are the current VEX game rules?",
        "How do I program autonomous routines?",
        "What should be in my engineering notebook?",
        "How do I build a strong drivetrain?",
        "What sensors are available for VEX robots?",
        "How does alliance selection work?"
    ]
    return jsonify({'suggestions': suggestions})

@app.route('/reset', methods=['POST'])
def reset_assistant():
    """Reset the assistant (reload models)"""
    global assistant, is_initializing
    
    try:
        assistant = None
        is_initializing = False
        logger.info("Assistant reset")
        
        return jsonify({
            'success': True,
            'message': 'Assistant reset successfully'
        })
        
    except Exception as e:
        logger.error(f"Reset error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("VEX Assistant API Server")
    print("=" * 60)
    print("\nStarting server on http://127.0.0.1:5000")
    print("\nEndpoints:")
    print("  GET  /health      - Health check")
    print("  GET  /status      - Check if ready")
    print("  POST /initialize  - Initialize AI")
    print("  POST /ask         - Ask a question")
    print("  GET  /suggestions - Get suggested questions")
    print("\nNote: First initialization takes 30-60 seconds")
    print("=" * 60)
    
    # Auto-initialize on startup
    print("\nAuto-initializing assistant...")
    try:
        assistant = VexAssistant()
        print("✓ Assistant ready!")
    except Exception as e:
        print(f"✗ Auto-initialization failed: {e}")
        print("  Call /initialize endpoint to try again")
    
    # Run server
    app.run(
        host='127.0.0.1',  # Localhost only (secure)
        port=5000,
        debug=False,  # Set to True for development
        threaded=True  # Handle multiple requests
    )