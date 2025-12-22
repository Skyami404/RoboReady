// vexAssistantService.ts
// Place this file in: utils/vexAssistantService.ts

export class VexAssistantService {
    private static readonly VEX_DOMAINS = [
      'vexrobotics.com',
      'robotevents.com',
      'vexforum.com',
      'kb.vex.com'
    ];
  
    // Check if question is related to robotics/VEX
    private static isRoboticsQuestion(question: string): boolean {
      const roboticsKeywords = [
        'vex', 'robot', 'competition', 'tournament', 'programming', 'autonomous',
        'driver', 'control', 'sensor', 'motor', 'gear', 'wheel', 'build',
        'design', 'engineering', 'notebook', 'judging', 'game', 'field',
        'skills', 'match', 'alliance', 'team', 'code', 'controller', 'brain',
        'cortex', 'iq', 'edr', 'v5', 'battery', 'port', 'wire', 'metal',
        'parts', 'mechanum', 'omni', 'traction', 'pneumatic', 'lift', 'intake',
        'scoring', 'strategy', 'scouting', 'mechanic', 'electronics', 'clawbot',
        'drivetrain', 'subsystem', 'chassis', 'sprocket', 'chain', 'screw'
      ];
  
      const lowerQuestion = question.toLowerCase();
      return roboticsKeywords.some(keyword => lowerQuestion.includes(keyword));
    }
  
    // Scrape VEX website for relevant information
    private static async scrapeVexInfo(query: string): Promise<string> {
      try {
        // Construct search URL for VEX Robotics
        const searchUrl = `https://www.vexrobotics.com/search?q=${encodeURIComponent(query)}`;
        
        // Note: Direct web scraping may be blocked by CORS in React Native
        // Consider using a backend proxy or API for production
        const response = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; VEXAssistant/1.0)',
            'Accept': 'text/html,application/xhtml+xml',
          }
        }).catch(() => null);
  
        if (response && response.ok) {
          const html = await response.text();
          return this.extractRelevantInfo(html);
        }
  
        // If scraping fails, return empty string (AI will work without context)
        return '';
      } catch (error) {
        console.error('Error scraping VEX info:', error);
        return '';
      }
    }
  
    private static extractRelevantInfo(html: string): string {
      try {
        // Extract text content from HTML
        // Remove scripts, styles, and extract meaningful content
        let textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
  
        // Return first 1000 characters as context
        return textContent.substring(0, 1000);
      } catch (error) {
        console.error('Error extracting info:', error);
        return '';
      }
    }
  
    // Generate AI response using Claude API
    private static async generateResponse(question: string, context: string): Promise<string> {
      try {
        const systemPrompt = `You are a helpful VEX Robotics assistant. You provide accurate, concise information about VEX Robotics competitions, robot building, programming, and rules.
  
  You have access to information from the official VEX Robotics website and related resources. Answer questions clearly and helpfully, focusing on:
  - Competition rules and formats (VEX IQ, V5, VEX U)
  - Robot design and building techniques
  - Programming and autonomous routines (VEXcode, PROS, RobotC)
  - Tournament preparation and strategies
  - Game strategies and scoring methods
  - Parts, components, and sensors
  - Engineering notebook best practices
  - Team organization and judging
  
  Keep responses conversational, informative, and under 250 words unless more detail is specifically requested.
  
  If the question is not related to robotics or VEX, politely decline and explain that you only answer VEX Robotics questions.`;
  
        const userPrompt = context 
          ? `Context from VEX website: ${context}\n\nQuestion: ${question}`
          : `Question: ${question}`;
  
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: systemPrompt,
            messages: [
              { role: "user", content: userPrompt }
            ],
          })
        });
  
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
  
        const data = await response.json();
        
        if (data.content && data.content[0] && data.content[0].text) {
          return data.content[0].text;
        }
  
        throw new Error('Invalid response format');
      } catch (error) {
        console.error('Error generating response:', error);
        throw error;
      }
    }
  
    // Main method to get response
    static async getResponse(question: string): Promise<string> {
      // Check if question is robotics-related
      if (!this.isRoboticsQuestion(question)) {
        return "I apologize, but I'm specifically designed to answer questions about VEX Robotics. I can help with topics like:\n\n• Robot building and design\n• Competition rules and formats\n• Programming (VEXcode, PROS, RobotC)\n• Tournament preparation\n• Game strategies\n• Engineering notebooks\n• Parts and sensors\n\nPlease ask me a VEX Robotics-related question!";
      }
  
      try {
        // Try to scrape relevant information from VEX website
        const context = await this.scrapeVexInfo(question);
        
        // Generate AI response with context
        const response = await this.generateResponse(question, context);
        
        return response;
      } catch (error) {
        console.error('Error in getResponse:', error);
        
        // Fallback to knowledge-based response
        return this.getFallbackResponse(question);
      }
    }
  
    // Fallback response when API is unavailable
    private static getFallbackResponse(question: string): string {
      const lowerQuestion = question.toLowerCase();
      
      // Pattern matching for common questions
      if (lowerQuestion.includes('rule') || lowerQuestion.includes('legal')) {
        return "For official VEX competition rules, please visit the Game Manual at www.vexrobotics.com or check RobotEvents.com for the current season's game manual. Rules can vary by game and season, so always refer to the official documentation.";
      }
      
      if (lowerQuestion.includes('notebook') || lowerQuestion.includes('engineering')) {
        return "An Engineering Notebook should document your design process, including brainstorming, testing, iterations, and competition reflections. Include sketches, photos, and detailed explanations of your decisions. The notebook is crucial for judging and helps teams win awards!";
      }
      
      if (lowerQuestion.includes('program') || lowerQuestion.includes('code') || lowerQuestion.includes('autonomous')) {
        return "VEX robots can be programmed using VEXcode (blocks or text), PROS, or RobotC. For autonomous routines, focus on sensor integration, consistent starting positions, and thorough testing. Practice your autonomous runs extensively before competitions!";
      }
      
      if (lowerQuestion.includes('tournament') || lowerQuestion.includes('competition')) {
        return "Tournament preparation includes: checking robot size constraints, testing all systems, charging batteries, updating firmware, practicing driver skills, and preparing your pit area. Arrive early, be courteous to other teams, and have fun!";
      }
      
      // Generic fallback
      return "I'm having trouble accessing detailed information right now. For official VEX Robotics information, please visit:\n\n• vexrobotics.com - Official website and store\n• robotevents.com - Competition schedules and results\n• vexforum.com - Community discussions\n• kb.vex.com - Knowledge base and support\n\nPlease try rephrasing your question or check these resources directly!";
    }
  
    // Get suggested questions for new users
    static getSuggestedQuestions(): string[] {
      return [
        "What are the current VEX competition game rules?",
        "How do I prepare for my first tournament?",
        "What's the difference between VEX IQ and V5?",
        "How do I program autonomous routines?",
        "What should I include in my engineering notebook?",
        "What are the best robot design strategies?",
        "How does tournament seeding work?",
        "What sensors are available for VEX robots?",
        "How do I build a strong drivetrain?",
        "What are common robot design mistakes?"
      ];
    }
  }