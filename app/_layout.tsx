import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// REMOVIDO: unstable_settings que forçava a abertura em (tabs)

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* headerShown: false esconde a barra de título padrão em todas as telas */}
      <Stack screenOptions={{ headerShown: false }}>
        
        {/* 1. Tela de Login */}
        <Stack.Screen name="index" />

        {/* 2. Tela de Cadastro */}
        <Stack.Screen name="signup" />

        {/* 3. Grupo de Abas */}
        <Stack.Screen name="(tabs)" />

        {/* 4. Fluxo de dias importantes */}
        <Stack.Screen name="selecionar_categoria" />
        <Stack.Screen name="novo_dia_importante" />
        <Stack.Screen name="detalhes_evento" />

        {/* 5. Registro do dia (acessado pelo menu central) */}
        <Stack.Screen name="registro_hoje" />

        {/* 6. Perfil e conta */}
        <Stack.Screen name="detalhes_usuario" />
        <Stack.Screen name="redefinir-senha" />

        {/* 7. Modal genérico */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}