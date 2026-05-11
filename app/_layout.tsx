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
        
        {/* 1. Tela de Login: Por se chamar 'index', ela abre primeiro */}
        <Stack.Screen name="index" /> 

        {/* 2. Tela de Cadastro */}
        <Stack.Screen name="signup" />

        {/* 3. Grupo de Abas (Só entra aqui após o login bem-sucedido) */}
        <Stack.Screen name="(tabs)" />

        {/* 4. Telas auxiliares */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}