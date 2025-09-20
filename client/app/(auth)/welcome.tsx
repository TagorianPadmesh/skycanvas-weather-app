import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { storage } from '../../utils/storage';

export default function WelcomeScreen() {
  const [hasRememberedUser, setHasRememberedUser] = useState(false);
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkRememberedUser = async () => {
      const rememberMe = await storage.getRememberMe();
      const email = await storage.getUserEmail();
      
      if (rememberMe && email) {
        setHasRememberedUser(true);
        setRememberedEmail(email);
      }
    };
    
    checkRememberedUser();
  }, []);
  return (
    <LinearGradient
      colors={['#74b9ff', '#0984e3']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="displayLarge" style={styles.title}>
          ☀️ Weather App
        </Text>
        <Text variant="headlineSmall" style={styles.subtitle}>
          Your personal weather companion
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          Get real-time weather updates, forecasts, and beautiful dynamic backgrounds that change with the weather.
        </Text>
        
        <View style={styles.buttonContainer}>
          {hasRememberedUser && rememberedEmail && (
            <>
              <Text style={styles.welcomeBackText}>
                Welcome back, {rememberedEmail.split('@')[0]}!
              </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Button mode="contained" style={styles.primaryButton} textColor="#0984e3">
                  Continue as {rememberedEmail.split('@')[0]}
                </Button>
              </Link>
              <View style={styles.divider}>
                <Text style={styles.dividerText}>or</Text>
              </View>
            </>
          )}
          
          <Link href="/(auth)/sign-up" asChild>
            <Button 
              mode={hasRememberedUser ? "outlined" : "contained"} 
              style={hasRememberedUser ? styles.secondaryButton : styles.primaryButton} 
              textColor={hasRememberedUser ? "#fff" : "#0984e3"}
            >
              Get Started
            </Button>
          </Link>
          
          <Link href="/(auth)/sign-in" asChild>
            <Button mode="outlined" style={styles.secondaryButton} textColor="#fff">
              {hasRememberedUser ? 'Sign in as different user' : 'Sign In'}
            </Button>
          </Link>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 48,
    opacity: 0.9,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  secondaryButton: {
    borderColor: '#fff',
    borderWidth: 2,
    marginBottom: 8,
  },
  welcomeBackText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '400',
  },
});