# VEX Assistant - Model Download Required

## ⚠️ Action Required: Download Language Model

The VEX Assistant needs a language model file that's too large for the repository.

### What You Need

**File**: `phi-3-mini-4k-instruct-q4.gguf`  
**Size**: ~2.3 GB  
**Location**: `roboready_app/python_ai/models/`

### Download Steps

1. Go to: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf

2. Find the file: `phi-3-mini-4k-instruct-q4.gguf`

3. Download it (choose the q4 quantized version for optimal performance)

4. Move to the correct location:
   ```bash
   mv phi-3-mini-4k-instruct-q4.gguf \
   ~/Documents/GitHub/VEX_Checklist/roboready_app/python_ai/models/
   ```

5. Verify it's correct:
   ```bash
   ls -lh roboready_app/python_ai/models/phi-3-mini-4k-instruct-q4.gguf
   # Should show ~2.3 GB file
   ```

### Why This Model?

- **Small**: 4-bit quantized = only 2.3 GB (vs 7.2 GB full)
- **Fast**: Optimized for CPU inference
- **Smart**: Designed for instruction following
- **Offline**: No internet needed for inference

### Alternative Models

If you need smaller/faster:
- `Phi-3-mini` (3.8B parameters, 2.3 GB)
- `Mistral-7B-Instruct-v0.1` (7B parameters)

If you need larger/smarter:
- `Phi-3-small` (8B parameters)
- `Llama-2-70B-Chat` (70B parameters, very large)

### Quick Check

After downloading, test with:
```bash
cd roboready_app/python_ai
source ../../venv/bin/activate
python flask_server.py
```

Wait for: `✓ Assistant ready!`

### Still Having Issues?

1. Check file size: `ls -lh models/phi-3-mini-4k-instruct-q4.gguf`
   - Should be ~2.3 GB (not 0 bytes!)
   
2. Check dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Check Python version:
   ```bash
   python3 --version  # Should be 3.10+
   ```

4. Look at error messages in terminal when starting Flask server
