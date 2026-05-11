// Tela Principal do app - onde o usuario resume o seu dia, ve uma frase motivacional, dicas e etc.

import {
  Manrope_400Regular,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router"; // useFocusEffect vindo daqui
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../src/supabase";

const { width } = Dimensions.get("window");

// =============================================
// 1. CONFIGURAÇÃO DOS HUMORES PRINCIPAIS
// =============================================
const mainMoods = [
  {
    label: "Ótimo",
    emoji: require("../../assets/images/emojisprincipal/otimo.png"),
    color: "#FFD93D",
    value: "Otimo",
  },
  {
    label: "Bem",
    emoji: require("../../assets/images/emojisprincipal/bem.png"),
    color: "#FF8C42",
    value: "Bem",
  },
  {
    label: "Ruim",
    emoji: require("../../assets/images/emojisprincipal/ruim.png"),
    color: "#FF4D4D",
    value: "Ruim",
  },
  {
    label: "Horrível",
    emoji: require("../../assets/images/emojisprincipal/horrivel.png"),
    color: "#C850C0",
    value: "Horrivel",
  },
];

// =============================================
// FRASES MOTIVACIONAIS DIÁRIAS
// =============================================
const frasesMotivacionais = [
  { texto: "Cuide da sua mente, ela cuida de você. 🧠", autor: "MeuDiário" },
  { texto: "Cada dia é uma nova chance de ser melhor. 🌱", autor: "MeuDiário" },
  { texto: "Você é mais forte do que imagina. 💪", autor: "MeuDiário" },
  {
    texto: "Respirar fundo já é um ato de autocuidado. 🌬️",
    autor: "MeuDiário",
  },
  { texto: "Pequenos passos levam a grandes mudanças. 🦋", autor: "MeuDiário" },
  { texto: "Permita-se descansar sem culpa. ☁️", autor: "MeuDiário" },
  { texto: "Seu bem-estar é prioridade, não luxo. ✨", autor: "MeuDiário" },
];

// =============================================
// DICAS DE BEM-ESTAR
// =============================================
const dicasBemEstar = [
  {
    titulo: "Hidrate-se",
    descricao: "Beba pelo menos 2L de água hoje.",
    icone: "water-outline",
    cor: "#4ECDC4",
  },
  {
    titulo: "Respire fundo",
    descricao: "5 minutos de respiração profunda reduzem a ansiedade.",
    icone: "leaf-outline",
    cor: "#A8E6CF",
  },
  {
    titulo: "Movimento",
    descricao: "Uma caminhada de 15 min melhora o humor.",
    icone: "walk-outline",
    cor: "#FFD93D",
  },
  {
    titulo: "Gratidão",
    descricao: "Anote 3 coisas boas que aconteceram hoje.",
    icone: "heart-outline",
    cor: "#FF6B95",
  },
  {
    titulo: "Desconecte",
    descricao: "Tire 30 min longe das telas antes de dormir.",
    icone: "phone-portrait-outline",
    cor: "#C850C0",
  },
  {
    titulo: "Sono",
    descricao: "Tente dormir e acordar no mesmo horário.",
    icone: "moon-outline",
    cor: "#7B68EE",
  },
  {
    titulo: "Conexão",
    descricao: "Converse com alguém que te faz bem.",
    icone: "people-outline",
    cor: "#FF8C42",
  },
];

// =============================================
// 2. OPÇÕES DETALHADAS PARA O MODAL (TELA 2)
// =============================================
const emotionsList = [
  { id: "1", label: "Feliz", icon: "smile-beam" },
  { id: "2", label: "Empolgado(a)", icon: "grin-stars" },
  { id: "3", label: "Grato(a)", icon: "hand-holding-heart" },
  { id: "4", label: "Ansioso(a)", icon: "meh" },
];

const sleepList = [
  { id: "s1", label: "Bom Sono", icon: "bed" },
  { id: "s2", label: "Sono Neutro", icon: "bed" },
  { id: "s3", label: "Sono Ruim", icon: "procedures" },
];

const healthList = [
  { id: "h1", label: "Atividade Física", icon: "walking" },
  { id: "h2", label: "Alimentação Saudável", icon: "apple-alt" },
  { id: "h3", label: "Beber Água", icon: "tint" },
];

// =============================================
// INTERFACE DE TIPO PARA OS REGISTROS
// =============================================
interface Registro {
  id: string;
  data_criacao: string;
  humor: string;
  nivel_sono: string;
  nivel_saude: string;
  anotacao?: string;
  atividades?: string;
  user_id: string;
}

// =============================================
// COMPONENTE PRINCIPAL: TELA INICIAL
// =============================================
export default function HomeScreen() {
  const router = useRouter();

  // Estados do Modal de registro
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMainMood, setSelectedMainMood] = useState<any>(null);
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [selectedSleep, setSelectedSleep] = useState("");
  const [selectedHealth, setSelectedHealth] = useState("");
  const [note, setNote] = useState("");

  // Estados da tela principal
  const [userName, setUserName] = useState("");
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [humorFrequente, setHumorFrequente] = useState("");
  const [jaRegistrouHoje, setJaRegistrouHoje] = useState(false);

  // Animação de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Frase e dica do dia
  const diaDoAno = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  const fraseHoje = frasesMotivacionais[diaDoAno % frasesMotivacionais.length];
  const dicaHoje = dicasBemEstar[diaDoAno % dicasBemEstar.length];

  // Carregar fontes
  let [fontsLoaded] = useFonts({
    "Manrope-ExtraBold": Manrope_800ExtraBold,
    "Manrope-Bold": Manrope_700Bold,
    "Manrope-Regular": Manrope_400Regular,
  });

  // Buscar dados do usuário logado
  const fetchUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Puxa o nome do metadata que você alterou na tela de Detalhes
      const nomeAtualizado =
        user.user_metadata?.nome_usuario || user.email?.split("@")[0];
      setUserName(
        nomeAtualizado.charAt(0).toUpperCase() + nomeAtualizado.slice(1),
      );
    }
  };

  // Buscar registros recentes do usuário
  const fetchRegistros = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .eq("user_id", user.id)
      .order("data_criacao", { ascending: false })
      .limit(5);

    if (!error && data) {
      setRegistros(data);
      setTotalRegistros(data.length);

      const hoje = new Date().toDateString();
      const registrouHoje = data.some(
        (r) => new Date(r.data_criacao).toDateString() === hoje,
      );
      setJaRegistrouHoje(registrouHoje);

      if (data.length > 0) {
        const contagem: Record<string, number> = {};
        data.forEach((r) => {
          contagem[r.humor] = (contagem[r.humor] || 0) + 1;
        });
        const maisFrequente = Object.entries(contagem).sort(
          (a, b) => b[1] - a[1],
        )[0];
        setHumorFrequente(maisFrequente ? maisFrequente[0] : "");
      }
    } else if (error) {
      console.error("Erro ao buscar registros:", error);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUserData();
    fetchRegistros();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Toda vez que você volta para a Home, ele executa essas funções
      fetchUserData();
      fetchRegistros();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRegistros();
  };

  const handleMainMoodSelect = (mood: any) => {
    setSelectedMainMood(mood);
    setModalVisible(true);
  };

  const handleFinalSave = async () => {
    try {
      setIsSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(
          "Sessão expirada",
          "Faça login novamente para salvar seu diário.",
        );
        setIsSaving(false);
        return;
      }

      const { error } = await supabase.from("registros").insert([
        {
          humor: selectedMainMood.value,
          user_id: user.id,
          atividades: selectedEmotion,
          nivel_sono: selectedSleep,
          nivel_saude: selectedHealth,
          anotacao: note,
          data_criacao: new Date().toISOString(),
        },
      ]);

      if (!error) {
        setModalVisible(false);
        Alert.alert("Sucesso ✌️", "Seu registro foi salvo!");
        setSelectedEmotion("");
        setSelectedSleep("");
        setSelectedHealth("");
        setNote("");
        fetchRegistros();
      } else {
        console.error("Erro do Supabase ao salvar:", error);
        Alert.alert("Erro do Banco", error.message);
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      Alert.alert("Erro", "Ocorreu um problema de conexão. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getDataHoje = () => {
    const hoje = new Date();
    const opcoes: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    const dataFormatada = hoje.toLocaleDateString("pt-BR", opcoes);
    return dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
  };

  const getHumorIcon = (humor: string) => {
    switch (humor) {
      case "Otimo":
        return { icon: "happy", color: "#FFD93D" };
      case "Bem":
        return { icon: "happy-outline", color: "#FF8C42" };
      case "Ruim":
        return { icon: "sad-outline", color: "#FF4D4D" };
      case "Horrivel":
        return { icon: "sad", color: "#C850C0" };
      default:
        return { icon: "ellipse", color: "#666" };
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <LinearGradient
        colors={["#41386B", "#A88AED", "#CBD83B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={[styles.loadingText, { color: "#fff" }]}>
          Carregando...
        </Text>
      </LinearGradient>
    );
  }

  const SelectableItem = ({ item, selected, onSelect }: any) => (
    <TouchableOpacity
      onPress={() => onSelect(item.label)}
      style={styles.iconItem}
    >
      <View
        style={[
          styles.iconCircle,
          selected === item.label && styles.iconCircleActive,
        ]}
      >
        <FontAwesome5
          name={item.icon}
          size={22}
          color={selected === item.label ? "#fff" : "#E94D89"}
        />
      </View>
      <Text
        style={[
          styles.iconLabel,
          selected === item.label && styles.labelActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderRegistroItem = ({ item }: { item: Registro }) => {
    const dataObj = new Date(item.data_criacao);
    const dataFormatada = dataObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
    const horaFormatada = dataObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const humorInfo = getHumorIcon(item.humor);

    return (
      <TouchableOpacity style={styles.registroCard} activeOpacity={0.7}>
        <View
          style={[
            styles.registroIconCircle,
            { backgroundColor: humorInfo.color + "20" },
          ]}
        >
          <Ionicons
            name={humorInfo.icon as any}
            size={26}
            color={humorInfo.color}
          />
        </View>
        <View style={styles.registroTextos}>
          <Text style={styles.registroHumor}>{item.humor}</Text>
          <Text style={styles.registroData}>
            {dataFormatada} • {horaFormatada}
          </Text>
        </View>
        {item.anotacao ? (
          <Ionicons name="document-text-outline" size={18} color="#aaa" />
        ) : null}
      </TouchableOpacity>
    );
  };

  // =============================================
  // RENDER PRINCIPAL (AGORA ENVELOPADO NO LINEAR GRADIENT)
  // =============================================
  return (
    <LinearGradient
      colors={["#41386B", "#A88AED", "#CBD83B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
        >
          {/* ===== CABEÇALHO COM SAUDAÇÃO ===== */}
          <Animated.View
            style={[
              styles.header,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.headerLeft}>
              <Text style={styles.saudacao}>{getSaudacao()},</Text>
              <Text style={styles.nomeUsuario}>{userName} 👋</Text>
              <Text style={styles.dataHoje}>{getDataHoje()}</Text>
            </View>
            <View style={styles.headerRight}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: jaRegistrouHoje ? "#2D4A3E" : "#4A2D2D" },
                ]}
              >
                <Ionicons
                  name={jaRegistrouHoje ? "checkmark-circle" : "alert-circle"}
                  size={14}
                  color={jaRegistrouHoje ? "#4ECDC4" : "#FF6B6B"}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: jaRegistrouHoje ? "#4ECDC4" : "#FF6B6B" },
                  ]}
                >
                  {jaRegistrouHoje ? "Registrado ✓" : "Pendente"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => router.push("/configuracoes")}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={42}
                  color="#fff" // Deixei branco para destacar no degradê
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ===== FRASE MOTIVACIONAL DO DIA ===== */}
          <Animated.View style={[styles.quoteCard, { opacity: fadeAnim }]}>
            <View style={styles.quoteIconRow}>
              <Text style={styles.quoteIcon}>💭</Text>
            </View>
            <Text style={styles.quoteText}>{fraseHoje.texto}</Text>
            <Text style={styles.quoteAuthor}>— {fraseHoje.autor}</Text>
          </Animated.View>

          {/* ===== CARDS DE ESTATÍSTICAS RÁPIDAS ===== */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardBorder1]}>
              <Ionicons name="calendar-outline" size={22} color="#FFD93D" />
              <Text style={styles.statNumber}>{totalRegistros}</Text>
              <Text style={styles.statLabel}>Registros</Text>
            </View>
            <View style={[styles.statCard, styles.statCardBorder2]}>
              <Ionicons name="trending-up-outline" size={22} color="#4ECDC4" />
              <Text style={styles.statNumber}>{humorFrequente || "—"}</Text>
              <Text style={styles.statLabel}>Mais frequente</Text>
            </View>
            <View style={[styles.statCard, styles.statCardBorder3]}>
              <Ionicons name="flame-outline" size={22} color="#FF6B6B" />
              <Text style={styles.statNumber}>
                {totalRegistros > 0 ? "🔥" : "—"}
              </Text>
              <Text style={styles.statLabel}>Sequência</Text>
            </View>
          </View>

          {/* ===== SEÇÃO: COMO VOCÊ ESTÁ HOJE? ===== */}
          <View style={styles.moodSection}>
            <Text style={styles.moodSectionTitle}>Como você está hoje?</Text>
            <Text style={styles.moodSectionSubtitle}>
              Toque em um emoji para registrar
            </Text>

            <View style={styles.moodRow}>
              {mainMoods.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  onPress={() => handleMainMoodSelect(mood)}
                  style={styles.moodItem}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.emojiCircle,
                      { backgroundColor: mood.color },
                    ]}
                  >
                    <Image
                      source={mood.emoji}
                      style={styles.emojiImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={[styles.moodLabel, { color: mood.color }]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ===== SEÇÃO: REGISTROS RECENTES ===== */}
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Registros Recentes</Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/historico")}
              >
                <Text style={styles.verTodosText}>Ver todos →</Text>
              </TouchableOpacity>
            </View>

            {registros.length > 0 ? (
              <FlatList
                data={registros}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderRegistroItem}
                scrollEnabled={false}
                contentContainerStyle={styles.registrosList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="book-outline" size={48} color="#fff" />
                <Text style={styles.emptyText}>Nenhum registro ainda</Text>
                <Text style={styles.emptySubtext}>
                  Comece registrando como você se sente hoje! ✨
                </Text>
              </View>
            )}
          </View>

          {/* ===== DICA DE BEM-ESTAR DO DIA ===== */}
          <View style={styles.dicaCard}>
            <View style={styles.dicaHeader}>
              <View
                style={[
                  styles.dicaIconCircle,
                  { backgroundColor: dicaHoje.cor + "25" },
                ]}
              >
                <Ionicons
                  name={dicaHoje.icone as any}
                  size={24}
                  color={dicaHoje.cor}
                />
              </View>
              <View style={styles.dicaHeaderText}>
                <Text style={styles.dicaLabel}>Dica do dia</Text>
                <Text style={styles.dicaTitulo}>{dicaHoje.titulo}</Text>
              </View>
              <Ionicons name="sparkles" size={18} color="#FFD93D" />
            </View>
            <Text style={styles.dicaDescricao}>{dicaHoje.descricao}</Text>
          </View>

          {/* Espaço extra */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* ===== MODAL: DETALHES DO REGISTRO (TAMBÉM ENVELOPADO) ===== */}
      <Modal animationType="slide" visible={modalVisible} transparent={true}>
        <LinearGradient
          colors={["#41386B", "#A88AED", "#CBD83B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.darkContainer}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.darkHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={32} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.darkHeaderTitle}>
                {selectedMainMood
                  ? `Sentindo-se ${selectedMainMood.label}`
                  : "Detalhes"}
              </Text>

              <TouchableOpacity
                onPress={handleFinalSave}
                style={styles.saveBtn}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    style={{ marginRight: 5 }}
                  />
                ) : (
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                )}
                <Text style={[styles.saveBtnText, { color: "#fff" }]}>
                  {isSaving ? "Salvando..." : "Salvar"}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ paddingHorizontal: 20 }}
            >
              {selectedMainMood && (
                <View style={styles.selectedMoodDisplay}>
                  <View
                    style={[
                      styles.selectedEmojiCircle,
                      { backgroundColor: selectedMainMood.color },
                    ]}
                  >
                    <Image
                      source={selectedMainMood.emoji}
                      style={styles.selectedEmojiImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              )}

              <Text style={styles.sectionTitle}>Emoções</Text>
              <View style={styles.darkCard}>
                <View style={styles.grid}>
                  {emotionsList.map((item) => (
                    <SelectableItem
                      key={item.id}
                      item={item}
                      selected={selectedEmotion}
                      onSelect={setSelectedEmotion}
                    />
                  ))}
                </View>
              </View>

              <Text style={styles.sectionTitle}>Sono</Text>
              <View style={styles.darkCard}>
                <View style={styles.grid}>
                  {sleepList.map((item) => (
                    <SelectableItem
                      key={item.id}
                      item={item}
                      selected={selectedSleep}
                      onSelect={setSelectedSleep}
                    />
                  ))}
                </View>
              </View>

              <Text style={styles.sectionTitle}>Saúde</Text>
              <View style={styles.darkCard}>
                <View style={styles.grid}>
                  {healthList.map((item) => (
                    <SelectableItem
                      key={item.id}
                      item={item}
                      selected={selectedHealth}
                      onSelect={setSelectedHealth}
                    />
                  ))}
                </View>
              </View>

              <Text style={styles.sectionTitle}>Anotação rápida</Text>
              <TextInput
                style={styles.darkInput}
                placeholder="Como foi o seu dia? Escreva aqui..."
                placeholderTextColor="#aaa"
                multiline
                value={note}
                onChangeText={setNote}
              />
              <View style={{ height: 50 }} />
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { color: "#666", marginTop: 12, fontFamily: "Manrope-Regular" },
  container: {
    flex: 1,
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 50 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  headerLeft: { flex: 1 },
  saudacao: { fontSize: 16, color: "#fff", fontFamily: "Manrope-Regular" }, // Mudei para branco pra contrastar melhor com o fundo
  nomeUsuario: {
    fontSize: 28,
    color: "#fff",
    fontFamily: "Manrope-ExtraBold",
    marginTop: 2,
  },
  dataHoje: {
    fontSize: 14,
    color: "#CBD83B", // Corrigido pra verde limão
    fontFamily: "Manrope-Bold",
    marginTop: 4,
  },
  headerRight: { alignItems: "flex-end", gap: 8 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  statusBadgeText: { fontSize: 11, fontFamily: "Manrope-Bold" },
  profileButton: { padding: 5 },
  quoteCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#CBD83B", // Mudei pra verde limão
  },
  quoteIconRow: { marginBottom: 8 },
  quoteIcon: { fontSize: 22 },
  quoteText: {
    fontSize: 16,
    color: "#ddd",
    fontFamily: "Manrope-Bold",
    lineHeight: 24,
    fontStyle: "italic",
  },
  quoteAuthor: {
    fontSize: 12,
    color: "#aaa",
    fontFamily: "Manrope-Regular",
    marginTop: 8,
    textAlign: "right",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  statCardBorder1: { borderColor: "#FFD93D30" },
  statCardBorder2: { borderColor: "#4ECDC430" },
  statCardBorder3: { borderColor: "#FF6B6B30" },
  statNumber: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Manrope-ExtraBold",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: "#aaa",
    fontFamily: "Manrope-Regular",
    marginTop: 2,
    textAlign: "center",
  },
  moodSection: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A88AED", // Mudei a bordinha pra roxo
  },
  moodSectionTitle: {
    fontSize: 22,
    color: "#fff",
    fontFamily: "Manrope-ExtraBold",
    textAlign: "center",
  },
  moodSectionSubtitle: {
    fontSize: 14,
    color: "#aaa",
    fontFamily: "Manrope-Regular",
    marginTop: 4,
    marginBottom: 24,
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  moodItem: { alignItems: "center", width: 75 },
  emojiCircle: {
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  emojiImage: { width: 42, height: 42 },
  moodLabel: { fontSize: 13, fontFamily: "Manrope-Bold", textAlign: "center" },
  recentSection: { marginBottom: 10 },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  recentTitle: { fontSize: 18, color: "#fff", fontFamily: "Manrope-ExtraBold" },
  verTodosText: { fontSize: 14, color: "#CBD83B", fontFamily: "Manrope-Bold" },
  registrosList: { gap: 10 },
  registroCard: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  registroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  registroTextos: { flex: 1, marginLeft: 14 },
  registroHumor: { fontSize: 16, color: "#fff", fontFamily: "Manrope-Bold" },
  registroData: {
    fontSize: 12,
    color: "#aaa",
    fontFamily: "Manrope-Regular",
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Manrope-Bold",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#aaa",
    fontFamily: "Manrope-Regular",
    marginTop: 6,
    textAlign: "center",
  },
  darkContainer: {
    flex: 1,
  },
  darkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  darkHeaderTitle: { color: "#fff", fontSize: 16, fontFamily: "Manrope-Bold" },
  saveBtn: { flexDirection: "row", alignItems: "center" },
  saveBtnText: {
    fontFamily: "Manrope-ExtraBold",
    marginLeft: 8,
    fontSize: 18,
  },
  selectedMoodDisplay: { alignItems: "center", marginBottom: 20 },
  selectedEmojiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  selectedEmojiImage: { width: 55, height: 55 },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Manrope-ExtraBold",
    marginTop: 20,
    marginBottom: 15,
  },
  darkCard: { backgroundColor: "#1A1A1A", borderRadius: 20, padding: 20 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  iconItem: { alignItems: "center", width: "25%", marginBottom: 15 },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  iconCircleActive: { backgroundColor: "#A88AED" }, // Botão ativo fica roxinho
  iconLabel: {
    color: "#ffffff",
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Manrope-Bold",
  },
  labelActive: { color: "#A88AED" },
  darkInput: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    color: "#fff",
    height: 120,
    textAlignVertical: "top",
    marginTop: 5,
    fontFamily: "Manrope-Regular",
    fontSize: 15,
  },
  dicaCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  dicaHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  dicaIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  dicaHeaderText: { flex: 1, marginLeft: 12 },
  dicaLabel: {
    fontSize: 11,
    color: "#aaa",
    fontFamily: "Manrope-Regular",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dicaTitulo: {
    fontSize: 17,
    color: "#fff",
    fontFamily: "Manrope-ExtraBold",
    marginTop: 2,
  },
  dicaDescricao: {
    fontSize: 14,
    color: "#ccc",
    fontFamily: "Manrope-Regular",
    lineHeight: 20,
  },
});
