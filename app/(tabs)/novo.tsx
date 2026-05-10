import { Redirect } from 'expo-router';

// Este arquivo agora serve apenas como um "fantasma" para a aba existir,
// mas a lógica real de abrir o menu está no _layout.tsx.
export default function NovoRedirect() {
  return <Redirect href="/" />;
}