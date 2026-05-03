import { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
// Ajustado para buscar na pasta src conforme sua organização
import { supabase } from '../src/supabase'; 
import { useRouter } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // Corrigido de userRouter para useRouter

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ 
      email: email, 
      password: password 
    });

    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      // Redireciona para as abas do app após logar
      router.replace('/(tabs)');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>
      
      <TextInput 
        placeholder="Seu e-mail" 
        onChangeText={setEmail} 
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input} 
      />
      
      <TextInput 
        placeholder="Sua senha" 
        secureTextEntry 
        onChangeText={setPassword} 
        style={styles.input} 
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>ENTRAR</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/signup')}>
  <Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#333', textAlign: 'center' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 25, padding: 10, fontSize: 16 },
  button: { backgroundColor: '#6366f1', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { marginTop: 25, color: '#6366f1', textAlign: 'center' }
});