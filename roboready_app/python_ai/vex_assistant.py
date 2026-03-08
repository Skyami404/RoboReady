# vex_assistant.py
# On-Device AI Assistant for VEX Robotics
# Runs entirely on mobile device - no internet required

import os
import json
import sys
import re
import numpy as np
from typing import List, Dict, Tuple
from pathlib import Path

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("Error: sentence-transformers not installed. Run: pip install -r requirements.txt")
    sys.exit(1)

try:
    import faiss
except ImportError:
    print("Error: faiss-cpu not installed. Run: pip install -r requirements.txt")
    sys.exit(1)

try:
    from llama_cpp import Llama
except ImportError:
    print("Error: llama-cpp-python not installed. Run: pip install -r requirements.txt")
    sys.exit(1)

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
        # Get absolute path relative to this script
        script_dir = Path(__file__).parent.absolute()
        self.models_dir = script_dir / "models"
        self.embeddings_dir = self.models_dir / "embeddings"
        
        print(f"Initializing knowledge base from: {self.embeddings_dir}")
        
        print("Loading embedding model...")
        try:
            # MiniLM: Small, fast embedding model (120MB)
            # Converts text to 384-dimensional vectors
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Error loading embedding model: {e}")
            raise
        
        # FAISS: Facebook AI Similarity Search
        # Ultra-fast vector search library
        self.index_path = self.embeddings_dir / "vex_knowledge.index"
        self.passages_path = self.embeddings_dir / "vex_passages.json"
        
        self.passages = []
        self.index = None
        
        if self.index_path.exists() and self.passages_path.exists():
            try:
                print("Loading existing knowledge base...")
                self.index = faiss.read_index(str(self.index_path))
                with open(self.passages_path, 'r') as f:
                    self.passages = json.load(f)
                print(f"✓ Loaded {len(self.passages)} passages from knowledge base")
            except Exception as e:
                print(f"Error loading knowledge base: {e}")
                print("Will rebuild from scratch...")
                self.build_knowledge_base()
        else:
            print("Knowledge base files not found. Building from scratch...")
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
        
        # VEX Robotics knowledge base
        vex_knowledge = [
            {
                "title": "Tournament Structure",
                "content": "VEX tournaments follow this structure: Qualification matches where teams compete in 4-6 matches with randomly assigned alliance partners. Teams are ranked by Win Points (2 per win, 1 per tie), Autonomous Win Points (AWP), and Strength of Schedule (SOS). Top teams then select alliance partners for elimination rounds consisting of quarterfinals, semifinals, and finals played in best-of-3 format.",
                "tags": ["tournament", "structure"]
            },
            {
                "title": "High Stakes Scoring",
                "content": "High Stakes scoring: Rings on mobile goals are worth different point values depending on goal height (lower, middle, upper). Rings on wall stakes follow the same relative point values. Alliance stake rings can have higher values. Autonomous bonuses award extra points for scoring during the autonomous period. Robot elevation at match end can provide bonus points. Check the current game manual for exact, up-to-date scoring values.",
                "tags": ["high stakes", "2024", "rings", "scoring"]
            },
            {
                "title": "Autonomous Programming",
                "content": "VEX autonomous programming uses sensors for accuracy. The Inertial Sensor provides gyroscope functionality for precise turns and positioning. Vision Sensors detect colored objects like goals and game pieces. Distance Sensors measure range to objects. Optical Sensors enable line tracking and color detection. GPS Sensors (V5 only) provide field positioning. Best practices include starting simple, testing from multiple positions, using consistent units, adding timeout failsafes, and keeping code modular.",
                "tags": ["autonomous", "programming", "sensors"]
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
            },
            {
                "title": "VEX IQ Competition",
                "content": "VEX IQ is designed for elementary and middle school students. Teams build robots with VEX IQ components and compete in game-based competitions. The VEX IQ Robotics Competition features 8-robot alliances and uses a modular scoring system. Key differences from V5: larger, simpler parts, intuitive building system, block-based programming, and age-appropriate complexity."
            },
            {
                "title": "Driver Skills Practice",
                "content": "Driver Skills are the manual control portion of competition. Best practices: practice field awareness by knowing where alliance members are, develop smooth controller inputs for precise movements, practice picking up and scoring game pieces under pressure, learn optimal routes across the field, communicate with your team, and practice consistently to build muscle memory."
            },
            {
                "title": "Gear Ratios and Speed",
                "content": "VEX motor gear ratios affect robot speed and torque. Common ratios: 1:1 (600 RPM, high speed), 3:5 (360 RPM), 1:2 (300 RPM), 1:3 (200 RPM), or lower for high torque. Speed ratio = output RPM / motor RPM. Torque increases as RPM decreases. Choose based on game requirements: fast drivetrains use 1:1 to 3:5, shooters need high torque with lower ratios."
            },
            {
                "title": "Common Robot Failures",
                "content": "Avoid these common failures: weak drivetrain that stalls under load, poor wheel traction causing slipping, inefficient intake design, overengineering subsystems making them slow or heavy, poor cable management causing disconnections, insufficient bracing causing deformation, not testing under game conditions, and forgetting to check weight and size limits."
            },
            {
                "title": "VEX Robotics Rules Compliance",
                "content": "All VEX robots must comply with official rules including size constraints (not exceeding maximum dimensions), weight limits (typically 12-16 lbs depending on competition), legal parts (only official VEX components), controlled autonomous mode (no human control), and match conduct rules. Violations result in disqualification. Always check the current game manual for specific rules.",
                "tags": ["rules", "compliance"]
            },
            {
                "title": "Push Back Game Overview",
                "content": "Push Back is the 2025-2026 VEX V5 Robotics Competition game. Two alliances (red and blue), each with two teams and one robot per team, compete on a 12ft x 12ft field. The objective is to score points by placing blocks (18-sided hollow plastic objects) into goals and parking robots. The game emphasizes dynamic, offensive gameplay where teams actively manipulate blocks to control goals around the field. 88 total blocks (44 blue, 44 red) are used.",
                "tags": ["push back", "2025", "2026", "game"]
            },
            {
                "title": "Push Back Field Layout",
                "content": "The Push Back field is 12ft x 12ft foam tiles divided by an autonomous line. Key elements: 2 Long Goals (48.8 inches), 2 Center Goals (Upper/Lower, 22.6 inches each), 4 Loaders (2 per alliance, 21.34 inches tall, start with 6 blocks each), 2 Park Zones (18.87\" x 16.86\" each). Loaders are attached to field perimeter adjacent to alliance stations. All goals have defined control zones marked by white tape lines."
            },
            {
                "title": "Push Back Autonomous Scoring",
                "content": "Push Back autonomous period is 15 seconds. Teams score: Each block in goal = 3 points, Long goal control zone = 10 points, Center goal upper control = 8 points, Center goal lower control = 6 points, Autonomous bonus = 10 points (to highest-scoring alliance). Autonomous Win Point awarded for: at least 7 blocks scored, at least 3 different goals contain blocks, at least 3 blocks removed from loaders, neither robot in park zone."
            },
            {
                "title": "Push Back Driver Control Scoring",
                "content": "Push Back driver control period is 1:45 (105 seconds). Teams continue scoring: Each block in goal = 3 points, Long goal control = 10 points, Center goal upper = 8 points, Center goal lower = 6 points, 1 parked robot = 8 points, 2 parked robots = 30 points. Blocks are scored when in contact with inside surfaces of goal plastic, not touching same-color robot, and not touching floor. Control zone controlled by majority block color."
            },
            {
                "title": "Push Back Goal Control Strategy",
                "content": "Push Back emphasizes controlling goals through block placement. A control zone is controlled when majority of scored blocks in that zone are the same alliance color. For long goals, blocks must be fully within tape lines. For center goals, entire goal is control zone. Teams score both for individual blocks (3 pts each) and for controlling entire zones (8-10 pts). Strategic block placement in multiple goals is key to high scores."
            },
            {
                "title": "Push Back Robot Mechanics",
                "content": "Push Back robots must fit within 18x18x18 inches at start, can expand to max 22x22 inches horizontally and 22 inches tall. Robots can carry/push unlimited blocks but must maintain size limits. Design focuses on block manipulation (pushing or lifting), mobility for field navigation, and parking mechanisms. Robots start with one preload block (must contact robot of same color). No requirements for specific mechanism types - pushing or lifting both viable."
            },
            {
                "title": "Push Back Offensive vs Defensive Play",
                "content": "Push Back emphasizes offensive play where teams actively score blocks. Defensive strategies are allowed but limited: Holding a robot for more than 3-count = violation. Goalkeeping (reaching into goal without moving blocks) not permitted during driver control. Purely destructive strategies prohibited. Dynamic, back-and-forth gameplay encouraged. Teams must provide open lanes for scoring. Offensive teams receive benefit of doubt in judgment calls."
            },
            {
                "title": "Push Back Match Loads and Loaders",
                "content": "Push Back has 24 match load blocks (12 per alliance) loaded through loaders during driver control. Drive team members can add one block at a time to loaders. Can only load if fewer than 5 blocks in loader's orange section. Blocks bounce out through bottom of loader during match load = not a violation. Robots remove blocks from loaders through bottom opening. Each alliance has 2 loaders adjacent to their alliance station."
            }
        ]
        
        # Create passages list with metadata.  Generate tags automatically based on
        # title/content keywords so we can boost correct manual/year later.
        self.passages = []
        for item in vex_knowledge:
            tags = item.get("tags", [])[:]  # copy existing tags if provided
            text_lower = (item["title"] + " " + item["content"]).lower()
            if "push back" in text_lower:
                tags.extend(["push back", "2025", "2026"])
            if "high stakes" in text_lower:
                tags.extend(["high stakes", "2024"])
            if "scoring" in item["title"].lower() or "scoring" in item["content"].lower():
                tags.append("scoring")
            if "rules" in item["title"].lower() or "rules" in item["content"].lower():
                tags.append("rules")
            # remove duplicates
            tags = list(dict.fromkeys(tags))
            self.passages.append({
                "title": item["title"],
                "content": item["content"],
                "source": "VEX Official Documentation",
                "tags": tags
            })
        
        print(f"Generating embeddings for {len(self.passages)} passages...")
        try:
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
            self.embeddings_dir.mkdir(parents=True, exist_ok=True)
            faiss.write_index(self.index, str(self.index_path))
            with open(self.passages_path, 'w') as f:
                json.dump(self.passages, f, indent=2)
            
            print(f"✓ Knowledge base built with {len(self.passages)} passages!")
        except Exception as e:
            print(f"Error building knowledge base: {e}")
            raise
    
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
            min(top_k * 3, len(self.passages))  # overfetch so we can re‑rank by tags
        )
        
        # Basic year/game detection for boosting
        qlower = query.lower()
        # look for explicit years like 2024, 2025, 2026
        years = re.findall(r"20\d{2}", qlower)
        game_keywords = []
        if 'push back' in qlower:
            game_keywords.append('push back')
        if 'high stakes' in qlower:
            game_keywords.append('high stakes')

        # Retrieve passages and adjust scores
        scored = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx < len(self.passages):
                result = self.passages[idx].copy()
                # base similarity from distance
                score = 1.0 / (1.0 + distance)
                # boost if tags match
                tags = result.get('tags', []) or []
                for tag in tags:
                    if tag.lower() in qlower:
                        score += 0.25  # small boost
                    for y in years:
                        if y in tag:
                            score += 0.5
                for g in game_keywords:
                    if g in tags:
                        score += 0.75
                result['similarity_score'] = score
                scored.append(result)
        # sort by boosted score and return top_k
        scored.sort(key=lambda x: x['similarity_score'], reverse=True)
        return scored[:top_k]


