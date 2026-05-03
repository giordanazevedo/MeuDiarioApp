import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: 'https://img.freepik.com/vetores-premium/personagem-feminino-trabalhando-no-laptop-ilustracao-3d_6735-853.jpg' }} 
        style={styles.image} 
      />
      
      <Text style={styles.title}>Meu Diário Pessoal</Text>
      <Text style={styles.subtitle}>
        Organize seus sentimentos e tarefas de forma prática e segura.
      </Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/signup')}
      >
        <Text style={styles.buttonText}>Let's Start ➔</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20 },
  image: { width: 300, height: 300, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginVertical: 20 },
  button: { backgroundColor: '#6366f1', paddingVertical: 15, paddingHorizontal: 60, borderRadius: 30 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});