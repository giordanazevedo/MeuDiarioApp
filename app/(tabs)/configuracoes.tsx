import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../src/supabase";

export default function Configuracoes() {
  const router = useRouter();

  const [tema, setTema] = useState<"claro" | "escuro">("escuro"); // Padrão escuro para combinar com o tema
  const [lembreteDiario, setLembreteDiario] = useState(false);
  const [alertaSistema, setAlertaSistema] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState({
    nome: "",
    email: "",
  });

  useFocusEffect(
    useCallback(() => {
      carregarDadosUsuario();
    }, []),
  );

  const carregarDadosUsuario = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const nomeCompleto =
          user.user_metadata?.nome_usuario || user.email?.split("@")[0];
        setUsuarioLogado({
          nome: nomeCompleto.charAt(0).toUpperCase() + nomeCompleto.slice(1),
          email: user.email || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const alterarSenha = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        usuarioLogado.email,
        { redirectTo: "http://localhost:8081/redefinir-senha" },
      );
      if (error) throw error;
      Alert.alert("E-mail enviado! 📧", "Verifique sua caixa de entrada.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar o e-mail.");
    }
  };

  const fazerLogout = async () => {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            // 1. Desloga do Supabase
            const { error } = await supabase.auth.signOut();

            if (error) throw error;

            // 2. Navegação Direta
            // Usamos replace para garantir que o usuário não consiga "voltar"
            // para a tela de configurações usando o botão físico do Android.
            // O caminho "/" geralmente aponta para o (auth)/index ou app/index
            router.replace("/");
          } catch (error) {
            console.error("Erro ao deslogar:", error);
            Alert.alert("Erro", "Não foi possível encerrar a sessão.");
          }
        },
      },
    ]);
  };

  const isEscuro = tema === "escuro";

  return (
    <SafeAreaView
      style={[styles.container, isEscuro && styles.containerEscuro]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: 16 }}
      >
        <Text style={[styles.mainTitle, isEscuro && styles.textoBranco]}>
          Configurações
        </Text>

        {/* 1. PERFIL E CONTA */}
        <View style={styles.secao}>
          <Text style={[styles.tituloSecao, isEscuro && styles.textoBranco]}>
            1. Perfil e Conta
          </Text>

          <View style={[styles.card, isEscuro && styles.cardEscuro]}>
            <View style={styles.perfilRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {usuarioLogado.nome ? usuarioLogado.nome.charAt(0) : "U"}
                </Text>
              </View>
              <View>
                <Text style={[styles.nome, isEscuro && styles.textoBranco]}>
                  {usuarioLogado.nome}
                </Text>
                <Text style={[styles.email, isEscuro && styles.textoCinza]}>
                  {usuarioLogado.email}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.card, isEscuro && styles.cardEscuro]}
            onPress={() => router.push("/detalhes_usuario")}
          >
            <View style={styles.linhaLink}>
              <Text style={[styles.opcaoTexto, isEscuro && styles.textoBranco]}>
                Informações do Usuário
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isEscuro ? "#fff" : "#41386B"}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, isEscuro && styles.cardEscuro]}
            onPress={alterarSenha}
          >
            <View style={styles.linhaLink}>
              <Text style={[styles.opcaoTexto, isEscuro && styles.textoBranco]}>
                Alterar Senha
              </Text>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={isEscuro ? "#fff" : "#41386B"}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* 2. APARÊNCIA */}
        <View style={styles.secao}>
          <Text style={[styles.tituloSecao, isEscuro && styles.textoBranco]}>
            2. Aparência
          </Text>
          <View style={[styles.card, isEscuro && styles.cardEscuro]}>
            <Text style={[styles.opcaoTexto, isEscuro && styles.textoBranco]}>
              Tema do Aplicativo
            </Text>
            <View style={styles.botoesTema}>
              <TouchableOpacity
                style={[styles.botaoTema, !isEscuro && styles.botaoAtivoClaro]}
                onPress={() => setTema("claro")}
              >
                <Ionicons
                  name="sunny"
                  size={20}
                  color={!isEscuro ? "#fff" : "#666"}
                />
                <Text
                  style={[
                    styles.textoBotao,
                    !isEscuro && styles.textoBotaoAtivo,
                  ]}
                >
                  Claro
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoTema, isEscuro && styles.botaoAtivoEscuro]}
                onPress={() => setTema("escuro")}
              >
                <Ionicons
                  name="moon"
                  size={20}
                  color={isEscuro ? "#fff" : "#666"}
                />
                <Text
                  style={[
                    styles.textoBotao,
                    isEscuro && styles.textoBotaoAtivo,
                  ]}
                >
                  Escuro
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 3. PREFERÊNCIAS */}
        <View style={styles.secao}>
          <Text style={[styles.tituloSecao, isEscuro && styles.textoBranco]}>
            3. Preferências
          </Text>
          <View style={[styles.card, isEscuro && styles.cardEscuro]}>
            <View style={styles.linhaSwitch}>
              <Text style={[styles.opcaoTexto, isEscuro && styles.textoBranco]}>
                Lembrete Diário
              </Text>
              <Switch
                value={lembreteDiario}
                onValueChange={setLembreteDiario}
                trackColor={{ false: "#767577", true: "#A88AED" }}
              />
            </View>
          </View>
        </View>

        {/* 4. SAIR */}
        <View style={styles.secao}>
          <TouchableOpacity
            style={styles.botaoSairContainer}
            onPress={fazerLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
            <Text style={styles.textoSair}>Sair da Conta</Text>
          </TouchableOpacity>
          <Text style={styles.versao}>Versão 1.2.0 • Diário Emocional</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },
  containerEscuro: { backgroundColor: "#1A162D" }, // Roxo bem profundo para o fundo
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#41386B",
    marginTop: 20,
    marginBottom: 20,
  },
  secao: { marginBottom: 25 },
  tituloSecao: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8E8AA7",
    textTransform: "uppercase",
    marginBottom: 10,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
    elevation: 2,
  },
  cardEscuro: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  perfilRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#A88AED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  nome: { fontSize: 18, fontWeight: "700", color: "#41386B" },
  email: { fontSize: 14, color: "#8E8AA7" },
  opcaoTexto: { fontSize: 16, fontWeight: "600", color: "#41386B" },
  textoBranco: { color: "#FFFFFF" },
  textoCinza: { color: "#8E8AA7" },
  linhaLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  botoesTema: { flexDirection: "row", gap: 10, marginTop: 15 },
  botaoTema: {
    flex: 1,
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F0F0F5",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  botaoAtivoClaro: { backgroundColor: "#A88AED" },
  botaoAtivoEscuro: { backgroundColor: "#41386B" },
  textoBotao: { fontWeight: "600", color: "#666" },
  textoBotaoAtivo: { color: "#fff" },
  linhaSwitch: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  botaoSairContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    gap: 10,
  },
  textoSair: { color: "#FF3B30", fontSize: 16, fontWeight: "700" },
  versao: {
    textAlign: "center",
    color: "#8E8AA7",
    fontSize: 12,
    marginTop: 10,
  },
});
