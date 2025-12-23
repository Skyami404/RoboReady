// vexAssistantService.ts
// Place this file in: utils/vexAssistantService.ts

export class VexAssistantService {
  // Main method to get response - uses Claude API with web search like ChatGPT
  static async getResponse(question: string): Promise<string> {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: `You are a VEX Robotics expert assistant. You have access to web search to find current information from official VEX sources.

CRITICAL INSTRUCTIONS:
- You can answer ANY question about VEX Robotics, competitions, robot building, programming, rules, tournaments, scoring, parts, strategies, etc.
- Use web search to find current information from vexrobotics.com, robotevents.com, kb.vex.com, and vexforum.com
- Be conversational, detailed, and helpful
- If asked about tournament structure, explain how tournaments work (qualification matches, rankings, alliance selection, eliminations)
- If asked about scoring, explain how points are earned in the current games
- If asked about rules, search for and cite the official game manuals
- ONLY decline questions that are clearly not about VEX Robotics or robotics in general (like questions about cooking, weather, celebrities, etc.)
- For any robotics-related question, provide a helpful answer using web search if needed`,
          messages: [
            { 
              role: "user", 
              content: question 
            }
          ],
          tools: [
            {
              "type": "web_search_20250305",
              "name": "web_search"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      
      // Handle multiple content blocks (text + tool results)
      if (data.content && Array.isArray(data.content)) {
        const textBlocks = data.content
          .filter((block: any) => block.type === "text")
          .map((block: any) => block.text);
        
        if (textBlocks.length > 0) {
          return textBlocks.join("\n\n");
        }
      }

      throw new Error('No text content in response');
      
    } catch (error: any) {
      console.error('Error in getResponse:', error);
      
      // Return error message to user
      return `I'm having trouble connecting right now. This could be due to:\n\n• Network connectivity issues\n• API configuration needed\n• Service temporarily unavailable\n\nPlease try again in a moment. In the meantime, you can find VEX Robotics information at:\n\n• vexrobotics.com - Official site and game manuals\n• robotevents.com - Competition info\n• kb.vex.com - Knowledge base\n• vexforum.com - Community discussions\n\nError details: ${error.message}`;
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
}