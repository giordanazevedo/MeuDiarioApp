import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "../src/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Escuta mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          router.replace("/(tabs)");
        } else if (event === "PASSWORD_RECOVERY") {
          router.replace("/redefinir-senha");
        }
      }
    );

    // Checa sessão ao abrir o app
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/(tabs)");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin() {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsLoading(false);

    if (error) {
      Alert.alert("Erro", error.message);
    }
  }

  async function handleResetPassword() {
    if (!email.trim()) {
      Alert.alert("Atenção", "Por favor, preencha o campo de e-mail.");
      return;
    }

    setIsLoading(true);
    const redirectTo = Linking.createURL("/redefinir-senha");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    setIsLoading(false);

    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      Alert.alert("E-mail enviado! 📧", "Verifique sua caixa de entrada para redefinir a senha.");
      setIsForgotPassword(false);
    }
  }

  return (
    <LinearGradient
      colors={["#41386B", "#A88AED", "#CBD83B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Image
        source={require("../assets/images/logoappcapa.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.card}>
        <Text style={styles.title}>
          {isForgotPassword ? "Recuperar Senha 🔑" : "Bem-vindo💜"}
        </Text>

        <Text style={styles.subtitle}>
          {isForgotPassword
            ? "Digite seu e-mail para enviarmos um link de redefinição."
            : "Entre na sua conta e organize sua rotina com leveza."}
        </Text>

        <TextInput
          placeholder="Seu e-mail"
          placeholderTextColor="#8E8AA7"
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        {!isForgotPassword && (
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#8E8AA7"
            secureTextEntry
            onChangeText={setPassword}
            style={styles.input}
          />
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={isForgotPassword ? handleResetPassword : handleLogin}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#41386B" />
          ) : (
            <Text style={styles.buttonText}>
              {isForgotPassword ? "Enviar Link" : "Entrar"}
            </Text>
          )}
        </TouchableOpacity>

        {!isForgotPassword ? (
          <>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/signup")}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Criar nova conta</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsForgotPassword(true)}>
              <Text style={styles.forgotPassword}>Esqueceu sua senha?</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={() => setIsForgotPassword(false)}>
            <Text style={styles.forgotPassword}>Voltar para o Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 20,
    backgroundColor: "transparent",
    // Removendo qualquer sombra indesejada
    shadowColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
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

    shadowColor: "#CBD83B",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,

    elevation: 5,
  },

  buttonText: {
    color: "#41386B",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    marginTop: 15,

    borderWidth: 1.5,
    borderColor: "#A88AED",

    paddingVertical: 16,
    borderRadius: 18,

    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#A88AED",
    fontSize: 15,
    fontWeight: "700",
  },

  forgotPassword: {
    textAlign: "center",
    color: "#6E6A7E",
    marginTop: 25,
    fontSize: 14,
    fontWeight: "600",
  },
});
