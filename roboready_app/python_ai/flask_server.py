# python_ai/flask_server.py
# Flask API server for React Native integration

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import logging
import threading
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

# Global assistant instance
assistant = None
is_initializing = True
initialization_lock = threading.Lock()
initialization_error = None

# Import VexAssistant in background
def initialize_assistant():
    global assistant, is_initializing, initialization_error
    try:
        logger.info("Loading VEX Assistant AI models...")
        from vex_assistant import VexAssistant
        assistant = VexAssistant()
        logger.info("✅ VEX Assistant initialized successfully")
        is_initializing = False
    except Exception as e:
        logger.error(f"❌ Failed to initialize assistant: {e}")
        initialization_error = str(e)
        is_initializing = False

# Start initialization in background thread
init_thread = threading.Thread(target=initialize_assistant, daemon=True)
init_thread.start()

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
    
    with initialization_lock:
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
        
        is_initializing = True
    
    try:
        logger.info("Starting assistant initialization...")
        
        # Initialize in background thread to avoid blocking
        def init_worker():
            global assistant, is_initializing
            try:
                assistant = VexAssistant()
                logger.info("✓ Assistant initialized successfully!")
            except Exception as e:
                logger.error(f"✗ Initialization failed: {e}")
                is_initializing = False
                raise
        
        init_thread = threading.Thread(target=init_worker, daemon=False)
        init_thread.start()
        init_thread.join(timeout=120)  # Wait up to 2 minutes
        
        if assistant is not None:
            is_initializing = False
            return jsonify({
                'success': True,
                'message': 'Assistant initialized successfully'
            })
        else:
            is_initializing = False
            return jsonify({
                'success': False,
                'error': 'Initialization timed out or failed'
            }), 500
        
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
        if not data:
            return jsonify({
                'error': 'No JSON data provided'
            }), 400
            
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
                'sources': []
            })
        
        # Get answer using RAG
        result = assistant.ask(question)
        logger.info(f"Answer generated; returning result to client")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error processing question: {e}", exc_info=True)
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
    print("\nStarting server on http://127.0.0.1:8000")
    print("\nEndpoints:")
    print("  GET  /health      - Health check")
    print("  GET  /status      - Check if ready")
    print("  POST /initialize  - Initialize AI")
    print("  POST /ask         - Ask a question")
    print("  GET  /suggestions - Get suggested questions")
    print("  POST /reset       - Reset assistant")
    print("\nNote: First initialization takes 30-60 seconds")
    print("=" * 60)
    
    # Auto-initialize on startup in background thread
    print("\nAuto-initializing assistant in background...")
    def init_on_startup():
        global assistant
        time.sleep(1)  # Give server time to start
        try:
            from vex_assistant import VexAssistant
            assistant = VexAssistant()
            print("✓ Assistant ready!")
        except Exception as e:
            print(f"✗ Auto-initialization failed: {e}")
            print("  Call POST /initialize endpoint to try again")
    
    init_thread = threading.Thread(target=init_on_startup, daemon=True)
    init_thread.start()
    
    # Run server
    app.run(
        host='127.0.0.1',  # Localhost only (secure)
        port=8000,
        debug=False,  # Production mode
        threaded=True,  # Handle multiple requests
        use_reloader=False  # Don't reload on file changes
    )