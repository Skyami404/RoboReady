import { ChatGuardrails } from './chatGuardrails';

// Test cases for the chat guardrails system
export const testChatGuardrails = async () => {
  console.log('Testing Chat Guardrails System...\n');

  // Test 1: Robotics-related questions (should pass)
  console.log('Test 1: Robotics-related questions');
  const roboticsQuestions = [
    'What is the robot size limit?',
    'How much does the robot weigh?',
    'What are the scoring rules?',
    'How long is the autonomous period?',
    'What are the tournament procedures?',
    'What VEX motors should I use?',
    'How do I program autonomous?',
    'What are the safety requirements?'
  ];

  for (const question of roboticsQuestions) {
    const result = await ChatGuardrails.processUserInput(question);
    console.log(`Q: "${question}"`);
    console.log(`Is Robotics: ${result.isRoboticsRelated}`);
    console.log(`Is Specific: ${result.isSpecific}`);
    console.log(`Confidence: ${result.confidence}`);
    console.log(`Response: ${result.suggestedResponse?.substring(0, 100)}...`);
    console.log('---');
  }

  // Test 2: Non-robotics questions (should be rejected)
  console.log('\nTest 2: Non-robotics questions');
  const nonRoboticsQuestions = [
    'What is the weather like?',
    'How do I cook pasta?',
    'What movie should I watch?',
    'Can you help me with my homework?',
    'What is the best restaurant?',
    'How do I fix my computer?',
    'What is the capital of France?',
    'Can you tell me a joke?'
  ];

  for (const question of nonRoboticsQuestions) {
    const result = await ChatGuardrails.processUserInput(question);
    console.log(`Q: "${question}"`);
    console.log(`Is Robotics: ${result.isRoboticsRelated}`);
    console.log(`Rejection Reason: ${result.rejectionReason}`);
    console.log('---');
  }

  // Test 3: Vague vs Specific responses
  console.log('\nTest 3: Vague vs Specific responses');
  const vagueResponses = [
    'It depends on the situation.',
    'Generally, robots are good.',
    'You might want to try different approaches.',
    'It could be helpful to practice.',
    'Some teams do well with this strategy.'
  ];

  const specificResponses = [
    'Robot size limit: 18" x 18" x 18" maximum starting size.',
    'Autonomous period: 15 seconds duration.',
    'Weight limit: 15 pounds maximum.',
    'Field size: 12\' x 12\' (144" x 144").',
    'V5 Brain - Main controller with integrated display.'
  ];

  console.log('Vague responses:');
  for (const response of vagueResponses) {
    const isSpecific = ChatGuardrails.isSpecificResponse(response);
    console.log(`"${response}" - Is Specific: ${isSpecific}`);
  }

  console.log('\nSpecific responses:');
  for (const response of specificResponses) {
    const isSpecific = ChatGuardrails.isSpecificResponse(response);
    console.log(`"${response}" - Is Specific: ${isSpecific}`);
  }

  // Test 4: Edge cases and design questions
  console.log('\nTest 4: Edge cases and design questions');
  const edgeCases = [
    'robot', // Single word
    'vex robot size', // Multiple keywords
    'what about robots?', // Question format
    'I need help with my robot project', // Project context
    'robot competition rules', // Competition context
    'robot parts and components', // Parts context
    'what are the design rules?', // Design question
    'how do I build this?', // Build question
    'what are the requirements?', // Requirements question
    'what size should it be?', // Size question
    'how much should it weigh?', // Weight question
    'what are the limits?', // Limits question
    'can I use this part?', // Part question
    'what is allowed?', // General rules question
    'how does this work?', // How question
    'what do I need to know?', // General question
  ];

  for (const question of edgeCases) {
    const result = await ChatGuardrails.processUserInput(question);
    console.log(`Q: "${question}"`);
    console.log(`Is Robotics: ${result.isRoboticsRelated}`);
    console.log(`Is Specific: ${result.isSpecific}`);
    console.log('---');
  }

  console.log('Chat Guardrails Testing Complete!');
};

// Test specific guardrail functions
export const testGuardrailFunctions = () => {
  console.log('Testing Individual Guardrail Functions...\n');

  // Test robotics keyword detection
  console.log('Test: Robotics keyword detection');
  const testMessages = [
    'What is the robot size?',
    'How do I cook dinner?',
    'VEX competition rules',
    'Weather forecast today',
    'Robot programming help',
    'Movie recommendations',
    'What are the design rules?',
    'How do I build this?',
    'What are the requirements?',
    'What size should it be?',
    'How much should it weigh?',
    'What are the limits?',
    'Can I use this part?',
    'What is allowed?',
    'How does this work?',
    'What do I need to know?'
  ];

  for (const message of testMessages) {
    const isRobotics = ChatGuardrails.isRoboticsRelated(message);
    console.log(`"${message}" - Is Robotics: ${isRobotics}`);
  }

  // Test specific response detection
  console.log('\nTest: Specific response detection');
  const testResponses = [
    'Robot size is 18" x 18" x 18".',
    'It depends on what you want to do.',
    'The field is 12 feet by 12 feet.',
    'You might want to try different things.',
    'Autonomous period lasts 15 seconds.',
    'Some teams do well with practice.'
  ];

  for (const response of testResponses) {
    const isSpecific = ChatGuardrails.isSpecificResponse(response);
    console.log(`"${response}" - Is Specific: ${isSpecific}`);
  }

  console.log('Individual Function Testing Complete!');
}; 