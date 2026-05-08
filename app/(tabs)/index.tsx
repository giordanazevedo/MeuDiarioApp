import React, { useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  FlatList,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { supabase } from '../../src/supabase'; // Ajustado para a sua estrutura
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFonts, Manrope_800ExtraBold, Manrope_700Bold, Manrope_400Regular } from '@expo-google-fonts/manrope';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../src/theme-context'; // Ajustado para a sua estrutura

const { width } = Dimensions.get('window');

// =============================================
// 1. LISTAS DE SELEÇÃO (Faltavam no seu código)
// =============================================
const emotionsList = [
  { id: '1', label: 'Radiante', icon: 'grin-beam' },
  { id: '2', label: 'Calmo', icon: 'smile' },
  { id: '3', label: 'Ansioso', icon: 'grimace' },
  { id: '4', label: 'Cansado', icon: 'tired' },
];

const sleepList = [
  { id: '1', label: 'Boa', icon: 'moon' },
  { id: '2', label: 'Média', icon: 'cloud-moon' },
  { id: '3', label: 'Ruim', icon: 'cloud' },
];

const healthList = [
  { id: '1', label: 'Saudável', icon: 'heartbeat' },
  { id: '2', label: 'Ok', icon: 'medkit' },
  { id: '3', label: 'Doente', icon: 'thermometer-full' },
];

const mainMoods = [
  { label: 'Ótimo', emoji: require('../../assets/images/emojisprincipal/otimo.png'), color: '#FFD93D', value: 'Otimo' },
  { label: 'Bem', emoji: require('../../assets/images/emojisprincipal/bem.png'), color: '#FF8C42', value: 'Bem' },
  { label: 'Ruim', emoji: require('../../assets/images/emojisprincipal/ruim.png'), color: '#FF4D4D', value: 'Ruim' },
  { label: 'Horrível', emoji: require('../../assets/images/emojisprincipal/horrivel.png'), color: '#C850C0', value: 'Horrivel' },
];

const frasesMotivacionais = [
  { texto: 'Cuide da sua mente, ela cuida de você. 🧠', autor: 'MeuDiário' },
  { texto: 'Cada dia é uma nova chance de ser melhor. 🌱', autor: 'MeuDiário' },
  { texto: 'Você é mais forte do que imagina. 💪', autor: 'MeuDiário' },
];

const dicasBemEstar = [
  { titulo: 'Hidrate-se', descricao: 'Beba pelo menos 2L de água hoje.', icone: 'water-outline', cor: '#4ECDC4' },
  { titulo: 'Respire fundo', descricao: '5 minutos de respiração profunda reduzem a ansiedade.', icone: 'leaf-outline', cor: '#A8E6CF' },
];

