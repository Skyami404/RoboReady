# VEX Assistant - Pre-Launch Checklist

## Before First Use

### Prerequisites
- [ ] Python 3.10+ installed: `python3 --version`
- [ ] Virtual environment created: `ls venv/`
- [ ] Python packages installed: `pip list | grep sentence-transformers`
- [ ] Model file downloaded: `ls -lh roboready_app/python_ai/models/phi-3-mini-4k-instruct-q4.gguf` (should be ~2.3GB, not 0 bytes)
- [ ] Embeddings files exist: `ls roboready_app/python_ai/models/embeddings/`

### Quick Verification
```bash
# Run from project root
cd roboready_app/python_ai
source venv312/bin/activate

# Check Python
python3 --version

# Check packages
pip list | grep -E "sentence|faiss|llama|flask"

# Check files
ls -lh models/phi-3-mini-4k-instruct-q4.gguf
ls models/embeddings/
```

## Startup Procedure

### Step 1: Start Flask Server (Terminal 1)
```bash
cd /Users/skyami/Documents/GitHub/VEX_Checklist/roboready_app/python_ai
source venv312/bin/activate
python flask_server_lite.py
```

**Expected Output**:
```
==========================================================
VEX Assistant API Server (LITE MODE)
==========================================================

Starting server on http://127.0.0.1:8000

Auto-initializing assistant in background...
✓ Assistant ready!
```

⏱️ **Wait for**: `✓ Assistant ready!` message (takes 30-60 seconds)

### Step 2: Open App (Terminal 2 or new window)
```bash
cd /Users/skyami/Documents/GitHub/VEX_Checklist
npm start  # or use Expo Go
```

### Step 3: Test the Assistant
1. Open RoboReady app
2. Navigate to "VEX Assistant" tab
3. Ask: "How does tournament structure work?"
4. Wait for response (5-15 seconds normal)

## Success Indicators

✅ **Flask Server**:
- [ ] No error messages in output
- [ ] Shows "✓ Assistant ready!"
- [ ] Terminal stays open and responsive
- [ ] Shows incoming questions in logs

✅ **React Native App**:
- [ ] VEX Assistant screen loads
- [ ] Can type questions
- [ ] Send button is enabled
- [ ] Gets response from assistant

 ✅ **Full Flow**:
 - [ ] User asks question
 - [ ] UI shows loading state
 - [ ] Response includes answer + sources

## Common Issues & Fixes

### Issue: Model file is 0 bytes
**Fix**: Download from HuggingFace
```bash
# See roboready_app/python_ai/MODEL_DOWNLOAD.md
```

### Issue: "Cannot connect to AI service"
**Fix**: Flask server not running
```bash
# Terminal 1:
cd roboready_app/python_ai
source ../../venv/bin/activate
python flask_server.py
```

### Issue: "AI is still loading"
**Fix**: Normal - wait 30-60 seconds on first startup

### Issue: "ModuleNotFoundError: No module named 'sentence_transformers'"
**Fix**: Install packages
```bash
cd roboready_app/python_ai
source ../../venv/bin/activate
pip install -r requirements.txt
```

### Issue: Port 5000 already in use
**Fix**: Kill other process
```bash
lsof -ti:5000 | xargs kill -9
python flask_server.py
```

## Terminal Setup

### Recommended Terminal Layout

**Terminal 1** (Keep open):
```
$ cd roboready_app/python_ai
$ source ../../venv/bin/activate
$ python flask_server.py
[Shows API logs]
```

**Terminal 2** (Run app):
```
$ cd /Users/skyami/Documents/GitHub/VEX_Checklist
$ npm start
[Expo server running]
```

## Stopping the App

1. Close Expo app or press `q` in Terminal 2
2. Stop Flask: Press `Ctrl+C` in Terminal 1

## Documentation Links

- **Quick Start**: [VEXAI_STARTUP.md](VEXAI_STARTUP.md)
- **Detailed Docs**: [README_AI.md](roboready_app/python_ai/README_AI.md)
- **Model Download**: [MODEL_DOWNLOAD.md](roboready_app/python_ai/MODEL_DOWNLOAD.md)
- **Full Summary**: [VEX_ASSISTANT_SUMMARY.md](VEX_ASSISTANT_SUMMARY.md)

## Support

If something goes wrong:

1. **Check Flask output** for error messages
2. **Review logs** - error messages are helpful
3. **Verify file sizes** - model should be ~2.3GB
4. **Check Python version** - needs 3.10+
5. **Reinstall packages** - `pip install -r requirements.txt`

## Example Questions to Try

After everything is running:

1. "How does tournament structure work?"
2. "What's the scoring system for High Stakes?"
3. "How do I build a strong drivetrain?"
4. "What sensors should I use?"
5. "How does alliance selection work?"
6. "What should be in my engineering notebook?"
7. "How do I program autonomous routines?"
8. "Tell me about the competition awards"

---

**Ready to Launch?** Follow the "Startup Procedure" section above!
