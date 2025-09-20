import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useChatbot } from '../hooks/useChatbot';
import { WeatherPayload } from '../../weather/model/types';
import { IconButton } from 'react-native-paper';

interface ChatbotProps {
  weatherData: WeatherPayload | null;
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ weatherData, onClose }) => {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const { messages, isLoading, error, sendMessage, clearChat } = useChatbot(weatherData);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const handleClear = () => {
    clearChat();
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.role === 'user';
    
    // Split response into sentences for better readability
    const sentences = item.content.split(/(?<=[.!?])\s+/);
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.assistantMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {sentences.map((sentence: string, index: number) => (
            <Text 
              key={index} 
              style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}
            >
              {sentence.trim()}
              {index < sentences.length - 1 && '.'}
            </Text>
          ))}
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weather Assistant</Text>
        <View style={styles.headerActions}>
          <IconButton 
            icon="refresh" 
            size={20} 
            onPress={handleClear}
            iconColor="#fff"
          />
          <IconButton 
            icon="close" 
            size={20} 
            onPress={onClose}
            iconColor="#fff"
          />
        </View>
      </View>

      {/* Using FlatList directly instead of nesting inside ScrollView */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        // Add these props to fix the nesting issue
        scrollEnabled={true}
        nestedScrollEnabled={true}
      />

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about the weather..."
          placeholderTextColor="rgba(255,255,255,0.7)"
          multiline
          maxLength={200}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>
            {isLoading ? '...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 20,
    overflow: 'hidden',
    margin: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(0, 122, 255, 0.5)',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    padding: 16,
    fontStyle: 'italic',
  },
});

export default Chatbot;