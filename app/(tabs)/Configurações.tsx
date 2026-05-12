// Este arquivo existe por razão histórica — redireciona para o configuracoes.tsx correto
import { Redirect } from "expo-router";
export default function ConfiguracoesAlias() {
  return <Redirect href="/(tabs)/configuracoes" />;
}