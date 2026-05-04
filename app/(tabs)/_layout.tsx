import { Tabs, useRouter } from 'expo-router'; //
import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Componente Interno do Menu corrigido com navegação
function MenuOverlay({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  const router = useRouter(); //

  const irParaTela = (rota: string) => {
    onClose(); // Fecha o menu primeiro
    router.push(rota as any); // Navega para a tela desejada
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Linha Superior */}
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItem} onPress={() => irParaTela('/nova_meta')}>
            <View style={[styles.circle, { backgroundColor: '#E94D89' }]}>
              <Ionicons name="flag" size={30} color="black" />
            </View>
            <Text style={styles.menuText}>Nova meta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => irParaTela('/novo_dia_importante')}>
            <View style={[styles.circle, { backgroundColor: '#C12683' }]}>
              <Ionicons name="calendar" size={30} color="black" />
            </View>
            <Text style={styles.menuText}>Dia importante novo</Text>
          </TouchableOpacity>
        </View>

        {/* Item Central */}
        <TouchableOpacity style={styles.menuItem} onPress={() => irParaTela('/registro_hoje')}>
          <View style={[styles.circle, { backgroundColor: '#F39200' }]}>
            <Ionicons name="time" size={30} color="black" />
          </View>
          <Text style={styles.menuText}>Hoje</Text>
        </TouchableOpacity>

        {/* Linha Inferior */}
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItem} onPress={() => irParaTela('/registro_ontem')}>
            <View style={[styles.circle, { backgroundColor: '#C12683' }]}>
              <Ionicons name="arrow-back" size={30} color="black" />
            </View>
            <Text style={styles.menuText}>Ontem</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => irParaTela('/calendario')}>
            <View style={[styles.circle, { backgroundColor: '#FFCB05' }]}>
              <Ionicons name="calendar-outline" size={30} color="black" />
            </View>
            <Text style={styles.menuText}>Outro dia</Text>
          </TouchableOpacity>
        </View>

        {/* Botão de Fechar (X) */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={40} color="black" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function TabLayout() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <MenuOverlay visible={menuVisible} onClose={() => setMenuVisible(false)} />
      
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: '#444',
          tabBarStyle: {
            backgroundColor: '#E94D89',
            height: 70,
            borderTopWidth: 0,
            paddingBottom: 12,
            position: 'absolute',
            overflow: 'visible',
          },
          tabBarLabelStyle: {
            fontFamily: 'Manrope_700Bold',
            fontSize: 10,
          }
        }}>
        
        <Tabs.Screen name="index" options={{ title: 'Registros', tabBarIcon: ({ color }) => <Ionicons name="reader-outline" size={24} color={color} /> }} />
        <Tabs.Screen name="estatisticas" options={{ title: 'Estatísticas', tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={24} color={color} /> }} />

        <Tabs.Screen
          name="novo"
          options={{
            title: '',
            tabBarIcon: () => (
              <View style={styles.floatingButton}>
                <Ionicons name="add" size={40} color="black" />
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault(); 
              setMenuVisible(true); 
            },
          }}
        />

        <Tabs.Screen name="calendario" options={{ title: 'Calendário', tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} /> }} />
        <Tabs.Screen name="mais" options={{ title: 'Mais', tabBarIcon: ({ color }) => <Ionicons name="ellipsis-horizontal-circle-outline" size={24} color={color} /> }} />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    width: 65,
    height: 65,
    backgroundColor: '#E94D89',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'black',
    bottom: 15,
    elevation: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  menuItem: {
    alignItems: 'center',
    width: 120,
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuText: {
    color: 'white',
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 50,
    width: 70,
    height: 70,
    backgroundColor: '#E94D89',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
  },
});