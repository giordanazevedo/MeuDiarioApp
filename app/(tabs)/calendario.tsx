// Tela de Calendário/Agenda — marcações de dias importantes
import {
  Manrope_400Regular,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../src/supabase";

interface DiasImportante {
  id: string;
  titulo: string;
  data_evento: string;
  categoria: string;
  user_id: string;
}

function getDiasRestantes(dataEvento: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const evento = new Date(dataEvento);
  evento.setHours(0, 0, 0, 0);
  const diff = evento.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const categoriaIcone: Record<string, string> = {
  Aniversário: "gift-outline",
  Relacionamento: "heart-outline",
  Família: "people-outline",
  Viagem: "airplane-outline",
  Casa: "home-outline",
  Trabalho: "briefcase-outline",
};

export default function CalendarioScreen() {
  const router = useRouter();
  const [eventos, setEventos] = useState<DiasImportante[]>([]);
  const [loading, setLoading] = useState(true);

  let [fontsLoaded] = useFonts({
    "Manrope-ExtraBold": Manrope_800ExtraBold,
    "Manrope-Bold": Manrope_700Bold,
    "Manrope-Regular": Manrope_400Regular,
  });

  const fetchEventos = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("dias_importantes")
      .select("*")
      .eq("user_id", user.id)
      .order("data_evento", { ascending: true });

    if (!error && data) {
      setEventos(data);
    } else if (error) {
      console.error("Erro ao buscar eventos:", error);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchEventos();
    }, [])
  );

  const deletarEvento = (id: string) => {
    Alert.alert("Remover Evento", "Deseja remover este dia importante?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("dias_importantes")
            .delete()
            .eq("id", id);
          if (!error) {
            setEventos((prev) => prev.filter((e) => e.id !== id));
          }
        },
      },
    ]);
  };

  if (!fontsLoaded || loading) {
    return (
      <LinearGradient
        colors={["#41386B", "#A88AED", "#CBD83B"]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  const renderEvento = ({ item }: { item: DiasImportante }) => {
    const dias = getDiasRestantes(item.data_evento);
    const dataFormatada = new Date(item.data_evento).toLocaleDateString(
      "pt-BR",
      { day: "2-digit", month: "long", year: "numeric" }
    );
    const icone = (categoriaIcone[item.categoria] || "star-outline") as any;
    const passado = dias < 0;
    const hoje = dias === 0;

    return (
      <View style={styles.card}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: hoje ? "#CBD83B20" : "#A88AED20" },
          ]}
        >
          <Ionicons
            name={icone}
            size={26}
            color={hoje ? "#CBD83B" : "#A88AED"}
          />
        </View>

        <View style={styles.cardTextos}>
          <Text style={styles.cardTitulo}>{item.titulo}</Text>
          <Text style={styles.cardData}>{dataFormatada}</Text>
          <Text
            style={[
              styles.cardContagem,
              passado
                ? styles.passado
                : hoje
                ? styles.hoje
                : styles.futuro,
            ]}
          >
            {passado
              ? `Passou há ${Math.abs(dias)} dia(s)`
              : hoje
              ? "🎉 É hoje!"
              : `Faltam ${dias} dia(s)`}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => deletarEvento(item.id)}
          style={{ padding: 5 }}
        >
          <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#41386B", "#A88AED", "#CBD83B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Agenda 📅</Text>
            <Text style={styles.headerSubtitle}>
              Seus dias importantes
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/selecionar_categoria")}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="#41386B" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id}
          renderItem={renderEvento}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={52} color="#fff" />
              <Text style={styles.emptyTitle}>Nenhum dia importante</Text>
              <Text style={styles.emptySubtitle}>
                Toque em + para adicionar eventos especiais
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push("/selecionar_categoria")}
              >
                <Text style={styles.emptyBtnText}>Adicionar evento</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    color: "#fff",
    fontFamily: "Manrope-ExtraBold",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#CBD83B",
    fontFamily: "Manrope-Regular",
    marginTop: 2,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#CBD83B",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#CBD83B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardTextos: { flex: 1 },
  cardTitulo: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Manrope-Bold",
  },
  cardData: {
    color: "#888",
    fontSize: 12,
    fontFamily: "Manrope-Regular",
    marginTop: 3,
  },
  cardContagem: {
    fontSize: 13,
    fontFamily: "Manrope-Bold",
    marginTop: 5,
  },
  passado: { color: "#888" },
  hoje: { color: "#CBD83B" },
  futuro: { color: "#A88AED" },
  emptyState: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Manrope-ExtraBold",
    marginTop: 16,
  },
  emptySubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontFamily: "Manrope-Regular",
    textAlign: "center",
    marginTop: 8,
  },
  emptyBtn: {
    marginTop: 24,
    backgroundColor: "#CBD83B",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyBtnText: {
    color: "#41386B",
    fontFamily: "Manrope-ExtraBold",
    fontSize: 15,
  },
});
