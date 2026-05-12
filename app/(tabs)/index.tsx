import {
  Manrope_400Regular,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { supabase } from "../../src/supabase";

const { width } = Dimensions.get("window");

// =============================================
// CONFIGURAÇÕES
// =============================================
const mainMoods = [
  { label: "Ótimo", emoji: require("../../assets/images/emojisprincipal/otimo.png"), color: "#FFD93D", value: "Otimo" },
  { label: "Bem", emoji: require("../../assets/images/emojisprincipal/bem.png"), color: "#FF8C42", value: "Bem" },
  { label: "Ruim", emoji: require("../../assets/images/emojisprincipal/ruim.png"), color: "#FF4D4D", value: "Ruim" },
  { label: "Horrível", emoji: require("../../assets/images/emojisprincipal/horrivel.png"), color: "#C850C0", value: "Horrivel" },
];

const frasesMotivacionais = [
  { texto: "Permita-se descansar sem culpa. ☁️", autor: "MeuDiário" },
  { texto: "Cuide da sua mente, ela cuida de você. 🧠", autor: "MeuDiário" },
  { texto: "Pequenos passos levam a grandes mudanças. 🦋", autor: "MeuDiário" },
];

const dicasBemEstar = [
  { titulo: "Sono", descricao: "Tente dormir e acordar no mesmo horário.", icone: "moon-outline", cor: "#7B68EE" },
  { titulo: "Hidrate-se", descricao: "Beba pelo menos 2L de água hoje.", icone: "water-outline", cor: "#4ECDC4" },
];

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

interface Registro {
  id: string;
  data_criacao: string;
  humor: string;
  anotacao?: string;
  atividades?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMainMood, setSelectedMainMood] = useState<any>(null);
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [selectedSleep, setSelectedSleep] = useState("");
  const [selectedHealth, setSelectedHealth] = useState("");
  const [note, setNote] = useState("");
  const [userName, setUserName] = useState("");
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [humorFrequente, setHumorFrequente] = useState("");
  const [jaRegistrouHoje, setJaRegistrouHoje] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const { fraseHoje, dicaHoje } = useMemo(() => {
    const dia = new Date().getDate();
    return {
      fraseHoje: frasesMotivacionais[dia % frasesMotivacionais.length],
      dicaHoje: dicasBemEstar[dia % dicasBemEstar.length],
    };
  }, []);

  let [fontsLoaded] = useFonts({
    "Manrope-ExtraBold": Manrope_800ExtraBold,
    "Manrope-Bold": Manrope_700Bold,
    "Manrope-Regular": Manrope_400Regular,
  });

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const nomeRaw = user.user_metadata?.nome_usuario || user.email?.split("@")[0] || "Usuário";
      setUserName(nomeRaw.charAt(0).toUpperCase() + nomeRaw.slice(1));
    }
  };

  const fetchRegistros = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("user_id", user.id)
        .order("data_criacao", { ascending: false });

      if (!error && data) {
        setRegistros(data.slice(0, 5));
        setTotalRegistros(data.length);
        const hoje = new Date().toISOString().split("T")[0];
        setJaRegistrouHoje(data.some((r) => r.data_criacao.startsWith(hoje)));

        if (data.length > 0) {
          const contagem: Record<string, number> = {};
          data.forEach((r) => (contagem[r.humor] = (contagem[r.humor] || 0) + 1));
          const maisFrequente = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0];
          setHumorFrequente(maisFrequente ? maisFrequente[0] : "");
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchRegistros();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useFocusEffect(useCallback(() => { fetchUserData(); fetchRegistros(); }, []));

  const handleFinalSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsSaving(false); return; }

    const { error } = await supabase.from("registros").insert([{
      humor: selectedMainMood.value,
      user_id: user.id,
      atividades: selectedEmotion,
      nivel_sono: selectedSleep,
      nivel_saude: selectedHealth,
      anotacao: note,
      data_criacao: new Date().toISOString(),
    }]);

    if (!error) {
      setModalVisible(false);
      Alert.alert("Sucesso ✨", "Seu dia foi guardado!");
      setSelectedEmotion(""); setSelectedSleep(""); setSelectedHealth(""); setNote("");
      fetchRegistros();
    }
    setIsSaving(false);
  };

  const SelectableItem = ({ item, selected, onSelect }: any) => (
    <TouchableOpacity onPress={() => onSelect(item.label)} style={styles.iconItem}>
      <View style={[styles.iconCircle, selected === item.label && styles.iconCircleActive]}>
        <FontAwesome5 name={item.icon} size={22} color={selected === item.label ? "#fff" : "#A88AED"} />
      </View>
      <Text style={[styles.iconLabel, selected === item.label && styles.labelActive]}>{item.label}</Text>
    </TouchableOpacity>
  );

  if (!fontsLoaded || loading) {
    return (
      <LinearGradient colors={["#41386B", "#A88AED", "#CBD83B"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#41386B", "#A88AED", "#CBD83B"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRegistros(); }} tintColor="#fff" />}
        >
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.headerLeft}>
              <Text style={styles.saudacao}>Olá,</Text>
              <Text style={styles.nomeUsuario}>{userName} 👋</Text>
              <Text style={styles.dataHoje}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/configuracoes")}>
              <Ionicons name="person-circle-outline" size={42} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>"{fraseHoje.texto}"</Text>
            <Text style={styles.quoteAuthor}>— {fraseHoje.autor}</Text>
          </View>

          <View style={styles.statsRow}>
            <StatCard icon="calendar-outline" val={totalRegistros} label="Registros" color="#FFD93D" />
            <StatCard icon="trending-up-outline" val={humorFrequente || "—"} label="Frequente" color="#4ECDC4" />
            <StatCard icon="flame-outline" val={jaRegistrouHoje ? "🔥" : "0"} label="Sequência" color="#FF6B6B" />
          </View>

          <View style={styles.moodSection}>
            <Text style={styles.moodSectionTitle}>Como você está hoje?</Text>
            <View style={styles.moodRow}>
              {mainMoods.map((mood) => (
                <TouchableOpacity key={mood.value} onPress={() => { setSelectedMainMood(mood); setModalVisible(true); }} style={styles.moodItem}>
                  <View style={[styles.emojiCircle, { backgroundColor: mood.color }]}>
                    <Image source={mood.emoji} style={styles.emojiImage} resizeMode="contain" />
                  </View>
                  <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Registros Recentes</Text>
              <TouchableOpacity onPress={() => router.push("/historico")}><Text style={styles.verTodosText}>Ver todos →</Text></TouchableOpacity>
            </View>
            {registros.map((item) => (
              <View key={item.id} style={styles.registroCard}>
                <Ionicons name="happy-outline" size={24} color="#FFD93D" />
                <View style={{ marginLeft: 15 }}>
                  <Text style={styles.registroHumor}>{item.humor}</Text>
                  <Text style={styles.registroData}>{new Date(item.data_criacao).toLocaleDateString("pt-BR")}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.dicaCard}>
            <View style={styles.dicaHeader}>
              <Ionicons name={dicaHoje.icone as any} size={24} color="#A88AED" />
              <Text style={styles.dicaTitulo}>{dicaHoje.titulo}</Text>
            </View>
            <Text style={styles.dicaDescricao}>{dicaHoje.descricao}</Text>
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <LinearGradient colors={["#41386B", "#A88AED"]} style={styles.darkContainer}>
          <SafeAreaView style={{ flex: 1, padding: 20 }}>
            <View style={styles.darkHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={32} color="#fff" /></TouchableOpacity>
              <Text style={styles.darkHeaderTitle}>Detalhes do Dia</Text>
              <TouchableOpacity onPress={handleFinalSave} disabled={isSaving}><Text style={styles.saveBtnText}>{isSaving ? "..." : "Salvar"}</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>Emoções</Text>
              <View style={styles.darkCard}>
                <View style={styles.grid}>{emotionsList.map(i => <SelectableItem key={i.id} item={i} selected={selectedEmotion} onSelect={setSelectedEmotion} />)}</View>
              </View>
              <Text style={styles.sectionTitle}>Anotação</Text>
              <TextInput style={styles.darkInput} multiline value={note} onChangeText={setNote} placeholder="Escreva aqui..." placeholderTextColor="#aaa" />
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}

// Sub-componente de Stat Card
const StatCard = ({ icon, val, label, color }: any) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={styles.statNumber}>{val}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  headerLeft: { flex: 1 },
  saudacao: { fontSize: 16, color: "#FFFFFF", opacity: 0.9 },
  nomeUsuario: { fontSize: 28, color: "#FFFFFF", fontFamily: "Manrope-ExtraBold" },
  dataHoje: { fontSize: 14, color: "#CBD83B", fontFamily: "Manrope-Bold" },
  quoteCard: { backgroundColor: "rgba(30, 25, 55, 0.95)", borderRadius: 20, padding: 20, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: "#CBD83B" },
  quoteText: { fontSize: 16, color: "#FFFFFF", fontFamily: "Manrope-Bold", fontStyle: "italic", lineHeight: 22 },
  quoteAuthor: { fontSize: 12, color: "#CBD83B", textAlign: "right", marginTop: 10 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25, gap: 10 },
  statCard: { flex: 1, backgroundColor: "rgba(65, 56, 107, 0.9)", borderRadius: 16, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.15)" },
  statNumber: { fontSize: 18, color: "#FFFFFF", fontFamily: "Manrope-ExtraBold", marginTop: 4 },
  statLabel: { fontSize: 10, color: "#FFFFFF", opacity: 0.8 },
  moodSection: { backgroundColor: "rgba(25, 20, 45, 0.98)", borderRadius: 24, padding: 24, marginBottom: 25 },
  moodSectionTitle: { fontSize: 20, color: "#FFFFFF", fontFamily: "Manrope-ExtraBold", textAlign: "center", marginBottom: 20 },
  moodRow: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  moodItem: { alignItems: "center", width: 75 },
  emojiCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  emojiImage: { width: 38, height: 38 },
  moodLabel: { fontSize: 12, fontFamily: "Manrope-Bold" },
  recentSection: { marginBottom: 20 },
  recentHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  recentTitle: { fontSize: 18, color: "#FFFFFF", fontWeight: "bold" },
  verTodosText: { fontSize: 13, color: "#CBD83B" },
  registroCard: { flexDirection: "row", backgroundColor: "rgba(255, 255, 255, 0.15)", borderRadius: 18, padding: 16, alignItems: "center", marginBottom: 10 },
  registroHumor: { fontSize: 16, color: "#FFFFFF", fontWeight: "bold" },
  registroData: { fontSize: 12, color: "#DDDDDD" },
  dicaCard: { backgroundColor: "rgba(43, 34, 78, 0.98)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#A88AED" },
  dicaHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  dicaTitulo: { fontSize: 18, color: "#FFFFFF", fontWeight: "bold", marginLeft: 10 },
  dicaDescricao: { fontSize: 14, color: "#FFFFFF", opacity: 0.9, lineHeight: 20 },
  darkContainer: { flex: 1 },
  darkHeader: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 20, alignItems: "center" },
  darkHeaderTitle: { color: "#FFFFFF", fontSize: 16, fontFamily: "Manrope-Bold" },
  saveBtnText: { fontFamily: "Manrope-ExtraBold", fontSize: 18, color: "#CBD83B" },
  sectionTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 15 },
  darkCard: { backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: 20, padding: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  iconItem: { alignItems: "center", width: "25%", marginBottom: 15 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center", marginBottom: 5 },
  iconCircleActive: { backgroundColor: "#A88AED" },
  iconLabel: { color: "#FFFFFF", fontSize: 11, textAlign: "center" },
  labelActive: { color: "#A88AED", fontWeight: "bold" },
  darkInput: { backgroundColor: "rgba(0, 0, 0, 0.4)", borderRadius: 16, padding: 16, color: "#FFFFFF", height: 120, textAlignVertical: "top" },
});