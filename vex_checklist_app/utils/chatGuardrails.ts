import { realPDFFetcher } from './realPDFFetcher';
import { gameManualParser } from './gameManualParser';
import { pdfParser } from './pdfParser';
import { getCurrentGameInfo } from './gameManualService';
import { QuestionParser } from './questionParser';
import { aiModel, AIResponse } from './aiModel';

// Robotics-specific keywords and topics
const ROBOTICS_KEYWORDS = {
  // VEX-specific terms
  vex: ['vex', 'v5', 'v5rc', 'robotics competition', 'push back', 'game manual'],
  
  // Robot components
  robot: ['robot', 'mechanism', 'motor', 'brain', 'controller', 'sensor', 'actuator', 'drive', 'intake', 'lift', 'arm', 'claw', 'gripper'],
  
  // Competition terms
  competition: ['tournament', 'competition', 'match', 'alliance', 'qualification', 'elimination', 'skills', 'challenge', 'scoring', 'points'],
  
  // Game elements
  game: ['field', 'goal', 'block', 'trough', 'zone', 'autonomous', 'driver controlled', 'period', 'timeout'],
  
  // Technical terms
  technical: ['inspection', 'size', 'weight', 'dimension', 'specification', 'rule', 'penalty', 'violation', 'safety'],
  
  // Strategy and tactics
  strategy: ['strategy', 'tactic', 'approach', 'planning', 'coordination', 'alliance', 'scouting'],
  
  // Parts and components
  parts: ['part', 'component', 'hardware', 'software', 'programming', 'code', 'autonomous', 'driver', 'controller'],
  
  // Tournament procedures
  tournament: ['referee', 'judge', 'head referee', 'alliance selection', 'engineering notebook', 'interview', 'award'],
  
  // Safety and rules
  safety: ['safety', 'glasses', 'adult', 'supervision', 'field boundary', 'participant', 'release form'],
  
  // Field and setup
  field: ['field', 'setup', 'modification', 'tape', 'threadlocker', 'tile', 'perimeter', 'zone', 'goal']
};

// Non-robotics topics to reject
const NON_ROBOTICS_TOPICS = [
  'politics', 'religion', 'personal', 'medical', 'financial', 'legal', 'dating', 'relationship',
  'cooking', 'recipe', 'food', 'restaurant', 'travel', 'vacation', 'hotel', 'flight',
  'entertainment', 'movie', 'music', 'book', 'game', 'sport', 'fitness', 'health',
  'shopping', 'fashion', 'clothing', 'makeup', 'beauty', 'hair', 'nail',
  'education', 'school', 'college', 'university', 'homework', 'assignment', 'test',
  'work', 'job', 'career', 'business', 'company', 'office', 'meeting',
  'technology', 'computer', 'phone', 'app', 'software', 'website', 'internet',
  'weather', 'climate', 'temperature', 'forecast', 'rain', 'snow', 'sunny'
];

// Vague response patterns to avoid
const VAGUE_PATTERNS = [
  'it depends', 'it varies', 'it could be', 'it might be', 'possibly', 'maybe',
  'generally', 'usually', 'typically', 'often', 'sometimes', 'rarely',
  'some', 'many', 'few', 'several', 'various', 'different', 'multiple',
  'around', 'about', 'approximately', 'roughly', 'close to',
  'good', 'bad', 'nice', 'great', 'awesome', 'terrible', 'wonderful',
  'helpful', 'useful', 'important', 'necessary', 'essential', 'critical'
];

export interface ChatGuardrailsResult {
  isRoboticsRelated: boolean;
  isSpecific: boolean;
  confidence: number;
  suggestedResponse?: string;
  rejectionReason?: string;
  aiResponse?: AIResponse;
}

export class ChatGuardrails {
  
  /**
   * Check if a user message is robotics-related
   * More inclusive approach: accept anything that's not explicitly non-robotics
   * and could potentially be answered by the game manual
   */
  static isRoboticsRelated(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    
    // Check for explicitly non-robotics topics first
    for (const topic of NON_ROBOTICS_TOPICS) {
      if (lowerMessage.includes(topic)) {
        return false;
      }
    }
    
    // Check for strong robotics indicators (automatic accept)
    const strongRoboticsIndicators = [
      'vex', 'robot', 'competition', 'tournament', 'match', 'game', 'manual',
      'rule', 'scoring', 'field', 'goal', 'block', 'autonomous', 'driver',
      'alliance', 'inspection', 'safety', 'motor', 'brain', 'controller',
      'mechanism', 'part', 'component', 'programming', 'strategy'
    ];
    
    for (const indicator of strongRoboticsIndicators) {
      if (lowerMessage.includes(indicator)) {
        return true;
      }
    }
    
    // Check for question words that could be about robotics
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'which', 'who'];
    const hasQuestionWord = questionWords.some(word => lowerMessage.includes(word));
    
