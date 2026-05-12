import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Componente do Menu (Simples e funcional)
function MenuOverlay({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const irParaTela = (rota: string) => {
    onClose();
    router.push(rota as any);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.menuRow}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => irParaTela("/selecionar_categoria")}
          >
            <View style={[styles.circle, { backgroundColor: "#CBD83B" }]}>
              <Ionicons name="star" size={30} color="#41386B" />
            </View>
            <Text style={styles.menuText}>Dia Importante</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => irParaTela("/registro_hoje")}
          >
            <View style={[styles.circle, { backgroundColor: "#A88AED" }]}>
              <Ionicons name="pencil" size={30} color="#fff" />
            </View>
            <Text style={styles.menuText}>Registrar Hoje</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={35} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function TabLayout() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <MenuOverlay
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#FFFCEC", // Creme
          tabBarInactiveTintColor: "rgba(255, 255, 255, 0.4)",
          tabBarStyle: {
            backgroundColor: "#41386B", // Roxo escuro
            height: 75,
            borderTopWidth: 0,
            paddingBottom: 12,
            display: "flex",
            flexDirection: "row", // Força a distribuição horizontal
          },
          tabBarLabelStyle: {
            fontFamily: "Manrope_700Bold",
            fontSize: 10,
          },
        }}
      >
        {/* 1. INÍCIO */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Início",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={24} color={color} />
            ),
          }}
        />

        {/* 2. HISTÓRICO */}
        <Tabs.Screen
          name="historico"
          options={{
            title: "Memorias",
            tabBarIcon: ({ color }) => (
              <Ionicons name="journal-outline" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="novo"
          options={{
            title: "",
            tabBarShowLabel: false,
            tabBarIcon: () => (
              <View style={styles.floatingButton}>
                <Ionicons name="add" size={40} color="#41386B" />
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setMenuVisible(true);
            },
          }}
        />

        {/* 4. CALENDÁRIO (Certifique-se que o nome do arquivo é calendario.tsx) */}
        <Tabs.Screen
          name="calendario"
          options={{
            title: "Agenda",
            tabBarIcon: ({ color }) => (
              <Ionicons name="calendar-outline" size={24} color={color} />
            ),
          }}
        />

        {/* 5. PERFIL (Abre a tela de configurações) */}
        <Tabs.Screen
          name="perfil"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={24} color={color} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push("/configuracoes");
            },
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    width: 60,
    height: 60,
    backgroundColor: "#CBD83B", // Verde Limão
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    top: -15, // Levanta o botão para ficar flutuando acima da barra
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(65, 56, 107, 0.98)", // Roxo profundo
    justifyContent: "center",
    alignItems: "center",
  },
  menuRow: {
    flexDirection: "row",
    gap: 30,
    marginBottom: 40,
  },
  menuItem: {
    alignItems: "center",
    width: 120,
  },
  circle: {
    width: 75,
    height: 75,
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 4,
  },
  menuText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },
  closeButton: {
    width: 65,
    height: 65,
    backgroundColor: "#A88AED",
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
});
