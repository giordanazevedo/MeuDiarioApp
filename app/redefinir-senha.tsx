import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { supabase } from "../src/supabase"; // Verifique se o caminho está correto

export default function TelaRedefinirSenha() {
    const router = useRouter();
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [carregando, setCarregando] = useState(false);

    const atualizarSenha = async () => {
        // 1. Validações básicas
        if (novaSenha.length < 6) {
            Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres.");
            return;
        }

        if (novaSenha !== confirmarSenha) {
            Alert.alert("Erro", "As senhas não coincidem.");
            return;
        }

        setCarregando(true);

        try {
            // 2. Chamada ao Supabase
            // O usuário já deve estar "autenticado" via link de e-mail ou sessão ativa
            const { error } = await supabase.auth.updateUser({
                password: novaSenha
            });

            if (error) throw error;

            Alert.alert("Sucesso!", "Sua senha foi alterada.", [
                { text: "Ir para o App", onPress: () => router.replace("/(tabs)") }
            ]);
        } catch (error: any) {
            Alert.alert("Erro", error.message);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.titulo}>Criar Nova Senha</Text>
                <Text style={styles.subtitulo}>Digite sua nova senha abaixo.</Text>

                <View style={styles.inputArea}>
                    <Ionicons name="lock-closed" size={20} color="#A88AED" />
                    <TextInput
                        style={styles.input}
                        placeholder="Nova Senha"
                        secureTextEntry
                        value={novaSenha}
                        onChangeText={setNovaSenha}
                    />
                </View>

                <View style={styles.inputArea}>
                    <Ionicons name="checkmark-circle" size={20} color="#A88AED" />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirme a Senha"
                        secureTextEntry
                        value={confirmarSenha}
                        onChangeText={setConfirmarSenha}
                    />
                </View>

                <TouchableOpacity
                    style={styles.botao}
                    onPress={atualizarSenha}
                    disabled={carregando}
                >
                    {carregando ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.botaoTexto}>Salvar Alteração</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#41386B", justifyContent: "center", padding: 20 },
    card: { backgroundColor: "#FFF", borderRadius: 20, padding: 25, elevation: 5 },
    titulo: { fontSize: 22, fontWeight: "bold", color: "#41386B", marginBottom: 10 },
    subtitulo: { fontSize: 14, color: "#8E8AA7", marginBottom: 20 },
    inputArea: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F0F5",
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        height: 55,
    },
    input: { flex: 1, marginLeft: 10, color: "#41386B" },
    botao: {
        backgroundColor: "#A88AED",
        height: 55,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    botaoTexto: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
