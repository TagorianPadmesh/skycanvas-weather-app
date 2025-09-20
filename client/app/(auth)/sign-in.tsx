import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Checkbox } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { storage } from '../../utils/storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignIn(){
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved email and remember me preference on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      const savedRememberMe = await storage.getRememberMe();
      if (savedRememberMe) {
        setRememberMe(true);
        const savedEmail = await storage.getUserEmail();
        if (savedEmail) {
          setEmail(savedEmail);
        }
      }
    };
    loadSavedData();
  }, []);

  const onSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    
    if (!err) {
      // Save remember me preference and email if successful
      if (rememberMe) {
        await storage.setRememberMe(true);
        await storage.setUserEmail(email);
      } else {
        await storage.clearRememberMe();
      }
      router.replace('/');
    } else {
      setError(err.message);
    }
    
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#74b9ff', '#0984e3']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant='displayMedium' style={styles.title}>Welcome Back</Text>
        <Text variant='bodyLarge' style={styles.subtitle}>Sign in to continue</Text>
        
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
          
          {/* Remember Me Checkbox */}
          <TouchableOpacity 
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <Checkbox
              status={rememberMe ? 'checked' : 'unchecked'}
              onPress={() => setRememberMe(!rememberMe)}
              color="#fff"
              uncheckedColor="rgba(255,255,255,0.7)"
            />
            <Text style={styles.rememberMeText}>
              Remember me
            </Text>
          </TouchableOpacity>
          
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          
          <Button 
            mode='contained' 
            onPress={onSignIn} 
            loading={loading} 
            disabled={loading}
            style={styles.signInButton}
            labelStyle={styles.signInButtonText}
          >
            Sign in
          </Button>
          
          <Text style={styles.linkText}>
            No account?{' '}
            <Link href='/(auth)/sign-up' style={styles.link}>
              Create one
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
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 48,
  },
  formContainer: {
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 16,
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  rememberMeText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  errorText: {
    color: '#fff',
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: '#fff',
    marginBottom: 24,
    paddingVertical: 6,
  },
  signInButtonText: {
    color: '#0984e3',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  link: {
    color: '#fff',
    fontWeight: 'bold',
  },
});