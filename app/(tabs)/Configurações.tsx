// app/(tabs)/Configurações.tsx (versão com Supabase)
import React, { useState, useEffect, useContext } from 'react';
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
import { ThemeContext } from '../src/theme-context';

export default function Configuracoes() {
  const router = useRouter();
  const { theme, setTheme } = useContext(ThemeContext)!;
  
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
    <ScrollView style={[styles.container, theme === 'dark' && styles.containerEscuro]}>
      
      <View style={styles.secao}>
        <Text style={[styles.tituloSecao, theme === 'dark' && styles.textoBranco]}>
          1. Perfil e Conta
        </Text>
        
        {/* Card com informações dinâmicas do usuário logado */}
        <View style={[styles.card, theme === 'dark' && styles.cardEscuro]}>
          <Text style={[styles.nome, theme === 'dark' && styles.textoBranco]}>
            {usuarioLogado.nome}
          </Text>
          <Text style={[styles.email, theme === 'dark' && styles.textoCinza]}>
            {usuarioLogado.email}
          </Text>
        </View>

        {/* Botão que navega para detalhes do usuário */}
        <TouchableOpacity 
          style={[styles.opcao, theme === 'dark' && styles.cardEscuro]}
          onPress={() => router.push('/detalhes_usuario')}>
          <Text style={[styles.opcaoTexto, theme === 'dark' && styles.textoBranco]}>
            Informações do Usuário
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.secao}>
        <Text style={[styles.tituloSecao, theme === 'dark' && styles.textoBranco]}>
          2. Personalização (Interface)
        </Text>
        
        <View style={[styles.card, theme === 'dark' && styles.cardEscuro]}>
          <Text style={[styles.opcaoTexto, theme === 'dark' && styles.textoBranco]}>Tema</Text>
          
          <View style={styles.botoesTema}>
            <TouchableOpacity 
              style={[styles.botaoTema, theme === 'light' && styles.botaoAtivo]}
              onPress={() => setTheme('light')}>
              <Text style={[styles.textoBotao, theme === 'light' && styles.textoBotaoAtivo]}>Claro</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.botaoTema, theme === 'dark' && styles.botaoAtivo]}
              onPress={() => setTheme('dark')}>
              <Text style={[styles.textoBotao, theme === 'dark' && styles.textoBotaoAtivo]}>Escuro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.secao}>
        <Text style={[styles.tituloSecao, theme === 'dark' && styles.textoBranco]}>
          3. Notificações e Lembretes
        </Text>

        <View style={[styles.card, theme === 'dark' && styles.cardEscuro]}>
          <View style={styles.linhaSwitch}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.opcaoTexto, theme === 'dark' && styles.textoBranco]}>
                Alertas de Sistema
              </Text>
              <Text style={[styles.subtexto, theme === 'dark' && styles.textoCinza]}>
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
        <Text style={[styles.tituloSecao, theme === 'dark' && styles.textoBranco]}>
          4. Suporte e Informações
        </Text>
        
        <TouchableOpacity 
          style={[styles.card, theme === 'dark' && styles.cardEscuro]}
          onPress={() => Alert.alert('Sobre', 'Diário App\nVersão 1.2.0')}>
          <View style={styles.linhaInfo}>
            <View>
              <Text style={[styles.opcaoTexto, theme === 'dark' && styles.textoBranco]}>
                Sobre o App
              </Text>
              <Text style={[styles.subtexto, theme === 'dark' && styles.textoCinza]}>
                Versão atual e informações do aplicativo
              </Text>
            </View>
            <Text style={[styles.versao, theme === 'dark' && styles.textoCinza]}>1.2.0</Text>
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
    fontFamily: 'Manrope-Bold',
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
    fontFamily: 'Manrope-Bold',
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Manrope-Bold',
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
    fontFamily: 'Manrope-Bold',
  },
});