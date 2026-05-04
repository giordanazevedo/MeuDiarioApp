import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const categorias = [
  { id: '1', nome: 'Aniversário', icon: 'gift-outline', cor: '#E94D89' },
  { id: '2', nome: 'Relacionamento', icon: 'heart-outline', cor: '#E94D89' },
  { id: '3', nome: 'Família', icon: 'people-outline', cor: '#E94D89' },
  { id: '4', nome: 'Viagem', icon: 'airplane-outline', cor: '#E94D89' },
  { id: '5', nome: 'Casa', icon: 'home-outline', cor: '#E94D89' },
  { id: '6', nome: 'Trabalho', icon: 'briefcase-outline', cor: '#E94D89' },
];

export default function SelecionarCategoria() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dia importante</Text>
      <Text style={styles.subtitle}>Adicione um dia importante para ser lembrado e veja a contagem regressiva.</Text>
      
      <View style={styles.grid}>
        {categorias.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            onPress={() => router.push({ pathname: '/novo_dia_importante', params: { categoria: item.nome, icon: item.icon } })}
          >
            <Ionicons name={item.icon as any} size={32} color="#E94D89" />
            <Text style={styles.cardText}>{item.nome}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={[styles.card, styles.cardEmpty]}>
          <Ionicons name="add-circle" size={32} color="#E94D89" />
          <Text style={[styles.cardText, { color: '#E94D89' }]}>Crie seu próprio</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Manrope_700Bold', textAlign: 'center', marginTop: 40 },
  subtitle: { color: '#ccc', textAlign: 'center', marginVertical: 20, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#1A1C1E', width: '48%', height: 120, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  cardEmpty: { borderWidth: 1, borderColor: '#333', backgroundColor: 'transparent' },
  cardText: { color: '#fff', marginTop: 10, fontFamily: 'Manrope_700Bold' }
});