class VexLanguageModel:
    """
    Small language model for generating responses
    Runs entirely on-device using llama.cpp
    """
    
    def __init__(self, model_path: str = None):
        """
        Initialize language model
        
        Uses Phi-3-mini:
        - 3.8 billion parameters
        - 4-bit quantization (2.3GB)
        - Optimized for instruction following
        - Fast inference on mobile
        """
        if model_path is None:
            script_dir = Path(__file__).parent.absolute()
            model_path = script_dir / "models" / "phi-3-mini-4k-instruct-q4.gguf"
        
        model_path = Path(model_path)
        
        print(f"Loading language model from {model_path}...")
        
        if not model_path.exists():
            raise FileNotFoundError(
                f"Model not found at {model_path}\n"
                "Download from: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf"
            )
        
        try:
            # Initialize Llama.cpp model
            # n_ctx: context window size (4096 tokens)
            # n_threads: CPU threads to use
            # n_gpu_layers: offload to GPU if available
            self.model = Llama(
                model_path=str(model_path),
                n_ctx=4096,  # Context window
                n_threads=4,  # CPU threads
                n_gpu_layers=0,  # Set to 35 if GPU available
                verbose=False
            )
            
            print("✓ Model loaded successfully!")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    
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
            stop=["</s>", "\nQuestion:", "\n\nQuestion:"]  # Stop at end or new question
        )

        # Log raw output for debugging
        try:
            print(f"LLM raw output: {output}")
        except Exception:
            pass

        # Extract text from output robustly
        try:
            response = output['choices'][0].get('text', '')
            if response is None:
                response = ''
            response = response.strip()
        except Exception:
            # Fallback: try other keys
            try:
                response = output.get('text', '')
                if response is None:
                    response = ''
                response = str(response).strip()
            except Exception:
                response = ''

        # If the model returned an empty string, return a helpful fallback message
        if not response:
            print("Warning: LLM returned empty response")
            response = "I don't have a complete answer right now — please try rephrasing your question or ask for a specific topic."

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
        
        try:
            # Load components
            self.knowledge_base = VexKnowledgeBase()
            self.language_model = VexLanguageModel()
            
            # System prompt for the model
            self.system_prompt = """You are a knowledgeable VEX Robotics expert. Answer questions concisely and directly using only the provided context.

Style:
- Be conversational and natural
- Answer only what was asked—do not add extra information or elaborate unnecessarily
- Use short, clear sentences
- If step-by-step instructions are needed, use brief bullets
- Never ask follow-up questions or suggest related topics unless requested

Rules:
- Use only the provided context (VEX knowledge base). Do not invent facts.
- Keep responses under 150 words
- If you don't have enough information, say so briefly
- Never include labels, metadata, or formatting tags in responses"""
            
            print("✓ VEX Assistant ready!")
        except Exception as e:
            print(f"Error initializing assistant: {e}")
            raise
    
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
        try:
            print(f"\nQuestion: {question}")
            
            # Step 1: Retrieve relevant context
            print("Searching knowledge base...")
            search_results = self.knowledge_base.search(question, top_k=3)
            
            if not search_results:
                return {
                    "answer": "I don't have enough information to answer that question. Please ask about VEX Robotics topics like competitions, building, or programming.",
                    "sources": []
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

Question: {question}
Answer:"""
            
            # Step 4: Generate answer
            print("Generating response...")
            answer = self.language_model.generate(
                prompt,
                max_tokens=300,
                temperature=0.1
            )
            
            # Clean up answer - remove any included question or labels
            answer = answer.strip()

            # Remove any assistant role tokens like "<|assistant|>" at start
            answer = re.sub(r'^<\|[^>]+\|>\s*', '', answer)

            # Remove leading single-word labels like "support:" or "assistant:"
            answer = re.sub(r'^[A-Za-z]{1,20}:\s*', '', answer)
            
            # Remove only strong label patterns that shouldn't be in the answer
            if answer.startswith("User Question:"):
                answer = answer.replace("User Question:", "", 1).strip()
            if answer.startswith("Assistant Answer:"):
                answer = answer.replace("Assistant Answer:", "", 1).strip()
            if "\nUser Question:" in answer:
                answer = answer.split("\nUser Question:")[0].strip()
            if "\nAssistant Answer:" in answer:
                answer = answer.split("\nAssistant Answer:")[0].strip()
            
            # Return answer and sources
            return {
                "answer": answer,
                "sources": sources,
                "retrieved_passages": len(search_results)
            }
        except Exception as e:
            print(f"Error in ask(): {e}")
            return {
                "answer": "I encountered an error processing your question. Please try again.",
                "sources": [],
                "error": str(e)
            }
    
    def is_robotics_question(self, question: str) -> bool:
        """
        Check if question is VEX/robotics related
        Simple keyword matching (could be improved with classifier)
        """
        robotics_keywords = [
            'vex', 'robot', 'competition', 'tournament', 'programming',
            'autonomous', 'sensor', 'motor', 'build', 'design', 'scoring',
            'match', 'alliance', 'team', 'code', 'controller', 'brain',
            'game', 'push back', 'high stakes', 'rules', '2024', '2025', '2026'
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
                "sources": []
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
        print(f"Sources used: {result.get('retrieved_passages', 0)}")
        
        if result['sources']:
            print("\nBased on:")
            for source in result['sources']:
                print(f"  • {source['title']} (similarity: {source['similarity']:.2f})")
        
        print("\n" + "-" * 60 + "\n")

if __name__ == "__main__":
    main()