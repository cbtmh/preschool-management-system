import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, ScrollView, Modal } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { teacherService } from '../../services/teacher.service';
import { dailyLogService } from '../../services/dailyLog.service';
import { SchoolClassResponse } from '../../types/teacher';
import { AttendanceStatus, MealLevel, SleepQuality, DailyLogResponse, DailyLogItem } from '../../types/dailyLog';
import { store } from '../../store';
import { Calendar } from 'react-native-calendars';

type TabType = 'meal' | 'sleep' | 'notes';

export default function DailyLogScreen() {
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<SchoolClassResponse | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  
  const [students, setStudents] = useState<DailyLogResponse[]>([]);
  const [logs, setLogs] = useState<Record<number, DailyLogItem>>({});
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('meal');

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  useEffect(() => {
    generateWeekDates(date);
  }, []);

  const generateWeekDates = (baseDate: Date) => {
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(new Date(baseDate).setDate(diff));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      dates.push(nextDate);
    }
    setWeekDates(dates);
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadDailyLogs();
    }
  }, [selectedClass, date]);

  const loadClasses = async () => {
    try {
      const me = await teacherService.getMe();
      const fetchedClasses = await teacherService.getClassesByTeacherId(me.profile.teacherId);
      setClasses(fetchedClasses);
      const years = Array.from(new Set(fetchedClasses.map(c => c.academicYearName))).sort((a, b) => b.localeCompare(a));
      setAcademicYears(years);
      if (years.length > 0) {
        setSelectedYear(years[0]);
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải danh sách lớp');
    }
  };

  useEffect(() => {
    if (selectedYear) {
      const filtered = classes.filter(c => c.academicYearName === selectedYear);
      if (filtered.length > 0) {
        setSelectedClass(filtered[0]);
      } else {
        setSelectedClass(null);
      }
    }
  }, [selectedYear, classes]);

  const loadDailyLogs = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const formattedDate = date.toISOString().split('T')[0];
      const fetchedLogs = await dailyLogService.getDailyLogsForClass(selectedClass.id, formattedDate);
      
      setStudents(fetchedLogs);
      
      const initialLogs: Record<number, DailyLogItem> = {};
      fetchedLogs.forEach(log => {
        initialLogs[log.childId] = {
          childId: log.childId,
          attendanceStatus: log.attendanceStatus || AttendanceStatus.PRESENT,
          mealStatus: log.mealStatus,
          sleepStatus: log.sleepStatus,
          teacherNotes: log.teacherNotes || ''
        };
      });
      setLogs(initialLogs);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải nhật ký hằng ngày');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedClass) return;
    try {
      setSaving(true);
      const formattedDate = date.toISOString().split('T')[0];
      await dailyLogService.batchUpdateDailyLogs(formattedDate, {
        classId: selectedClass.id,
        logs: Object.values(logs)
      });
      Alert.alert('Thành công', 'Đã lưu nhật ký thành công');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu nhật ký hằng ngày');
    } finally {
      setSaving(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate);
    // nếu ngày mới nằm ngoài tuần hiện tại thì tạo lại danh sách ngày
    const isOutsideWeek = !weekDates.some(d => d.getDate() === newDate.getDate() && d.getMonth() === newDate.getMonth());
    if (isOutsideWeek) {
      generateWeekDates(newDate);
    }
  };

  const updateLog = (childId: number, field: keyof DailyLogItem, value: any) => {
    setLogs(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        [field]: value
      }
    }));
  };

  const filteredClasses = selectedYear ? classes.filter(c => c.academicYearName === selectedYear) : classes;

  const presentStudents = students.filter(student => {
    const log = logs[student.childId];
    return log && log.attendanceStatus === AttendanceStatus.PRESENT;
  });

  const totalPresent = presentStudents.length;
  let completedCount = 0;
  if (activeTab === 'meal') {
    completedCount = presentStudents.filter(s => logs[s.childId]?.mealStatus).length;
  } else if (activeTab === 'sleep') {
    completedCount = presentStudents.filter(s => logs[s.childId]?.sleepStatus).length;
  } else if (activeTab === 'notes') {
    completedCount = presentStudents.filter(s => (logs[s.childId]?.teacherNotes || '').trim().length > 0).length;
  }

  const handleBulkAction = () => {
    if (activeTab === 'notes') return;

    Alert.alert(
      "Xác nhận",
      activeTab === 'meal' ? "Đánh dấu tất cả các bé đều Ăn Hết?" : "Đánh dấu tất cả các bé đều Ngủ Ngon?",
      [
        { text: "Huỷ", style: "cancel" },
        { 
          text: "Đồng ý", 
          onPress: () => {
            const newLogs = { ...logs };
            presentStudents.forEach(student => {
              if (activeTab === 'meal') {
                newLogs[student.childId] = { ...newLogs[student.childId], mealStatus: MealLevel.ALL };
              } else if (activeTab === 'sleep') {
                newLogs[student.childId] = { ...newLogs[student.childId], sleepStatus: SleepQuality.GOOD };
              }
            });
            setLogs(newLogs);
          }
        }
      ]
    );
  };

  const renderMealOptions = (childId: number, currentLevel?: MealLevel) => {
    const options = [
      { value: MealLevel.ALL, icon: '🟢', label: 'Hết' },
      { value: MealLevel.MOST, icon: '🟡', label: 'Nhiều' },
      { value: MealLevel.HALF, icon: '🟠', label: 'Nửa' },
      { value: MealLevel.LITTLE, icon: '🔴', label: 'Ít' },
    ];

    return (
      <View style={styles.optionRow}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.optionBtn, currentLevel === opt.value && styles.optionBtnActive]}
            onPress={() => updateLog(childId, 'mealStatus', opt.value)}
          >
            <Text style={styles.optionIcon}>{opt.icon}</Text>
            <Text style={[styles.optionLabel, currentLevel === opt.value && styles.optionLabelActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSleepOptions = (childId: number, currentQuality?: SleepQuality) => {
    const options = [
      { value: SleepQuality.GOOD, icon: '🟢', label: 'Ngoan' },
      { value: SleepQuality.RESTLESS, icon: '🟡', label: 'Trằn trọc' },
      { value: SleepQuality.NONE, icon: '🔴', label: 'Không ngủ' },
    ];

    return (
      <View style={styles.optionRow}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.optionBtn, currentQuality === opt.value && styles.optionBtnActive]}
            onPress={() => updateLog(childId, 'sleepStatus', opt.value)}
          >
            <Text style={styles.optionIcon}>{opt.icon}</Text>
            <Text style={[styles.optionLabel, currentQuality === opt.value && styles.optionLabelActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderNotesInput = (childId: number, currentNote?: string) => {
    return (
      <View style={styles.noteRow}>
        <TextInput
          style={styles.noteInput}
          placeholder="Nhập ghi chú..."
          value={currentNote}
          onChangeText={(text) => updateLog(childId, 'teacherNotes', text)}
          multiline
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nhật ký hằng ngày</Text>
        <TouchableOpacity onPress={() => setShowHistoryModal(true)} style={styles.dateBtn}>
          <Ionicons name="calendar-outline" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>
      <View style={styles.dateSelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {weekDates.map((d, index) => {
            const isSelected = d.getDate() === date.getDate() && d.getMonth() === date.getMonth();
            const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            return (
              <TouchableOpacity 
                key={index}
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                onPress={() => setDate(d)}
              >
                <Text style={[styles.dateDay, isSelected && styles.dateTextActive]}>
                  {dayNames[d.getDay()]}
                </Text>
                <Text style={[styles.dateNumber, isSelected && styles.dateTextActive]}>
                  {d.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      {filteredClasses.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classSelector}>
          {filteredClasses.map(cls => (
            <TouchableOpacity
              key={cls.id}
              style={[
                styles.classTab,
                selectedClass?.id === cls.id && styles.classTabActive
              ]}
              onPress={() => setSelectedClass(cls)}
            >
              <Text style={[
                styles.classTabText,
                selectedClass?.id === cls.id && styles.classTabTextActive
              ]}>
                {cls.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <View style={styles.mainTabs}>
        <TouchableOpacity style={[styles.mainTab, activeTab === 'meal' && styles.mainTabActive]} onPress={() => setActiveTab('meal')}>
          <Text style={[styles.mainTabText, activeTab === 'meal' && styles.mainTabTextActive]}>🍽️ Ăn uống</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.mainTab, activeTab === 'sleep' && styles.mainTabActive]} onPress={() => setActiveTab('sleep')}>
          <Text style={[styles.mainTabText, activeTab === 'sleep' && styles.mainTabTextActive]}>💤 Giấc ngủ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.mainTab, activeTab === 'notes' && styles.mainTabActive]} onPress={() => setActiveTab('notes')}>
          <Text style={[styles.mainTabText, activeTab === 'notes' && styles.mainTabTextActive]}>📝 Ghi chú</Text>
        </TouchableOpacity>
      </View>
      {!loading && totalPresent > 0 && (
        <View style={styles.actionBar}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Tiến độ: <Text style={styles.progressHighlight}>{completedCount}/{totalPresent}</Text></Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(completedCount / totalPresent) * 100}%` }]} />
            </View>
          </View>
          
          {activeTab !== 'notes' && (
            <TouchableOpacity style={styles.bulkBtn} onPress={handleBulkAction}>
              <Ionicons name="checkmark-done" size={16} color="#fff" />
              <Text style={styles.bulkBtnText}>Tất cả Tốt</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <KeyboardAwareScrollView 
        style={styles.listContainer} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
      >
          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
          ) : presentStudents.length === 0 ? (
            <Text style={styles.emptyText}>Không có học sinh nào có mặt.</Text>
          ) : (
            presentStudents.map((student) => {
              const log = logs[student.childId];
              if (!log) return null;

              return (
                <View key={student.childId} style={styles.studentCardRow}>
                  <View style={styles.studentInfoSmall}>
                    <View style={styles.avatarSmall}>
                      <Text style={styles.avatarTextSmall}>{student.childFullName.charAt(0)}</Text>
                    </View>
                    <Text style={styles.studentNameSmall} numberOfLines={1}>{student.childFullName}</Text>
                  </View>

                  <View style={styles.actionArea}>
                    {activeTab === 'meal' && renderMealOptions(student.childId, log.mealStatus)}
                    {activeTab === 'sleep' && renderSleepOptions(student.childId, log.sleepStatus)}
                    {activeTab === 'notes' && renderNotesInput(student.childId, log.teacherNotes)}
                  </View>
                </View>
              );
            })
          )}
      </KeyboardAwareScrollView>
      {!loading && presentStudents.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Lưu dữ liệu</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showHistoryModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày báo cáo</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Calendar
              current={date.toISOString().split('T')[0]}
              onDayPress={(day: any) => {
                const newDate = new Date(day.timestamp + new Date().getTimezoneOffset() * 60000);
                setDate(newDate);
                generateWeekDates(newDate);
                setShowHistoryModal(false);
              }}
              theme={{
                todayTextColor: '#3b82f6',
                arrowColor: '#3b82f6'
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  dateBtn: {
    padding: 4,
  },
  dateSelectorContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dateScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dateCard: {
    width: 50,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateCardActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  dateDay: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  dateTextActive: {
    color: '#ffffff',
  },
  classSelector: {
    maxHeight: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  classTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  classTabActive: {
    backgroundColor: '#3b82f6',
  },
  classTabText: {
    color: '#64748b',
    fontWeight: '500',
  },
  classTabTextActive: {
    color: '#fff',
  },
  mainTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    justifyContent: 'space-between',
  },
  mainTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#f1f5f9',
  },
  mainTabActive: {
    backgroundColor: '#e0e7ff',
    borderWidth: 1,
    borderColor: '#818cf8',
  },
  mainTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  mainTabTextActive: {
    color: '#4f46e5',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  progressContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  progressHighlight: {
    color: '#0f172a',
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  bulkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bulkBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
  },
  listContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 40,
  },
  studentCardRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentInfoSmall: {
    width: 100,
    alignItems: 'center',
    marginRight: 12,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarTextSmall: {
    color: '#4f46e5',
    fontWeight: 'bold',
    fontSize: 14,
  },
  studentNameSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  actionArea: {
    flex: 1,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionBtnActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  optionIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  optionLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  optionLabelActive: {
    color: '#16a34a',
    fontWeight: '700',
  },
  noteRow: {
    flex: 1,
  },
  noteInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    fontSize: 13,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  }
});
