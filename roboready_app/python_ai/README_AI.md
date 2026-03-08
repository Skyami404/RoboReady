# VEX Assistant - On-Device AI Chatbot

## Overview

The VEX Assistant is a fully offline AI chatbot that helps teams with VEX Robotics questions. It runs entirely on-device using:

- **Knowledge Base**: VEX competition rules, building guides, programming tutorials
- **Embedding Model**: `all-MiniLM-L6-v2` for semantic search
- **Language Model**: `Phi-3-mini` (4-bit quantized) for response generation
- **Vector Database**: FAISS for fast similarity search

No internet connection required! All processing happens locally.

## Setup

### 1. Install Python Dependencies

From the project root:

```bash
cd roboready_app/python_ai
source venv312/bin/activate  # Activate virtual environment (venv312)
pip install -r requirements.txt
```

### 2. Verify Models are Downloaded

Check that these files exist:
- `models/phi-3-mini-4k-instruct-q4.gguf` (2.3 GB)
- `models/embeddings/vex_knowledge.index`
- `models/embeddings/vex_passages.json`

If missing, download from:
https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf

### 3. Start the Flask Server (optional)

The Python/Flask server is **only required for desktop development** or debugging the
full RAG pipeline. Mobile builds include a lightweight JavaScript engine that runs
entirely on-device, so end users do **not** need to start this server and the app
will work offline out of the box.

If you are a developer and still want to start the backend manually, run:

```bash
# From roboready_app/python_ai directory:
cd roboready_app/python_ai
source ../../venv/bin/activate
python flask_server.py
```

Or use the startup script:
```bash
chmod +x start_server.sh
./start_server.sh
```

The server will start on `http://127.0.0.1:8000`, but the React Native app will
prefer the local JS engine when available.

## How It Works

### Architecture

```
React Native App
      ↓
VexAssistantService (TypeScript)
      ↓
HTTP/REST API
      ↓
Flask Server (Python)
      ↓
├─ VexKnowledgeBase (FAISS + Embeddings)
├─ VexLanguageModel (Phi-3-mini)
└─ VexAssistant (RAG orchestration)
```

### Response Flow (RAG - Retrieval-Augmented Generation)

1. **User asks question** in the app
2. **Service initializes** Flask server if needed
3. **Server receives question** via HTTP POST
4. **Knowledge base searches** for relevant passages using embeddings
5. **Context construction**: Top 3 most relevant passages selected
6. **Language model generates** response based on context
7. **Response sent back** to app with sources (no separate confidence score)

## API Endpoints

### `GET /health`
Simple health check
```json
{"status": "ok", "message": "VEX Assistant API is running"}
```

### `GET /status`
Check if AI is ready
```json
{"ready": true, "knowledge_base_size": 15, "model_loaded": true}
```

### `POST /initialize`
Initialize the AI (auto-called on startup)
```json
{"success": true, "message": "Assistant initialized successfully"}
```

### `POST /ask`
Ask a question
```
Request:
{"question": "How does autonomous programming work?"}

Response:
{
  "answer": "...",
  "sources": [
    {"title": "Autonomous Programming", "similarity": 0.95},
    ...
  ],
  "retrieved_passages": 3
}
```

### `GET /suggestions`
Get suggested questions
```json
{
  "suggestions": [
    "How does tournament structure work?",
    ...
  ]
}
```

### `POST /reset`
Reset the assistant (clear memory)
```json
{"success": true, "message": "Assistant reset successfully"}
```

## Features

✅ **VEX-Only Responses**: Filters non-VEX questions  
✅ **Source Attribution**: Shows which documents the answer was drawn from
✅ **Source Attribution**: Shows which docs the answer came from  
✅ **Fast Responses**: FAISS provides millisecond-level search  
✅ **No Internet Required**: Runs completely offline  
✅ **Low Resource Usage**: Phi-3-mini uses ~2.3GB memory  
✅ **Error Handling**: Graceful failures with helpful messages  

## VEX Knowledge Base

The assistant has knowledge about:

- Tournament structure and scoring
 - High Stakes rules and scoring (check current game manual for exact values)
- Autonomous programming techniques
- Engineering notebook requirements
- Robot building fundamentals
- V5 motors and sensors
- Competition awards and judging
- Skills challenges
- Alliance selection process
- Programming platforms (VEXcode, PROS, RobotC)
- VEX IQ competition
- Driver skills practice
- Gear ratios and speed calculations
- Common robot failures and fixes
- VEX rules compliance

To add more knowledge, edit the knowledge base in:
```python
roboready_app/python_ai/vex_assistant.py
# In VexKnowledgeBase.build_knowledge_base()
```

## Troubleshooting

### "Cannot connect to AI service"
1. Ensure Flask server is running: `python flask_server.py`
2. Check that virtual environment is activated
3. Verify Python packages: `pip install -r requirements.txt`

### "AI is still loading"
- First initialization takes 30-60 seconds
- Model file is being loaded and optimized
- Wait and try again

### Slow responses
- Normal: 5-15 seconds for response generation
- First question takes longer due to model warmup
- Consider reducing max_tokens in `vex_assistant.py` if needed

### Model file not found
- Download from: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf
- Place in: `roboready_app/python_ai/models/`
- Filename should be: `phi-3-mini-4k-instruct-q4.gguf`

## Performance Optimization

### For Faster Responses
In `vex_assistant.py`, adjust these parameters:

```python
# Reduce response length
max_tokens=200  # Default: 400

# Reduce search results
top_k=2  # Default: 3 (fewer documents = faster)

# Lower temperature for more deterministic responses
temperature=0.5  # Default: 0.7
```

### For Better Accuracy
```python
# More search results
top_k=5  # Default: 3

# More creative responses
temperature=0.9  # Default: 0.7

# Longer responses
max_tokens=600  # Default: 400
```

## Development

### Testing the Assistant Locally

```bash
python vex_assistant.py
```

This starts the CLI mode where you can test questions directly.

### Building the Knowledge Base from Scratch

```python
from vex_assistant import VexKnowledgeBase

kb = VexKnowledgeBase()
# Will automatically build if files don't exist
```

## File Structure

```
roboready_app/python_ai/
├── flask_server.py              # Flask API server
├── vex_assistant.py             # Core AI logic
├── requirements.txt             # Python dependencies
├── start_server.sh             # Startup script
│
├── models/
│   ├── phi-3-mini-4k-instruct-q4.gguf  # Language model (2.3GB)
│   └── embeddings/
│       ├── vex_knowledge.index         # FAISS index
│       └── vex_passages.json           # Passages with metadata
│
├── data/                        # VEX reference docs (optional)
│   ├── vex_guides/
│   ├── vex_manuals/
│   └── vex_rules/
│
└── scripts/                     # Utility scripts
    ├── build_knowledge_base.py
    └── test_assistant.py
```

## Limitations & Future Improvements

### Current Limitations
- Limited to VEX-related questions (by design)
- Responses limited to ~200 words
- Knowledge base is static (doesn't learn)
- Single-threaded (processes one question at a time)

### Future Improvements
- [ ] Real-time knowledge base updates
- [ ] Multi-language support
- [ ] Conversation history and context
- [ ] Vision support (analyze robot images)
- [ ] Integration with RobotEvents API
- [ ] Custom knowledge base training
- [ ] Mobile offline models (smaller, faster)

## Support

For issues or questions:
1. Check the Flask server output for errors
2. Verify Python dependencies: `pip list | grep -E "sentence-transformers|faiss|llama"`
3. Try resetting the assistant: `POST /reset`
4. Restart the Flask server

## License

Same as RoboReady app license.
