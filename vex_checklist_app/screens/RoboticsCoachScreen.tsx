import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TextInput, 
  Button, 
  Card, 
  useTheme as usePaperTheme,
  IconButton,
  ActivityIndicator,
  Chip
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
import { ChatGuardrails } from '../utils/chatGuardrails';
import { aiModel } from '../utils/aiModel';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      text: "Hi! I'm your VEX Robotics Coach with AI-powered assistance. I can help you with:\n\n🤖 **AI-Enhanced Responses** - Natural, detailed answers to your questions\n📋 **Game Manual Rules** - Current VEX V5 Robotics Competition Push Back rules\n🤖 **Robot Design** - Size limits (18\"x18\"x18\"), weight (15 lbs), components\n🏆 **Tournament Procedures** - Alliance selection, skills challenges, inspection\n📊 **Scoring System** - Block scoring, autonomous bonus, match timing\n🛡️ **Safety Requirements** - Safety glasses, adult supervision, field boundaries\n\nI provide accurate information directly from the official VEX documentation. Configure AI in the 'AI Config' tab for enhanced responses!",
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
    // Load game manual data and AI configuration on component mount
    loadGameManualData();
    loadAIConfiguration();
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

  const loadAIConfiguration = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem('ai_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.apiKey && config.enabled) {
          aiModel.configure(config.apiKey);
          console.log('AI configuration loaded successfully');
        }
      }
    } catch (error) {
      console.error('Failed to load AI configuration:', error);
    }
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Use the guardrails system to process the user input
      const guardrailsResult = await ChatGuardrails.processUserInput(userMessage);
      
      // If the message is not robotics-related, return the rejection reason
      if (!guardrailsResult.isRoboticsRelated) {
        return guardrailsResult.rejectionReason || "I'm specifically designed to help with VEX Robotics questions. Please ask me about robotics-related topics.";
      }
      
      // If we have a suggested response, use it
      if (guardrailsResult.suggestedResponse) {
        // Validate the response to ensure it's specific
        const validation = ChatGuardrails.validateResponse(guardrailsResult.suggestedResponse);
        
        if (!validation.isValid && validation.improvedResponse) {
          return validation.improvedResponse;
        }
        
        return guardrailsResult.suggestedResponse;
      }
      
      // Fallback response if something goes wrong
      return `I'm your VEX Robotics Coach! I can help with specific questions about:

Game Manual Rules - Current VEX V5 Robotics Competition Push Back rules
Robot Design - Size limits (18"x18"x18"), weight (15 lbs), components
Tournament Procedures - Alliance selection, skills challenges, inspection
Scoring System - Block scoring, autonomous bonus, match timing
Safety Requirements - Safety glasses, adult supervision, field boundaries

Please ask about specific rules, robot specifications, or tournament procedures. I'll provide accurate information from the official VEX documentation.`;

    } catch (error) {
      console.error('Error generating response:', error);
      
      // Fallback response
      return `I'm your VEX Robotics Coach! I can help with specific questions about:

Game Manual Rules - Current VEX V5 Robotics Competition Push Back rules
Robot Design - Size limits (18"x18"x18"), weight (15 lbs), components
Tournament Procedures - Alliance selection, skills challenges, inspection
Scoring System - Block scoring, autonomous bonus, match timing
Safety Requirements - Safety glasses, adult supervision, field boundaries

Please ask about specific rules, robot specifications, or tournament procedures. I'll provide accurate information from the official VEX documentation.`;
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={styles.title}>Robotics Coach</Text>
            <Chip 
              icon={aiModel.isAIConfigured() ? 'robot' : 'robot-off'} 
              mode="outlined"
              textStyle={{ fontSize: 12 }}
            >
              {aiModel.isAIConfigured() ? 'AI Enabled' : 'Manual Mode'}
            </Chip>
          </View>
          
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
              placeholder="Ask about robot size limits, scoring rules, tournament procedures..."
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