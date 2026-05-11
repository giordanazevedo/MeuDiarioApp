import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { supabase } from "../src/supabase";

export default function SignUp() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  async function handleSignUp() {
    // 1. Validação de campos vazios
    if (!email.trim() || !password.trim() || !nome.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos para criar a conta.");
      return;
    }

    // 2. Validação de segurança mínima (Senha)
    if (password.length < 6) {
      Alert.alert(
        "Senha muito curta",
        "A senha deve ter pelo menos 6 caracteres.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            nome_usuario: nome,
          },
        },
      });

      // 3. Se o Supabase retornar um erro direto (ex: e-mail inválido)
      if (error) {
        Alert.alert("Erro ao cadastrar", error.message);
        setIsLoading(false);
        return;
      }

      // 4. LÓGICA DE USUÁRIO JÁ EXISTENTE
      // O Supabase, por segurança, não dá erro se o e-mail já existir.
      // Em vez disso, ele retorna o objeto 'user', mas com o array 'identities' VAZIO.
      if (
        data.user &&
        data.user.identities &&
        data.user.identities.length === 0
      ) {
        Alert.alert(
          "E-mail já cadastrado 🧐",
          "Já existe uma conta vinculada a este e-mail. Tente fazer o login!",
          [{ text: "Ir para Login", onPress: () => router.back() }],
        );
      } else {
        // 5. SUCESSO: Usuário novo
        // O e-mail de confirmação será enviado automaticamente conforme sua config no painel
        Alert.alert(
          "Verifique seu e-mail! 📩",
          "Enviamos um link de confirmação. Clique nele para ativar sua conta antes de entrar no Diário.",
          [{ text: "Entendi", onPress: () => router.back() }],
        );
      }
    } catch (err) {
      Alert.alert("Erro", "Ocorreu uma falha na conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={["#41386B", "#A88AED", "#CBD83B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Criar Conta ✨</Text>

        <Text style={styles.subtitle}>
          Junte-se a nós e comece a registrar o seu dia a dia com o Diário
          Emocional.
        </Text>

        <TextInput
          placeholder="Como quer ser chamada?"
          placeholderTextColor="#8E8AA7"
          onChangeText={setNome}
          autoCapitalize="words"
          style={styles.input}
        />

        <TextInput
          placeholder="Seu e-mail"
          placeholderTextColor="#8E8AA7"
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          placeholder="Crie uma senha forte"
          placeholderTextColor="#8E8AA7"
          secureTextEntry
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignUp}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#41386B" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Já tenho uma conta</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  card: {
    backgroundColor: "#FFFCEC",
    borderRadius: 30,
    padding: 28,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#41386B",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6E6A7E",
    marginBottom: 35,
    lineHeight: 22,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E1F2",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: "#2D2A3A",
    marginBottom: 18,
  },
  button: {
    backgroundColor: "#CBD83B",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
  },
  buttonText: { color: "#41386B", fontSize: 16, fontWeight: "700" },
  secondaryButton: { marginTop: 15, paddingVertical: 16, alignItems: "center" },
  secondaryButtonText: { color: "#A88AED", fontSize: 15, fontWeight: "700" },
});
