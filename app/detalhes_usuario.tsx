import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Manrope_800ExtraBold, useFonts } from "@expo-google-fonts/manrope";
import { supabase } from "../src/supabase";

export default function DetalhesUsuario() {
  const router = useRouter();

  let [fontsLoaded] = useFonts({
    "Manrope-ExtraBold": Manrope_800ExtraBold,
  });

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

  if (carregando || !fontsLoaded) {
    return (
      <LinearGradient
        colors={["#41386B", "#A88AED", "#CBD83B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.centralizar}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.textoCarregando}>Carregando perfil...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#41386B", "#A88AED", "#CBD83B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
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
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centralizar: { flex: 1, justifyContent: "center", alignItems: "center" },
  textoCarregando: { marginTop: 10, color: "#fff", fontFamily: "Manrope-ExtraBold" },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  botaoVoltar: { marginBottom: 10 },
  textoVoltar: { color: "#fff", fontFamily: "Manrope-ExtraBold" },
  titulo: { fontSize: 24, color: "#fff", fontFamily: "Manrope-ExtraBold" },
  formulario: { padding: 20 },
  campo: { marginBottom: 20 },
  label: { fontSize: 14, color: "#fff", marginBottom: 5, fontFamily: "Manrope-ExtraBold" },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    color: "#fff",
    fontFamily: "Manrope-ExtraBold",
  },
  inputDesabilitado: { backgroundColor: "rgba(255, 255, 255, 0.1)", color: "rgba(255, 255, 255, 0.7)", fontFamily: "Manrope-ExtraBold" },
  botoesContainer: { paddingHorizontal: 20 },
  botaoEditar: {
    backgroundColor: "#5b20e6ff",
    borderRadius: 15,
    padding: 18,
    alignItems: "center",
  },
  textoBotaoEditar: { color: "#fff", fontSize: 16, fontFamily: "Manrope-ExtraBold" },
  botoesEdicao: { flexDirection: "row", gap: 10 },
  botao: { flex: 1, borderRadius: 15, padding: 18, alignItems: "center" },
  botaoCancelar: { backgroundColor: "rgba(255, 255, 255, 0.2)" },
  botaoSalvar: { backgroundColor: "#A88AED" },
  textoBotaoCancelar: { color: "#fff", fontFamily: "Manrope-ExtraBold" },
  textoBotaoSalvar: { color: "#fff", fontFamily: "Manrope-ExtraBold" },
  estatisticas: { padding: 20 },
  cardEstatistica: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 0,
  },
  numeroEstatistica: { fontSize: 32, color: "#fff", fontFamily: "Manrope-ExtraBold" },
  labelEstatistica: { color: "rgba(255, 255, 255, 0.9)", marginTop: 5, fontFamily: "Manrope-ExtraBold" },
});
