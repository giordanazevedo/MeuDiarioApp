import React, { useState, useEffect } from 'react';
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
  Image 
} from 'react-native';
import { supabase } from '../../src/supabase'; 
import { useRouter } from 'expo-router'; 
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFonts, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';

// 1. Configuração dos Humores com o caminho de pasta corrigido
const mainMoods = [
  { label: 'Ótimo', emoji: require('../../assets/images/emojisprincipal/otimo.png'), color: '#ffda6b', value: 'Otimo' },
  { label: 'Bem', emoji: require('../../assets/images/emojisprincipal/bem.png'), color: '#d8790b', value: 'Bem' },
  { label: 'Ruim', emoji: require('../../assets/images/emojisprincipal/ruim.png'), color: '#ea1607', value: 'Ruim' },
  { label: 'Horrível', emoji: require('../../assets/images/emojisprincipal/horrivel.png'), color: '#b34fc5', value: 'Horrivel' },
];

// 2. Opções Detalhadas para o Modal Dark segunda pagina
const emotionsList = [
  { id: '1', label: 'Feliz', icon: 'smile-beam' },
  { id: '2', label: 'Empolgado(a)', icon: 'grin-stars' },
  { id: '3', label: 'Grato(a)', icon: 'hand-holding-heart' },
  { id: '4', label: 'Ansioso(a)', icon: 'nervous' },
];

const sleepList = [
  { id: 's1', label: 'Bom Sono', icon: 'bed' },
  { id: 's2', label: 'Sono Neutro', icon: 'bed' },
  { id: 's3', label: 'Sono Ruim', icon: 'procedures' },
];

const healthList = [
  { id: 'h1', label: 'Atividade Física', icon: 'walking' },
  { id: 'h2', label: 'Alimentação Saudável', icon: 'apple-alt' },
  { id: 'h3', label: 'Beber Água', icon: 'tint' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMainMood, setSelectedMainMood] = useState<any>(null);
  
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedSleep, setSelectedSleep] = useState('');
  const [selectedHealth, setSelectedHealth] = useState('');
  const [note, setNote] = useState('');

  let [fontsLoaded] = useFonts({ 'Manrope-ExtraBold': Manrope_800ExtraBold });

  if (!fontsLoaded) return <ActivityIndicator size="large" color="#FF6B95" style={{flex:1, backgroundColor:'#000'}} />;

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
      Alert.alert('Sucesso', 'Seu dia em Teresina foi registrado! ✌️');
      setSelectedEmotion(''); setSelectedSleep(''); setSelectedHealth(''); setNote('');
    } else {
      Alert.alert('Erro', 'Não foi possível salvar no Supabase.');
    }
  };

  const SelectableItem = ({ item, selected, onSelect }: any) => (
    <TouchableOpacity onPress={() => onSelect(item.label)} style={styles.iconItem}>
      <View style={[styles.iconCircle, selected === item.label && styles.iconCircleActive]}>
        <FontAwesome5 name={item.icon} size={22} color={selected === item.label ? '#fff' : '#FF6B95'} />
      </View>
      <Text style={[styles.iconLabel, selected === item.label && styles.labelActive]}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* TELA 1: SELEÇÃO DE HUMOR (BRANCA) */}
      <View style={styles.whiteHeader}>
        <TouchableOpacity onPress={() => router.replace('/')} style={{padding: 10}}>
          <Ionicons name="close" size={35} color="#D1D1D1" />
        </TouchableOpacity>
      </View>

      <View style={styles.whiteContent}>
        <Text style={styles.whiteTitle}>Como você está?</Text>
        <Text style={styles.whiteDate}>Hoje, 3 de maio</Text>

        <View style={styles.moodRow}>
          {mainMoods.map((mood) => (
            <TouchableOpacity key={mood.value} onPress={() => handleMainMoodSelect(mood)} style={styles.moodItem}>
              <View style={[styles.emojiCircle, { backgroundColor: mood.color }]}>
                <Image 
                  source={mood.emoji} 
                  style={styles.emojiImage} 
                  resizeMode="contain" 
                />
              </View>
              <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* TELA 2: MODAL DETALHADO (DARK) */}
      <Modal animationType="slide" visible={modalVisible} transparent={false}>
        <View style={styles.darkContainer}>
          <View style={styles.darkHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={32} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleFinalSave} style={styles.saveBtn}>
              <Ionicons name="checkmark-circle" size={24} color="#FF6B95" />
              <Text style={styles.saveBtnText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 20 }}>
            <Text style={styles.sectionTitle}>Emoções</Text>
            <View style={styles.darkCard}>
              <View style={styles.grid}>
                {emotionsList.map(item => (
                  <SelectableItem key={item.id} item={item} selected={selectedEmotion} onSelect={setSelectedEmotion} />
                ))}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Sono</Text>
            <View style={styles.darkCard}>
              <View style={styles.grid}>
                {sleepList.map(item => (
                  <SelectableItem key={item.id} item={item} selected={selectedSleep} onSelect={setSelectedSleep} />
                ))}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Saúde</Text>
            <View style={styles.darkCard}>
              <View style={styles.grid}>
                {healthList.map(item => (
                  <SelectableItem key={item.id} item={item} selected={selectedHealth} onSelect={setSelectedHealth} />
                ))}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Anotação rápida</Text>
            <TextInput 
              style={styles.darkInput}
              placeholder="Adicionar Nota.."
              placeholderTextColor="#444"
              multiline
              value={note}
              onChangeText={setNote}
            />
            <View style={{height: 50}} />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  whiteHeader: { marginTop: 40, paddingLeft: 15 },
  whiteContent: { flex: 1, alignItems: 'center', marginTop: 20 },
  whiteTitle: { fontSize: 32, fontFamily: 'Manrope-ExtraBold', color: '#000' },
  whiteDate: { color: '#FF6B95', fontFamily: 'Manrope-ExtraBold', fontSize: 18, marginBottom: 60 },
  moodRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', // Mudamos de 'space-around' para 'center' para unir os itens
    width: '100%',
    gap: 60, // Adicione 'gap' para controlar o espaço exato entre um círculo e outro
  },
  moodItem: { 
    alignItems: 'center',
    width: 85, // Defina uma largura fixa para o item que seja próxima ao tamanho do círculo
    marginHorizontal: 5, // Controle fino do espaço lateral
  },
  emojiCircle: { width: 90, height: 90, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 4 },
  emojiImage: { width: 60, height: 60 },
  moodLabel: { fontSize: 15, fontFamily: 'Manrope-ExtraBold' },

  darkContainer: { flex: 1, backgroundColor: '#000' },
  darkHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 25, alignItems: 'center' },
  saveBtn: { flexDirection: 'row', alignItems: 'center' },
  saveBtnText: { color: '#FF6B95', fontFamily: 'Manrope-ExtraBold', marginLeft: 8, fontSize: 18 },
  sectionTitle: { color: '#fff', fontSize: 18, fontFamily: 'Manrope-ExtraBold', marginTop: 20, marginBottom: 15 },
  darkCard: { backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  iconItem: { alignItems: 'center', width: '25%', marginBottom: 15 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#2A2A2A', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  iconCircleActive: { backgroundColor: '#FF6B95' },
  iconLabel: { color: '#ffffff', fontSize: 14, textAlign: 'center', fontFamily: 'Manrope-ExtraBold' },
  labelActive: { color: '#fff' },
  darkInput: { backgroundColor: '#1A1A1A', borderRadius: 15, padding: 15, color: '#fff', height: 100, textAlignVertical: 'top', marginTop: 10, fontFamily: 'Manrope-ExtraBold' }
});