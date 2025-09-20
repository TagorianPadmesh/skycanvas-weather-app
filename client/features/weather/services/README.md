# AI Weather Summary Service

This service provides AI-generated weather summaries using OpenAI for a more human-readable weather experience.

## Supported Provider

**OpenAI GPT** - High quality weather summaries with free tier available

## Setup

1. Get an OpenAI API key:
   - Sign up at [platform.openai.com](https://platform.openai.com/)
   - Get your API key from the dashboard

2. Add the API key to your `.env` file:
   ```env
   # OpenAI API Key for GPT-based weather summaries
   # Free tier: $5 credit for 3 months
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

### In a Component

```tsx
import { useAIWeatherSummary } from '../hooks/useAIWeatherSummary';

function WeatherComponent({ weatherData }) {
  const { summary, loading, error } = useAIWeatherSummary({
    weatherData,
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY
  });

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;
  
  return <Text>{summary}</Text>;
}
```

### Direct Service Usage

```tsx
import { createAIProvider } from '../services/aiWeatherSummary';

const provider = createAIProvider(apiKey);
const summary = await provider.generateWeatherSummary(weatherData);
```

## Free Tier Information

- **OpenAI Free Tier**: $5 credit for 3 months
- **Rate Limits**: 3 RPM (requests per minute)
- **Model Used**: GPT-4o-mini (cost-effective, high quality)

## Security Considerations

For production apps, it's recommended to:
1. Use a backend service to proxy API requests
2. Never expose API keys in client-side code
3. Implement rate limiting and caching

## Customization

You can customize the prompt in the service implementation to change the tone or content of the summaries.