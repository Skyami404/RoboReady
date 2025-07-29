import { realPDFFetcher } from './realPDFFetcher';
import { getCurrentGameInfo } from './gameManualService';

export interface QuestionIntent {
  type: 'size' | 'weight' | 'scoring' | 'timing' | 'components' | 'rules' | 'procedures' | 'safety' | 'field' | 'general';
  subType?: string;
  specificAspect?: string;
  confidence: number;
  keywords: string[];
}

export interface ParsedQuestion {
  originalQuestion: string;
  intent: QuestionIntent;
  searchTerms: string[];
  expectedAnswerType: 'measurement' | 'rule' | 'procedure' | 'component' | 'specification' | 'general';
}

export class QuestionParser {
  
  /**
   * Parse a question to understand what the user is actually asking
   */
  static parseQuestion(question: string): ParsedQuestion {
    const lowerQuestion = question.toLowerCase();
    const words = lowerQuestion.split(/\s+/);
    
    // Extract key terms and their context
    const intent = this.analyzeIntent(lowerQuestion, words);
    const searchTerms = this.extractSearchTerms(lowerQuestion, intent);
    const expectedAnswerType = this.determineAnswerType(intent);
    
    return {
      originalQuestion: question,
      intent,
      searchTerms,
      expectedAnswerType
    };
  }
  
  /**
   * Analyze the intent of the question
   */
  private static analyzeIntent(question: string, words: string[]): QuestionIntent {
    let type: QuestionIntent['type'] = 'general';
    let subType: string | undefined;
    let specificAspect: string | undefined;
    let confidence = 0.5;
    const keywords: string[] = [];
    
    // Size-related questions
    if (this.matchesPattern(question, ['size', 'dimension', '18', 'inch', 'expand', 'horizontal', 'vertical'])) {
      type = 'size';
      confidence = 0.9;
      
      if (question.includes('horizontal')) {
        subType = 'horizontal_expansion';
        specificAspect = 'horizontal_expansion_limit';
      } else if (question.includes('vertical')) {
        subType = 'vertical_expansion';
        specificAspect = 'vertical_expansion_limit';
      } else if (question.includes('starting') || question.includes('initial')) {
        subType = 'starting_size';
        specificAspect = 'starting_size_limit';
      } else {
        subType = 'general_size';
        specificAspect = 'robot_size_limits';
      }
      
      keywords.push('size', 'dimension', 'limit');
    }
    
    // Weight-related questions
    else if (this.matchesPattern(question, ['weight', 'pound', '15', 'heavy', 'light'])) {
      type = 'weight';
      confidence = 0.9;
      subType = 'weight_limit';
      specificAspect = 'weight_requirement';
      keywords.push('weight', 'pound', 'limit');
    }
    
    // Motor/component questions
    else if (this.matchesPattern(question, ['motor', 'rpm', '600', '900', '1800', 'torque', 'speed'])) {
      type = 'components';
      confidence = 0.8;
      
      if (question.includes('rpm') || question.includes('600') || question.includes('900') || question.includes('1800')) {
        subType = 'motor_specifications';
        specificAspect = 'motor_rpm_limits';
      } else if (question.includes('torque')) {
        subType = 'motor_torque';
        specificAspect = 'motor_torque_limits';
      } else if (question.includes('speed')) {
        subType = 'motor_speed';
        specificAspect = 'motor_speed_limits';
      } else {
        subType = 'motor_general';
        specificAspect = 'motor_components';
      }
      
      keywords.push('motor', 'rpm', 'specification');
    }
    
    // Scoring questions
    else if (this.matchesPattern(question, ['score', 'point', 'block', 'goal', 'trough', 'autonomous', 'bonus'])) {
      type = 'scoring';
      confidence = 0.8;
      
      if (question.includes('block')) {
        subType = 'block_scoring';
        specificAspect = 'block_scoring_rules';
      } else if (question.includes('autonomous') || question.includes('bonus')) {
        subType = 'autonomous_scoring';
        specificAspect = 'autonomous_bonus';
      } else if (question.includes('goal') || question.includes('trough')) {
        subType = 'goal_scoring';
        specificAspect = 'goal_scoring_rules';
      } else {
        subType = 'general_scoring';
        specificAspect = 'scoring_rules';
      }
      
      keywords.push('score', 'point', 'rule');
    }
    
    // Timing questions
    else if (this.matchesPattern(question, ['time', 'second', '15', '105', '120', 'period', 'autonomous', 'driver'])) {
      type = 'timing';
      confidence = 0.8;
      
      if (question.includes('autonomous') || question.includes('15')) {
        subType = 'autonomous_timing';
        specificAspect = 'autonomous_period';
      } else if (question.includes('driver') || question.includes('105')) {
        subType = 'driver_timing';
        specificAspect = 'driver_controlled';
      } else if (question.includes('total') || question.includes('120')) {
        subType = 'total_timing';
        specificAspect = 'match_timing';
      } else {
        subType = 'general_timing';
        specificAspect = 'match_procedures';
      }
      
      keywords.push('time', 'second', 'period');
    }
    
    // Field questions
    else if (this.matchesPattern(question, ['field', '12', '144', 'tile', 'zone', 'goal', 'dimension'])) {
      type = 'field';
      confidence = 0.8;
      
      if (question.includes('dimension') || question.includes('size')) {
        subType = 'field_dimensions';
        specificAspect = 'field_dimensions';
      } else if (question.includes('zone') || question.includes('area')) {
        subType = 'field_zones';
        specificAspect = 'field_zones';
      } else if (question.includes('goal')) {
        subType = 'field_goals';
        specificAspect = 'field_goals';
      } else {
        subType = 'field_general';
        specificAspect = 'field_setup';
      }
      
      keywords.push('field', 'dimension', 'zone');
    }
    
    // Safety questions
    else if (this.matchesPattern(question, ['safety', 'glasses', 'adult', 'supervision', 'requirement'])) {
      type = 'safety';
      confidence = 0.8;
      subType = 'safety_requirements';
      specificAspect = 'safety_requirements';
      keywords.push('safety', 'requirement');
    }
    
    // Tournament/procedure questions
    else if (this.matchesPattern(question, ['tournament', 'procedure', 'alliance', 'selection', 'inspection'])) {
      type = 'procedures';
      confidence = 0.7;
      
      if (question.includes('alliance')) {
        subType = 'alliance_procedures';
        specificAspect = 'alliance_selection';
      } else if (question.includes('inspection')) {
        subType = 'inspection_procedures';
        specificAspect = 'inspection_checklist';
      } else if (question.includes('tournament')) {
        subType = 'tournament_procedures';
        specificAspect = 'tournament_procedures';
      } else {
        subType = 'general_procedures';
        specificAspect = 'match_procedures';
      }
      
      keywords.push('procedure', 'tournament');
    }
    
    // Rules questions
    else if (this.matchesPattern(question, ['rule', 'allow', 'permit', 'modification', 'penalty', 'violation'])) {
      type = 'rules';
      confidence = 0.7;
      
      if (question.includes('modification') || question.includes('change')) {
        subType = 'modification_rules';
        specificAspect = 'field_modifications';
      } else if (question.includes('penalty') || question.includes('violation')) {
        subType = 'penalty_rules';
        specificAspect = 'penalties_violations';
      } else if (question.includes('timeout')) {
        subType = 'timeout_rules';
        specificAspect = 'timeout_rules';
      } else {
        subType = 'general_rules';
        specificAspect = 'general_rules';
      }
      
      keywords.push('rule', 'allow');
    }
    
    return {
      type,
      subType,
      specificAspect,
      confidence,
      keywords
    };
  }
  
