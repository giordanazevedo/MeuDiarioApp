import React, { useEffect, useState, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../../src/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { ThemeContext } from '../../src/theme-context';

// 1. Defina a interface APENAS UMA VEZ fora do componente
interface Registro {
  id: string | number;
  data_criacao: string;
  humor: string;
  nivel_sono: string;
  nivel_saude: string;
  anotacao?: string;
  user_id?: string;
}

export default function HistoricoScreen() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme || 'light';
  const isDark = theme === 'dark';

  // 2. Cores dinâmicas
  const colors = useMemo(() => ({
    backgroundColor: isDark ? '#000' : '#f5f5f5',
    cardBackground: isDark ? '#1A1A1A' : '#ffffff',
    textColor: isDark ? '#fff' : '#000',
    secondaryTextColor: isDark ? '#aaa' : '#666',
    accentColor: '#FF6B95',
    tagColor: isDark ? '#ccc' : '#666',
  }), [isDark]);

  let [fontsLoaded] = useFonts({ 'Manrope-ExtraBold': Manrope_800ExtraBold });

  const fetchRegistros = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .eq('user_id', user.id)
        .order('data_criacao', { ascending: false });

      if (!error && data) setRegistros(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRegistros(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRegistros();
  };

  // 3. Função de Renderização movida para dentro para usar as 'colors'
  const renderItem = ({ item }: { item: Registro }) => {
    const dataObj = new Date(item.data_criacao);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }).toUpperCase();
    const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.dateText, { color: colors.secondaryTextColor }]}>HOJE, {dataFormatada}</Text>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.secondaryTextColor} />
        </View>

        <View style={styles.contentRow}>
          <View style={[styles.emojiCircle, { backgroundColor: colors.accentColor }]}>
            <Ionicons name="happy" size={30} color="#fff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.moodTitle, { color: colors.accentColor }]}>
              {item.humor} <Text style={[styles.timeText, { color: colors.secondaryTextColor }]}>{horaFormatada}</Text>
            </Text>
            <View style={styles.tagsRow}>
              <Text style={[styles.tag, { color: colors.tagColor }]}>• {item.nivel_sono} sono</Text>
              <Text style={[styles.tag, { color: colors.tagColor }]}>• saúde {item.nivel_saude}</Text>
            </View>
            {item.anotacao && (
              <Text style={[styles.noteText, { color: colors.secondaryTextColor }]}>
                {item.anotacao}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.backgroundColor }}>
        <ActivityIndicator size="large" color="#FF6B95" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.headerTitle, { color: colors.textColor }]}>Maio 2026</Text>
      
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B95" />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.secondaryTextColor }]}>
            Nenhum registro ainda. Vamos fazer história! ✌️
          </Text>
        }
      />
    </View>
  );
}

// 4. Styles fixos (o que for dinâmico vai direto no componente via array [styles.ex, {color: ...}])
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  headerTitle: { 
    fontSize: 22, textAlign: 'center', 
    marginTop: 50, marginBottom: 20, fontFamily: 'Manrope-ExtraBold' 
  },
  listContent: { paddingBottom: 100 },
  card: { 
    borderRadius: 20, padding: 20, marginBottom: 15,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  dateText: { fontSize: 12, fontFamily: 'Manrope-ExtraBold' },
  contentRow: { flexDirection: 'row', alignItems: 'center' },
  emojiCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  textContainer: { marginLeft: 15, flex: 1 },
  moodTitle: { fontSize: 18, fontFamily: 'Manrope-ExtraBold' },
  timeText: { fontSize: 14 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  tag: { fontSize: 12, marginRight: 10, fontFamily: 'Manrope-ExtraBold' },
  noteText: { marginTop: 10, fontStyle: 'italic' },
  emptyText: { textAlign: 'center', marginTop: 50, fontFamily: 'Manrope-ExtraBold' }
});