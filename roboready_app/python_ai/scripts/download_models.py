# python_ai/scripts/download_models.py
# Download AI models for on-device inference

import os
import requests
from tqdm import tqdm
from pathlib import Path

# Model URLs
MODELS = {
    'phi3': {
        'name': 'Phi-3-mini 4K Instruct (4-bit)',
        'url': 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf',
        'filename': 'phi-3-mini-4k-instruct-q4.gguf',
        'size': '2.3 GB'
    }
}

def download_file(url: str, destination: str):
    """
    Download file with progress bar
    """
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(destination, 'wb') as file, tqdm(
        desc=os.path.basename(destination),
        total=total_size,
        unit='iB',
        unit_scale=True,
        unit_divisor=1024,
    ) as progress_bar:
        for data in response.iter_content(chunk_size=1024):
            size = file.write(data)
            progress_bar.update(size)

def main():
    print("=" * 60)
    print("VEX Assistant - Model Download")
    print("=" * 60)
    
    # Create models directory
    models_dir = Path(__file__).parent.parent / 'models'
    models_dir.mkdir(exist_ok=True)
    
    print(f"\nModels will be saved to: {models_dir}\n")
    
    # Download each model
    for model_id, model_info in MODELS.items():
        print(f"Model: {model_info['name']}")
        print(f"Size: {model_info['size']}")
        
        destination = models_dir / model_info['filename']
        
        # Check if already downloaded
        if destination.exists():
            print(f"✓ Already downloaded: {destination}")
            print()
            continue
        
        # Download
        print(f"Downloading from: {model_info['url']}")
        try:
            download_file(model_info['url'], str(destination))
            print(f"✓ Download complete: {destination}")
        except Exception as e:
            print(f"✗ Download failed: {e}")
            if destination.exists():
                destination.unlink()  # Remove partial file
        
        print()
    
    print("=" * 60)
    print("Download complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Run: python vex_assistant.py")
    print("2. This will build the knowledge base (one-time)")
    print("3. Then start Flask server: python flask_server.py")
    print("=" * 60)

if __name__ == '__main__':
    main()