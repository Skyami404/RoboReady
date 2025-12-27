# scripts/build_knowledge_base.py
# Build VEX knowledge base from text files

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from vex_assistant import VexKnowledgeBase

def main():
    """
    Rebuild knowledge base from scratch
    """
    print("=" * 60)
    print("VEX Knowledge Base Builder")
    print("=" * 60)
    
    # Check if data directory exists
    data_dir = Path(__file__).parent.parent / 'data'
    if not data_dir.exists():
        print(f"\n❌ Error: Data directory not found: {data_dir}")
        print("   Create it and add VEX text files")
        return 1
    
    print(f"\n📂 Data directory: {data_dir}")
    
    # Count text files
    text_files = list(data_dir.rglob('*.txt'))
    print(f"📄 Found {len(text_files)} text files:")
    for f in text_files:
        print(f"   • {f.relative_to(data_dir)}")
    
    if len(text_files) == 0:
        print("\n⚠️  No .txt files found in data/ directory")
        print("   Add VEX knowledge files to build the knowledge base")
        return 0
    
    # Remove existing knowledge base
    models_dir = Path(__file__).parent.parent / 'models' / 'embeddings'
    if models_dir.exists():
        print(f"\n🗑️  Removing existing knowledge base...")
        for file in models_dir.glob('*'):
            if file.is_file():
                file.unlink()
                print(f"   Deleted: {file.name}")
    
    # Build new knowledge base
    print(f"\n🏗️  Building new knowledge base...")
    print("   This may take 30-60 seconds...")
    
    try:
        kb = VexKnowledgeBase()
        
        print(f"\n✅ Knowledge base built successfully!")
        print(f"   Passages: {len(kb.passages)}")
        print(f"   Index size: {kb.index.ntotal} vectors")
        print(f"   Dimensions: {kb.index.d}D vectors")
        
        # Test search
        print(f"\n🧪 Testing search...")
        results = kb.search("tournament structure", top_k=3)
        print(f"   Found {len(results)} relevant passages")
        
        if results:
            print(f"\n   Top result:")
            print(f"   Title: {results[0]['title']}")
            print(f"   Similarity: {results[0]['similarity_score']:.3f}")
            print(f"   Content: {results[0]['content'][:100]}...")
        
        print(f"\n🎉 Knowledge base ready to use!")
        return 0
        
    except Exception as e:
        print(f"\n❌ Error building knowledge base: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)