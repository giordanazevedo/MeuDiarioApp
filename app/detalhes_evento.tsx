import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DetalhesEvento() {
  const { titulo, dataSelecionada } = useLocalSearchParams();
  const router = useRouter();

  const calcularDias = () => {
    if (!dataSelecionada) return 0;
    const dataAlvo = new Date(dataSelecionada as string);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataAlvo.setHours(0, 0, 0, 0);
    const diffTime = dataAlvo.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const dias = calcularDias();
  const dataFormatada = dataSelecionada
    ? new Date(dataSelecionada as string).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const getContagemTexto = () => {
    if (dias < 0) return `Passou há ${Math.abs(dias)} dia(s)`;
    if (dias === 0) return "🎉 É hoje!";
    return `Faltam ${dias} dia(s)`;
  };

  const getContagemCor = () => {
    if (dias < 0) return "#888";
    if (dias === 0) return "#CBD83B";
    return "#A88AED";
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>
          {/* Ícone grande */}
          <View style={styles.iconCircle}>
            <Ionicons name="star" size={52} color="#CBD83B" />
          </View>

          <Text style={styles.eventTitle}>{titulo || "Evento"}</Text>
          <Text style={styles.eventDate}>{dataFormatada}</Text>

          {/* Card de contagem regressiva */}
          <View style={styles.infoCard}>
            <Ionicons name="hourglass-outline" size={28} color={getContagemCor()} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Contagem regressiva</Text>
              <Text style={[styles.infoValue, { color: getContagemCor() }]}>
                {getContagemTexto()}
              </Text>
            </View>
          </View>

          {/* Botão voltar */}
          <TouchableOpacity
            style={styles.backBtnLarge}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>Voltar para Agenda</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    elevation: 8,
  },
  eventTitle: {
    color: "#fff",
    fontSize: 26,
    fontFamily: "Manrope_700Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  eventDate: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    marginBottom: 36,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    width: "100%",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  infoTextGroup: { flex: 1 },
  infoLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontFamily: "Manrope_700Bold",
  },
  backBtnLarge: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 18,
    marginTop: 16,
  },
  backBtnText: {
    color: "#fff",
    fontFamily: "Manrope_700Bold",
    fontSize: 15,
  },
});