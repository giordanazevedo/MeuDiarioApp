import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DetalhesEvento() {
  const { titulo, dataSelecionada } = useLocalSearchParams();
  const router = useRouter();

  // Lógica para calcular os dias restantes
  const calcularDias = () => {
    if (!dataSelecionada) return 0;
    const dataAlvo = new Date(dataSelecionada as string);
    const hoje = new Date();
    const diffTime = dataAlvo.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <View style={styles.container}>
      {/* Imagem de topo (ajuste o caminho se tiver uma imagem local) */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15' }} 
        style={styles.headerImage}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </ImageBackground>

      <View style={styles.content}>
        <Text style={styles.eventTitle}>{titulo || 'Evento'}</Text>
        <Text style={styles.eventDate}>
          {dataSelecionada ? new Date(dataSelecionada as string).toLocaleDateString('pt-BR') : ''}
        </Text>

        <View style={styles.infoCard}>
          <Ionicons name="hourglass-outline" size={24} color="#E94D89" />
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Próximo aniversário</Text>
            <Text style={styles.infoValue}>{calcularDias()} dias</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.configBtn}>
          <Text style={styles.configBtnText}>Abrir Configurações</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  headerImage: { width: '100%', height: 250, justifyContent: 'flex-start', padding: 20 },
  backBtn: { marginTop: 20 },
  content: { flex: 1, alignItems: 'center', marginTop: -30, backgroundColor: '#000', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  eventTitle: { color: '#fff', fontSize: 24, fontFamily: 'Manrope_700Bold', marginTop: 20 },
  eventDate: { color: '#666', fontSize: 14, marginBottom: 30 },
  infoCard: { flexDirection: 'row', backgroundColor: '#1A1C1E', width: '100%', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  infoTextGroup: { marginLeft: 15 },
  infoLabel: { color: '#fff', fontSize: 14 },
  infoValue: { color: '#E94D89', fontSize: 18, fontWeight: 'bold' },
  configBtn: { borderWidth: 1, borderColor: '#333', padding: 15, borderRadius: 25, width: '80%', alignItems: 'center', marginTop: 'auto', marginBottom: 30 },
  configBtnText: { color: '#fff', fontWeight: 'bold' }
});