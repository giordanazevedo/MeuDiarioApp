import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export default function NovoDiaImportante() {
  const router = useRouter();
  const { categoria, icon } = useLocalSearchParams(); // Pega o que você escolheu na tela anterior
  const [data, setData] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || data;
    // No Android, o seletor fecha sozinho ao escolher; no iOS fica aberto
    setShow(Platform.OS === 'ios'); 
    setData(currentDate);
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho com ícone da categoria selecionada */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.iconCircle}>
          <Ionicons name={(icon as any) || "calendar"} size={40} color="#E94D89" />
        </View>
        <Text style={styles.categoryTitle}>{categoria || 'Dia importante'}</Text>
      </View>

      <Text style={styles.instructions}>Escolha uma data</Text>

      {/* Campo de Data (Botão que abre o seletor) */}
      <TouchableOpacity style={styles.inputField} onPress={() => setShow(true)}>
        <Ionicons name="calendar-outline" size={20} color="#666" />
        <Text style={styles.inputText}>Data</Text>
        <Text style={styles.dateDisplay}>
          {data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
        </Text>
      </TouchableOpacity>

      {/* O Seletor Estilo Spinner (Igual a image_d18f00.png) */}
      {show && (
        <View style={styles.modalData}>
          <DateTimePicker
            value={data}
            mode="date"
            display="spinner"
            textColor="white"
            onChange={onChange}
          />
          <TouchableOpacity style={styles.saveDateBtn} onPress={() => setShow(false)}>
            <Text style={styles.saveDateText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
  style={styles.saveButton} 
  onPress={() => {
    // 1. Log para conferência no terminal
    console.log("Evento Salvo:", categoria, data);

    // 2. Navegação enviando os dados para a tela de Detalhes
    router.push({
      pathname: '/detalhes_evento',
      params: { 
        titulo: categoria, 
        dataSelecionada: data.toISOString() // Transforma a data em texto para enviar
      }
    }); 
  }}
>
  <Text style={styles.saveButtonText}>Adicionar ao Diário</Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  headerContainer: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  backButton: { position: 'absolute', left: 0, top: 0 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1A1C1E', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  categoryTitle: { color: '#fff', fontSize: 22, fontFamily: 'Manrope_700Bold' },
  instructions: { color: '#666', textAlign: 'center', marginBottom: 20 },
  inputField: { 
    flexDirection: 'row', 
    backgroundColor: '#1A1C1E', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center',
    marginBottom: 20 
  },
  inputText: { color: '#fff', marginLeft: 10, flex: 1 },
  dateDisplay: { color: '#E94D89' },
  modalData: { backgroundColor: '#1A1C1E', borderRadius: 20, padding: 10, marginTop: 10 },
  saveDateBtn: { padding: 10, alignItems: 'flex-end' },
  saveDateText: { color: '#E94D89', fontFamily: 'Manrope_700Bold' },
  saveButton: { backgroundColor: '#E94D89', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  saveButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' }
});