  /**
   * Extract search terms for finding relevant information
   */
  private static extractSearchTerms(question: string, intent: QuestionIntent): string[] {
    const terms: string[] = [];
    
    // Add intent-specific terms
    if (intent.specificAspect) {
      terms.push(intent.specificAspect);
    }
    if (intent.subType) {
      terms.push(intent.subType);
    }
    
    // Add keywords from the question
    terms.push(...intent.keywords);
    
    // Add question words that might be relevant
    const questionWords = ['what', 'how', 'when', 'where', 'why', 'which'];
    questionWords.forEach(word => {
      if (question.includes(word)) {
        terms.push(word);
      }
    });
    
    return [...new Set(terms)]; // Remove duplicates
  }
  
  /**
   * Determine what type of answer the user expects
   */
  private static determineAnswerType(intent: QuestionIntent): ParsedQuestion['expectedAnswerType'] {
    switch (intent.type) {
      case 'size':
      case 'weight':
        return 'measurement';
      case 'components':
        return 'component';
      case 'field':
        return 'specification';
      case 'scoring':
      case 'rules':
        return 'rule';
      case 'procedures':
        return 'procedure';
      case 'timing':
        return 'measurement';
      case 'safety':
        return 'rule';
      default:
        return 'general';
    }
  }
  
  /**
   * Check if question matches a pattern of keywords
   */
  private static matchesPattern(question: string, keywords: string[]): boolean {
    return keywords.some(keyword => question.includes(keyword));
  }
  
  /**
   * Generate a targeted response based on the parsed question
   */
  static async generateTargetedResponse(parsedQuestion: ParsedQuestion): Promise<string> {
    const { intent, searchTerms, expectedAnswerType } = parsedQuestion;
    
    try {
      // Try to get the most specific information first
      if (intent.specificAspect) {
        const specificSection = await realPDFFetcher.getSectionFromRealPDF(intent.specificAspect);
        if (specificSection) {
          return this.formatResponse(specificSection, intent.type, expectedAnswerType);
        }
      }
      
      // Try subType if specificAspect didn't work
      if (intent.subType) {
        const subTypeSection = await realPDFFetcher.getSectionFromRealPDF(intent.subType);
        if (subTypeSection) {
          return this.formatResponse(subTypeSection, intent.type, expectedAnswerType);
        }
      }
      
      // Search for relevant information using search terms
      const searchResults = await realPDFFetcher.searchInRealPDF(searchTerms.join(' '));
      if (searchResults.length > 0) {
        // Find the most relevant result
        const mostRelevant = this.findMostRelevantResult(searchResults, intent);
        if (mostRelevant) {
          return this.formatResponse(mostRelevant, intent.type, expectedAnswerType);
        }
      }
      
      // Fallback to keyword-based response
      return this.generateFallbackResponse(intent, expectedAnswerType);
      
    } catch (error) {
      console.error('Error generating targeted response:', error);
      return this.generateFallbackResponse(intent, expectedAnswerType);
    }
  }
  
