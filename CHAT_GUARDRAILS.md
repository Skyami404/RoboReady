# Chat Guardrails System

## Overview

The Chat Guardrails System ensures that the VEX Robotics Coach chat module only answers robotics-related questions and provides specific, non-vague responses based on official VEX documentation.

## Key Features

### 1. Intelligent Question Parsing
- **Intent Understanding**: Analyzes what the user is actually asking, not just keyword matching
- **Specific Question Types**: Recognizes questions about size, weight, motors, timing, scoring, etc.
- **Context-Aware Responses**: Provides targeted answers based on the specific aspect being asked about

### 2. Topic Filtering
- **Inclusive Robotics Responses**: The system accepts questions that could be answered by the VEX game manual
- **Non-Robotics Rejection**: Automatically rejects questions about politics, weather, cooking, entertainment, etc.
- **Smart Detection**: Uses strong robotics indicators and technical terms to identify relevant topics

### 3. Specificity Validation
- **Vague Response Detection**: Identifies and rejects vague responses like "it depends" or "generally"
- **Specific Details Required**: Ensures responses contain concrete measurements, numbers, or official references
- **Response Improvement**: Automatically enhances vague responses with specific details

### 4. Comprehensive Manual Integration
- **Multi-Source Search**: Searches across real PDF data, parsed sections, and game manual content
- **Official Source Priority**: Prioritizes information from official VEX documentation
- **Fallback Systems**: Multiple layers of fallback to ensure relevant responses

## Implementation Details

### Robotics Keywords

The system recognizes these robotics-related topics:

```typescript
const ROBOTICS_KEYWORDS = {
  vex: ['vex', 'v5', 'v5rc', 'robotics competition', 'push back', 'game manual'],
  robot: ['robot', 'mechanism', 'motor', 'brain', 'controller', 'sensor', 'actuator'],
  competition: ['tournament', 'competition', 'match', 'alliance', 'qualification'],
  game: ['field', 'goal', 'block', 'trough', 'zone', 'autonomous', 'driver controlled'],
  technical: ['inspection', 'size', 'weight', 'dimension', 'specification', 'rule'],
  strategy: ['strategy', 'tactic', 'approach', 'planning', 'coordination'],
  parts: ['part', 'component', 'hardware', 'software', 'programming'],
  tournament: ['referee', 'judge', 'head referee', 'alliance selection'],
  safety: ['safety', 'glasses', 'adult', 'supervision', 'field boundary'],
  field: ['field', 'setup', 'modification', 'tape', 'threadlocker', 'tile']
};
```

### Non-Robotics Topics

The system automatically rejects questions about:

- Politics, religion, personal matters
- Cooking, food, restaurants, travel
- Entertainment, movies, music, books
- Shopping, fashion, beauty
- Education, homework, school
- Work, career, business
- Technology (non-robotics), computers, phones
- Weather, climate, temperature

### Vague Response Patterns

The system detects and avoids these vague patterns:

```typescript
const VAGUE_PATTERNS = [
  'it depends', 'it varies', 'it could be', 'it might be', 'possibly', 'maybe',
  'generally', 'usually', 'typically', 'often', 'sometimes', 'rarely',
  'some', 'many', 'few', 'several', 'various', 'different', 'multiple',
  'around', 'about', 'approximately', 'roughly', 'close to',
  'good', 'bad', 'nice', 'great', 'awesome', 'terrible', 'wonderful'
];
```

## Usage Examples

### Acceptable Questions (Robotics-Related)

✅ **Robot Design**
- "What is the robot size limit?"
- "How much does the robot weigh?"
- "What VEX motors should I use?"
- "What are the design rules?"
- "How do I build this?"
- "What are the requirements?"

✅ **Motor & Component Questions**
- "What is the motor RPM limit?"
- "What are the motor torque limits?"
- "What is the motor speed limit?"
- "How fast can my motors go?"
- "What motors can I use?"

✅ **Size & Expansion Questions**
- "What is the horizontal expansion limit?"
- "What is the vertical expansion limit?"
- "How big can my robot be?"
- "What are the size limits?"
- "How much can my robot expand?"

