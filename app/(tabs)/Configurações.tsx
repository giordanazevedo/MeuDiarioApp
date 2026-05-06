// app/(tabs)/Configurações.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Configuracoes() {
  const router = useRouter();
  
  const [tema, setTema] = useState('claro');
  const [lembreteDiario, setLembreteDiario] = useState(false);
  const [horarioLembrete, setHorarioLembrete] = useState('20:00');
  const [alertaSistema, setAlertaSistema] = useState(true);

  const fazerLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => router.replace('/start')
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, tema === 'escuro' && styles.containerEscuro]}>
      
      {/* Seção 1: Perfil e Conta */}
      <View style={styles.secao}>
        
        {/* Card do usuário COM IMAGEM */}
        <View style={[styles.cardUsuario, tema === 'escuro' && styles.cardEscuro]}>
          {/* Opção 1: Ícone (mais fácil) */}
          <Ionicons name="person-circle" size={70} color="#007AFF" />
          
          <View style={styles.infoUsuario}>
            <Text style={[styles.nomeUsuario, tema === 'escuro' && styles.textoBranco]}>
              Juliana Souza
            </Text>
            <Text style={[styles.emailUsuario, tema === 'escuro' && styles.textoCinza]}>
              juliana.souza@email.com
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.opcao, tema === 'escuro' && styles.cardEscuro]}
          onPress={() => router.push('/detalhes_usuario')}>
          <Text style={[styles.opcaoTexto, tema === 'escuro' && styles.textoBranco]}>
            Informações do Usuário
          </Text>
        </TouchableOpacity>
      </View>

      {/* Seção 2: Personalização */}
      <View style={styles.secao}>
        <Text style={[styles.tituloSecao, tema === 'escuro' && styles.textoBranco]}>
          2. Personalização (Interface)
        </Text>
        
        <View style={[styles.card, tema === 'escuro' && styles.cardEscuro]}>
          <Text style={[styles.opcaoTexto, tema === 'escuro' && styles.textoBranco]}>Tema</Text>
          
          <View style={styles.botoesTema}>
            <TouchableOpacity 
              style={[styles.botaoTema, tema === 'claro' && styles.botaoAtivo]}
              onPress={() => setTema('claro')}>
              <Text style={[styles.textoBotao, tema === 'claro' && styles.textoBotaoAtivo]}>Claro</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.botaoTema, tema === 'escuro' && styles.botaoAtivo]}
              onPress={() => setTema('escuro')}>
              <Text style={[styles.textoBotao, tema === 'escuro' && styles.textoBotaoAtivo]}>Escuro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>


      {/* Seção 3: Notificações */}
      <View style={styles.secao}>
        <Text style={[styles.tituloSecao, tema === 'escuro' && styles.textoBranco]}>
          3. Notificações e Lembretes
        </Text>

        <View style={[styles.card, tema === 'escuro' && styles.cardEscuro]}>
          <View style={styles.linhaSwitch}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.opcaoTexto, tema === 'escuro' && styles.textoBranco]}>
                Alertas de Sistema
              </Text>
              <Text style={[styles.subtexto, tema === 'escuro' && styles.textoCinza]}>
                Receber avisos sobre atualizações e novidades
              </Text>
            </View>
            <Switch
              value={alertaSistema}
              onValueChange={setAlertaSistema}
              trackColor={{ false: '#767577', true: '#bc8ddf',  }}
              thumbColor={'#f4f3f4'}
            />
          </View>

        </View>
      </View>

      {/* Seção 4: Suporte */}
      <View style={styles.secao}>
        <Text style={[styles.tituloSecao, tema === 'escuro' && styles.textoBranco]}>
          4. Suporte e Informações
        </Text>
        
        <TouchableOpacity 
          style={[styles.card, tema === 'escuro' && styles.cardEscuro]}
          onPress={() => Alert.alert('Sobre', 'Diário App\nVersão 1.2.0')}>
          <View style={styles.linhaInfo}>
            <View>
              <Text style={[styles.opcaoTexto, tema === 'escuro' && styles.textoBranco]}>
                Sobre o App
              </Text>
              <Text style={[styles.subtexto, tema === 'escuro' && styles.textoCinza]}>
                Versão atual e informações do aplicativo
              </Text>
            </View>
            <Text style={[styles.versao, tema === 'escuro' && styles.textoCinza]}>1.2.0</Text>
          </View>
        
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.botaoSair]}
          onPress={fazerLogout}>
          <Text style={styles.textoSair}>Sair (Log out)</Text>
        </TouchableOpacity>
      </View>
    
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerEscuro: {
    backgroundColor: '#121212',
  },
  secao: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  textoBranco: {
    color: '#fff',
  },
  textoCinza: {
    color: '#aaa',
  },
  // Estilos do card do usuário com imagem
  cardUsuario: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardEscuro: {
    backgroundColor: '#1e1e1e',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30, // Torna a imagem redonda
  },
  infoUsuario: {
    flex: 1,
  },
  nomeUsuario: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emailUsuario: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  opcao: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  opcaoTexto: {
    fontSize: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  botoesTema: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  botaoTema: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  botaoAtivo: {
    backgroundColor: '#bc8ddf',
  },
  textoBotao: {
    color: '#333',
  },
  textoBotaoAtivo: {
    color: '#fff',
  },
  linhaSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtexto: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  horarioRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  horarioText: {
    fontSize: 14,
    color: '#007AFF',
  },
  linhaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versao: {
    fontSize: 14,
    color: '#666',
  },
  botaoSair: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    alignItems: 'center',
  },
  textoSair: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
}); 