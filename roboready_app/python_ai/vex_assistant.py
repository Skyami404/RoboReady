# vex_assistant.py
# On-Device AI Assistant for VEX Robotics
# Runs entirely on mobile device - no internet required

import os
import json
import numpy as np
from typing import List, Dict, Tuple
from sentence_transformers import SentenceTransformer
import faiss
from llama_cpp import Llama

class VexKnowledgeBase:
    """
    Stores and retrieves VEX Robotics knowledge using vector embeddings
    """
    
    def __init__(self, model_path: str = "models/embeddings"):
        """
        Initialize the knowledge base with embedding model
        
        How it works:
        1. Load embedding model (converts text to vectors)
        2. Load pre-built vector index (FAISS)
        3. Load text passages corresponding to vectors
        """
        print("Loading embedding model...")
        # MiniLM: Small, fast embedding model (120MB)
        # Converts text to 384-dimensional vectors
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # FAISS: Facebook AI Similarity Search
        # Ultra-fast vector search library
        self.index_path = os.path.join(model_path, "vex_knowledge.index")
        self.passages_path = os.path.join(model_path, "vex_passages.json")
        
        if os.path.exists(self.index_path):
            print("Loading existing knowledge base...")
            self.index = faiss.read_index(self.index_path)
            with open(self.passages_path, 'r') as f:
                self.passages = json.load(f)
        else:
            print("Knowledge base not found. Building from scratch...")
            self.index = None
            self.passages = []
            self.build_knowledge_base()
    
    def build_knowledge_base(self):
        """
        Build knowledge base from VEX information
        
        Process:
        1. Load VEX documentation (scraped beforehand)
        2. Split into passages (chunks of text)
        3. Generate embeddings for each passage
        4. Build FAISS index for fast search
        5. Save to disk
        """
        print("Building VEX knowledge base...")
        
        # Sample VEX knowledge (in production, load from scraped files)
        vex_knowledge = [
            {
                "title": "Tournament Structure",
                "content": "VEX tournaments follow this structure: Qualification matches where teams compete in 4-6 matches with randomly assigned alliance partners. Teams are ranked by Win Points (2 per win, 1 per tie), Autonomous Win Points (AWP), and Strength of Schedule (SOS). Top teams then select alliance partners for elimination rounds consisting of quarterfinals, semifinals, and finals played in best-of-3 format."
            },
            {
                "title": "High Stakes Scoring",
                "content": "High Stakes (2024-2025 VEX V5RC) scoring: Rings on mobile goals are worth 3 points (lower), 4 points (middle), or 5 points (upper). Rings on wall stakes follow the same point values. Alliance stake rings are worth 6 points each. Autonomous bonus awards extra points for preloaded rings scored during autonomous period. Robot elevation at match end provides bonus points."
            },
            {
                "title": "Autonomous Programming",
                "content": "VEX autonomous programming uses sensors for accuracy. The Inertial Sensor provides gyroscope functionality for precise turns and positioning. Vision Sensors detect colored objects like goals and game pieces. Distance Sensors measure range to objects. Optical Sensors enable line tracking and color detection. GPS Sensors (V5 only) provide field positioning. Best practices include starting simple, testing from multiple positions, using consistent units, adding timeout failsafes, and keeping code modular."
            },
            {
                "title": "Engineering Notebook",
                "content": "Engineering notebooks should document the complete design process including brainstorming, sketches, CAD models, build documentation with photos, testing data and performance metrics, problem-solving approaches, strategy development, team organization, and reflections. Best practices: date every entry, write in past tense, be specific and detailed, include photos and diagrams, show decision-making process, document both failures and successes, and make it authentic rather than templated."
            },
            {
                "title": "Robot Building Basics",
                "content": "VEX robot building starts with a strong drivetrain. Common options include Tank Drive (simple, reliable), X-Drive (fast, maneuverable), H-Drive (strafing ability), and Mecanum (omni-directional). Key design principles: start with strong drivetrain, keep center of gravity low, ensure proper gear ratios balancing speed vs torque, use proper spacing and support, allow maintenance access, stay under size constraints, and test iteratively."
            },
            {
                "title": "V5 Motors and Sensors",
                "content": "V5 Smart Motors come in 11W (high speed, standard torque) and 5.5W (high torque, lower speed) variants with built-in encoders. Motor cartridges: Red (torque), Green (speed), Blue (turbo). Available sensors: Vision Sensor (color/object detection), Inertial Sensor (rotation/acceleration), Distance Sensor (ultrasonic ranging), Optical Sensor (line tracking, color), Rotation Sensor (precise position tracking), GPS Sensor (field positioning), and Limit Switch (digital detection)."
            },
            {
                "title": "Competition Awards",
                "content": "Major VEX awards include Excellence Award (overall best team considering robot performance, notebook, and interview), Tournament Champions (elimination bracket winners), Design Award (best engineering process with notebook emphasis), Judges Award (exemplary team qualities), Innovate Award (creative/innovative design), and Amaze Award (best driver skills). Judging criteria emphasize engineering notebook quality, robot design innovation, programming complexity, team interview, match performance, and teamwork."
            },
            {
                "title": "Skills Challenge",
                "content": "VEX Skills Challenges consist of two parts: Driver Skills (1 minute of manual control) and Autonomous Skills (1 minute of autonomous operation). Combined scores rank teams globally. Skills challenges are separate from regular matches and provide opportunities to showcase robot capabilities in controlled conditions. High skills scores can earn tournament seeding advantages and qualification for championship events."
            },
            {
                "title": "Alliance Selection",
                "content": "Alliance selection occurs after qualification matches. The top 8-16 teams (depending on tournament size) become alliance captains based on qualification ranking. Starting with the #1 seed, captains take turns selecting alliance partners from remaining teams. Selected teams can accept or decline. If declined, the captain makes another selection. This continues until all alliances are formed for elimination rounds."
            },
            {
                "title": "Programming Platforms",
                "content": "VEX robots can be programmed using several platforms: VEXcode V5/IQ offers blocks or Python/C++ and is beginner-friendly with intuitive interface. PROS provides advanced C/C++ programming for experienced programmers with full control. RobotC is a legacy C-based platform for older systems. Python is also available through VEXcode for text-based programming with modern syntax."
            }
        ]
        
        # Create passages list with metadata
        self.passages = []
        for item in vex_knowledge:
            self.passages.append({
                "title": item["title"],
                "content": item["content"],
                "source": "VEX Official Documentation"
            })
        
        # Generate embeddings for all passages
        print(f"Generating embeddings for {len(self.passages)} passages...")
        passage_texts = [p["content"] for p in self.passages]
        
        # Convert text to vectors (embeddings)
        # Each passage becomes a 384-dimensional vector
        embeddings = self.embedding_model.encode(
            passage_texts,
            show_progress_bar=True,
            convert_to_numpy=True
        )
        
        # Build FAISS index for fast similarity search
        dimension = embeddings.shape[1]  # 384 dimensions
        self.index = faiss.IndexFlatL2(dimension)  # L2 = Euclidean distance
        self.index.add(embeddings.astype('float32'))
        
        # Save to disk
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        faiss.write_index(self.index, self.index_path)
        with open(self.passages_path, 'w') as f:
            json.dump(self.passages, f, indent=2)
        
        print(f"Knowledge base built with {len(self.passages)} passages!")
    
    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        """
        Search knowledge base for relevant passages
        
        Args:
            query: User's question
            top_k: Number of results to return
            
        Returns:
            List of most relevant passages
            
        How it works:
        1. Convert query to embedding vector
        2. Search FAISS index for similar vectors
        3. Return corresponding text passages
        """
        # Convert query to vector
        query_embedding = self.embedding_model.encode(
            [query],
            convert_to_numpy=True
        )
        
        # Search index for top_k similar vectors
        # distances: how far each result is (lower = more similar)
        # indices: which passages matched
        distances, indices = self.index.search(
            query_embedding.astype('float32'),
            top_k
        )
        
        # Retrieve passages
        results = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx < len(self.passages):
                result = self.passages[idx].copy()
                result['similarity_score'] = 1.0 / (1.0 + distance)  # Convert to 0-1 score
                results.append(result)
        
        return results


