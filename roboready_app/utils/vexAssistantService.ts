// vexAssistantService.ts
// React Native service for On-Device AI Assistant (Python Flask)

export class VexAssistantService {
  // PYTHON FLASK API - On-Device AI
  private static readonly API_URL = 'http://127.0.0.1:5000';
  private static initializationPromise: Promise<boolean> | null = null;
  private static isInitialized = false;
  
  // Initialize the AI (call once on app startup)
  static async initialize(): Promise<boolean> {
    // Return existing initialization promise if already in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    // If already initialized, return true
    if (this.isInitialized) {
      return true;
    }
    
    // Create new initialization promise
    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }
  
  private static async performInitialization(): Promise<boolean> {
    try {
      // Check if service is already running
      const status = await this.checkStatus();
      if (status.ready) {
        console.log('VEX Assistant already initialized');
        this.isInitialized = true;
        return true;
      }
      
      console.log('Initializing VEX Assistant...');
      
      const response = await fetch(`${this.API_URL}/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000 // 2 minute timeout
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('VEX Assistant initialized successfully');
        this.isInitialized = true;
        return true;
      } else {
        console.error('Initialization failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Initialization error:', error);
      return false;
    }
  }
  
  // Check if AI is initialized and ready
  static async checkStatus(): Promise<{ ready: boolean; message?: string; knowledge_base_size?: number }> {
    try {
      const response = await fetch(`${this.API_URL}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      if (!response.ok) {
        return { 
          ready: false, 
          message: 'AI service not responding' 
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Status check failed:', error);
      return { 
        ready: false, 
        message: 'AI service not available' 
      };
    }
  }

  // Main method to get response from on-device AI
  static async getResponse(question: string): Promise<string> {
    try {
      // Ensure service is initialized
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          return "❌ Cannot connect to AI service.\n\n" +
                 "Make sure the Python Flask server is running:\n\n" +
                 "1. Open Terminal\n" +
                 "2. cd roboready_app/python_ai\n" +
                 "3. source ../../venv/bin/activate\n" +
                 "4. python flask_server.py\n\n" +
                 "Then try asking again!";
        }
      }
      
      // First check if service is ready
      const status = await this.checkStatus();
      if (!status.ready) {
        return "🔄 AI is still loading...\n\nFirst launch takes 30-60 seconds to initialize the models.\n\nPlease wait a moment and try again!";
      }

      // Validate question
      if (!question || question.trim().length === 0) {
        return "Please ask a question!";
      }

      // Send question to Python backend
      const response = await fetch(`${this.API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
        timeout: 30000 // 30 second timeout for response
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Flask API Error:', response.status, errorText);
        
        if (response.status === 503) {
          return "🔄 AI is still initializing...\n\nPlease wait 30-60 seconds and try again!";
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Format response with sources
      let responseText = data.answer || "No answer generated";
      
      if (data.sources && data.sources.length > 0) {
        responseText += "\n\n📚 Based on:\n";
        data.sources.forEach((source: any) => {
          const title = source.title || 'Unknown source';
          responseText += `• ${title}\n`;
        });
      }

      if (data.confidence !== undefined) {
        const confidencePercent = Math.round(data.confidence * 100);
        responseText += `\n✨ Confidence: ${confidencePercent}%`;
      }

      return responseText;
      
    } catch (error: any) {
      console.error('Error getting response:', error);
      
      // Provide helpful error messages
      const errorMsg = error.message || error.toString();
      
      if (errorMsg.includes('Network request failed') || 
          errorMsg.includes('fetch') ||
          errorMsg.includes('connection refused') ||
          errorMsg.includes('ECONNREFUSED')) {
        return "❌ Cannot connect to AI service.\n\n" +
               "Make sure the Python Flask server is running:\n\n" +
               "1. Open Terminal\n" +
               "2. cd roboready_app/python_ai\n" +
               "3. source ../../venv/bin/activate\n" +
               "4. python flask_server.py\n\n" +
               "Then try asking again!";
      }
      
      if (errorMsg.includes('timeout')) {
        return "⏱️ Request timed out. The AI server might be overloaded.\n\n" +
               "Please try again in a moment!";
      }

      return "❌ Error: " + errorMsg + "\n\n" +
             "Please make sure Flask server is running and try again.";
    }
  }

  // Get suggested questions
  static getSuggestedQuestions(): string[] {
    return [
      "How does tournament structure work?",
      "How do I score points in High Stakes?",
      "What are the current VEX game rules?",
      "How do I program autonomous routines?",
      "What should be in my engineering notebook?",
      "How do I build a strong drivetrain?",
      "What sensors are available for VEX robots?",
      "How does alliance selection work?"
    ];
  }

  // Fallback responses when AI is unavailable
  static getFallbackResponse(question: string): string {
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('tournament') && lowerQ.includes('structure')) {
      return "🏆 VEX Tournament Structure:\n\n" +
             "• Qualification Matches: 4-6 matches with random alliances\n" +
             "• Ranking: Based on Win Points, AWP, and SOS\n" +
             "• Alliance Selection: Top teams choose partners\n" +
             "• Eliminations: Best-of-3 bracket format\n\n" +
             "Check robotevents.com for specific tournament details!";
    }

    if (lowerQ.includes('score') || lowerQ.includes('point')) {
      return "📊 Scoring varies by game:\n\n" +
             "High Stakes (V5):\n" +
             "• Rings on goals: 3-5 points\n" +
             "• Alliance stake: 6 points\n" +
             "• Autonomous bonus available\n\n" +
             "Visit vexrobotics.com for the current game manual!";
    }

    return "For detailed VEX information, visit:\n\n" +
           "• vexrobotics.com - Official site\n" +
           "• robotevents.com - Competitions\n" +
           "• kb.vex.com - Knowledge base\n" +
           "• vexforum.com - Community\n\n" +
           "The on-device AI will provide more detailed answers once the Flask server is running!";
  }
}

// Export for use in VexAssistantScreen
export default VexAssistantService;