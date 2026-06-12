import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function TeacherUtilitiesScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tiện ích</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.gridContainer}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#eef2ff' }]}
            onPress={() => navigation.navigate('Daily Log')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#c7d2fe' }]}>
              <Text style={styles.iconText}>📝</Text>
            </View>
            <Text style={styles.actionTitle}>Hoạt động</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#fdf4ff' }]}
            onPress={() => navigation.navigate('TeacherHealth')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#f5d0fe' }]}>
              <Text style={styles.iconText}>❤️</Text>
            </View>
            <Text style={styles.actionTitle}>Sức khỏe</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#fff7ed' }]}
            onPress={() => navigation.navigate('TeacherMenu')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#ffedd5' }]}>
              <Text style={styles.iconText}>🍲</Text>
            </View>
            <Text style={styles.actionTitle}>Thực đơn</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#fdf2f8' }]}
            onPress={() => navigation.navigate('TeacherMedication')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#fce7f3' }]}>
              <Text style={styles.iconText}>💊</Text>
            </View>
            <Text style={styles.actionTitle}>Dặn thuốc</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#fff1f2' }]}
            onPress={() => navigation.navigate('TeacherAllergy')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#ffe4e6' }]}>
              <Text style={styles.iconText}>🥜</Text>
            </View>
            <Text style={styles.actionTitle}>Dị ứng</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#eff6ff' }]}
            onPress={() => navigation.navigate('TeacherIncident')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#dbeafe' }]}>
              <Text style={styles.iconText}>⚠️</Text>
            </View>
            <Text style={styles.actionTitle}>Tường trình</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#fefce8' }]}
            onPress={() => navigation.navigate('TeacherLeaveRequest')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#fef08a' }]}>
              <Text style={styles.iconText}>📩</Text>
            </View>
            <Text style={styles.actionTitle}>Đơn xin nghỉ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  scrollContent: {
    padding: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  actionCard: {
    width: (width - 50) / 2, // 2 cột
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
});
