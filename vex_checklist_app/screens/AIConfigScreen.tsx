import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TextInput, 
  Button, 
  Card, 
  useTheme as usePaperTheme,
  Switch,
  Divider
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../App';
import { createChecklistStyles } from '../styles/checklistStyles';
import { aiModel } from '../utils/aiModel';

const AI_CONFIG_KEY = 'ai_config';

interface AIConfig {
  apiKey: string;
  enabled: boolean;
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4-turbo';
}

export default function AIConfigScreen() {
  const { isDarkMode } = useTheme();
  const paperTheme = usePaperTheme();
  const checklistStyles = createChecklistStyles(isDarkMode);
  
  const [config, setConfig] = useState<AIConfig>({
    apiKey: '',
    enabled: false,
    model: 'gpt-4'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem(AI_CONFIG_KEY);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        
        // Configure AI model if API key is available
        if (parsedConfig.apiKey && parsedConfig.enabled) {
          aiModel.configure(parsedConfig.apiKey);
        }
      }
    } catch (error) {
      console.error('Error loading AI config:', error);
    }
  };

  const saveConfig = async () => {
    try {
      setIsLoading(true);
      
      // Validate API key format
      if (config.apiKey && !config.apiKey.startsWith('sk-')) {
        Alert.alert('Invalid API Key', 'Please enter a valid OpenAI API key that starts with "sk-"');
        return;
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
      
      // Configure AI model
      if (config.apiKey && config.enabled) {
        aiModel.configure(config.apiKey);
      }
      
      Alert.alert('Success', 'AI configuration saved successfully!');
      
    } catch (error) {
      console.error('Error saving AI config:', error);
      Alert.alert('Error', 'Failed to save configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const testAIConnection = async () => {
    if (!config.apiKey) {
      Alert.alert('No API Key', 'Please enter your OpenAI API key first.');
      return;
    }

    try {
      setIsTesting(true);
      
      // Configure AI model temporarily for testing
      aiModel.configure(config.apiKey);
      
      // Test with a simple question
      const testQuestion = "What is the robot size limit?";
      const parsedQuestion = {
        originalQuestion: testQuestion,
        intent: { type: 'size' as const, confidence: 0.9, keywords: ['size', 'limit'] },
        searchTerms: ['size', 'limit'],
        expectedAnswerType: 'measurement' as const
      };
      
      const response = await aiModel.generateResponse(testQuestion, parsedQuestion);
      
      if (response.source === 'hybrid' || response.source === 'ai') {
        Alert.alert(
          'AI Connection Successful', 
          'Your OpenAI API key is working correctly! AI-enhanced responses are now available.'
        );
      } else {
        Alert.alert(
          'Manual Mode Active', 
          'AI is not responding, but manual responses are working. Check your API key and internet connection.'
        );
      }
      
    } catch (error) {
      console.error('AI test failed:', error);
      Alert.alert(
        'Connection Failed', 
        'Unable to connect to OpenAI. Please check your API key and internet connection.'
      );
    } finally {
      setIsTesting(false);
    }
  };

  const clearConfig = async () => {
    Alert.alert(
      'Clear Configuration',
      'Are you sure you want to clear your AI configuration? This will remove your API key.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(AI_CONFIG_KEY);
              setConfig({ apiKey: '', enabled: false, model: 'gpt-4' });
              Alert.alert('Cleared', 'AI configuration has been cleared.');
            } catch (error) {
              console.error('Error clearing config:', error);
              Alert.alert('Error', 'Failed to clear configuration.');
            }
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    card: {
      marginBottom: 16,
    },
    input: {
      marginBottom: 16,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    button: {
      flex: 1,
      marginHorizontal: 4,
    },
    infoText: {
      fontSize: 14,
      marginBottom: 16,
      lineHeight: 20,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
  });

  return (
    <SafeAreaView style={checklistStyles.safeArea}>
      <View style={styles.container}>
        <Text style={checklistStyles.title}>AI Configuration</Text>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.infoText}>
              Enable AI-enhanced responses for more natural and detailed answers to your VEX Robotics questions.
            </Text>
            
            <View style={styles.statusContainer}>
              <View 
                style={[
                  styles.statusDot, 
                  { 
                    backgroundColor: aiModel.isAIConfigured() 
                      ? paperTheme.colors.primary 
                      : paperTheme.colors.outline 
                  }
                ]} 
              />
              <Text style={{ color: paperTheme.colors.onSurface }}>
                AI Status: {aiModel.isAIConfigured() ? 'Connected' : 'Not Configured'}
              </Text>
            </View>

            <View style={styles.switchContainer}>
              <Text style={{ color: paperTheme.colors.onSurface }}>Enable AI Responses</Text>
              <Switch
                value={config.enabled}
                onValueChange={(value) => setConfig(prev => ({ ...prev, enabled: value }))}
                color={paperTheme.colors.primary}
              />
            </View>

            <TextInput
              label="OpenAI API Key"
              value={config.apiKey}
              onChangeText={(text) => setConfig(prev => ({ ...prev, apiKey: text }))}
              mode="outlined"
              secureTextEntry
              placeholder="sk-..."
              style={styles.input}
              disabled={!config.enabled}
            />

            <Text style={styles.infoText}>
              Your API key is stored locally on your device and is never shared. 
              You can get an API key from{' '}
              <Text 
                style={{ color: paperTheme.colors.primary }}
                onPress={() => {
                  // In a real app, you'd open the URL
                  Alert.alert('OpenAI', 'Visit https://platform.openai.com/api-keys to get your API key');
                }}
              >
                OpenAI's website
              </Text>
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={checklistStyles.title}>Features</Text>
            <Text style={styles.infoText}>
              • More natural conversation flow{'\n'}
              • Detailed explanations of rules{'\n'}
              • Context-aware responses{'\n'}
              • Fallback to manual data if AI fails{'\n'}
              • Always based on official VEX documentation
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={testAIConnection}
            disabled={!config.enabled || !config.apiKey || isTesting}
            loading={isTesting}
            style={styles.button}
          >
            Test Connection
          </Button>
          
          <Button
            mode="outlined"
            onPress={clearConfig}
            disabled={isLoading}
            style={styles.button}
            textColor={paperTheme.colors.error}
          >
            Clear Config
          </Button>
        </View>

        <Button
          mode="contained"
          onPress={saveConfig}
          disabled={isLoading}
          loading={isLoading}
          style={{ marginTop: 16 }}
        >
          Save Configuration
        </Button>
      </View>
    </SafeAreaView>
  );
} 