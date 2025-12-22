import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createChatStyles } from '../styles/chatStyles';
import { SFSymbols, getIconColor, getIconSize } from '../utils/sfSymbols';
import { useNavigation } from '@react-navigation/native';
import { VexAssistantService } from '../utils/vexAssistantService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function VexAssistantScreen() {
  const { isDarkMode } = useTheme();
  const chatStyles = createChatStyles(isDarkMode);
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your VEX Robotics assistant. I can help answer questions about VEX competitions, rules, robot building, programming, and more. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'VEX Assistant',
    });
  }, [navigation]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
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
      const response = await VexAssistantService.getResponse(userMessage.text);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error processing your question. Please try again.",
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
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={chatStyles.safeArea} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={chatStyles.container}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={chatStyles.messagesContainer}
          contentContainerStyle={chatStyles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                chatStyles.messageBubble,
                message.isUser ? chatStyles.userBubble : chatStyles.assistantBubble
              ]}
            >
              <Text style={[
                chatStyles.messageText,
                message.isUser ? chatStyles.userText : chatStyles.assistantText
              ]}>
                {message.text}
              </Text>
              <Text style={[
                chatStyles.timestamp,
                message.isUser ? chatStyles.userTimestamp : chatStyles.assistantTimestamp
              ]}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          ))}
          
          {isLoading && (
            <View style={[chatStyles.messageBubble, chatStyles.assistantBubble]}>
              <ActivityIndicator color={getIconColor(isDarkMode, 'primary')} />
            </View>
          )}
        </ScrollView>

        <View style={chatStyles.inputContainer}>
          <TextInput
            style={chatStyles.input}
            placeholder="Ask about VEX Robotics..."
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              chatStyles.sendButton,
              (!inputText.trim() || isLoading) && chatStyles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={getIconSize('medium')}
              color={(!inputText.trim() || isLoading) ? 
                (isDarkMode ? '#4B5563' : '#D1D5DB') : 
                getIconColor(isDarkMode, 'primary')
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}