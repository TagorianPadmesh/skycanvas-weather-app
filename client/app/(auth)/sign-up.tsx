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
