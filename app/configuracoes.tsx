import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Manrope_800ExtraBold, useFonts } from "@expo-google-fonts/manrope";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Linking from "expo-linking";
import { supabase } from "../src/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Configuracoes() {
  const router = useRouter();

  let [fontsLoaded] = useFonts({
    "Manrope-ExtraBold": Manrope_800ExtraBold,
  });


  const [lembreteDiario, setLembreteDiario] = useState(false);
  const [horarioLembrete, setHorarioLembrete] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [alertaSistema, setAlertaSistema] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState({
    nome: "",
    email: "",
  });

  useFocusEffect(
    useCallback(() => {
      carregarDadosUsuario();
      carregarPreferenciaNotificacao();
    }, []),
  );

  const carregarPreferenciaNotificacao = async () => {
    try {
      const ativado = await AsyncStorage.getItem("@lembrete_ativo");
      const horario = await AsyncStorage.getItem("@lembrete_horario");

      if (ativado === "true") {
        setLembreteDiario(true);
      }

      if (horario) {
        setHorarioLembrete(new Date(horario));
      } else {
        const defaultTime = new Date();
        defaultTime.setHours(20, 0, 0, 0); // Padrão às 20h
        setHorarioLembrete(defaultTime);
      }
    } catch (e) {
      console.log("Erro ao carregar preferências:", e);
    }
  };

  const agendarNotificacao = async (data: Date) => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        Alert.alert(
          "Permissão Negada",
          "Habilite as notificações nas configurações do celular para receber lembretes."
        );
        setLembreteDiario(false);
        await AsyncStorage.setItem("@lembrete_ativo", "false");
        return;
      }
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Como foi o seu dia hoje? 🌟",
        body: "Tire 2 minutinhos para registrar suas emoções e atividades no diário!",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: data.getHours(),
        minute: data.getMinutes(),
      },
    });

    Alert.alert(
      "Lembrete ativado! 🔔",
      `Você será lembrado(a) todos os dias às ${data.getHours().toString().padStart(2, "0")}:${data.getMinutes().toString().padStart(2, "0")}.`
    );
  };

  const handleToggleLembrete = async (valor: boolean) => {
    setLembreteDiario(valor);
    await AsyncStorage.setItem("@lembrete_ativo", valor ? "true" : "false");

    if (valor) {
      await agendarNotificacao(horarioLembrete);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const onChangeTime = async (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      setHorarioLembrete(selectedDate);
      await AsyncStorage.setItem("@lembrete_horario", selectedDate.toISOString());
      if (lembreteDiario) {
        await agendarNotificacao(selectedDate);
      }
    }
  };

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
      const redirectTo = Linking.createURL("/redefinir-senha");
      const { error } = await supabase.auth.resetPasswordForEmail(
        usuarioLogado.email,
        { redirectTo },
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



  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={["#41386B", "#A88AED", "#CBD83B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 16 }}
        >
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.textoVoltar}>Voltar</Text>
          </TouchableOpacity>
          <Text style={[styles.mainTitle, styles.textoBranco]}>
            Configurações
          </Text>

          {/* 1. PERFIL E CONTA */}
          <View style={styles.secao}>
            <Text style={[styles.tituloSecao, styles.textoBranco]}>
              1. Perfil e Conta
            </Text>

            <View style={styles.card}>
              <View style={styles.perfilRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {usuarioLogado.nome ? usuarioLogado.nome.charAt(0) : "U"}
                  </Text>
                </View>
                <View>
                  <Text style={styles.nome}>
                    {usuarioLogado.nome}
                  </Text>
                  <Text style={styles.email}>
                    {usuarioLogado.email}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push("/detalhes_usuario")}
            >
              <View style={styles.linhaLink}>
                <Text style={styles.opcaoTexto}>
                  Informações do Usuário
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#fff"
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={alterarSenha}
            >
              <View style={styles.linhaLink}>
                <Text style={styles.opcaoTexto}>
                  Alterar Senha
                </Text>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#fff"
                />
              </View>
            </TouchableOpacity>
          </View>



          <View style={styles.secao}>
            <Text style={[styles.tituloSecao, styles.textoBranco]}>
              2. Preferências
            </Text>
            <View style={styles.card}>
              <View style={styles.linhaSwitch}>
                <Text style={styles.opcaoTexto}>
                  Lembrete Diário
                </Text>
                <Switch
                  value={lembreteDiario}
                  onValueChange={handleToggleLembrete}
                  trackColor={{ false: "#767577", true: "#A88AED" }}
                />
              </View>

              {lembreteDiario && (
                <View style={styles.linhaHorario}>
                  <Text style={styles.opcaoTexto}>Horário do Lembrete</Text>

                  {Platform.OS === 'ios' ? (
                    <DateTimePicker
                      value={horarioLembrete}
                      mode="time"
                      display="default"
                      themeVariant="dark"
                      onChange={onChangeTime}
                      style={{ width: 100 }}
                    />
                  ) : (
                    <>
                      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.timeBtn}>
                        <Text style={styles.timeText}>
                          {horarioLembrete.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                      </TouchableOpacity>
                      {showPicker && (
                        <DateTimePicker
                          value={horarioLembrete}
                          mode="time"
                          is24Hour={true}
                          display="default"
                          onChange={onChangeTime}
                        />
                      )}
                    </>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* SEÇÃO SAIR */}
          <View style={styles.secao}>
            <TouchableOpacity
              style={styles.botaoSairContainer}
              onPress={fazerLogout}
            >
              <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
              <Text style={styles.textoSair}>Sair da Conta</Text>
            </TouchableOpacity>
            <Text style={styles.versao}>Versão 1.2.0 • LUME</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerEscuro: {}, // Deixado vazio pois o fundo agora é o gradiente
  botaoVoltar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 20,
    marginBottom: 10,
    gap: 8,
  },
  textoVoltar: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Manrope-ExtraBold",
  },
  mainTitle: {
    fontSize: 28,
    fontFamily: "Manrope-ExtraBold",
    color: "#fff", // Fixo em branco para dar contraste com o gradiente
    marginBottom: 20,
  },
  secao: { marginBottom: 25 },
  tituloSecao: {
    fontSize: 14,
    fontFamily: "Manrope-ExtraBold",
    color: "#fff", // Fixo em branco para dar contraste com o gradiente
    textTransform: "uppercase",
    marginBottom: 10,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
    elevation: 0,
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
  avatarText: { color: "#fff", fontSize: 20, fontFamily: "Manrope-ExtraBold" },
  nome: { fontSize: 18, fontFamily: "Manrope-ExtraBold", color: "#fff" },
  email: { fontSize: 14, color: "rgba(255, 255, 255, 0.8)" },
  opcaoTexto: { fontSize: 16, fontFamily: "Manrope-ExtraBold", color: "#fff" },
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
  textoBotao: { fontFamily: "Manrope-ExtraBold", color: "#666" },
  textoBotaoAtivo: { color: "#fff" },
  linhaSwitch: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  linhaHorario: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    marginTop: 10,
  },
  timeBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timeText: {
    color: "#6c0382ff",
    fontSize: 16,
    fontFamily: "Manrope-ExtraBold",
  },
  botaoSairContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    paddingVertical: 16,
    borderRadius: 20,
    gap: 10,
    marginTop: 10,
  },
  textoSair: { color: "#FF3B30", fontSize: 16, fontFamily: "Manrope-ExtraBold" },
  versao: {
    textAlign: "center",
    color: "#fff", // Mudado para branco para contraste com o gradiente
    fontSize: 12,
    marginTop: 10,
    fontFamily: "Manrope-ExtraBold",
  },
});
