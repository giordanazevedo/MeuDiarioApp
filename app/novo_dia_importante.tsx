import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../src/supabase";

export default function NovoDiaImportante() {
  const router = useRouter();
  const { categoria, icon } = useLocalSearchParams();
  const [data, setData] = useState(new Date());
  const [show, setShow] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || data;
    setShow(Platform.OS === "ios");
    setData(currentDate);
  };

  const handleSalvar = async () => {
    try {
      setSalvando(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Sessão expirada", "Faça login novamente.");
        return;
      }

      const { error } = await supabase.from("dias_importantes").insert([
        {
          titulo: categoria,
          categoria: categoria,
          data_evento: data.toISOString(),
          user_id: user.id,
        },
      ]);

      if (error) {
        Alert.alert("Erro ao salvar", error.message);
      } else {
        Alert.alert("Adicionado! ✨", "Dia importante salvo na sua agenda.", [
          {
            text: "Ver Agenda",
            onPress: () => router.replace("/(tabs)/calendario"),
          },
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (err) {
      Alert.alert("Erro", "Problema de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <LinearGradient
      colors={["#41386B", "#A88AED", "#CBD83B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Cabeçalho */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dia Importante ✨</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Ícone da categoria */}
          <View style={styles.iconCircle}>
            <Ionicons
              name={(icon as any) || "star-outline"}
              size={48}
              color="#CBD83B"
            />
          </View>
          <Text style={styles.categoriaTitle}>{categoria}</Text>
          <Text style={styles.instructions}>Escolha a data do evento</Text>

          {/* Campo de data */}
          <TouchableOpacity
            style={styles.inputField}
            onPress={() => setShow(true)}
          >
            <Ionicons name="calendar-outline" size={22} color="#A88AED" />
            <Text style={styles.inputText}>Data selecionada:</Text>
            <Text style={styles.dateDisplay}>
              {data.toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </TouchableOpacity>

          {show && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={data}
                mode="date"
                display="spinner"
                textColor="white"
                onChange={onChange}
              />
              <TouchableOpacity
                style={styles.saveDateBtn}
                onPress={() => setShow(false)}
              >
                <Text style={styles.saveDateText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botão salvar */}
          <TouchableOpacity
            style={[styles.saveButton, salvando && { opacity: 0.7 }]}
            onPress={handleSalvar}
            disabled={salvando}
          >
            <Ionicons name="checkmark-circle" size={22} color="#41386B" />
            <Text style={styles.saveButtonText}>
              {salvando ? "Salvando..." : "Adicionar ao Diário"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 20, alignItems: "center" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 32,
  },
  backButton: {
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
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  categoriaTitle: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Manrope_700Bold",
    marginBottom: 8,
  },
  instructions: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginBottom: 28,
  },
  inputField: {
    flexDirection: "column",
    backgroundColor: "#1A1A1A",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    gap: 6,
  },
  inputText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
  dateDisplay: {
    color: "#CBD83B",
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
    textAlign: "center",
  },
  pickerContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    width: "100%",
  },
  saveDateBtn: { padding: 10, alignItems: "flex-end" },
  saveDateText: { color: "#CBD83B", fontFamily: "Manrope_700Bold" },
  saveButton: {
    backgroundColor: "#CBD83B",
    padding: 18,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    marginTop: 20,
    elevation: 5,
    shadowColor: "#CBD83B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: "#41386B",
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
  },
});