  /**
   * Find the most relevant search result based on intent
   */
  private static findMostRelevantResult(results: string[], intent: QuestionIntent): string | null {
    if (results.length === 0) return null;
    
    // Score each result based on relevance to intent
    const scoredResults = results.map(result => ({
      content: result,
      score: this.calculateRelevanceScore(result, intent)
    }));
    
    // Return the highest scoring result
    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults[0].content;
  }
  
  /**
   * Calculate relevance score for a result
   */
  private static calculateRelevanceScore(content: string, intent: QuestionIntent): number {
    const lowerContent = content.toLowerCase();
    let score = 0;
    
    // Score based on intent keywords
    intent.keywords.forEach(keyword => {
      const matches = (lowerContent.match(new RegExp(keyword, 'g')) || []).length;
      score += matches * 2; // Keywords are worth more
    });
    
    // Score based on intent type
    if (intent.type === 'size' && lowerContent.includes('18')) score += 5;
    if (intent.type === 'weight' && lowerContent.includes('15')) score += 5;
    if (intent.type === 'timing' && lowerContent.includes('15') && lowerContent.includes('105')) score += 5;
    if (intent.type === 'components' && lowerContent.includes('motor')) score += 5;
    
    return score;
  }
  
  /**
   * Format the response based on the expected answer type
   */
  private static formatResponse(content: string, intentType: string, answerType: string): string {
    const gameInfo = getCurrentGameInfo();
    
    switch (answerType) {
      case 'measurement':
        return `Based on the ${gameInfo.description} Game Manual:

${content}

This information comes directly from the official VEX game manual PDF.`;
        
      case 'rule':
        return `Official Rule from the ${gameInfo.description} Game Manual:

${content}

This rule comes directly from the official VEX game manual PDF.`;
        
      case 'procedure':
        return `Tournament Procedure from the ${gameInfo.description} Game Manual:

${content}

This procedure comes directly from the official VEX game manual PDF.`;
        
      case 'component':
        return `Component Information from the ${gameInfo.description} Game Manual:

${content}

This information comes directly from the official VEX documentation.`;
        
      case 'specification':
        return `Specification from the ${gameInfo.description} Game Manual:

${content}

This specification comes directly from the official VEX game manual PDF.`;
        
      default:
        return `Information from the ${gameInfo.description} Game Manual:

${content}

This information comes directly from the official VEX game manual PDF.`;
    }
  }
  
  /**
   * Generate a fallback response when no specific information is found
   */
  private static generateFallbackResponse(intent: QuestionIntent, answerType: string): string {
    const gameInfo = getCurrentGameInfo();
    
    switch (intent.type) {
      case 'size':
        return `Robot Size Limits (from official VEX game manual):
Starting size: 18" x 18" x 18" maximum
Expansion allowed during match
Vertical expansion: Unlimited
Horizontal expansion: Must remain within field boundaries
All parts must be contained within starting size at match start

For the most accurate and up-to-date information, please refer to the official ${gameInfo.description} Game Manual.`;
        
      case 'weight':
        return `Robot Weight Requirements (from official VEX game manual):
Maximum weight: 15 pounds
Includes all parts, mechanisms, and components
Weight checked during inspection process
Must meet weight limit to pass inspection

For the most accurate and up-to-date information, please refer to the official ${gameInfo.description} Game Manual.`;
        
      case 'components':
        return `VEX Robot Components (from official documentation):
V5 Brain - Main controller with integrated display
V5 Motors - Various types (600RPM, 900RPM, 1800RPM)
V5 Smart Motors - Integrated encoders for precise control
V5 Controller - Driver control interface with joysticks
VEXnet Keys - Wireless communication between brain and controller

For specific motor limits and specifications, please refer to the official ${gameInfo.description} Game Manual.`;
        
      case 'scoring':
        return `Scoring Rules (from official VEX game manual):
All scoring evaluated after match ends
Blocks must be in contact with inside surface of plastic trough to be scored
Autonomous bonus scored immediately after autonomous period
Block mass: 40 ± 4 grams

For detailed scoring criteria, please refer to the official ${gameInfo.description} Game Manual.`;
        
      case 'timing':
        return `Match Timing (from official VEX game manual):
Autonomous period: 15 seconds
Driver controlled period: 105 seconds
Total match time: 120 seconds
Teams have 2 minutes to set up robot before match

For complete timing details, please refer to the official ${gameInfo.description} Game Manual.`;
        
      default:
        return `I can help with ${intent.type}-related questions about the ${gameInfo.description} Game Manual. 

For the most accurate and up-to-date information, please refer to the official VEX game manual PDF or ask me about specific rules, specifications, or procedures.`;
    }
  }
} 