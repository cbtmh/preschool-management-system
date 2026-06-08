import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ParentServicesScreen() {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tiện ích</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.gridContainer}>
          
          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => navigation.navigate('MedicationAdviceList')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="medkit" size={28} color="#ef4444" />
            </View>
            <Text style={styles.itemText}>Dặn thuốc</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => navigation.navigate('ParentMealMenu')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="restaurant" size={28} color="#22c55e" />
            </View>
            <Text style={styles.itemText}>Thực đơn</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => navigation.navigate('ParentMealRegistration')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#ecfeff' }]}>
              <Ionicons name="fast-food" size={28} color="#06b6d4" />
            </View>
            <Text style={styles.itemText}>Đăng ký ăn</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => navigation.navigate('LeaveRequestList')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="calendar" size={28} color="#f59e0b" />
            </View>
            <Text style={styles.itemText}>Xin nghỉ</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => navigation.navigate('ParentHealth')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#e0f2fe' }]}>
              <Ionicons name="fitness" size={28} color="#0ea5e9" />
            </View>
            <Text style={styles.itemText}>Sức khỏe</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => navigation.navigate('ParentAllergy')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#ffedd5' }]}>
              <Ionicons name="warning" size={28} color="#ea580c" />
            </View>
            <Text style={styles.itemText}>Dị ứng</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => navigation.navigate('ParentIncident')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="alert-circle" size={28} color="#a855f7" />
            </View>
            <Text style={styles.itemText}>Sự việc</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  content: {
    padding: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  }
});