interface Registro {
  id: string;
  data_criacao: string;
  humor: string;
  nivel_sono: string;
  nivel_saude: string;
  anotacao?: string;
  emocao_detalhe?: string;
  user_id: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme || 'light';

  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#121212' : '#f5f5f5';
  const cardBackground = isDark ? '#1E1E1E' : '#ffffff';
  const textColor = isDark ? '#fff' : '#333';
  const secondaryTextColor = isDark ? '#aaa' : '#666';
  const accentColor = '#E94D89';
  const borderColor = isDark ? '#333' : '#e0e0e0';

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMainMood, setSelectedMainMood] = useState<any>(null);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedSleep, setSelectedSleep] = useState('');
  const [selectedHealth, setSelectedHealth] = useState('');
  const [note, setNote] = useState('');

  const [userName, setUserName] = useState('');
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [humorFrequente, setHumorFrequente] = useState('');
  const [jaRegistrouHoje, setJaRegistrouHoje] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const diaDoAno = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const fraseHoje = frasesMotivacionais[diaDoAno % frasesMotivacionais.length];
  const dicaHoje = dicasBemEstar[diaDoAno % dicasBemEstar.length];

  let [fontsLoaded] = useFonts({
    'Manrope-ExtraBold': Manrope_800ExtraBold,
    'Manrope-Bold': Manrope_700Bold,
    'Manrope-Regular': Manrope_400Regular,
  });

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const nome = user.email?.split('@')[0] || 'Usuário';
        setUserName(nome.charAt(0).toUpperCase() + nome.slice(1));
      }
    } catch (e) { console.error(e); }
  };

  const fetchRegistros = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .eq('user_id', user.id)
        .order('data_criacao', { ascending: false })
        .limit(5);

      if (!error && data) {
        setRegistros(data);
        setTotalRegistros(data.length);
        const hoje = new Date().toDateString();
        setJaRegistrouHoje(data.some((r) => new Date(r.data_criacao).toDateString() === hoje));
      }
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUserData();
    fetchRegistros();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useFocusEffect(useCallback(() => { fetchRegistros(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchRegistros();
  };

  const handleMainMoodSelect = (mood: any) => {
    setSelectedMainMood(mood);
    setModalVisible(true);
  };

  const handleFinalSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('registros').insert([{
      humor: selectedMainMood.value,
      user_id: user.id,
      emocao_detalhe: selectedEmotion,
      nivel_sono: selectedSleep,
      nivel_saude: selectedHealth,
      anotacao: note,
      data_criacao: new Date().toISOString()
    }]);

    if (!error) {
      setModalVisible(false);
      Alert.alert('Sucesso ✌️', 'Seu registro foi salvo!');
      setSelectedEmotion(''); setSelectedSleep(''); setSelectedHealth(''); setNote('');
      fetchRegistros();
    }
  };

  const getSaudacao = () => {
    const hora = new Date().getHours();
    return hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  };

  const getDataHoje = () => {
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    return dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
  };

  const getHumorIcon = (humor: string) => {
    switch (humor) {
      case 'Otimo': return { icon: 'happy', color: '#FFD93D' };
      case 'Bem': return { icon: 'happy-outline', color: '#FF8C42' };
      case 'Ruim': return { icon: 'sad-outline', color: '#FF4D4D' };
      case 'Horrivel': return { icon: 'sad', color: '#C850C0' };
      default: return { icon: 'ellipse', color: '#666' };
    }
  };

  // Memoize styles to use current theme variables
  const styles = useMemo(() => StyleSheet.create({
    loadingContainer: { flex: 1, backgroundColor, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: secondaryTextColor, marginTop: 12, fontFamily: 'Manrope-Regular' },
    container: { flex: 1, backgroundColor },
    scrollContent: { paddingHorizontal: 20, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    headerLeft: { flex: 1 },
    saudacao: { fontSize: 16, color: secondaryTextColor, fontFamily: 'Manrope-Regular' },
    nomeUsuario: { fontSize: 28, color: textColor, fontFamily: 'Manrope-ExtraBold' },
    dataHoje: { fontSize: 14, color: accentColor, fontFamily: 'Manrope-Bold', marginTop: 4 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 5 },
    statusBadgeText: { fontSize: 11, fontFamily: 'Manrope-Bold' },
    quoteCard: { backgroundColor: cardBackground, borderRadius: 20, padding: 20, marginBottom: 20, borderLeftWidth: 3, borderLeftColor: accentColor },
    quoteText: { fontSize: 16, color: textColor, fontFamily: 'Manrope-Bold', fontStyle: 'italic' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, gap: 10 },
    statCard: { flex: 1, backgroundColor: cardBackground, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor },
    statNumber: { fontSize: 16, color: textColor, fontFamily: 'Manrope-ExtraBold', marginTop: 6 },
    statLabel: { fontSize: 10, color: secondaryTextColor, textAlign: 'center' },
    moodSection: { backgroundColor: cardBackground, borderRadius: 24, padding: 24, marginBottom: 25, borderWidth: 1, borderColor: accentColor + '20' },
    moodSectionTitle: { fontSize: 20, color: textColor, fontFamily: 'Manrope-ExtraBold', textAlign: 'center' },
    moodRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20 },
    emojiCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 4 },
    emojiImage: { width: 35, height: 35 },
    moodLabel: { fontSize: 12, fontFamily: 'Manrope-Bold' },
    recentTitle: { fontSize: 18, color: textColor, fontFamily: 'Manrope-ExtraBold', marginBottom: 15 },
    registroCard: { flexDirection: 'row', backgroundColor: cardBackground, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 10 },
    registroIconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    registroTextos: { flex: 1, marginLeft: 12 },
    registroHumor: { fontSize: 16, color: textColor, fontFamily: 'Manrope-Bold' },
    registroData: { fontSize: 12, color: secondaryTextColor },
    darkContainer: { flex: 1, backgroundColor },
    darkHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50, alignItems: 'center' },
    darkHeaderTitle: { color: textColor, fontSize: 16, fontFamily: 'Manrope-Bold' },
    saveBtnText: { color: accentColor, fontFamily: 'Manrope-ExtraBold', marginLeft: 8, fontSize: 18 },
    sectionTitle: { color: textColor, fontSize: 18, fontFamily: 'Manrope-ExtraBold', marginTop: 20, marginBottom: 15 },
    darkCard: { backgroundColor: cardBackground, borderRadius: 20, padding: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    iconItem: { alignItems: 'center', width: '25%', marginBottom: 15 },
    iconCircle: { width: 45, height: 45, borderRadius: 22, backgroundColor: isDark ? '#333' : '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
    iconCircleActive: { backgroundColor: accentColor },
    iconLabel: { color: textColor, fontSize: 10, textAlign: 'center' },
    darkInput: { backgroundColor: cardBackground, borderRadius: 16, padding: 16, color: textColor, height: 100, textAlignVertical: 'top', marginTop: 5, borderWidth: 1, borderColor },
    dicaCard: { backgroundColor: cardBackground, borderRadius: 20, padding: 20, marginBottom: 110, borderWidth: 1, borderColor }
  }), [isDark, backgroundColor, cardBackground, textColor, secondaryTextColor, accentColor, borderColor]);

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E94D89" />
      </View>
    );
  }

  const SelectableItem = ({ item, selected, onSelect }: any) => (
    <TouchableOpacity onPress={() => onSelect(item.label)} style={styles.iconItem}>
      <View style={[styles.iconCircle, selected === item.label && styles.iconCircleActive]}>
        <FontAwesome5 name={item.icon} size={20} color={selected === item.label ? '#fff' : accentColor} />
      </View>
      <Text style={[styles.iconLabel, selected === item.label && { color: accentColor }]}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E94D89" />}>
        
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.saudacao}>{getSaudacao()},</Text>
            <Text style={styles.nomeUsuario}>{userName} 👋</Text>
            <Text style={styles.dataHoje}>{getDataHoje()}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/Configurações')}>
            <Ionicons name="person-circle-outline" size={45} color={accentColor} />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>"{fraseHoje.texto}"</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalRegistros}</Text>
            <Text style={styles.statLabel}>Registros</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{humorFrequente || '—'}</Text>
            <Text style={styles.statLabel}>Frequente</Text>
          </View>
        </View>

        <View style={styles.moodSection}>
          <Text style={styles.moodSectionTitle}>Como você está hoje?</Text>
          <View style={styles.moodRow}>
            {mainMoods.map((mood) => (
  <TouchableOpacity 
    key={mood.value} 
    onPress={() => handleMainMoodSelect(mood)} 
    style={styles.moodItem} // O estilo estrutural vem do StyleSheet fixo
    activeOpacity={0.7}
  >
    <View style={[styles.emojiCircle, { backgroundColor: mood.color }]}>
      <Image 
        source={mood.emoji} 
        style={styles.emojiImage} 
        resizeMode="contain" 
      />
    </View>
    <Text style={[styles.moodLabel, { color: mood.color }]}>
      {mood.label}
    </Text>
  </TouchableOpacity>
))}
          </View>
        </View>

        <Text style={styles.recentTitle}>Registros Recentes</Text>
        {registros.map(item => (
          <View key={item.id} style={styles.registroCard}>
            <Ionicons name={getHumorIcon(item.humor).icon as any} size={24} color={getHumorIcon(item.humor).color} />
            <View style={styles.registroTextos}>
              <Text style={styles.registroHumor}>{item.humor}</Text>
              <Text style={styles.registroData}>{new Date(item.data_criacao).toLocaleDateString('pt-BR')}</Text>
            </View>
          </View>
        ))}

        <View style={styles.dicaCard}>
          <Text style={{color: accentColor, fontWeight: 'bold'}}>DICA DO DIA</Text>
          <Text style={{color: textColor, marginTop: 5}}>{dicaHoje.descricao}</Text>
        </View>
      </ScrollView>

      <Modal animationType="slide" visible={modalVisible}>
        <View style={styles.darkContainer}>
          <View style={styles.darkHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={30} color={textColor}/></TouchableOpacity>
            <TouchableOpacity onPress={handleFinalSave}><Text style={styles.saveBtnText}>Salvar</Text></TouchableOpacity>
          </View>
          <ScrollView style={{padding: 20}}>
            <Text style={styles.sectionTitle}>Emoções</Text>
            <View style={styles.grid}>{emotionsList.map(item => <SelectableItem key={item.id} item={item} selected={selectedEmotion} onSelect={setSelectedEmotion} />)}</View>
            <Text style={styles.sectionTitle}>Sono</Text>
            <View style={styles.grid}>{sleepList.map(item => <SelectableItem key={item.id} item={item} selected={selectedSleep} onSelect={setSelectedSleep} />)}</View>
            <Text style={styles.sectionTitle}>Saúde</Text>
            <View style={styles.grid}>{healthList.map(item => <SelectableItem key={item.id} item={item} selected={selectedHealth} onSelect={setSelectedHealth} />)}</View>
            <TextInput style={styles.darkInput} placeholder="Nota rápida..." placeholderTextColor={secondaryTextColor} multiline value={note} onChangeText={setNote} />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}