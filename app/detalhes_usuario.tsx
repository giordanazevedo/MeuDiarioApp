import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../src/supabase";

export default function DetalhesUsuario() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [dataCadastro, setDataCadastro] = useState("");

  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // Corrigido aqui

  const [totalEntradas, setTotalEntradas] = useState(0);

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = async () => {
    try {
      setCarregando(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        router.replace("/");
        return;
      }

      setUserId(user.id); // Agora usando o estado correto
      setEmail(user.email || "");

      // Tenta buscar o nome do metadata primeiro (o que salvamos no cadastro)
      const nomeMetadata =
        user.user_metadata?.nome_usuario || user.email?.split("@")[0];
      setNome(nomeMetadata);

      // Aqui você busca na tabela de perfis se tiver uma,
      // caso contrário, o app usará o que está no auth
      const { data: perfil } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      if (perfil) {
        setNome(perfil.nome || nomeMetadata);
        setTelefone(perfil.telefone || "");
        setDataNascimento(perfil.data_nascimento || "");
      }

      // Ajustado para a sua tabela real: 'registros'
      const { count } = await supabase
        .from("registros")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setTotalEntradas(count || 0);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    } finally {
      setCarregando(false);
    }
  };

  const salvarAlteracoes = async () => {
    try {
      setSalvando(true);

      // Isso atualiza o "RG" do usuário no Supabase globalmente
      const { error } = await supabase.auth.updateUser({
        data: { nome_usuario: nome },
      });

      if (error) throw error;

      Alert.alert("Sucesso ✨", "Nome atualizado em todo o sistema!");
      setEditando(false);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <View style={styles.centralizar}>
        <ActivityIndicator size="large" color="#A88AED" />
        <Text style={styles.textoCarregando}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.botaoVoltar}
        >
          <Text style={styles.textoVoltar}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Meu Perfil</Text>
      </View>

      <View style={styles.formulario}>
        <View style={styles.campo}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={[styles.input, !editando && styles.inputDesabilitado]}
            value={nome}
            onChangeText={setNome}
            editable={editando}
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.label}>E-mail (Não alterável)</Text>
          <TextInput
            style={[styles.input, styles.inputDesabilitado]}
            value={email}
            editable={false}
          />
        </View>

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
      </View>

      <View style={styles.botoesContainer}>
        {!editando ? (
          <TouchableOpacity
            style={styles.botaoEditar}
            onPress={() => setEditando(true)}
          >
            <Text style={styles.textoBotaoEditar}>✏️ Editar Perfil</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.botoesEdicao}>
            <TouchableOpacity
              style={[styles.botao, styles.botaoCancelar]}
              onPress={() => setEditando(false)}
            >
              <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botao, styles.botaoSalvar]}
              onPress={salvarAlteracoes}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.textoBotaoSalvar}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.estatisticas}>
        <View style={styles.cardEstatistica}>
          <Text style={styles.numeroEstatistica}>{totalEntradas}</Text>
          <Text style={styles.labelEstatistica}>Registros no Diário</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },
  centralizar: { flex: 1, justifyContent: "center", alignItems: "center" },
  textoCarregando: { marginTop: 10, color: "#666" },
  header: {
    backgroundColor: "#A88AED",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  botaoVoltar: { marginBottom: 10 },
  textoVoltar: { color: "#fff", fontWeight: "bold" },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  formulario: { padding: 20 },
  campo: { marginBottom: 20 },
  label: { fontSize: 14, color: "#8E8AA7", marginBottom: 5, fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E4E1F2",
    color: "#41386B",
  },
  inputDesabilitado: { backgroundColor: "#F1F0F5", color: "#8E8AA7" },
  botoesContainer: { paddingHorizontal: 20 },
  botaoEditar: {
    backgroundColor: "#A88AED",
    borderRadius: 15,
    padding: 18,
    alignItems: "center",
  },
  textoBotaoEditar: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  botoesEdicao: { flexDirection: "row", gap: 10 },
  botao: { flex: 1, borderRadius: 15, padding: 18, alignItems: "center" },
  botaoCancelar: { backgroundColor: "#E4E1F2" },
  botaoSalvar: { backgroundColor: "#A88AED" },
  textoBotaoCancelar: { color: "#41386B", fontWeight: "600" },
  textoBotaoSalvar: { color: "#fff", fontWeight: "bold" },
  estatisticas: { padding: 20 },
  cardEstatistica: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 2,
  },
  numeroEstatistica: { fontSize: 32, fontWeight: "bold", color: "#A88AED" },
  labelEstatistica: { color: "#8E8AA7", marginTop: 5 },
});
