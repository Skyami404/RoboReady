// vexAssistantService.ts
// React Native service for On-Device AI Assistant
// This version runs entirely inside the mobile app using a lightweight
// JavaScript retrieval engine.  A Python/Flask backend is still available
// as a fallback for development, but the normal workflow no longer requires
// starting a separate server.

import localAssistant from './vexAssistantLocal';

export class VexAssistantService {
  private static initializationPromise: Promise<boolean> | null = null;
  private static isInitialized = false;

  // Initialize the on‑device engine (no network calls required)
  static async initialize(): Promise<boolean> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.isInitialized) {
      return true;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private static async performInitialization(): Promise<boolean> {
    try {
      // in-process engine is ready immediately; future work such as model
      // warm‑up could go here
      console.log('Initializing local VEX Assistant engine...');
      this.isInitialized = true;
      return true;
    } catch (err) {
      console.error('Local initialization error:', err);
      return false;
    }
  }
  
  // Local engine is always considered ready once initialized
  static async checkStatus(): Promise<{ ready: boolean; message?: string; knowledge_base_size?: number }> {
    if (this.isInitialized) {
      // report the size of the built-in knowledge base
      try {
        const kb: any = localAssistant as any;
        const size = Array.isArray(kb.passages) ? kb.passages.length : undefined;
        return { ready: true, knowledge_base_size: size } as any;
      } catch {
        return { ready: true };
      }
    }
    return { ready: false, message: 'Not initialized' };
  }

  // Main method to get a response from the local AI engine
  static async getResponse(question: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!question || question.trim().length === 0) {
        return "Please ask a question!";
      }

      // directly query the local assistant
      const answer = localAssistant.answer(question.trim());
      return answer;
    } catch (error: any) {
      console.error('Error getting response (local engine):', error);
      return "❌ Error processing your question. Please try again.";
    }
  }

  // Get suggested questions
  static getSuggestedQuestions(): string[] {
    return [
      "How does tournament structure work?",
      "How do I score points in Push Back (2025-2026)?",
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
           "The on-device AI is built into the app and will provide more detailed answers once it finishes initializing!";
  }
}

// Export for use in VexAssistantScreen
export default VexAssistantService;