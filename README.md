# LUME - Diário Emocional 🌟

**LUME** é um aplicativo móvel desenvolvido para o acompanhamento e gerenciamento de bem-estar emocional, permitindo que usuários registrem suas emoções, atividades e reflexões diárias. 

Este projeto foi desenvolvido como parte dos requisitos da disciplina de Desenvolvimento Móvel, utilizando o framework **React Native** e o ecossistema **Expo**.

---

## 👥 Identificação do Grupo e Contribuições

| Integrante | Componentes/Responsabilidades |
| :--- | :--- |
| **Giordana Azevedo** | Arquitetura, Integração com Supabase, sistema de notificações |
| **Joao** | Implementação da Tela Principal e Listagem (FlatList) |
 **Ericka** | Login e signup
| **Ericka** | Tela de Registro de Atividades e Design Visual (Flexbox) |
| **Membro 4** | Sistema de Notificações Locais e Detalhes de Registro |
| **Membro 5** | Documentação, Testes e Refatoração de Código |

---

## 🛠️ Requisitos Técnicos Implementados

O projeto utiliza os componentes fundamentais do React Native para garantir uma experiência fluida e eficiente:

1.  **View**: Utilizada para estruturar o layout e organizar os elementos visualmente.
2.  **Text**: Exibição de títulos, descrições e informações textuais estilizadas.
3.  **TextInput**: Captura de dados do usuário nas telas de Login, Cadastro e Registro de notas.
4.  **Button / TouchableOpacity**: Elementos interativos para disparar ações como salvar, excluir e navegar.
5.  **FlatList**: Renderização eficiente da lista de registros históricos do usuário.
6.  **Image**: Exibição de logos e ícones visuais para enriquecer a interface.
7.  **Layout com Flexbox**: Todo o design é responsivo, utilizando propriedades de Flexbox para alinhamento e distribuição.
8.  **Navegação**: Implementada via **Expo Router**, permitindo transições suaves entre as múltiplas telas.

---

## 📱 Telas do Aplicativo

O LUME conta com as seguintes interfaces principais:

1.  **Tela de Login/Cadastro**: Autenticação segura de usuários.
2.  **Tela Principal (Home)**: Lista cronológica de todos os registros emocionais (usando FlatList).
3.  **Tela de Registro**: Interface para adicionar novas emoções, sentimentos e atividades do dia.
4.  **Tela de Detalhes**: Visualização aprofundada de um registro específico, com opção de edição.
5.  **Tela de Configurações**: Personalização de perfil e gerenciamento de lembretes diários.
6.  **Tela de Redefinição de Senha**: Recuperação de conta via e-mail.

---

## 🗄️ Banco de Dados (Ponto Extra 💎)

Utilizamos o **Supabase** como solução de Backend-as-a-Service (BaaS), gerenciando:
-   **Autenticação**: Login persistente e recuperação de senha.
-   **Banco de Dados Relacional**: Armazenamento seguro de todos os registros dos usuários em tempo real.

---

## 📂 Estrutura de Arquivos e Lógica do Código

Abaixo, detalhamos a função técnica e o propósito de cada arquivo principal dentro da estrutura do projeto:

### 📍 Pasta `app/(tabs)` (Navegação Principal por Abas)

- **`_layout.tsx`**: Gerencia a navegação por abas (Bottom Tab Bar). Define os ícones, cores e a lógica de redirecionamento entre as telas principais.
- **`index.tsx` (Dashboard)**: A tela inicial do usuário logado. Apresenta um resumo das atividades recentes e o estado emocional atual.
- **`calendario.tsx`**: Implementa a visualização mensal dos registros. Permite que o usuário selecione datas específicas para ver o que foi registrado naquele dia.
- **`historico.tsx`**: Utiliza o componente `FlatList` para renderizar todos os registros de forma cronológica, facilitando a busca por memórias passadas.
- **`novo.tsx`**: Atua como um gatilho de navegação rápida para a tela de novos registros, posicionado estrategicamente no centro da barra de abas.
- **`perfil.tsx`**: Tela dedicada às informações básicas do usuário e atalhos para configurações avançadas de conta.

### 📍 Pasta `app` (Fluxos Globais e Telas Auxiliares)

- **`_layout.tsx`**: O Root Layout do aplicativo. Define o `Stack Navigator` global, gerenciando a transição entre as telas de Autenticação (Login/Signup) e o fluxo principal de Abas.
- **`detalhes_evento.tsx`**: Tela que recebe parâmetros de um registro específico e exibe todas as informações detalhadas, permitindo uma análise mais profunda do evento.
- **`novo_dia_importante.tsx`**: Interface especializada para o registro de eventos que o usuário considera marcos ou "dias importantes", com campos personalizados.
- **`selecionar_categoria.tsx`**: Um componente de apoio que permite ao usuário classificar seus registros (ex: Trabalho, Família, Saúde), melhorando a organização dos dados.
- **`redefinir-senha.tsx`**: Integração direta com o Supabase Auth para gerenciar o fluxo de recuperação de conta via e-mail e definição de nova credencial.
- **`modal.tsx`**: Gerencia as janelas flutuantes (Popups) do aplicativo, utilizadas para confirmações rápidas ou avisos importantes sem trocar de tela.
- **`configuracoes.tsx`**: Central de controle onde o usuário gerencia notificações, preferências de conta e encerramento de sessão.

---

## 🚀 Instalação e Uso

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/giordanazevedo/MeuDiarioApp.git
    cd LUME
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npx expo start
    ```

4.  **Para gerar o APK (Android):**
    ```bash
    npx eas build --platform android --profile preview
    ```

---

## 📸 Demonstração
*(Adicione aqui os links para os prints das telas ou vídeos de demonstração no YouTube)*

- **Link da Apresentação:** [Insira o link do YouTube aqui]
- **Layout Base:** Inspirado em padrões modernos de UX/UI para diários e produtividade.

---
Desenvolvido para fins acadêmicos - Maio 2026.
