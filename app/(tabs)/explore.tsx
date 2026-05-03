import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/supabase';
const ATIVIDADES = [
  { id: '1', nome: 'Família', icone: 'https://cdn-icons-png.flaticon.com/512/3076/3076755.png' },
  { id: '2', nome: 'Amigos', icone: 'https://cdn-icons-png.flaticon.com/512/2583/2583118.png' },
];

export default function AtividadesScreen() {
  const { humor } = useLocalSearchParams(); // Recebe o humor da tela anterior
  const [nota, setNota] = useState('');

  const salvarNoSupabase = async () => {
  const { error } = await supabase
    .from('registros')
    .insert([{ 
      humor: humor, 
      atividades: 'Social', 
      nota: nota 
      // O user_id é preenchido automaticamente pelo banco!
    }]);

  if (error) Alert.alert('Erro', error.message);
  else Alert.alert('Sucesso', 'Salvo na sua conta!');
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>O que você tem feito?</Text>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Social</Text>
        <FlatList 
          data={ATIVIDADES}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.circle}><Image source={{ uri: item.icone }} style={styles.icon} /></View>
              <Text style={styles.itemText}>{item.nome}</Text>
            </View>
          )}
        />
      </View>

      <Text style={styles.label}>Anotação Rápida</Text>
      <TextInput 
        style={styles.input}
        placeholder="Adicionar nota..."
        value={nota}
        onChangeText={setNota}
        multiline
      />

      <TouchableOpacity style={styles.saveBtn} onPress={salvarNoSupabase}>
        <Text style={styles.saveBtnText}>✓ Salvar Registro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#fce4ec' },
  sectionTitle: { fontWeight: 'bold', marginBottom: 10 },
  item: { alignItems: 'center', marginRight: 15 },
  circle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fce4ec', justifyContent: 'center', alignItems: 'center' },
  icon: { width: 25, height: 25 },
  itemText: { fontSize: 10, marginTop: 5 },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: { borderBottomWidth: 1, borderColor: '#ccc', padding: 10, height: 80, marginBottom: 30 },
  saveBtn: { backgroundColor: '#e91e63', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' }
});