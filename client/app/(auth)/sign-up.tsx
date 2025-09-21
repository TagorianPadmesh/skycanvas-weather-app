import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

export default function SignUp(){
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignUp = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.replace('/');
  };

  return (
    <LinearGradient
      colors={['#74b9ff', '#0984e3']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant='displayMedium' style={styles.title}>Join Weather App</Text>
        <Text variant='bodyLarge' style={styles.subtitle}>Create your account to get started</Text>
        
        <View style={styles.formContainer}>
          <TextInput 
            label='Email' 
            autoCapitalize='none' 
            keyboardType='email-address' 
            value={email} 
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            outlineColor="rgba(255,255,255,0.5)" 
            activeOutlineColor="#fff"
            textColor="#333"
            theme={{ 
              colors: { 
                onSurfaceVariant: 'rgba(255,255,255,0.8)',
                background: 'rgba(255,255,255,0.95)'
              } 
            }}
          />
          <TextInput 
            label='Password' 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            outlineColor="rgba(255,255,255,0.5)" 
            activeOutlineColor="#fff"
            textColor="#333"
            theme={{ 
              colors: { 
                onSurfaceVariant: 'rgba(255,255,255,0.8)',
                background: 'rgba(255,255,255,0.95)'
              } 
            }}
          />
          
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          
          <Button 
            mode='contained' 
            onPress={onSignUp} 
            loading={loading} 
            disabled={loading}
            style={styles.signUpButton}
            labelStyle={styles.signUpButtonText}
          >
            Create Account
          </Button>
          
          <Text style={styles.linkText}>
            Already have an account?{' '}
            <Link href='/(auth)/sign-in' style={styles.link}>
              Sign in
            </Link>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  signUpButton: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  signUpButtonText: {
    color: '#0984e3',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 8,
  },
  linkText: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  link: {
    color: '#fff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
