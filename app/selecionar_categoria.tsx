import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const categorias = [
  { id: "1", nome: "Aniversário", icon: "gift-outline" },
  { id: "2", nome: "Relacionamento", icon: "heart-outline" },
  { id: "3", nome: "Família", icon: "people-outline" },
  { id: "4", nome: "Viagem", icon: "airplane-outline" },
  { id: "5", nome: "Casa", icon: "home-outline" },
  { id: "6", nome: "Trabalho", icon: "briefcase-outline" },
];

export default function SelecionarCategoria() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#41386B", "#A88AED", "#CBD83B"]} // Cores do seu tema
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>Dia importante ✨</Text>
          <Text style={styles.subtitle}>
            Escolha uma categoria para o seu evento e vamos começar a contagem
            regressiva.
          </Text>

          <View style={styles.grid}>
            {categorias.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: "/novo_dia_importante",
                    params: { categoria: item.nome, icon: item.icon },
                  })
                }
              >
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon as any} size={28} color="#A88AED" />
                </View>
                <Text style={styles.cardText}>{item.nome}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.card, styles.cardEmpty]}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert("Em breve", "Função de categoria personalizada.")
              }
            >
              <Ionicons name="add-circle" size={32} color="#fff" />
              <Text style={[styles.cardText, { color: "#fff" }]}>
                Crie seu próprio
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 60 },
  backButton: { marginBottom: 20 },
  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 40,
    fontSize: 16,
    lineHeight: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#FFFCEC", // Creme padrão do seu app
    width: "47%",
    height: 140,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  cardEmpty: {
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
    borderStyle: "dashed",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F1F0F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardText: {
    color: "#41386B", // Roxo escuro para o texto
    fontSize: 15,
    fontWeight: "700",
  },
});
