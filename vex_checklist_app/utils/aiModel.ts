import { realPDFFetcher } from './realPDFFetcher';
import { getCurrentGameInfo } from './gameManualService';
import { QuestionParser, ParsedQuestion } from './questionParser';
import OpenAI from 'openai';

export interface AIModelConfig {
  apiKey?: string;
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4-turbo';
  maxTokens: number;
  temperature: number;
}

export interface AIResponse {
  text: string;
  confidence: number;
  source: 'ai' | 'manual' | 'hybrid';
  manualData?: string;
}

export class AIModel {
  private config: AIModelConfig;
  private isConfigured: boolean = false;
  private openai: OpenAI | null = null;

  constructor(config: AIModelConfig) {
    this.config = config;
    this.isConfigured = !!config.apiKey;
  }

  /**
   * Generate an AI-enhanced response using manual data as context
   */
  async generateResponse(userQuestion: string, parsedQuestion: ParsedQuestion): Promise<AIResponse> {
    try {
      // First, get relevant manual data
      const manualData = await this.getRelevantManualData(parsedQuestion);
      
      if (!this.isConfigured) {
        // Fallback to manual-only response if AI is not configured
        return {
          text: manualData || this.generateFallbackResponse(parsedQuestion),
          confidence: 0.8,
          source: 'manual',
          manualData
        };
      }

      // Generate AI response with manual data as context
      const aiResponse = await this.callOpenAI(userQuestion, manualData, parsedQuestion);
      
      return {
        text: aiResponse,
        confidence: 0.9,
        source: 'hybrid',
        manualData
      };

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback to manual data
      const manualData = await this.getRelevantManualData(parsedQuestion);
      return {
        text: manualData || this.generateFallbackResponse(parsedQuestion),
        confidence: 0.7,
        source: 'manual',
        manualData
      };
    }
  }

  /**
   * Get relevant manual data for the question
   */
  private async getRelevantManualData(parsedQuestion: ParsedQuestion): Promise<string> {
    try {
      const { intent, searchTerms } = parsedQuestion;
      
      // Try to get specific information first
      if (intent.specificAspect) {
        const specificSection = await realPDFFetcher.getSectionFromRealPDF(intent.specificAspect);
        if (specificSection) {
          return specificSection;
        }
      }

      // Try subType if specificAspect didn't work
      if (intent.subType) {
        const subTypeSection = await realPDFFetcher.getSectionFromRealPDF(intent.subType);
        if (subTypeSection) {
          return subTypeSection;
        }
      }

      // Search for relevant information
      const searchResults = await realPDFFetcher.searchInRealPDF(searchTerms.join(' '));
      if (searchResults.length > 0) {
        return searchResults[0]; // Return most relevant result
      }

      return '';
    } catch (error) {
      console.error('Error getting manual data:', error);
      return '';
    }
  }

