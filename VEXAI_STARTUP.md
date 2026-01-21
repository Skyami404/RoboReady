# VEX Assistant Quick Start Guide

## Important: Python Version

**⚠️ Use Python 3.12 (not 3.14)**

Python 3.14 has compatibility issues with scipy. Use the Python 3.12 virtual environment:

```bash
source venv312/bin/activate  # Use this, not venv/
```

## One-Time Setup

### 1. Install Python Packages

```bash
# From project root - USE PYTHON 3.12 VENV
cd roboready_app/python_ai
source ../../venv312/bin/activate  # Python 3.12
pip install -r requirements.txt
```

### 2. Verify Model File Exists

The file `models/phi-3-mini-4k-instruct-q4.gguf` (2.3 GB) should exist.

If it doesn't, download from:
https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf

## Every Session - Start the Flask Server

**From Terminal:**

```bash
cd /Users/skyami/Documents/GitHub/VEX_Checklist/roboready_app/python_ai
source ../../venv312/bin/activate  # Python 3.12
python flask_server.py
```

**Expected Output:**
```
============================================================
VEX Assistant API Server
============================================================

Starting server on http://127.0.0.1:5000

Auto-initializing assistant in background...
✓ Assistant ready!
```

> **Important**: Keep this terminal open while using the app!

## Using the App

1. Start Flask server (see above)
2. Open the RoboReady app
3. Go to "VEX Assistant" tab
4. Ask any VEX Robotics question!

## Troubleshooting

### "Cannot connect to AI service"
- ✅ Flask server is running?
- ✅ Terminal shows "✓ Assistant ready!"?
- ✅ Don't close the Terminal window!
- ✅ Using venv312 (Python 3.12)?

### "ModuleNotFoundError: scipy"
**Solution**: You're using Python 3.14 which has compatibility issues
```bash
# Switch to Python 3.12
source ../../venv312/bin/activate
```

### "AI is still loading"
- Normal behavior on first use
- Takes 30-60 seconds to initialize
- Wait and ask again

### Server won't start?
```bash
# Check which python is being used
which python  # Should show venv312

# Try these commands
python3.12 --version  # Should be 3.12.x
source ../../venv312/bin/activate
pip install -r requirements.txt
python flask_server.py
```

### Port 5000 already in use?
```bash
# Kill other process on port 5000
lsof -ti:5000 | xargs kill -9
python flask_server.py
```

## Features

✅ **Offline**: No internet needed  
✅ **Fast**: Millisecond responses  
✅ **Accurate**: Uses VEX official docs  
✅ **Safe**: Only answers VEX questions  
✅ **Simple**: Just ask and get answers!  

## Example Questions

- "How does tournament structure work?"
- "What's the scoring system for High Stakes?"
- "How do I program autonomous routines?"
- "What should be in my engineering notebook?"
- "How do I build a strong drivetrain?"
- "What sensors should I use?"
- "How does alliance selection work?"

## Support

For detailed documentation, see: `README_AI.md`
