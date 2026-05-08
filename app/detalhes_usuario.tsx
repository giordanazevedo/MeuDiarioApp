import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../src/supabase'; // Ajuste o caminho conforme sua configuração

const ACCENT_COLOR = '#E94D89';

export default function DetalhesUsuario() {
  const router = useRouter();
  
  // Estado para dados do usuário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [dataCadastro, setDataCadastro] = useState('');
  
  // Estados de controle
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Estatísticas
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalDiasImportantes, setTotalDiasImportantes] = useState(0);
  const [diasSeguidos, setDiasSeguidos] = useState(0);

  // Carregar dados do usuário ao iniciar
  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = async () => {
    try {
      setCarregando(true);
      
      // 1. Buscar usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user) {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        router.replace('/start');
        return;
      }
      
      setUserId(user.id);
      setEmail(user.email || '');
      
      // 2. Buscar dados do perfil na tabela 'usuarios'
      const { data: perfil, error: perfilError } = await supabase
        .from('usuarios') // Ajuste o nome da tabela
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (perfilError && perfilError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', perfilError);
      }
      
      if (perfil) {
        setNome(perfil.nome || '');
        setTelefone(perfil.telefone || '');
        setDataNascimento(perfil.data_nascimento || '');
        setDataCadastro(perfil.data_cadastro || formatarData(new Date()));
      } else {
        // Se não encontrar perfil, usar dados do metadata ou criar padrão
        setNome(user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário');
        setDataCadastro(formatarData(new Date()));
      }
      
      // 3. Buscar estatísticas
      await carregarEstatisticas(user.id);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do usuário.');
    } finally {
      setCarregando(false);
    }
  };

  const carregarEstatisticas = async (userId: string) => {
    try {
      // Buscar total de entradas no diário
      const { count: totalDiarios, error: errorDiarios } = await supabase
        .from('diarios') // Ajuste o nome da tabela
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', userId);
      
      if (!errorDiarios) setTotalEntradas(totalDiarios || 0);
      
      // Buscar total de dias importantes
      const { count: totalImportantes, error: errorImportantes } = await supabase
        .from('dias_importantes') // Ajuste o nome da tabela
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', userId);
      
      if (!errorImportantes) setTotalDiasImportantes(totalImportantes || 0);
      
      // Calcular dias seguidos (exemplo simplificado)
      const { data: ultimosDiarios, error: errorSeguidos } = await supabase
        .from('diarios')
        .select('data_criacao')
        .eq('usuario_id', userId)
        .order('data_criacao', { ascending: false })
        .limit(30);
      
      if (!errorSeguidos && ultimosDiarios) {
        const diasSeguidosCalc = calcularDiasSeguidos(ultimosDiarios);
        setDiasSeguidos(diasSeguidosCalc);
      }
      
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const calcularDiasSeguidos = (diarios: any[]) => {
    if (!diarios.length) return 0;
    
    let seguidos = 1;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < diarios.length - 1; i++) {
      const dataAtual = new Date(diarios[i].data_criacao);
      const dataProxima = new Date(diarios[i + 1].data_criacao);
      
      const diffDias = Math.floor((dataAtual.getTime() - dataProxima.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDias === 1) {
        seguidos++;
      } else {
        break;
      }
    }
    
    return seguidos;
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR');
  };

  const formatarDataParaBanco = (data: string) => {
    // Converte DD/MM/AAAA para YYYY-MM-DD
    const partes = data.split('/');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    return data;
  };

  const salvarAlteracoes = async () => {
    try {
      setSalvando(true);
      
      // Validar campos
      if (!nome.trim()) {
        Alert.alert('Erro', 'O nome é obrigatório.');
        return;
      }
      
      // Atualizar dados no Supabase
      const { error } = await supabase
        .from('usuarios')
        .upsert({
          id: userId,
          nome: nome,
          telefone: telefone,
          data_nascimento: dataNascimento ? formatarDataParaBanco(dataNascimento) : null,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      // Atualizar metadata do usuário se necessário
      if (nome) {
        await supabase.auth.updateUser({
          data: { nome: nome }
        });
      }
      
      Alert.alert(
        'Sucesso',
        'Informações atualizadas com sucesso!',
        [{ text: 'OK', onPress: () => setEditando(false) }]
      );
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const cancelarEdicao = async () => {
    // Recarregar dados originais
    await carregarDadosUsuario();
    setEditando(false);
  };

  if (carregando) {
    return (
      <View style={styles.centralizar}>
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
        <Text style={styles.textoCarregando}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho com botão voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
          <Text style={styles.textoVoltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Informações do Usuário</Text>
      </View>

      {/* Formulário */}
      <View style={styles.formulario}>
        {/* Nome */}
        <View style={styles.campo}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={[styles.input, !editando && styles.inputDesabilitado]}
            value={nome}
            onChangeText={setNome}
            editable={editando}
            placeholder="Seu nome completo"
          />
        </View>

        {/* Email */}
        <View style={styles.campo}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, styles.inputDesabilitado]}
            value={email}
            editable={false}
            placeholder="seu@email.com"
          />
          <Text style={styles.textoAjuda}>O e-mail não pode ser alterado</Text>
        </View>

        {/* Telefone */}
        <View style={styles.campo}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={[styles.input, !editando && styles.inputDesabilitado]}
            value={telefone}
            onChangeText={setTelefone}
            editable={editando}
            keyboardType="phone-pad"
            placeholder="(00) 00000-0000"
          />
        </View>

        {/* Data de Nascimento */}
        <View style={styles.campo}>
          <Text style={styles.label}>Data de nascimento</Text>
          <TextInput
            style={[styles.input, !editando && styles.inputDesabilitado]}
            value={dataNascimento}
            onChangeText={setDataNascimento}
            editable={editando}
            placeholder="DD/MM/AAAA"
          />
        </View>

        {/* Data de cadastro */}
        <View style={styles.campo}>
          <Text style={styles.label}>Membro desde</Text>
          <TextInput
            style={[styles.input, styles.inputDesabilitado]}
            value={dataCadastro}
            editable={false}
          />
        </View>
      </View>

      {/* Botões de ação */}
      <View style={styles.botoesContainer}>
        {!editando ? (
          <TouchableOpacity 
            style={styles.botaoEditar}
            onPress={() => setEditando(true)}>
            <Text style={styles.textoBotaoEditar}>✏️ Editar informações</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.botoesEdicao}>
            <TouchableOpacity 
              style={[styles.botao, styles.botaoCancelar]}
              onPress={cancelarEdicao}
              disabled={salvando}>
              <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.botao, styles.botaoSalvar]}
              onPress={salvarAlteracoes}
              disabled={salvando}>
              {salvando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.textoBotaoSalvar}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Estatísticas do usuário */}
      <View style={styles.estatisticas}>
        <Text style={styles.tituloEstatisticas}>Estatísticas da conta</Text>
        
        <View style={styles.cardEstatistica}>
          <Text style={styles.numeroEstatistica}>{totalEntradas}</Text>
          <Text style={styles.labelEstatistica}>Entradas no diário</Text>
        </View>
        
        <View style={styles.cardEstatistica}>
          <Text style={styles.numeroEstatistica}>{totalDiasImportantes}</Text>
          <Text style={styles.labelEstatistica}>Dias importantes</Text>
        </View>
        
        <View style={styles.cardEstatistica}>
          <Text style={styles.numeroEstatistica}>{diasSeguidos}</Text>
          <Text style={styles.labelEstatistica}>Dias seguidos</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centralizar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  textoCarregando: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Manrope-ExtraBold',
  },
  header: {
    backgroundColor: ACCENT_COLOR,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  botaoVoltar: {
    marginBottom: 15,
  },
  textoVoltar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Manrope-ExtraBold',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Manrope-ExtraBold',
    color: '#fff',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: ACCENT_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarTexto: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  formulario: {
    padding: 20,
  },
  campo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Manrope-ExtraBold',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputDesabilitado: {
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  textoAjuda: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontFamily: 'Manrope-ExtraBold',
  },
  botoesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  botaoEditar: {
    backgroundColor: ACCENT_COLOR,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  textoBotaoEditar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Manrope-ExtraBold',
  },
  botoesEdicao: {
    flexDirection: 'row',
    gap: 12,
  },
  botao: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  botaoCancelar: {
    backgroundColor: '#f0f0f0',
  },
  botaoSalvar: {
    backgroundColor: ACCENT_COLOR,
  },
  textoBotaoCancelar: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Manrope-ExtraBold',
  },
  textoBotaoSalvar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Manrope-ExtraBold',
  },
  estatisticas: {
    padding: 20,
    paddingTop: 0,
  },
  tituloEstatisticas: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Manrope-ExtraBold',
    color: '#333',
    marginBottom: 16,
  },
  cardEstatistica: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  numeroEstatistica: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Manrope-ExtraBold',
    color: ACCENT_COLOR,
  },
  labelEstatistica: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Manrope-ExtraBold',
  },
});
