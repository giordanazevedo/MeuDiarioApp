// Tela de Registrar o Dia de Hoje — fluxo completo em uma única tela
import {
  Manrope_400Regular,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../src/supabase";

const { width } = Dimensions.get("window");

// =============================================
// DADOS — mesmos do index.tsx para consistência
// =============================================
const mainMoods = [
  {
    label: "Ótimo",
    emoji: require("../assets/images/emojisprincipal/otimo.png"),
    color: "#FFD93D",
    value: "Otimo",
  },
  {
    label: "Bem",
    emoji: require("../assets/images/emojisprincipal/bem.png"),
    color: "#FF8C42",
    value: "Bem",
  },
  {
    label: "Ruim",
    emoji: require("../assets/images/emojisprincipal/ruim.png"),
    color: "#FF4D4D",
    value: "Ruim",
  },
  {
    label: "Horrível",
    emoji: require("../assets/images/emojisprincipal/horrivel.png"),
    color: "#C850C0",
    value: "Horrivel",
  },
];

const emotionsList = [
  { id: "1", label: "Feliz", icon: "smile-beam" },
  { id: "2", label: "Empolgado(a)", icon: "grin-stars" },
  { id: "3", label: "Grato(a)", icon: "hand-holding-heart" },
  { id: "4", label: "Ansioso(a)", icon: "meh" },
  { id: "5", label: "Triste", icon: "sad-tear" },
  { id: "6", label: "Calmo(a)", icon: "smile" },
  { id: "7", label: "Estressado(a)", icon: "tired" },
  { id: "8", label: "Confiante", icon: "grin" },
  { id: "9", label: "Frustrado(a)", icon: "angry" },
  { id: "10", label: "Surpreso(a)", icon: "surprise" },
  { id: "11", label: "Amado(a)", icon: "kiss-wink-heart" },
  { id: "12", label: "Cansado(a)", icon: "battery-empty" },
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
  { id: "h4", label: "Meditação", icon: "brain" },
];

// =============================================
// COMPONENTE ITEM SELECIONÁVEL
// =============================================
function SelectableItem({
  item,
  selected,
  onSelect,
}: {
  item: { id: string; label: string; icon: string };
  selected: string;
  onSelect: (label: string) => void;
}) {
  const isSelected = selected === item.label;
  return (
    <TouchableOpacity
      onPress={() => onSelect(item.label)}
      style={styles.iconItem}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, isSelected && styles.iconCircleActive]}>
        <FontAwesome5
          name={item.icon}
          size={20}
          color={isSelected ? "#41386B" : "#A88AED"}
        />
      </View>
      <Text style={[styles.iconLabel, isSelected && styles.labelActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function RegistroHoje() {
  const router = useRouter();
  const { mood } = useLocalSearchParams();

  // Estados
  const [selectedMood, setSelectedMood] = useState<any>(null);

  useEffect(() => {
    if (mood) {
      const foundMood = mainMoods.find((m) => m.value === mood);
      if (foundMood) {
        setSelectedMood(foundMood);
      }
    }
  }, [mood]);
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [selectedSleep, setSelectedSleep] = useState("");
  const [selectedHealth, setSelectedHealth] = useState("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Animação do emoji selecionado
  const moodScaleAnim = useRef(new Animated.Value(1)).current;

  let [fontsLoaded] = useFonts({
    "Manrope-ExtraBold": Manrope_800ExtraBold,
    "Manrope-Bold": Manrope_700Bold,
    "Manrope-Regular": Manrope_400Regular,
  });

  // Seleciona o humor com animação de "pulso"
  const handleMoodSelect = (mood: any) => {
    setSelectedMood(mood);
    Animated.sequence([
      Animated.timing(moodScaleAnim, {
        toValue: 1.25,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(moodScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Salva o registro no Supabase
  const handleSalvar = async () => {
    if (!selectedMood) {
      Alert.alert(
        "Ops! 🙃",
        "Selecione pelo menos como você está se sentindo hoje."
      );
      return;
    }

    try {
      setIsSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(
          "Sessão expirada",
          "Faça login novamente para salvar seu diário."
        );
        return;
      }

      const { error } = await supabase.from("registros").insert([
        {
          humor: selectedMood.value,
          user_id: user.id,
          atividades: selectedEmotion,
          nivel_sono: selectedSleep,
          nivel_saude: selectedHealth,
          anotacao: note,
          data_criacao: new Date().toISOString(),
        },
      ]);

      if (!error) {
        Alert.alert("Salvo! ✌️", "Seu registro foi salvo com sucesso.", [
          {
            text: "Ótimo!",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Erro ao salvar", error.message);
      }
    } catch (err) {
      Alert.alert("Erro", "Ocorreu um problema de conexão. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const getDataHoje = () => {
    const hoje = new Date();
    const opcoes: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    const str = hoje.toLocaleDateString("pt-BR", opcoes);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (!fontsLoaded) {
    return (
      <LinearGradient
        colors={["#41386B", "#A88AED", "#CBD83B"]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#fff" />
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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* ===== CABEÇALHO ===== */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={26} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Registrar Hoje ✏️</Text>
              <Text style={styles.headerDate}>{getDataHoje()}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                selectedMood ? styles.saveBtnActive : styles.saveBtnDisabled,
              ]}
              onPress={handleSalvar}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#41386B" />
              ) : (
                <Ionicons
                  name="checkmark"
                  size={22}
                  color={selectedMood ? "#41386B" : "rgba(255,255,255,0.4)"}
                />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* ===== SEÇÃO 1: EMOÇÕES DETALHADAS ===== */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>1. Emoções</Text>
              <Text style={styles.sectionHint}>
                Selecione a que mais combina (opcional)
              </Text>
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
            </View>

            {/* ===== SEÇÃO 2: SONO ===== */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>2. Como foi seu sono?</Text>
              <Text style={styles.sectionHint}>
                O sono afeta muito o seu humor (opcional)
              </Text>
              <View style={styles.darkCard}>
                <View style={styles.sleepRow}>
                  {sleepList.map((item) => {
                    const isSelected = selectedSleep === item.label;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.sleepCard,
                          isSelected && styles.sleepCardActive,
                        ]}
                        onPress={() =>
                          setSelectedSleep(isSelected ? "" : item.label)
                        }
                        activeOpacity={0.75}
                      >
                        <FontAwesome5
                          name={item.icon}
                          size={22}
                          color={isSelected ? "#41386B" : "#A88AED"}
                        />
                        <Text
                          style={[
                            styles.sleepLabel,
                            isSelected && styles.sleepLabelActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* ===== SEÇÃO 3: SAÚDE / ATIVIDADES ===== */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>3. Saúde & Atividades</Text>
              <Text style={styles.sectionHint}>
                O que você fez de bom por você hoje? (opcional)
              </Text>
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
            </View>

            {/* ===== SEÇÃO 4: ANOTAÇÃO ===== */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>4. Anotação livre</Text>
              <Text style={styles.sectionHint}>
                Escreva o que quiser sobre o seu dia (opcional)
              </Text>
              <View style={styles.darkCard}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Como foi o seu dia? O que aconteceu de especial?..."
                  placeholderTextColor="#555"
                  multiline
                  value={note}
                  onChangeText={setNote}
                  maxLength={500}
                />
                <Text style={styles.charCount}>{note.length}/500</Text>
              </View>
            </View>

            {/* ===== BOTÃO SALVAR GRANDE ===== */}
            <TouchableOpacity
              style={[
                styles.bigSaveBtn,
                !selectedMood && styles.bigSaveBtnDisabled,
              ]}
              onPress={handleSalvar}
              disabled={isSaving || !selectedMood}
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator color="#41386B" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#41386B" />
                  <Text style={styles.bigSaveBtnText}>Salvar Registro</Text>
                </>
              )}
            </TouchableOpacity>

            {!selectedMood && (
              <Text style={styles.saveHint}>
                Selecione seu humor para salvar ⬆️
              </Text>
            )}

            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// =============================================
// ESTILOS
// =============================================
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: { flex: 1 },

  // Cabeçalho
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "Manrope-ExtraBold",
  },
  headerDate: {
    fontSize: 12,
    color: "#CBD83B",
    fontFamily: "Manrope-Regular",
    marginTop: 2,
  },
  saveBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnActive: { backgroundColor: "#CBD83B" },
  saveBtnDisabled: { backgroundColor: "rgba(255,255,255,0.15)" },

  // Scroll
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  // Seções
  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "Manrope-ExtraBold",
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Manrope-Regular",
    marginBottom: 16,
  },

  // Humor Principal
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  moodItem: { alignItems: "center", width: (width - 60) / 4 },
  emojiCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  emojiImage: { width: 40, height: 40 },
  moodLabel: { fontSize: 12, textAlign: "center" },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  selectedBadgeText: {
    fontFamily: "Manrope-Bold",
    fontSize: 13,
  },

  // Card escuro base
  darkCard: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 20,
  },

  // Grid de ícones
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  iconItem: { alignItems: "center", width: "25%", marginBottom: 18 },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  iconCircleActive: { backgroundColor: "#CBD83B" },
  iconLabel: {
    color: "#fff",
    fontSize: 11,
    textAlign: "center",
    fontFamily: "Manrope-Regular",
  },
  labelActive: {
    color: "#CBD83B",
    fontFamily: "Manrope-Bold",
  },

  // Sono — cards horizontais
  sleepRow: { flexDirection: "row", gap: 10 },
  sleepCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  sleepCardActive: { backgroundColor: "#CBD83B" },
  sleepLabel: {
    color: "#A88AED",
    fontSize: 11,
    fontFamily: "Manrope-Bold",
    textAlign: "center",
  },
  sleepLabelActive: { color: "#41386B" },

  // Input de texto
  textInput: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Manrope-Regular",
    minHeight: 120,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  charCount: {
    color: "#444",
    fontSize: 11,
    fontFamily: "Manrope-Regular",
    textAlign: "right",
    marginTop: 8,
  },

  // Botão salvar grande
  bigSaveBtn: {
    backgroundColor: "#CBD83B",
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    elevation: 6,
    shadowColor: "#CBD83B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  bigSaveBtnDisabled: {
    backgroundColor: "rgba(203,216,59,0.35)",
    elevation: 0,
    shadowOpacity: 0,
  },
  bigSaveBtnText: {
    color: "#41386B",
    fontSize: 18,
    fontFamily: "Manrope-ExtraBold",
  },
  saveHint: {
    textAlign: "center",
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontFamily: "Manrope-Regular",
    marginTop: 12,
  },
});
