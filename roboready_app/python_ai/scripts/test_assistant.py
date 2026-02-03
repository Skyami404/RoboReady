# scripts/test_assistant.py
# Test script for VEX Assistant

import sys
import os

# Add parent directory to path so we can import vex_assistant
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from vex_assistant import VexAssistant

def test_questions():
    """
    Test the assistant with common VEX questions
    """
    print("=" * 60)
    print("VEX Assistant - Test Suite")
    print("=" * 60)
    
    # Initialize assistant
    print("\n📚 Initializing assistant...")
    assistant = VexAssistant()
    print("✓ Assistant ready!\n")
    
    # Test questions
    test_cases = [
        {
            "question": "How does tournament structure work?",
            "expected_keywords": ["qualification", "alliance", "elimination"]
        },
        {
            "question": "How do I score points in High Stakes?",
            "expected_keywords": ["rings", "points", "mobile goal"]
        },
        {
            "question": "What should be in my engineering notebook?",
            "expected_keywords": ["design", "process", "documentation"]
        },
        {
            "question": "How do I program autonomous?",
            "expected_keywords": ["sensor", "autonomous", "programming"]
        },
        {
            "question": "What is a banana?",  # Non-VEX question
            "expected_keywords": ["robotics", "VEX"]  # Should decline
        }
    ]
    
    passed = 0
    failed = 0
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n{'='*60}")
        print(f"Test {i}/{len(test_cases)}")
        print(f"{'='*60}")
        print(f"\n❓ Question: {test['question']}")
        
        # Get answer
        result = assistant.ask(test['question'])
        answer = result.get('answer', '')
        
        print(f"\n💬 Answer ({len(answer)} chars):")
        print("-" * 60)
        print(answer[:300] + ("..." if len(answer) > 300 else ""))
        print("-" * 60)
        print(f"📚 Sources retrieved: {result.get('retrieved_passages', 0)}")
        
        # Check for expected keywords
        answer_lower = answer.lower()
        keywords_found = [kw for kw in test['expected_keywords'] if kw.lower() in answer_lower]
        
        if keywords_found:
            print(f"✅ PASS - Found keywords: {', '.join(keywords_found)}")
            passed += 1
        else:
            print(f"❌ FAIL - Expected keywords not found: {', '.join(test['expected_keywords'])}")
            failed += 1
    
    # Summary
    print(f"\n{'='*60}")
    print("Test Summary")
    print(f"{'='*60}")
    print(f"✅ Passed: {passed}/{len(test_cases)}")
    print(f"❌ Failed: {failed}/{len(test_cases)}")
    print(f"📊 Success Rate: {(passed/len(test_cases)*100):.1f}%")
    print(f"{'='*60}\n")
    
    return passed == len(test_cases)

def test_knowledge_base():
    """
    Test knowledge base search functionality
    """
    print("\n" + "=" * 60)
    print("Testing Knowledge Base")
    print("=" * 60)
    
    from vex_assistant import VexKnowledgeBase
    
    kb = VexKnowledgeBase()
    
    # Test search
    query = "tournament structure"
    results = kb.search(query, top_k=3)
    
    print(f"\n🔍 Search Query: '{query}'")
    print(f"📊 Results Found: {len(results)}\n")
    
    for i, result in enumerate(results, 1):
        print(f"{i}. {result['title']}")
        print(f"   Similarity: {result['similarity_score']:.3f}")
        print(f"   Content: {result['content'][:100]}...")
        print()
    
    return len(results) > 0

def main():
    """
    Run all tests
    """
    try:
        # Test 1: Knowledge Base
        print("\n🧪 Test 1: Knowledge Base Search")
        kb_pass = test_knowledge_base()
        
        # Test 2: Question Answering
        print("\n🧪 Test 2: Question Answering")
        qa_pass = test_questions()
        
        # Overall result
        if kb_pass and qa_pass:
            print("\n🎉 All tests passed!")
            return 0
        else:
            print("\n⚠️  Some tests failed. Check output above.")
            return 1
            
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)