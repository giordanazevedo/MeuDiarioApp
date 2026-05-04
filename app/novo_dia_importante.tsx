import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export default function NovoDiaImportante() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || data;
    setShow(Platform.OS === 'ios'); // No iOS o calendário pode ficar aberto
    setData(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Novo Dia Importante</Text>

      <Text style={styles.label}>O que vamos celebrar?</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ex: Aniversário de Namoro com a Layne" 
        value={titulo}
        onChangeText={setTitulo}
      />

      <Text style={styles.label}>Quando?</Text>
      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShow(true)}>
        <Ionicons name="calendar-outline" size={24} color="#C12683" />
        <Text style={styles.dateText}>
          {data.toLocaleDateString('pt-BR')}
        </Text>
      </TouchableOpacity>

      {/* Componente de Calendário que abre ao clicar */}
      {show && (
        <DateTimePicker
          value={data}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}

      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={() => {
          console.log("Salvando:", titulo, data);
          router.back();
        }}
      >
        <Text style={styles.saveButtonText}>Adicionar ao Diário</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: '#fff', paddingTop: 60 },
  header: { fontSize: 24, fontFamily: 'Manrope_700Bold', color: '#C12683', marginBottom: 30 },
  label: { fontFamily: 'Manrope_700Bold', fontSize: 16, marginBottom: 10, color: '#333' },
  input: { 
    borderWidth: 1.5, 
    borderColor: '#eee', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 25,
    fontFamily: 'Manrope_700Bold' 
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1.5,
    borderColor: '#eee',
    borderRadius: 12,
    marginBottom: 40
  },
  dateText: { marginLeft: 10, fontSize: 16, color: '#333' },
  saveButton: { 
    backgroundColor: '#C12683', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center',
    elevation: 4
  },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});