    // Check for design/technical terms that could be robotics-related
    const technicalTerms = ['design', 'build', 'make', 'create', 'size', 'weight', 'limit', 'requirement'];
    const hasTechnicalTerm = technicalTerms.some(term => lowerMessage.includes(term));
    
    // If it has a question word and technical terms, it's likely robotics-related
    if (hasQuestionWord && hasTechnicalTerm) {
      return true;
    }
    
    // Check for robotics keywords (more lenient scoring)
    let roboticsScore = 0;
    Object.values(ROBOTICS_KEYWORDS).flat().forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        roboticsScore++;
      }
    });
    
    // More lenient: accept if it has any robotics keywords or seems like a technical question
    return roboticsScore >= 1 || (hasQuestionWord && lowerMessage.length > 10);
  }
  
  /**
   * Check if a response is specific and non-vague
   */
  static isSpecificResponse(response: string): boolean {
    const lowerResponse = response.toLowerCase();
    
    // Check for vague patterns
    for (const pattern of VAGUE_PATTERNS) {
      if (lowerResponse.includes(pattern)) {
        return false;
      }
    }
    
    // Check for specific measurements, numbers, or concrete details
    const hasSpecificDetails = 
      /\d+/.test(response) || // Contains numbers
      /[A-Z]{2,}/.test(response) || // Contains acronyms
      /"[^"]*"/.test(response) || // Contains quoted text
      /\([^)]*\)/.test(response); // Contains parenthetical details
    
    // Check for official source references
    const hasOfficialSource = 
      lowerResponse.includes('official') ||
      lowerResponse.includes('pdf') ||
      lowerResponse.includes('manual') ||
      lowerResponse.includes('rule') ||
      lowerResponse.includes('specification');
    
    return hasSpecificDetails || hasOfficialSource;
  }
  
  /**
   * Generate a specific, robotics-focused response using AI and intelligent question parsing
   */
  static async generateSpecificResponse(userMessage: string): Promise<string> {
    try {
      // Parse the question to understand what the user is actually asking
      const parsedQuestion = QuestionParser.parseQuestion(userMessage);
      
      // Generate AI-enhanced response
      const aiResponse = await aiModel.generateResponse(userMessage, parsedQuestion);
      
      // Validate the AI response
      const validation = aiModel.validateAIResponse(aiResponse.text);
      
      if (!validation.isValid) {
        console.warn('AI response validation failed:', validation.issues);
        // Fall back to manual response if AI response is invalid
        const manualResponse = await QuestionParser.generateTargetedResponse(parsedQuestion);
        return manualResponse;
      }
      
      return aiResponse.text;
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback to manual response if AI fails
      try {
        const parsedQuestion = QuestionParser.parseQuestion(userMessage);
        const manualResponse = await QuestionParser.generateTargetedResponse(parsedQuestion);
        return manualResponse;
      } catch (fallbackError) {
        console.error('Manual fallback also failed:', fallbackError);
        return this.generateKeywordBasedResponse(userMessage);
      }
    }
  }
  
  /**
   * Generate a response based on specific keywords when no manual data is available
   */
  private static generateKeywordBasedResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Size and weight questions
    if (lowerMessage.includes('size') || lowerMessage.includes('dimension') || lowerMessage.includes('18') || lowerMessage.includes('inch')) {
      return `Robot Size Limits (from official VEX game manual):
Starting size: 18" x 18" x 18" maximum
Weight limit: 15 pounds maximum
All parts must be contained within starting size at match start
Expansion allowed during match within field boundaries`;
    }
    
    // Weight questions
    if (lowerMessage.includes('weight') || lowerMessage.includes('pound') || lowerMessage.includes('15')) {
      return `Robot Weight Requirements (from official VEX game manual):
Maximum weight: 15 pounds
Includes all parts, mechanisms, and components
Weight checked during inspection process
Must meet weight limit to pass inspection`;
    }
    
    // Field questions
    if (lowerMessage.includes('field') && (lowerMessage.includes('size') || lowerMessage.includes('dimension') || lowerMessage.includes('12'))) {
      return `Field Specifications (from official VEX game manual):
Field size: 12' x 12' (144" x 144")
Field tile size: 24" x 24"
Field height: 12" from floor to top of field perimeter
Loader zone: 24" x 24" in each corner`;
    }
    
    // Scoring questions
    if (lowerMessage.includes('score') || lowerMessage.includes('point') || lowerMessage.includes('block')) {
      return `Scoring Rules (from official VEX game manual):
All scoring evaluated after match ends
Blocks must be in contact with inside surface of plastic trough to be scored
Autonomous bonus scored immediately after autonomous period
Block mass: 40 ± 4 grams`;
    }
    
    // Timing questions
    if (lowerMessage.includes('time') || lowerMessage.includes('second') || lowerMessage.includes('period') || lowerMessage.includes('15') || lowerMessage.includes('105')) {
      return `Match Timing (from official VEX game manual):
Autonomous period: 15 seconds
Driver controlled period: 105 seconds
Total match time: 120 seconds
Teams have 2 minutes to set up robot before match`;
    }
    
    // Tournament questions
    if (lowerMessage.includes('tournament') || lowerMessage.includes('competition') || lowerMessage.includes('event')) {
      return `Tournament Information (from official VEX game manual):
Head referees have final authority on all decisions
Alliance selection: Top 8 teams automatically qualify
Robot skills challenges: 60-second programming and driver skills matches
Engineering notebook review required for awards`;
    }
    
    // Robot parts questions
    if (lowerMessage.includes('parts') || lowerMessage.includes('robot') || lowerMessage.includes('mechanism') || lowerMessage.includes('motor')) {
      return `VEX Robot Components (from official documentation):
V5 Brain - Main controller with integrated display
V5 Motors - Various types (600RPM, 900RPM, 1800RPM)
V5 Smart Motors - Integrated encoders for precise control
V5 Controller - Driver control interface with joysticks
VEXnet Keys - Wireless communication between brain and controller`;
    }
    
    // Default robotics-focused response
    return `I'm your VEX Robotics Coach! I can help with specific questions about:

Game Manual Rules - Current VEX V5 Robotics Competition Push Back rules
Robot Design - Size limits (18"x18"x18"), weight (15 lbs), components
Tournament Procedures - Alliance selection, skills challenges, inspection
Scoring System - Block scoring, autonomous bonus, match timing
Safety Requirements - Safety glasses, adult supervision, field boundaries

Please ask about specific rules, robot specifications, or tournament procedures. I'll provide accurate information from the official VEX documentation.`;
  }
  
  /**
   * Main function to process user input and generate appropriate response
   */
  static async processUserInput(userMessage: string): Promise<ChatGuardrailsResult> {
    // Check if message is robotics-related
    if (!this.isRoboticsRelated(userMessage)) {
      return {
        isRoboticsRelated: false,
        isSpecific: false,
        confidence: 0,
        rejectionReason: "I'm specifically designed to help with VEX Robotics questions. I can assist with game manual rules, robot design, tournament procedures, and competition strategies. Please ask me about robotics-related topics."
      };
    }
    
    // Generate AI-enhanced response
    const response = await this.generateSpecificResponse(userMessage);
    
    // Check if response is specific
    const isSpecific = this.isSpecificResponse(response);
    
    return {
      isRoboticsRelated: true,
      isSpecific,
      confidence: isSpecific ? 0.9 : 0.6,
      suggestedResponse: response
    };
  }
  
  /**
   * Validate and improve a response to ensure it's specific and non-vague
   */
  static validateResponse(response: string): { isValid: boolean; improvedResponse?: string } {
    if (!this.isSpecificResponse(response)) {
      // Try to improve the response by adding more specific details
      const improvedResponse = this.addSpecificDetails(response);
      return {
        isValid: false,
        improvedResponse
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * Add specific details to a vague response
   */
  private static addSpecificDetails(response: string): string {
    const lowerResponse = response.toLowerCase();
    
    // Add specific measurements and numbers where appropriate
    if (lowerResponse.includes('robot') && !lowerResponse.includes('18')) {
      return response + '\n\nSpecific Requirements:\n- Starting size: 18" x 18" x 18" maximum\n- Weight limit: 15 pounds maximum';
    }
    
    if (lowerResponse.includes('match') && !lowerResponse.includes('15') && !lowerResponse.includes('105')) {
      return response + '\n\nMatch Timing:\n- Autonomous period: 15 seconds\n- Driver controlled period: 105 seconds\n- Total match time: 120 seconds';
    }
    
    if (lowerResponse.includes('field') && !lowerResponse.includes('12')) {
      return response + '\n\nField Specifications:\n- Field size: 12\' x 12\' (144" x 144")\n- Field tile size: 24" x 24"';
    }
    
    return response + '\n\nFor the most accurate and up-to-date information, please refer to the official VEX game manual PDF.';
  }
} 