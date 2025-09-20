# Weather Chatbot Feature

## Overview
The weather chatbot allows users to interact with an AI assistant to ask questions about current weather conditions. The chatbot provides contextual responses based on the current weather data.

## Features
- Interactive chat interface
- Context-aware responses based on current weather data
- Support for common weather questions
- Clean, modern UI that integrates with the app's design

## Implementation Details

### Services
The chatbot uses a rule-based approach for generating responses to ensure:
1. No external API dependencies (fully free and unlimited)
2. Fast response times
3. Privacy (no data sent to external servers)

### Common Questions Supported
- Temperature-related questions ("Is it hot?", "What's the temperature?")
- Precipitation inquiries ("Should I bring an umbrella?", "Will it rain?")
- Wind conditions ("Is it windy?")
- Humidity levels ("Is it humid?")
- General weather conditions ("Is it sunny?")

### UI Components
1. `ChatbotToggle.tsx` - Floating button to open/close the chatbot
2. `Chatbot.tsx` - Main chat interface with message history
3. `useChatbot.ts` - Hook for managing chat state and interactions
4. `chatbotService.ts` - Service for generating weather-aware responses

## Usage
Users can tap the chatbot icon (speech bubble) in the bottom-right corner of the weather screen to open the chat interface. They can then type questions about the current weather and receive immediate responses.

## Future Enhancements
- Integration with actual AI models using free-tier APIs
- Support for more complex weather queries
- Voice input support
- Multi-language support