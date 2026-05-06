import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

export default function ConfiguraçõesScreen() {
  // 1. Estados para controlar os botões de ligar/desligar
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(false);

  // 2. Função para o botão de sair
  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => console.log("Usuário deslogado") }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Título da Tela */}
      <Text style={styles.mainTitle}>Configurações</Text>

      {/* Seção: Preferências */}
      <Text style={styles.sectionTitle}>Preferências</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.labelArea}>
            <Ionicons name="moon" size={20} color="#4a90e2" />
            <Text style={styles.label}>Modo Escuro</Text>
          </View>
          <Switch 
            value={darkMode} 
            onValueChange={setDarkMode}
            trackColor={{ false: "#767577", true: "#4a90e2" }} 
          />
        </View>

        <View style={styles.row}>
          <View style={styles.labelArea}>
            <Ionicons name="notifications" size={20} color="#4a90e2" />
            <Text style={styles.label}>Notificações</Text>
          </View>
          <Switch 
            value={notifications} 
            onValueChange={setNotifications}
            trackColor={{ false: "#767577", true: "#4a90e2" }} 
          />
        </View>
      </View>

      {/* Seção: Conta */}
      <Text style={styles.sectionTitle}>Conta</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.row}>
          <View style={styles.labelArea}>
            <Ionicons name="person-circle" size={20} color="#fff" />
            <Text style={styles.label}>Editar Perfil</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <View style={styles.labelArea}>
            <Ionicons name="log-out" size={20} color="#ff4444" />
            <Text style={[styles.label, { color: '#ff4444' }]}>Sair da Conta</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>Versão 1.0.0 - Grupo Ciência da Computação</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8cc', // Fundo preto conforme image_2.png
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 20,
    fontFamily: 'Manrope-ExtraBold', // Mesma fonte de image_2.png
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#1A1A1A', // Cor dos cards conforme image_2.png
    borderRadius: 20,
    padding: 15,
    marginBottom: 25,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  labelArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  footerText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  }
});