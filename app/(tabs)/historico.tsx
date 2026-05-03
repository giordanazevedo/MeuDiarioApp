import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../../src/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';

interface Registro {
  id: string;
  data_criacao: string;
  humor: string;
  nivel_sono: string;
  nivel_saude: string;
  anotacao?: string;
  user_id: string;
}

export default function HistoricoScreen() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  let [fontsLoaded] = useFonts({ 'Manrope-ExtraBold': Manrope_800ExtraBold });

  const fetchRegistros = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .eq('user_id', user.id)
      .order('data_criacao', { ascending: false });

    if (!error) setRegistros(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchRegistros(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRegistros();
  };

  if (!fontsLoaded || loading) {
    return <ActivityIndicator size="large" color="#FF6B95" style={{ flex: 1, backgroundColor: '#000' }} />;
  }

// Definimos o tipo do Registro para o TypeScript parar de reclamar
interface Registro {
  id: number;
  humor: string;
  data_criacao: string;
  nivel_sono: string;
  nivel_saude: string;
  anotacao: string;
}

// Agora aplicamos o tipo no renderItem
const renderItem = ({ item }: { item: Registro }) => {
    const dataObj = new Date(item.data_criacao);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }).toUpperCase();
    const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>HOJE, {dataFormatada}</Text>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </View>

        <View style={styles.contentRow}>
          <View style={[styles.emojiCircle, { backgroundColor: '#FF6B95' }]}>
            <Ionicons name="happy" size={30} color="#fff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.moodTitle}>{item.humor} <Text style={styles.timeText}>{horaFormatada}</Text></Text>
            <View style={styles.tagsRow}>
              <Text style={styles.tag}>• {item.nivel_sono} sono</Text>
              <Text style={styles.tag}>• saúde {item.nivel_saude}</Text>
            </View>
            {item.anotacao && <Text style={styles.noteText}>{item.anotacao}</Text>}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Maio 2026</Text>
      
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B95" />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum registro ainda. Vamos fazer história! ✌️</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 20 },
  headerTitle: { 
    fontSize: 22, color: '#fff', textAlign: 'center', 
    marginTop: 50, marginBottom: 20, fontFamily: 'Manrope-ExtraBold' 
  },
  listContent: { paddingBottom: 100 },
  card: { 
    backgroundColor: '#1A1A1A', borderRadius: 20, padding: 20, marginBottom: 15 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  dateText: { color: '#666', fontSize: 12, fontFamily: 'Manrope-ExtraBold' },
  contentRow: { flexDirection: 'row', alignItems: 'center' },
  emojiCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  textContainer: { marginLeft: 15, flex: 1 },
  moodTitle: { color: '#FF6B95', fontSize: 18, fontFamily: 'Manrope-ExtraBold' },
  timeText: { color: '#666', fontSize: 14 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  tag: { color: '#ccc', fontSize: 12, marginRight: 10, fontFamily: 'Manrope-ExtraBold' },
  noteText: { color: '#888', marginTop: 10, fontStyle: 'italic' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 50, fontFamily: 'Manrope-ExtraBold' }
});