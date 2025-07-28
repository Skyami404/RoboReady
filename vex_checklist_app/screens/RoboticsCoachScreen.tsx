import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TextInput, 
  Button, 
  Card, 
  useTheme as usePaperTheme,
  IconButton,
  ActivityIndicator
} from 'react-native-paper';
import { useTheme } from '../App';
import { createChecklistStyles } from '../styles/checklistStyles';
import { 
  fetchGameManualData, 
  searchGameManual, 
  getGameManualSection, 
  getCurrentGameInfo 
} from '../utils/gameManualService';
import { gameManualParser } from '../utils/gameManualParser';
import { pdfParser } from '../utils/pdfParser';
import { realPDFFetcher } from '../utils/realPDFFetcher';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface GameManualData {
  title: string;
  content: string;
  url: string;
  lastUpdated: string;
}

export default function RoboticsCoachScreen() {
  const { isDarkMode } = useTheme();
  const paperTheme = usePaperTheme();
  const checklistStyles = createChecklistStyles(isDarkMode);
  
  const chatStyles = StyleSheet.create({
    chatContainer: {
      flex: 1,
      marginBottom: 10,
    },
    messageContainer: {
      marginVertical: 4,
      paddingHorizontal: 16,
    },
    userMessage: {
      alignItems: 'flex-end',
    },
    coachMessage: {
      alignItems: 'flex-start',
    },
    messageCard: {
      maxWidth: '90%',
      borderRadius: 16,
      minHeight: 40,
    },
    messageContent: {
      padding: 12,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
      flexShrink: 1,
    },
    messageTime: {
      fontSize: 12,
      marginTop: 4,
      opacity: 0.7,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    loadingText: {
      marginLeft: 8,
      fontSize: 14,
      fontStyle: 'italic',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    input: {
      flex: 1,
      marginRight: 8,
      maxHeight: 100,
    },
    sendButton: {
      margin: 0,
    },
  });

  const styles = { ...checklistStyles, ...chatStyles };
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Robotics Coach. I can help you with VEX and FIRST tournament questions, game manual information, robot parts, and competition strategies. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Game manual data cache
  const [gameManualData, setGameManualData] = useState<GameManualData | null>(null);

  useEffect(() => {
    // Load game manual data on component mount
    loadGameManualData();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const loadGameManualData = async () => {
    try {
      const manualData = await fetchGameManualData();
      setGameManualData(manualData);
    } catch (error) {
      console.error('Failed to load game manual data:', error);
    }
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerMessage = userMessage.toLowerCase();
    
    try {
      // First, try to find specific information from the real PDF fetcher
      const realPDFResults = await realPDFFetcher.searchInRealPDF(userMessage);
      const specificRealSection = await realPDFFetcher.getSectionFromRealPDF(userMessage.toLowerCase().replace(/\s+/g, '_'));
      
      // Search for specific keywords and provide direct answers
      const lowerMessage = userMessage.toLowerCase();
      
      // Check for specific size-related questions
      if (lowerMessage.includes('size') || lowerMessage.includes('dimension') || lowerMessage.includes('18') || lowerMessage.includes('inch')) {
        const sizeSection = await realPDFFetcher.getSectionFromRealPDF('robot_size_limits');
        if (sizeSection) {
          return `Robot Size Limits (from official PDF):

${sizeSection}

This information comes directly from the official VEX game manual PDF.`;
        }
      }
      
      // Check for specific weight questions
      if (lowerMessage.includes('weight') || lowerMessage.includes('pound') || lowerMessage.includes('15')) {
        const inspectionSection = await realPDFFetcher.getSectionFromRealPDF('inspection_checklist');
        if (inspectionSection) {
          return `Robot Weight and Inspection Requirements (from official PDF):

${inspectionSection}

This information comes directly from the official VEX game manual PDF.`;
        }
      }
      
      // Check for field dimension questions
      if (lowerMessage.includes('field') && (lowerMessage.includes('size') || lowerMessage.includes('dimension') || lowerMessage.includes('12'))) {
        const fieldSection = await realPDFFetcher.getSectionFromRealPDF('field_dimensions');
        if (fieldSection) {
          return `Field Dimensions (from official PDF):

${fieldSection}

This information comes directly from the official VEX game manual PDF.`;
        }
      }
      
      // Check for scoring questions
      if (lowerMessage.includes('score') || lowerMessage.includes('point') || lowerMessage.includes('block')) {
        const scoringSection = await realPDFFetcher.getSectionFromRealPDF('scoring_detailed');
        if (scoringSection) {
          return `Scoring Rules (from official PDF):

${scoringSection}

This information comes directly from the official VEX game manual PDF.`;
        }
      }
      
      // Check for match timing questions
      if (lowerMessage.includes('time') || lowerMessage.includes('second') || lowerMessage.includes('period') || lowerMessage.includes('15') || lowerMessage.includes('105')) {
        const autonomousSection = await realPDFFetcher.getSectionFromRealPDF('autonomous_period');
        const driverSection = await realPDFFetcher.getSectionFromRealPDF('driver_controlled');
        if (autonomousSection && driverSection) {
          return `Match Timing (from official PDF):

${autonomousSection}

${driverSection}

This information comes directly from the official VEX game manual PDF.`;
        }
      }
      
      // Check for penalty and violation questions
      if (lowerMessage.includes('penalty') || lowerMessage.includes('violation') || lowerMessage.includes('disqualification') || lowerMessage.includes('holding')) {
        const penaltySection = await realPDFFetcher.getSectionFromRealPDF('penalties_violations');
        if (penaltySection) {
          return `Penalties and Violations (from official PDF):

${penaltySection}

This information comes directly from the official VEX game manual PDF.`;
        }
      }
      
      // Check for timeout questions
      if (lowerMessage.includes('timeout') || lowerMessage.includes('2 minute')) {
        const timeoutSection = await realPDFFetcher.getSectionFromRealPDF('timeout_rules');
        if (timeoutSection) {
          return `Timeout Rules (from official PDF):

${timeoutSection}

This information comes directly from the official VEX game manual PDF.`;
        }
      }
      
      // Check for field modification questions
      if (lowerMessage.includes('modification') || lowerMessage.includes('field') && lowerMessage.includes('change') || lowerMessage.includes('tape')) {
        const modificationSection = await realPDFFetcher.getSectionFromRealPDF('field_modifications');
        if (modificationSection) {
          return `Permitted Field Modifications (from official PDF):

${modificationSection}

This information comes directly from the official VEX game manual PDF.`;
        }
      }
      
      if (specificRealSection) {
        return `Official Game Manual Information:

${specificRealSection}

This information comes directly from the official VEX game manual PDF. Would you like to know more about this section or ask about something else?`;
      }
      
      if (realPDFResults.length > 0) {
        const gameInfo = getCurrentGameInfo();
        const infoText = realPDFResults.slice(0, 2).join('\n\n'); // Limit to 2 sections to avoid cutoff
        
        return `Based on the ${gameInfo.description} Game Manual:

${infoText}

This information comes directly from the official game manual PDF. Ask me about specific rules, parts, or strategies.`;
      }

      // Fallback to PDF parser
      const pdfSections = await pdfParser.searchInPDF(userMessage);
      const specificSection = await pdfParser.getSectionByTitle(userMessage);
      
      if (specificSection) {
        return `${specificSection.title} (Page ${specificSection.pageNumber}):

${specificSection.content}

This information comes directly from the official VEX game manual. Would you like to know more about this section or ask about something else?`;
      }
      
      if (pdfSections.length > 0) {
        const gameInfo = getCurrentGameInfo();
        const infoText = pdfSections.slice(0, 2).map(section => 
          `${section.title} (Page ${section.pageNumber}):\n${section.content}`
        ).join('\n\n'); // Limit to 2 sections to avoid cutoff
        
        return `Based on the ${gameInfo.description} Game Manual:

${infoText}

This information comes directly from the official game manual. Ask me about specific rules, parts, or strategies.`;
      }

      // Fallback to game manual parser
      const relevantInfo = await gameManualParser.findRelevantInformation(userMessage);
      const specificRule = await gameManualParser.getSpecificRule(userMessage);
      
      if (specificRule) {
        return `Specific Rule Found:

${specificRule}

This is from the official VEX V5 Robotics Competition Push Back Game Manual. Would you like to know more about this rule or ask about something else?`;
      }
      
      if (relevantInfo.length > 0) {
        const gameInfo = getCurrentGameInfo();
        const infoText = relevantInfo.slice(0, 2).join('\n\n'); // Limit to 2 sections to avoid cutoff
        
        return `Based on the ${gameInfo.description} Game Manual:

${infoText}

This information comes directly from the official game manual. Ask me about specific rules, parts, or strategies.`;
      }

      // Fallback to keyword-based responses with specific information
      if (lowerMessage.includes('game manual') || lowerMessage.includes('rules') || lowerMessage.includes('scoring')) {
        const scoringSection = await getGameManualSection('scoring');
        const safetySection = await getGameManualSection('safety');
        const fieldSection = await getGameManualSection('field');
        
        return `Based on the current VEX V5 Robotics Competition Push Back Game Manual (v1.0, June 26, 2025):

${scoringSection || 'Scoring Rules:\nAll scoring is evaluated after the match ends\nBlocks must be in contact with the inside surface of plastic troughs to be scored\nAutonomous bonus is scored immediately after the autonomous period'}

${safetySection || 'Key Safety Rules:\nStudents must be accompanied by adults\nStay inside the field boundaries\nSafety glasses required\nParticipant release forms must be completed'}

${fieldSection || 'Field Specifications:\nBlock mass: 40 ± 4 grams\nVarious goals and zones with specific dimensions\nField modifications permitted with threadlocker and non-VEX white electrical tape'}

Would you like specific details about any particular rule or aspect?`;
      }

      // Tournament questions
      if (lowerMessage.includes('tournament') || lowerMessage.includes('competition') || lowerMessage.includes('event')) {
        const tournamentSection = await getGameManualSection('tournament');
        const allianceSection = await realPDFFetcher.getSectionFromRealPDF('alliance_selection');
        const skillsSection = await realPDFFetcher.getSectionFromRealPDF('robot_skills');
        const proceduresSection = await realPDFFetcher.getSectionFromRealPDF('tournament_procedures');
        
        return `VEX Tournament Information:

${allianceSection || 'Alliance Selection Process:\nTop 8 teams automatically qualify for elimination rounds\nRemaining teams selected by qualified teams\nEach alliance captain selects 2 partners\nSelection order based on qualification ranking'}

${skillsSection || 'Robot Skills Challenge Rules:\n60-second programming skills matches\n60-second driver skills matches\nMaximum 3 programming skills attempts\nMaximum 3 driver skills attempts\nBest score from each type counts toward team ranking'}

${proceduresSection || 'Tournament Procedures:\nHead referees have final authority on all decisions\nEngineering notebook review required for awards\nTeam interviews conducted by judges\nAwards ceremony at conclusion of tournament'}

${tournamentSection || `Tournament Structure:
Head referees have final authority on all gameplay decisions
Standard tournament procedures and formats
Robot skills challenges available for additional scoring

Preparation Tips:
Ensure robot meets all inspection requirements
Complete all safety documentation
Practice both autonomous and driver-controlled periods
Test all mechanisms thoroughly before competition

Tournament Day Checklist:
Robot and controller ready
Spare parts and tools packed
Engineering notebook updated
Team information and documentation`}

What specific tournament aspect would you like to know more about?`;
      }

      // Robot parts questions
      if (lowerMessage.includes('parts') || lowerMessage.includes('robot') || lowerMessage.includes('mechanism') || lowerMessage.includes('motor')) {
        const robotSection = await getGameManualSection('robot');
        const inspectionSection = await realPDFFetcher.getSectionFromRealPDF('inspection_checklist');
        const sizeSection = await realPDFFetcher.getSectionFromRealPDF('robot_size_limits');
        
        return `VEX Robot Parts & Design:

${sizeSection || 'Robot Size Limits:\nStarting size: 18" x 18" x 18" maximum\nWeight limit: 15 pounds maximum\nAll parts must be contained within starting size at match start'}

${inspectionSection || 'Inspection Requirements:\nRobot must pass inspection before competition\nAll mechanisms must be safe and secure\nAutonomous programming must be tested and verified\nDriver controls must be clearly labeled'}

${robotSection || `Essential Components:
V5 Brain - Main controller
V5 Motors - Various types for different applications
V5 Smart Motors - Integrated encoders
V5 Controller - Driver control interface
VEXnet Keys - Wireless communication

Design Considerations:
Follow size constraints (check current game manual)
Ensure mechanisms are robust and reliable
Consider field variances in your design
Test all systems thoroughly

Common Mechanisms:
Intake systems for game objects
Lift mechanisms for scoring
Drive systems (tank drive, mecanum, etc.)
Autonomous programming

Tips:
Use CAD software for design planning
Prototype mechanisms before final assembly
Document your design process
Keep spare parts for critical components`}

Need help with a specific mechanism or part?`;
      }

      // Strategy questions
      if (lowerMessage.includes('strategy') || lowerMessage.includes('tactics') || lowerMessage.includes('approach')) {
        return `Competition Strategy Tips:

Pre-Match Strategy:
Analyze the game objectives and scoring opportunities
Develop both autonomous and driver-controlled strategies
Practice alliance coordination
Plan for different field conditions

During Competition:
Adapt to opponent strategies
Communicate effectively with alliance partners
Stay calm under pressure
Focus on consistent performance

Post-Match Analysis:
Review match recordings
Identify areas for improvement
Update strategies based on results
Learn from other teams' approaches

Key Success Factors:
Reliable robot performance
Effective driver skills
Strong alliance partnerships
Quick problem-solving abilities

What specific strategic aspect would you like to discuss?`;
      }

      // Default response
      return `I'm here to help with your robotics questions! I can provide information about:

Game Manual & Rules - Current VEX competition rules and specifications
Tournaments - Competition structure, preparation, and procedures  
Robot Design - Parts, mechanisms, and technical guidance
Strategy - Competition tactics and team coordination

Try asking about specific rules, robot parts, tournament procedures, or competition strategies. I'll provide accurate, up-to-date information based on the latest VEX documentation.`;

    } catch (error) {
      console.error('Error generating response:', error);
      
      // Fallback response
      return `I'm here to help with your robotics questions! I can provide information about:

Game Manual & Rules - Current VEX competition rules and specifications
Tournaments - Competition structure, preparation, and procedures  
Robot Design - Parts, mechanisms, and technical guidance
Strategy - Competition tactics and team coordination

Try asking about specific rules, robot parts, tournament procedures, or competition strategies. I'll provide accurate, up-to-date information based on the latest VEX documentation.`;
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await generateResponse(userMessage.text);
      const coachMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, coachMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Robotics Coach</Text>
          
          <ScrollView 
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View 
                key={message.id} 
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessage : styles.coachMessage
                ]}
              >
                <Card 
                  style={[
                    styles.messageCard,
                    { 
                      backgroundColor: message.isUser 
                        ? paperTheme.colors.primary 
                        : paperTheme.colors.surfaceVariant 
                    }
                  ]}
                >
                  <Card.Content style={styles.messageContent}>
                    <Text 
                      style={[
                        styles.messageText,
                        { 
                          color: message.isUser 
                            ? '#ffffff' 
                            : paperTheme.colors.onSurfaceVariant 
                        }
                      ]}
                    >
                      {message.text}
                    </Text>
                    <Text 
                      style={[
                        styles.messageTime,
                        { 
                          color: message.isUser 
                            ? 'rgba(255,255,255,0.7)' 
                            : paperTheme.colors.onSurfaceVariant 
                        }
                      ]}
                    >
                      {formatTime(message.timestamp)}
                    </Text>
                  </Card.Content>
                </Card>
              </View>
            ))}
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={paperTheme.colors.primary} />
                <Text style={[styles.loadingText, { color: paperTheme.colors.onSurfaceVariant }]}>
                  Coach is thinking...
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about VEX rules, robot parts, tournaments..."
              style={styles.input}
              mode="outlined"
              multiline
              maxLength={500}
              disabled={isLoading}
              onSubmitEditing={sendMessage}
            />
            <IconButton
              icon="send"
              size={24}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
              iconColor={paperTheme.colors.primary}
              style={styles.sendButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 