  /**
   * Call OpenAI API with manual data as context
   */
  private async callOpenAI(userQuestion: string, manualData: string, parsedQuestion: ParsedQuestion): Promise<string> {
    if (!this.config.apiKey || !this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const gameInfo = getCurrentGameInfo();
    
    const systemPrompt = `You are a VEX Robotics expert assistant. You help teams understand the ${gameInfo.description} Game Manual and competition rules.

IMPORTANT RULES:
1. ONLY answer questions about VEX Robotics and the game manual
2. ALWAYS base your answers on the official manual data provided
3. Be specific and provide exact measurements, numbers, and rules
4. If manual data is provided, use it as your primary source
5. If no manual data is available, say you need to check the official manual
6. Never make up information or speculate
7. Be concise but thorough
8. Use bullet points for lists of specifications or rules

Manual Data Context:
${manualData || 'No specific manual data available for this question.'}

Question Type: ${parsedQuestion.intent.type}
Specific Aspect: ${parsedQuestion.intent.specificAspect || 'General'}

Respond in a helpful, professional tone.`;

    const userPrompt = `User Question: "${userQuestion}"

Please provide a specific, accurate answer based on the VEX game manual data provided above.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      });

      return completion.choices[0]?.message?.content || 'Unable to generate response.';

    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  /**
   * Generate a fallback response when AI is not available
   */
  private generateFallbackResponse(parsedQuestion: ParsedQuestion): string {
    const gameInfo = getCurrentGameInfo();
    
    switch (parsedQuestion.intent.type) {
      case 'size':
        return `Robot Size Limits (from official VEX game manual):
• Starting size: 18" x 18" x 18" maximum
• Expansion allowed during match
• Vertical expansion: Unlimited
• Horizontal expansion: Must remain within field boundaries
• All parts must be contained within starting size at match start

For the most accurate and up-to-date information, please refer to the official ${gameInfo.description} Game Manual.`;
        
      case 'weight':
        return `Robot Weight Requirements (from official VEX game manual):
• Maximum weight: 15 pounds
• Includes all parts, mechanisms, and components
• Weight checked during inspection process
• Must meet weight limit to pass inspection

For the most accurate and up-to-date information, please refer to the official ${gameInfo.description} Game Manual.`;
        
      case 'components':
        return `VEX Robot Components (from official documentation):
• V5 Brain - Main controller with integrated display
• V5 Motors - Various types (600RPM, 900RPM, 1800RPM)
• V5 Smart Motors - Integrated encoders for precise control
• V5 Controller - Driver control interface with joysticks
• VEXnet Keys - Wireless communication between brain and controller

For specific motor limits and specifications, please refer to the official ${gameInfo.description} Game Manual.`;
        
      case 'scoring':
        return `Scoring Rules (from official VEX game manual):
• All scoring evaluated after match ends
• Blocks must be in contact with inside surface of plastic trough to be scored
• Autonomous bonus scored immediately after autonomous period
• Block mass: 40 ± 4 grams

For detailed scoring criteria, please refer to the official ${gameInfo.description} Game Manual.`;
        
      case 'timing':
        return `Match Timing (from official VEX game manual):
• Autonomous period: 15 seconds
• Driver controlled period: 105 seconds
• Total match time: 120 seconds
• Teams have 2 minutes to set up robot before match

For complete timing details, please refer to the official ${gameInfo.description} Game Manual.`;
        
      default:
        return `I can help with ${parsedQuestion.intent.type}-related questions about the ${gameInfo.description} Game Manual. 

For the most accurate and up-to-date information, please refer to the official VEX game manual PDF or ask me about specific rules, specifications, or procedures.`;
    }
  }

  /**
   * Validate AI response to ensure it's appropriate and accurate
   */
  validateAIResponse(response: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for inappropriate content
    const inappropriatePatterns = [
      /i don't know/i,
      /i'm not sure/i,
      /i can't help/i,
      /i don't have information/i,
      /i don't have access/i
    ];
    
    inappropriatePatterns.forEach(pattern => {
      if (pattern.test(response)) {
        issues.push('Response indicates lack of knowledge');
      }
    });
    
    // Check for speculation
    const speculationPatterns = [
      /might be/i,
      /could be/i,
      /probably/i,
      /maybe/i,
      /i think/i,
      /i believe/i
    ];
    
    speculationPatterns.forEach(pattern => {
      if (pattern.test(response)) {
        issues.push('Response contains speculation');
      }
    });
    
    // Check for non-robotics content
    const nonRoboticsPatterns = [
      /weather/i,
      /cooking/i,
      /movie/i,
      /restaurant/i,
      /travel/i
    ];
    
    nonRoboticsPatterns.forEach(pattern => {
      if (pattern.test(response)) {
        issues.push('Response contains non-robotics content');
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Configure the AI model with API key
   */
  configure(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.isConfigured = true;
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // For React Native
    });
  }

  /**
   * Check if AI is configured
   */
  isAIConfigured(): boolean {
    return this.isConfigured;
  }
}

// Export a default instance
export const aiModel = new AIModel({
  model: 'gpt-4',
  maxTokens: 500,
  temperature: 0.3
}); 