class VexLanguageModel:
    """
    Small language model for generating responses
    Runs entirely on-device using llama.cpp
    """
    
    def __init__(self, model_path: str = "models/phi-3-mini-4k-instruct-q4.gguf"):
        """
        Initialize language model
        
        Uses Phi-3-mini:
        - 3.8 billion parameters
        - 4-bit quantization (2.3GB)
        - Optimized for instruction following
        - Fast inference on mobile
        """
        print(f"Loading language model from {model_path}...")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model not found at {model_path}\n"
                "Download from: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf"
            )
        
        # Initialize Llama.cpp model
        # n_ctx: context window size (4096 tokens)
        # n_threads: CPU threads to use
        # n_gpu_layers: offload to GPU if available
        self.model = Llama(
            model_path=model_path,
            n_ctx=4096,  # Context window
            n_threads=4,  # CPU threads
            n_gpu_layers=0,  # Set to 35 if GPU available
            verbose=False
        )
        
        print("Model loaded successfully!")
    
    def generate(
        self,
        prompt: str,
        max_tokens: int = 500,
        temperature: float = 0.7,
        top_p: float = 0.9
    ) -> str:
        """
        Generate response to prompt
        
        Args:
            prompt: Input text (question + context)
            max_tokens: Maximum response length
            temperature: Randomness (0.0 = deterministic, 1.0 = creative)
            top_p: Nucleus sampling threshold
            
        Returns:
            Generated text response
            
        How it works:
        1. Tokenize prompt
        2. Run through model layers (autoregressive)
        3. Sample next token based on probabilities
        4. Repeat until done or max_tokens reached
        """
        # Generate response
        output = self.model(
            prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            echo=False,  # Don't repeat prompt in output
            stop=["</s>", "User:", "\n\n\n"]  # Stop sequences
        )
        
        # Extract text from output
        response = output['choices'][0]['text'].strip()
        return response


