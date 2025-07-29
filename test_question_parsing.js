// Test the new question parsing system
const testQuestions = [
  // Motor-related questions
  "What is the motor RPM limit?",
  "What are the motor torque limits?",
  "What is the motor speed limit?",
  "How fast can my motors go?",
  "What motors can I use?",
  
  // Size-related questions
  "What is the horizontal expansion limit?",
  "What is the vertical expansion limit?",
  "How big can my robot be?",
  "What are the size limits?",
  "How much can my robot expand?",
  
  // Weight questions
  "What is the weight limit?",
  "How much can my robot weigh?",
  "What is the maximum weight?",
  
  // Timing questions
  "How long is the autonomous period?",
  "What is the match time?",
  "How long is the driver controlled period?",
  
  // Scoring questions
  "How do I score points?",
  "What are the scoring rules?",
  "How does block scoring work?",
  
  // General questions that should be answered
  "What are the design rules?",
  "What are the requirements?",
  "What is allowed?",
  "How does this work?"
];

console.log("Testing Question Parsing System...\n");

// Simulate the question parsing logic
function parseQuestion(question) {
  const lowerQuestion = question.toLowerCase();
  
  // Analyze intent
  let type = 'general';
  let subType;
  let specificAspect;
  let confidence = 0.5;
  const keywords = [];
  
  // Motor/component questions
  if (lowerQuestion.includes('motor') || lowerQuestion.includes('rpm') || lowerQuestion.includes('600') || lowerQuestion.includes('900') || lowerQuestion.includes('1800') || lowerQuestion.includes('torque') || lowerQuestion.includes('speed')) {
    type = 'components';
    confidence = 0.8;
    
    if (lowerQuestion.includes('rpm') || lowerQuestion.includes('600') || lowerQuestion.includes('900') || lowerQuestion.includes('1800')) {
      subType = 'motor_specifications';
      specificAspect = 'motor_rpm_limits';
    } else if (lowerQuestion.includes('torque')) {
      subType = 'motor_torque';
      specificAspect = 'motor_torque_limits';
    } else if (lowerQuestion.includes('speed')) {
      subType = 'motor_speed';
      specificAspect = 'motor_speed_limits';
    } else {
      subType = 'motor_general';
      specificAspect = 'motor_components';
    }
    
    keywords.push('motor', 'rpm', 'specification');
  }
  
  // Size-related questions
  else if (lowerQuestion.includes('size') || lowerQuestion.includes('dimension') || lowerQuestion.includes('18') || lowerQuestion.includes('inch') || lowerQuestion.includes('expand') || lowerQuestion.includes('horizontal') || lowerQuestion.includes('vertical')) {
    type = 'size';
    confidence = 0.9;
    
    if (lowerQuestion.includes('horizontal')) {
      subType = 'horizontal_expansion';
      specificAspect = 'horizontal_expansion_limit';
    } else if (lowerQuestion.includes('vertical')) {
      subType = 'vertical_expansion';
      specificAspect = 'vertical_expansion_limit';
    } else if (lowerQuestion.includes('starting') || lowerQuestion.includes('initial')) {
      subType = 'starting_size';
      specificAspect = 'starting_size_limit';
    } else {
      subType = 'general_size';
      specificAspect = 'robot_size_limits';
    }
    
    keywords.push('size', 'dimension', 'limit');
  }
  
  // Weight-related questions
  else if (lowerQuestion.includes('weight') || lowerQuestion.includes('pound') || lowerQuestion.includes('15') || lowerQuestion.includes('heavy') || lowerQuestion.includes('light')) {
    type = 'weight';
    confidence = 0.9;
    subType = 'weight_limit';
    specificAspect = 'weight_requirement';
    keywords.push('weight', 'pound', 'limit');
  }
  
  // Timing questions
  else if (lowerQuestion.includes('time') || lowerQuestion.includes('second') || lowerQuestion.includes('15') || lowerQuestion.includes('105') || lowerQuestion.includes('120') || lowerQuestion.includes('period') || lowerQuestion.includes('autonomous') || lowerQuestion.includes('driver')) {
    type = 'timing';
    confidence = 0.8;
    
    if (lowerQuestion.includes('autonomous') || lowerQuestion.includes('15')) {
      subType = 'autonomous_timing';
      specificAspect = 'autonomous_period';
    } else if (lowerQuestion.includes('driver') || lowerQuestion.includes('105')) {
      subType = 'driver_timing';
      specificAspect = 'driver_controlled';
    } else if (lowerQuestion.includes('total') || lowerQuestion.includes('120')) {
      subType = 'total_timing';
      specificAspect = 'match_timing';
    } else {
      subType = 'general_timing';
      specificAspect = 'match_procedures';
    }
    
    keywords.push('time', 'second', 'period');
  }
  
  // Scoring questions
  else if (lowerQuestion.includes('score') || lowerQuestion.includes('point') || lowerQuestion.includes('block') || lowerQuestion.includes('goal') || lowerQuestion.includes('trough') || lowerQuestion.includes('autonomous') || lowerQuestion.includes('bonus')) {
    type = 'scoring';
    confidence = 0.8;
    
    if (lowerQuestion.includes('block')) {
      subType = 'block_scoring';
      specificAspect = 'block_scoring_rules';
    } else if (lowerQuestion.includes('autonomous') || lowerQuestion.includes('bonus')) {
      subType = 'autonomous_scoring';
      specificAspect = 'autonomous_bonus';
    } else if (lowerQuestion.includes('goal') || lowerQuestion.includes('trough')) {
      subType = 'goal_scoring';
      specificAspect = 'goal_scoring_rules';
    } else {
      subType = 'general_scoring';
      specificAspect = 'scoring_rules';
    }
    
    keywords.push('score', 'point', 'rule');
  }
  
  return {
    type,
    subType,
    specificAspect,
    confidence,
    keywords
  };
}

// Test each question
testQuestions.forEach(question => {
  const intent = parseQuestion(question);
  console.log(`Q: "${question}"`);
  console.log(`  Type: ${intent.type}`);
  console.log(`  SubType: ${intent.subType || 'none'}`);
  console.log(`  SpecificAspect: ${intent.specificAspect || 'none'}`);
  console.log(`  Confidence: ${intent.confidence}`);
  console.log(`  Keywords: [${intent.keywords.join(', ')}]`);
  console.log('---');
});

console.log("\nQuestion Parsing Test Complete!");
console.log("The system should now understand specific questions and provide targeted answers."); 