// app/(tabs)/Configurações.tsx (versão com Supabase)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/supabase';// Ajuste o caminho conforme sua configuração

export default function Configuracoes() {
  const router = useRouter();
  
  const [tema, setTema] = useState('claro');
  const [lembreteDiario, setLembreteDiario] = useState(false);
  const [horarioLembrete, setHorarioLembrete] = useState('20:00');
  const [alertaSistema, setAlertaSistema] = useState(true);
  
  // Estado para armazenar os dados do usuário logado
  const [usuarioLogado, setUsuarioLogado] = useState({
    nome: '',
    email: '',
  });

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  // Função para carregar os dados do usuário do Supabase
  const carregarDadosUsuario = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        throw userError;
      }
      
      if (user) {
        // Busca informações adicionais do perfil na tabela 'usuarios' ou 'profiles'
        const { data: perfil, error: perfilError } = await supabase
          .from('usuarios') // Ajuste o nome da tabela conforme seu banco
          .select('nome, email')
          .eq('id', user.id)
          .single();
        
        if (perfilError && perfilError.code !== 'PGRST116') { // PGRST116 = não encontrado
          console.error('Erro ao buscar perfil:', perfilError);
        }
        
        setUsuarioLogado({
          nome: perfil?.nome || user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário',
          email: user.email || perfil?.email || 'email@exemplo.com',
        });
      } else {
        // Se não houver usuário logado, redireciona para o login
        Alert.alert('Sessão expirada', 'Faça login novamente.', [
          { text: 'OK', onPress: () => router.replace('/start') }
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const fazerLogout = async () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              router.replace('/start');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, tema === 'escuro' && styles.containerEscuro]}>
      
      <View style={styles.secao}>
        <Text style={[styles.tituloSecao, tema === 'escuro' && styles.textoBranco]}>
          1. Perfil e Conta
        </Text>
        
        {/* Card com informações dinâmicas do usuário logado */}
        <View style={[styles.card, tema === 'escuro' && styles.cardEscuro]}>
          <Text style={[styles.nome, tema === 'escuro' && styles.textoBranco]}>
            {usuarioLogado.nome}
          </Text>
          <Text style={[styles.email, tema === 'escuro' && styles.textoCinza]}>
            {usuarioLogado.email}
          </Text>
        </View>

        {/* Botão que navega para detalhes do usuário */}
        <TouchableOpacity 
          style={[styles.opcao, tema === 'escuro' && styles.cardEscuro]}
          onPress={() => router.push('/detalhes_usuario')}>
          <Text style={[styles.opcaoTexto, tema === 'escuro' && styles.textoBranco]}>
            Informações do Usuário
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.opcao, tema === 'escuro' && styles.cardEscuro]}
          onPress={() => Alert.alert('Senha', 'Redefinir senha (em breve)')}>
          <Text style={[styles.opcaoTexto, tema === 'escuro' && styles.textoBranco]}>
            Alterar Senha
          </Text>
        </TouchableOpacity>
      </View>

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

      <View style={styles.secao}>
        <Text style={[styles.tituloSecao, tema === 'escuro' && styles.textoBranco]}>
          3. Notificações e Lembretes
        </Text>
        
        <View style={[styles.card, tema === 'escuro' && styles.cardEscuro]}>
          <View style={styles.linhaSwitch}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.opcaoTexto, tema === 'escuro' && styles.textoBranco]}>
                Lembrete Diário
              </Text>
              <Text style={[styles.subtexto, tema === 'escuro' && styles.textoCinza]}>
                Receba um lembrete para escrever no diário
              </Text>
            </View>
            <Switch
              value={lembreteDiario}
              onValueChange={setLembreteDiario}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
          
          {lembreteDiario && (
            <TouchableOpacity 
              style={styles.horarioRow}
              onPress={() => Alert.alert('Horário', 'Selecionar horário (em breve)')}>
              <Text style={[styles.horarioText, tema === 'escuro' && styles.textoBranco]}>
                Horário: {horarioLembrete}
              </Text>
            </TouchableOpacity>
          )}
        </View>

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
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>
      </View>

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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardEscuro: {
    backgroundColor: '#1e1e1e',
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
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  textoBranco: {
    color: '#fff',
  },
  textoCinza: {
    color: '#aaa',
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
    backgroundColor: '#007AFF',
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