import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../src/supabase"; // Verifique se o caminho está correto

export default function TelaRedefinirSenha() {
    const router = useRouter();
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [sessaoAtiva, setSessaoAtiva] = useState(false);

    useEffect(() => {
        const checarSessao = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                Alert.alert(
                    "Sessão não encontrada",
                    "Link de recuperação inválido ou expirado. Por favor, solicite uma nova recuperação de senha.",
                    [{ text: "Voltar para o Login", onPress: () => router.replace("/") }]
                );
                setSessaoAtiva(false);
            } else {
                setSessaoAtiva(true);
            }
        };

        checarSessao();
    }, []);

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
        <LinearGradient
            colors={["#41386B", "#A88AED", "#dae093ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
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
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24 },
    card: {
        backgroundColor: "#FFFCEC",
        borderRadius: 30,
        padding: 28,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 10,
    },
    titulo: { fontSize: 24, fontWeight: "bold", color: "#41386B", marginBottom: 10, textAlign: "center" },
    subtitulo: { fontSize: 15, color: "#8E8AA7", marginBottom: 25, textAlign: "center" },
    inputArea: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F0F5",
        borderRadius: 16,
        paddingHorizontal: 15,
        marginBottom: 15,
        height: 60,
    },
    input: { flex: 1, marginLeft: 10, color: "#41386B", fontSize: 16 },
    botao: {
        backgroundColor: "#41386B",
        height: 60,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 15,
    },
    botaoTexto: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
