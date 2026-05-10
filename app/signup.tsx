
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase } from '../src/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      router.push('/');
    }
  }

  return (
    <LinearGradient
      colors={['#41386B', '#A88AED', '#CBD83B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Bem-vinda 💜</Text>

        <Text style={styles.subtitle}>
          Entre na sua conta e organize sua rotina com leveza.
        </Text>

        <TextInput
          placeholder="Seu e-mail"
          placeholderTextColor="#8E8AA7"
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          placeholder="Senha"
          placeholderTextColor="#8E8AA7"
          secureTextEntry
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/signup')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>
            Criar nova conta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>
            Esqueceu sua senha?
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  card: {
    backgroundColor: '#FFFCEC',
    borderRadius: 30,
    padding: 28,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.12,
    shadowRadius: 20,

    elevation: 10,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#41386B',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    color: '#6E6A7E',
    marginBottom: 35,
    lineHeight: 22,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E1F2',

    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,

    fontSize: 16,
    color: '#2D2A3A',

    marginBottom: 18,
  },

  button: {
    backgroundColor: '#CBD83B',

    paddingVertical: 18,
    borderRadius: 18,

    alignItems: 'center',
    marginTop: 10,

    shadowColor: '#CBD83B',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,

    elevation: 5,
  },

  buttonText: {
    color: '#41386B',
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryButton: {
    marginTop: 15,

    borderWidth: 1.5,
    borderColor: '#A88AED',

    paddingVertical: 16,
    borderRadius: 18,

    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#A88AED',
    fontSize: 15,
    fontWeight: '700',
  },

  forgotPassword: {
    textAlign: 'center',
    color: '#6E6A7E',
    marginTop: 25,
    fontSize: 14,
  },
});

