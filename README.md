# 🌦️ SkyCanvas - Advanced React Native Weather Application

A beautiful, feature-rich weather application built with React Native and Expo, featuring dynamic backgrounds, AI-powered summaries, and comprehensive weather data.

## ✨ Features

### 🔍 **Smart City Search**
- Global city search with Google Geocoding API
- Open-Meteo geocoding fallback for reliability
- Real-time search suggestions
- GPS location detection with permissions

### 🎨 **Dynamic Weather Backgrounds**
- 20+ gradient combinations for different weather conditions
- Real-time day/night detection using city timezones
- Animated weather effects:
  - Rain animations for rainy conditions
  - Snow animations for winter weather
  - Cloud movements for overcast skies
  - Lightning effects for thunderstorms
  - Night sky with moon, stars, and shooting stars
  - Sun effects for clear sunny days

### 🌡️ **Comprehensive Weather Data**
- Current weather conditions
- 24-hour hourly forecasts
- 10-day daily forecasts
- Air quality monitoring (PM2.5, PM10, UV Index)
- Temperature unit conversion (Celsius ↔ Fahrenheit)
- Wind speed, humidity, and precipitation data

### 🤖 **AI-Powered Weather Summaries**
- Natural language weather descriptions using OpenAI
- Context-aware summaries based on current conditions
- Intelligent fallback summaries when AI is unavailable

### 💾 **Smart Data Management**
- React Query for intelligent caching
- 10-minute data freshness with stale indicators
- Offline support with AsyncStorage
- Optimized API usage to reduce data consumption

### 🎯 **Modern UI/UX**
- Glassmorphism design system
- Smooth animations and transitions
- Loading states and error handling
- Responsive design for all screen sizes
- Professional weather icons

### 🔐 **User Authentication**
- Supabase authentication integration
- User session management
- Protected routes and personalization ready

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: Zustand + React Query
- **UI Components**: React Native Paper
- **Backend**: Supabase
- **APIs**: Open-Meteo, Google Maps, OpenAI
- **Storage**: AsyncStorage

## 📱 Screenshots

*Add screenshots of your app here*

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skycanvas-weather-app.git
   cd skycanvas-weather-app
   ```

2. **Navigate to the client directory**
   ```bash
   cd client
   ```

3. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Set up environment variables**
   
   Copy the `.env.example` file to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

   Required API keys:
   - `EXPO_PUBLIC_OPENAI_API_KEY`: OpenAI API key for AI weather summaries
   - `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key for geocoding
   - `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

5. **Start the development server**
   ```bash
   npx expo start
   ```

6. **Run on your device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator, `a` for Android emulator

## 🔑 API Setup

### OpenAI API (Optional but Recommended)
1. Sign up at [OpenAI](https://openai.com/api/)
2. Create an API key
3. Add to your `.env` file as `EXPO_PUBLIC_OPENAI_API_KEY`

### Google Maps API (Optional but Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Geocoding API
3. Create an API key
4. Add to your `.env` file as `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

### Supabase (Required for Authentication)
1. Sign up at [Supabase](https://supabase.com/)
2. Create a new project
3. Get your project URL and anon key from Settings > API
4. Add to your `.env` file

### Open-Meteo API
- **No API key required!** 
- Free weather data with excellent coverage
- Automatic fallback for geocoding

## 📁 Project Structure

```
client/
├── app/                        # App router pages
│   ├── index.tsx              # Main weather dashboard
│   ├── cities.tsx             # Cities management
│   └── (auth)/               # Authentication screens
├── components/                # Reusable UI components
│   ├── layout/               # Layout components
│   └── unitToggle.tsx        # Temperature unit toggle
├── features/                  # Feature-based modules
│   ├── weather/              # Weather functionality
│   │   ├── api/              # Weather API clients
│   │   ├── components/       # Weather UI components
│   │   ├── hooks/           # Weather-related hooks
│   │   └── services/        # Weather services
│   ├── search/              # City search functionality
│   └── chatbot/             # AI chatbot integration
├── theme/                    # Design system
│   ├── gradients.ts         # Weather gradients
│   └── paperTheme.ts        # Material theme
└── utils/                   # Utility functions
    ├── conversions.ts       # Unit conversions
    └── locationManager.ts   # Location services
```

## 🌟 Key Features Explained

### Dynamic Backgrounds
The app features intelligent background systems that change based on:
- **Weather Conditions**: Different gradients for sunny, cloudy, rainy, snowy weather
- **Time of Day**: Real-time detection using the city's actual timezone
- **Seasonal Changes**: Appropriate colors and effects for different times

### Smart Caching
- Weather data is cached for 10 minutes to reduce API calls
- Stale indicators show when data needs refreshing
- Offline support maintains functionality without internet

### Multi-API Integration
- Primary: Open-Meteo API (free, reliable weather data)
- Geocoding: Google Maps API with Open-Meteo fallback
- AI: OpenAI for natural language summaries
- Backend: Supabase for user management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Open-Meteo](https://open-meteo.com/) for free weather API
- [Expo](https://expo.dev/) for the amazing development platform
- [React Native Paper](https://callstack.github.io/react-native-paper/) for UI components
- [Supabase](https://supabase.com/) for backend services

## 📞 Support

If you have any questions or need help setting up the project, please open an issue or contact [your-email@example.com].

---

**SkyCanvas** - Made with ❤️ using React Native and Expo