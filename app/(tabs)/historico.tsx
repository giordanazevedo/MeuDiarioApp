import { Manrope_800ExtraBold, useFonts } from "@expo-google-fonts/manrope";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../src/supabase";

interface Registro {
  id: string;
  data_criacao: string;
  humor: string;
  nivel_sono: string;
  nivel_saude: string;
  anotacao?: string;
  user_id: string;
}

export default function HistoricoScreen() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  let [fontsLoaded] = useFonts({ "Manrope-ExtraBold": Manrope_800ExtraBold });

  const fetchRegistros = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .eq("user_id", user.id)
      .order("data_criacao", { ascending: false });

    if (!error && data) {
      setRegistros(data);
    } else if (error) {
      console.error("Erro ao buscar histórico:", error);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchRegistros();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRegistros();
  };

  // ==========================================
  // NOVA FUNÇÃO: APAGAR REGISTRO
  // ==========================================
  const deletarRegistro = (id: string) => {
    Alert.alert(
      "Apagar Registro",
      "Tem certeza que deseja apagar este dia? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Manda o Supabase apagar lá na nuvem
              const { error } = await supabase
                .from("registros")
                .delete()
                .eq("id", id);

              if (error) throw error;

              // 2. Tira o card da tela imediatamente sem precisar recarregar o app
              setRegistros((prevRegistros) =>
                prevRegistros.filter((item) => item.id !== id),
              );
            } catch (error) {
              console.error("Erro ao apagar:", error);
              Alert.alert("Erro", "Não foi possível apagar o registro.");
            }
          },
        },
      ],
    );
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
        return { icon: "ellipse", color: "#bc8ddf" };
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <LinearGradient
        colors={["#41386B", "#A88AED", "#CBD83B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, justifyContent: "center" }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  const renderItem = ({ item }: { item: Registro }) => {
    const dataObj = new Date(item.data_criacao);

    const dataFormatada = dataObj
      .toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })
      .toUpperCase();
    const horaFormatada = dataObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const humorInfo = getHumorIcon(item.humor);
    const isHoje = dataObj.toDateString() === new Date().toDateString();

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>
            {isHoje ? `HOJE, ${dataFormatada}` : dataFormatada}
          </Text>

          {/* BOTÃO DE APAGAR ATUALIZADO AQUI */}
          <TouchableOpacity
            onPress={() => deletarRegistro(item.id)}
            style={{ padding: 5 }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentRow}>
          <View
            style={[styles.emojiCircle, { backgroundColor: humorInfo.color }]}
          >
            <Ionicons name={humorInfo.icon as any} size={30} color="#fff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.moodTitle, { color: humorInfo.color }]}>
              {item.humor} <Text style={styles.timeText}>{horaFormatada}</Text>
            </Text>
            <View style={styles.tagsRow}>
              {item.nivel_sono ? (
                <Text style={styles.tag}>• Sono {item.nivel_sono}</Text>
              ) : null}
              {item.nivel_saude ? (
                <Text style={styles.tag}>• Saúde {item.nivel_saude}</Text>
              ) : null}
            </View>
            {item.anotacao ? (
              <Text style={styles.noteText}>{item.anotacao}</Text>
            ) : null}
          </View>
        </View>
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
      <Text style={styles.headerTitle}>Seu Histórico</Text>

      <FlatList
        data={registros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#bc8ddf"
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nenhum registro ainda. Vamos fazer história! ✌️
          </Text>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  headerTitle: {
    fontSize: 22,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
    fontFamily: "Manrope-ExtraBold",
  },
  listContent: { paddingBottom: 100 },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center", // Garante que a data e a lixeira fiquem alinhadas
  },
  dateText: { color: "rgba(255, 255, 255, 0.8)", fontSize: 12, fontFamily: "Manrope-ExtraBold" },
  contentRow: { flexDirection: "row", alignItems: "center" },
  emojiCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: { marginLeft: 15, flex: 1 },
  moodTitle: { fontSize: 18, fontFamily: "Manrope-ExtraBold" },
  timeText: { color: "rgba(255, 255, 255, 0.6)", fontSize: 14, fontFamily: "Manrope-ExtraBold" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  tag: {
    color: "#fff",
    fontSize: 12,
    marginRight: 10,
    fontFamily: "Manrope-ExtraBold",
  },
  noteText: { color: "rgba(255, 255, 255, 0.9)", marginTop: 10, fontFamily: "Manrope-ExtraBold", fontStyle: "italic" },
  emptyText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    fontFamily: "Manrope-ExtraBold",
  },
});
