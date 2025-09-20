import { createClient } from '@supabase/supabase-js';

// Add better error handling for missing environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
  throw new Error('supabaseUrl is required. Please check your .env file.');
}

if (!supabaseAnonKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable');
  throw new Error('supabaseAnonKey is required. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);