class VexAssistant:
    """
    Main VEX Assistant class
    Combines knowledge base and language model for RAG
    """
    
    def __init__(self):
        """
        Initialize assistant with knowledge base and language model
        """
        print("Initializing VEX Assistant...")
        
        # Load components
        self.knowledge_base = VexKnowledgeBase()
        self.language_model = VexLanguageModel()
        
        # System prompt for the model
        self.system_prompt = """You are a helpful VEX Robotics assistant. You provide accurate, concise information about VEX competitions, robot building, programming, and rules.

Based on the provided context, answer the user's question clearly and helpfully. If the context doesn't contain enough information, say so honestly.

Keep responses under 200 words unless more detail is requested. Be conversational and encouraging."""
        
        print("VEX Assistant ready!")
    
    def ask(self, question: str) -> Dict:
        """
        Answer a question using RAG (Retrieval-Augmented Generation)
        
        Args:
            question: User's question
            
        Returns:
            Dict with answer, sources, and metadata
            
        RAG Process:
        1. Retrieve relevant passages from knowledge base
        2. Construct prompt with context
        3. Generate answer using language model
        4. Return answer with sources
        """
        print(f"\nQuestion: {question}")
        
        # Step 1: Retrieve relevant context
        print("Searching knowledge base...")
        search_results = self.knowledge_base.search(question, top_k=3)
        
        if not search_results:
            return {
                "answer": "I don't have enough information to answer that question. Please ask about VEX Robotics topics like competitions, building, or programming.",
                "sources": [],
                "confidence": 0.0
            }
        
        # Step 2: Build context from search results
        context_parts = []
        sources = []
        
        for i, result in enumerate(search_results, 1):
            context_parts.append(f"[Source {i}] {result['title']}:\n{result['content']}")
            sources.append({
                "title": result['title'],
                "similarity": result['similarity_score']
            })
        
        context = "\n\n".join(context_parts)
        
        # Step 3: Construct prompt
        prompt = f"""{self.system_prompt}

Context:
{context}

User Question: {question}

Assistant Answer:"""
        
        # Step 4: Generate answer
        print("Generating response...")
        answer = self.language_model.generate(
            prompt,
            max_tokens=400,
            temperature=0.7
        )
        
        # Calculate confidence based on search result similarities
        avg_similarity = np.mean([s['similarity'] for s in sources])
        
        return {
            "answer": answer,
            "sources": sources,
            "confidence": avg_similarity,
            "retrieved_passages": len(search_results)
        }
    
    def is_robotics_question(self, question: str) -> bool:
        """
        Check if question is VEX/robotics related
        Simple keyword matching (could be improved with classifier)
        """
        robotics_keywords = [
            'vex', 'robot', 'competition', 'tournament', 'programming',
            'autonomous', 'sensor', 'motor', 'build', 'design', 'scoring',
            'match', 'alliance', 'team', 'code', 'controller', 'brain'
        ]
        
        question_lower = question.lower()
        return any(keyword in question_lower for keyword in robotics_keywords)


