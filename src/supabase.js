import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Sua URL baseada no ID do projeto da imagem
const supabaseUrl = 'https://bhiepahnmoxxcmdyykdy.supabase.co'; 

// Você encontra esta chave no menu lateral: Configurações -> API -> anon public
const supabaseAnonKey = 'sb_publishable_161xCeusuMIGHOtEHCRwuw_7d2lMvWb'; 

const ssrStorage = {
  getItem: () => null,
  setItem: () => null,
  removeItem: () => null,
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' 
      ? (typeof window !== 'undefined' ? window.localStorage : ssrStorage) 
      : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

