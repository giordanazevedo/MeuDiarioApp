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
import * as Linking from "expo-linking";
import { supabase } from "../src/supabase"; // Verifique se o caminho está correto

export default function TelaRedefinirSenha() {
    const router = useRouter();
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [sessaoAtiva, setSessaoAtiva] = useState(false);

    useEffect(() => {
        let montado = true;
        setCarregando(true);

        // Função para extrair tokens da URL (útil para links que vem com #access_token=...)
        const extrairTokensDaUrl = async (url: string | null) => {
            if (!url || !url.includes("#")) return;
            
            console.log("Tentando extrair tokens da URL...");
            const hash = url.split("#")[1];
            const partes = hash.split("&");
            const params: { [key: string]: string } = {};
            
            partes.forEach(p => {
                const [chave, valor] = p.split("=");
                params[chave] = valor;
            });

            if (params.access_token && params.refresh_token) {
                console.log("Tokens encontrados! Definindo sessão manualmente...");
                const { data, error } = await supabase.auth.setSession({
                    access_token: params.access_token,
                    refresh_token: params.refresh_token,
                });
                
                if (!error && data.session && montado) {
                    setSessaoAtiva(true);
                    setCarregando(false);
                }
            }
        };

        // Escuta mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Redefinir Senha - Evento:", event, session ? "Sessão OK" : "Sem sessão");
            if (session && montado) {
                setSessaoAtiva(true);
                setCarregando(false);
            }
        });

        const inicializar = async () => {
            // 1. Tenta pegar a URL inicial e extrair tokens
            const urlInicial = await Linking.getInitialURL();
            await extrairTokensDaUrl(urlInicial);

            // 2. Checa se já temos sessão (seja pelo passo 1 ou pelo Supabase automático)
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                if (montado) {
                    setSessaoAtiva(true);
                    setCarregando(false);
                }
            } else {
                console.log("Sessão ainda não encontrada, aguardando...");
                // Aguarda um pouco mais
                setTimeout(async () => {
                    if (montado) {
                        const { data: { session: finalSession } } = await supabase.auth.getSession();
                        if (!finalSession && !sessaoAtiva) {
                            setCarregando(false);
                            Alert.alert(
                                "Link de Recuperação",
                                "Não conseguimos validar seu acesso. Isso pode acontecer se o link expirou ou já foi usado. Tente solicitar um novo e-mail.",
                                [{ text: "Voltar para o Login", onPress: () => router.replace("/") }]
                            );
                        } else if (finalSession) {
                            setSessaoAtiva(true);
                            setCarregando(false);
                        }
                    }
                }, 4000);
            }
        };

        inicializar();

        // Escuta se uma nova URL chegar com o app aberto
        const urlSubscription = Linking.addEventListener("url", (event) => {
            extrairTokensDaUrl(event.url);
        });

        return () => {
            montado = false;
            subscription.unsubscribe();
            urlSubscription.remove();
        };
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