# ==============================================================================
# Mobile Integration Functions
# ==============================================================================

# Global assistant instance (loaded once, reused)
_assistant_instance = None

def initialize_assistant():
    """
    Initialize the assistant (call once on app startup)
    Returns: Success boolean
    """
    global _assistant_instance
    try:
        _assistant_instance = VexAssistant()
        return True
    except Exception as e:
        print(f"Error initializing assistant: {e}")
        return False

def get_answer(question: str) -> str:
    """
    Get answer to question (called from React Native)
    
    Args:
        question: User's question string
        
    Returns:
        JSON string with answer and metadata
    """
    global _assistant_instance
    
    if _assistant_instance is None:
        return json.dumps({
            "error": "Assistant not initialized",
            "answer": "Please restart the app to initialize the AI assistant."
        })
    
    try:
        # Check if VEX-related
        if not _assistant_instance.is_robotics_question(question):
            return json.dumps({
                "answer": "I'm designed to help with VEX Robotics questions! Ask me about competitions, building, programming, rules, or strategies.",
                "sources": [],
                "confidence": 0.0
            })
        
        # Get answer using RAG
        result = _assistant_instance.ask(question)
        return json.dumps(result)
        
    except Exception as e:
        return json.dumps({
            "error": str(e),
            "answer": "I encountered an error processing your question. Please try again."
        })

def get_status() -> str:
    """
    Check if assistant is ready
    Returns: JSON string with status
    """
    global _assistant_instance
    
    if _assistant_instance is None:
        return json.dumps({
            "ready": False,
            "message": "Assistant not initialized"
        })
    
    return json.dumps({
        "ready": True,
        "knowledge_base_size": len(_assistant_instance.knowledge_base.passages),
        "model_loaded": True
    })


# ==============================================================================
# Command Line Interface (for testing)
# ==============================================================================

def main():
    """
    Test the assistant from command line
    """
    print("=" * 60)
    print("VEX Robotics AI Assistant (On-Device)")
    print("=" * 60)
    
    # Initialize
    assistant = VexAssistant()
    
    # Interactive loop
    print("\nReady! Ask me anything about VEX Robotics.")
    print("Type 'quit' to exit.\n")
    
    while True:
        question = input("You: ").strip()
        
        if question.lower() in ['quit', 'exit', 'q']:
            print("Goodbye!")
            break
        
        if not question:
            continue
        
        # Get answer
        result = assistant.ask(question)
        
        # Display answer
        print(f"\nAssistant: {result['answer']}")
        print(f"\nConfidence: {result['confidence']:.2f}")
        print(f"Sources used: {result['retrieved_passages']}")
        
        if result['sources']:
            print("\nBased on:")
            for source in result['sources']:
                print(f"  • {source['title']} (similarity: {source['similarity']:.2f})")
        
        print("\n" + "-" * 60 + "\n")

if __name__ == "__main__":
    main()