✅ **Game Rules**
- "What are the scoring rules?"
- "How long is the autonomous period?"
- "What are the field dimensions?"
- "What is allowed?"
- "What are the limits?"
- "How does this work?"

✅ **Tournament Procedures**
- "What are the tournament procedures?"
- "How does alliance selection work?"
- "What are the inspection requirements?"
- "What do I need to know?"

✅ **Strategy & Parts**
- "How do I program autonomous?"
- "What are the safety requirements?"
- "What robot components do I need?"
- "Can I use this part?"
- "What size should it be?"

### Rejected Questions (Non-Robotics)

❌ **Non-Robotics Topics**
- "What is the weather like?"
- "How do I cook pasta?"
- "What movie should I watch?"
- "Can you help me with my homework?"
- "What is the best restaurant?"

## Response Quality

### Specific Responses (Good)

✅ **Contains concrete details:**
- "Robot size limit: 18" x 18" x 18" maximum starting size"
- "Autonomous period: 15 seconds duration"
- "Weight limit: 15 pounds maximum"
- "Field size: 12' x 12' (144" x 144")"

### Vague Responses (Rejected)

❌ **Contains vague language:**
- "It depends on the situation"
- "Generally, robots are good"
- "You might want to try different approaches"
- "Some teams do well with this strategy"

## Technical Implementation

### Question Parsing System

The system now uses intelligent question parsing to understand what the user is actually asking:

```typescript
// Parse the question to understand intent
const parsedQuestion = QuestionParser.parseQuestion(userMessage);

// Generate targeted response based on parsed question
const targetedResponse = await QuestionParser.generateTargetedResponse(parsedQuestion);
```

### Main Processing Function

```typescript
static async processUserInput(userMessage: string): Promise<ChatGuardrailsResult> {
  // Check if message is robotics-related (inclusive approach)
  if (!this.isRoboticsRelated(userMessage)) {
    return {
      isRoboticsRelated: false,
      isSpecific: false,
      confidence: 0,
      rejectionReason: "I'm specifically designed to help with VEX Robotics questions. I can assist with game manual rules, robot design, tournament procedures, and competition strategies. Please ask me about robotics-related topics."
    };
  }
  
  // Generate specific response using intelligent parsing
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
```

### Response Generation Priority

1. **Real PDF Data**: Search official VEX PDF sections first
2. **PDF Parser**: Use parsed game manual sections
3. **Game Manual Parser**: Fall back to manual parser
4. **Keyword-Based**: Provide specific responses based on keywords
5. **Default Response**: Robotics-focused help message

### Validation and Improvement

```typescript
static validateResponse(response: string): { isValid: boolean; improvedResponse?: string } {
  if (!this.isSpecificResponse(response)) {
    const improvedResponse = this.addSpecificDetails(response);
    return {
      isValid: false,
      improvedResponse
    };
  }
  return { isValid: true };
}
```

## Testing

The system includes comprehensive testing:

```typescript
// Test robotics-related questions
const roboticsQuestions = [
  'What is the robot size limit?',
  'How much does the robot weigh?',
  'What are the scoring rules?'
];

// Test non-robotics questions
const nonRoboticsQuestions = [
  'What is the weather like?',
  'How do I cook pasta?',
  'What movie should I watch?'
];

// Test vague vs specific responses
const vagueResponses = ['It depends on the situation.'];
const specificResponses = ['Robot size limit: 18" x 18" x 18" maximum.'];
```

## Benefits

1. **Focused Responses**: Ensures all responses are relevant to VEX Robotics
2. **High Quality**: Provides specific, actionable information
3. **Official Sources**: Prioritizes information from official VEX documentation
4. **User Experience**: Clear rejection messages for non-robotics topics
5. **Maintainability**: Easy to update keywords and patterns
6. **Reliability**: Multiple fallback systems ensure responses are always available

## Future Enhancements

- **Machine Learning**: Implement ML-based topic classification
- **Context Awareness**: Remember conversation context for better responses
- **Multi-Language Support**: Extend to support multiple languages
- **Voice Integration**: Add voice input/output capabilities
- **Real-Time Updates**: Connect to live VEX rule updates 