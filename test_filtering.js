// Simple test to verify the improved filtering logic
const testQuestions = [
  // Should pass (robotics-related)
  "What are the design rules?",
  "How do I build this?",
  "What are the requirements?",
  "What size should it be?",
  "How much should it weigh?",
  "What are the limits?",
  "Can I use this part?",
  "What is allowed?",
  "How does this work?",
  "What do I need to know?",
  "What is the robot size limit?",
  "How much does the robot weigh?",
  "What VEX motors should I use?",
  "What are the scoring rules?",
  "How long is the autonomous period?",
  
  // Should fail (non-robotics)
  "What is the weather like?",
  "How do I cook pasta?",
  "What movie should I watch?",
  "Can you help me with my homework?",
  "What is the best restaurant?",
  "How do I fix my computer?",
  "What is the capital of France?",
  "Can you tell me a joke?"
];

console.log("Testing improved filtering logic...\n");

// Simulate the filtering logic
function isRoboticsRelated(message) {
  const lowerMessage = message.toLowerCase();
  
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
  
  // More lenient: accept if it seems like a technical question
  return hasQuestionWord && lowerMessage.length > 10;
}

// Test each question
testQuestions.forEach(question => {
  const isRobotics = isRoboticsRelated(question);
  const status = isRobotics ? "✅ PASS" : "❌ FAIL";
  console.log(`${status}: "${question}"`);
});

console.log("\nTest complete! Questions marked with ✅ should be accepted as robotics-related."); 