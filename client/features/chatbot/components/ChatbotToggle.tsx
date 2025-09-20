import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { IconButton } from 'react-native-paper';
import Chatbot from './Chatbot';
import { WeatherPayload } from '../../weather/model/types';

interface ChatbotToggleProps {
  weatherData: WeatherPayload | null;
}

const ChatbotToggle: React.FC<ChatbotToggleProps> = ({ weatherData }) => {
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotVisible(!isChatbotVisible);
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={isChatbotVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsChatbotVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.chatbotWrapper}>
            <Chatbot 
              weatherData={weatherData} 
              onClose={() => setIsChatbotVisible(false)} 
            />
          </View>
        </View>
      </Modal>
      
      <IconButton
        icon={isChatbotVisible ? "close" : "message-processing-outline"}
        size={24}
        onPress={toggleChatbot}
        style={styles.toggleButton}
        iconColor="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  chatbotWrapper: {
    height: '70%',
  },
  toggleButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    borderRadius: 24,
    width: 48,
    height: 48,
  },
});

export default ChatbotToggle;