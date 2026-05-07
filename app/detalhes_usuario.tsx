// app/(tabs)/detalhes_usuario.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function DetalhesUsuario() {
  const router = useRouter();
  
  // Dados do usuário (depois você pode buscar do seu sistema de login)
  const [nome, setNome] = useState('Juliana Souza');
  const [email, setEmail] = useState('juliana.souza@email.com');
  const [telefone, setTelefone] = useState('(11) 98765-4321');
  const [dataNascimento, setDataNascimento] = useState('15/03/1990');
  
  const [editando, setEditando] = useState(false);

  const salvarAlteracoes = () => {
    Alert.alert(
      'Sucesso',
      'Informações atualizadas com sucesso!',
      [{ text: 'OK', onPress: () => setEditando(false) }]
    );
  };

  const cancelarEdicao = () => {
    // Recarregar dados originais (aqui você recarregaria do banco)
    setNome('Juliana Souza');
    setEmail('juliana.souza@email.com');
    setTelefone('(11) 98765-4321');
    setDataNascimento('15/03/1990');
    setEditando(false);
  };

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
            style={[styles.input, !editando && styles.inputDesabilitado]}
            value={email}
            onChangeText={setEmail}
            editable={editando}
            keyboardType="email-address"
            placeholder="seu@email.com"
          />
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

        {/* Data de cadastro (apenas leitura) */}
        <View style={styles.campo}>
          <Text style={styles.label}>Membro desde</Text>
          <TextInput
            style={[styles.input, styles.inputDesabilitado]}
            value="15/01/2024"
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
              onPress={cancelarEdicao}>
              <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.botao, styles.botaoSalvar]}
              onPress={salvarAlteracoes}>
              <Text style={styles.textoBotaoSalvar}>Salvar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Estatísticas do usuário */}
      <View style={styles.estatisticas}>
        <Text style={styles.tituloEstatisticas}>Estatísticas da conta</Text>
        
        <View style={styles.cardEstatistica}>
          <Text style={styles.numeroEstatistica}>47</Text>
          <Text style={styles.labelEstatistica}>Entradas no diário</Text>
        </View>
        
        <View style={styles.cardEstatistica}>
          <Text style={styles.numeroEstatistica}>12</Text>
          <Text style={styles.labelEstatistica}>Dias importantes</Text>
        </View>
        
        <View style={styles.cardEstatistica}>
          <Text style={styles.numeroEstatistica}>15</Text>
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
  header: {
    backgroundColor: '#bc8ddf',
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
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
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
    backgroundColor: '#bc8ddf',
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
  botaoEditarAvatar: {
    marginTop: 8,
  },
  textoEditarAvatar: {
    color: '#121315',
    fontSize: 14,
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
  botoesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  botaoEditar: {
    backgroundColor: '#bc8ddf',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  textoBotaoEditar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: '#bc8ddf',
  },
  textoBotaoCancelar: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  textoBotaoSalvar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  estatisticas: {
    padding: 20,
    paddingTop: 0,
  },
  tituloEstatisticas: {
    fontSize: 18,
    fontWeight: 'bold',
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
    color: '#308bed',
  },
  labelEstatistica: {
    fontSize: 16,
    color: '#666',
  },
});