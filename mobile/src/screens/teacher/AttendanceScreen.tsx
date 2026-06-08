import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { teacherService } from '../../services/teacher.service';
import { dailyLogService } from '../../services/dailyLog.service';
import { SchoolClassResponse } from '../../types/teacher';
import { AttendanceStatus, MealLevel, SleepQuality, DailyLogResponse, DailyLogItem } from '../../types/dailyLog';
import { store } from '../../store';
import { Calendar } from 'react-native-calendars';

export default function AttendanceScreen() {
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<SchoolClassResponse | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  
  const [students, setStudents] = useState<DailyLogResponse[]>([]);
  const [logs, setLogs] = useState<Record<number, DailyLogItem>>({});
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<{childId: number, type: 'in' | 'out'} | null>(null);
  const [pickerTime, setPickerTime] = useState<Date>(new Date());

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
      const state = store.getState();
      const me = await teacherService.getMe();
      const fetchedClasses = await teacherService.getClassesByTeacherId(me.profile.teacherId);
      setClasses(fetchedClasses);
      const years = Array.from(new Set(fetchedClasses.map(c => c.academicYearName))).sort((a, b) => b.localeCompare(a));
      setAcademicYears(years);
      if (years.length > 0) {
        setSelectedYear(years[0]);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load classes');
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
          attendanceStatus: log.attendanceStatus ?? AttendanceStatus.ABSENT_UNEXCUSED,
          checkInTime: log.checkInTime,
          checkOutTime: log.checkOutTime,
          mealStatus: log.mealStatus || MealLevel.ALL,
          sleepStatus: log.sleepStatus || SleepQuality.GOOD,
          teacherNotes: log.teacherNotes || ''
        };
      });
      setLogs(initialLogs);
    } catch (e) {
      Alert.alert('Error', 'Failed to load attendance');
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
      Alert.alert('Thành công', 'Đã lưu điểm danh!');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu điểm danh');
    } finally {
      setSaving(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate);
    // If the new date is outside current weekDates, regenerate week dates
    const isOutsideWeek = !weekDates.some(d => d.getDate() === newDate.getDate() && d.getMonth() === newDate.getMonth());
    if (isOutsideWeek) {
      generateWeekDates(newDate);
    }
  };

  const getCurrentTimeString = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0]; // "HH:mm:ss"
  };

  const openTimePicker = (childId: number, type: 'in' | 'out', currentTimeStr?: string) => {
    setTimePickerTarget({ childId, type });
    let dateToSet = new Date();
    if (currentTimeStr) {
      const [hours, minutes, seconds] = currentTimeStr.split(':').map(Number);
      dateToSet.setHours(hours, minutes, seconds || 0);
    }
    setPickerTime(dateToSet);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate && timePickerTarget) {
      const timeStr = selectedDate.toTimeString().split(' ')[0];
      setLogs(prev => {
        const currentLog = prev[timePickerTarget.childId];
        return {
          ...prev,
          [timePickerTarget.childId]: {
            ...currentLog,
            [timePickerTarget.type === 'in' ? 'checkInTime' : 'checkOutTime']: timeStr
          }
        };
      });
    }
    setTimePickerTarget(null);
  };

  const updateAttendance = (childId: number, status: AttendanceStatus) => {
    setLogs(prev => {
      const currentLog = prev[childId];
      let newCheckInTime = currentLog.checkInTime;
      let newCheckOutTime = currentLog.checkOutTime;

      if (status === AttendanceStatus.PRESENT) {
        if (!newCheckInTime) {
          newCheckInTime = getCurrentTimeString();
        }
      } else {
        newCheckInTime = undefined;
        newCheckOutTime = undefined;
      }

      return {
        ...prev,
        [childId]: {
          ...currentLog,
          attendanceStatus: status,
          checkInTime: newCheckInTime,
          checkOutTime: newCheckOutTime
        }
      };
    });
  };

  const handleCheckOut = (childId: number) => {
    setLogs(prev => {
      const currentLog = prev[childId];
      return {
        ...prev,
        [childId]: {
          ...currentLog,
          checkOutTime: getCurrentTimeString()
        }
      };
    });
  };

  const formatTimeHM = (timeStr?: string) => {
    if (!timeStr) return '--:--';
    return timeStr.substring(0, 5);
  };

  const markAllPresent = () => {
    setLogs(prev => {
      const newLogs = { ...prev };
      Object.keys(newLogs).forEach(key => {
        const id = parseInt(key);
        if (newLogs[id].attendanceStatus !== AttendanceStatus.PRESENT) {
          newLogs[id] = {
            ...newLogs[id],
            attendanceStatus: AttendanceStatus.PRESENT,
            checkInTime: getCurrentTimeString()
          };
        }
      });
      return newLogs;
    });
  };

  const filteredClasses = selectedYear ? classes.filter(c => c.academicYearName === selectedYear) : classes;

  // Stats
  const totalStudents = students.length;
  const presentCount = Object.values(logs).filter(l => l.attendanceStatus === AttendanceStatus.PRESENT).length;
  const absentCount = totalStudents - presentCount;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Date Navigation */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Điểm danh</Text>
        <TouchableOpacity onPress={() => setShowHistoryModal(true)} style={styles.dateBtn}>
          <Ionicons name="calendar-outline" size={24} color="#10b981" />
        </TouchableOpacity>
      </View>

      {/* Date Selector */}
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

      {/* Academic Year Selector */}
      {academicYears.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearSelector} contentContainerStyle={styles.yearSelectorContent}>
          {academicYears.map(year => (
            <TouchableOpacity
              key={year}
              style={[
                styles.yearTab,
                selectedYear === year && styles.yearTabActive
              ]}
              onPress={() => setSelectedYear(year)}
            >
              <Text style={[
                styles.yearTabText,
                selectedYear === year && styles.yearTabTextActive
              ]}>
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Class Selector */}
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

      {/* Stats & Batch Actions */}
      {!loading && students.length > 0 && (
        <View style={styles.summaryBar}>
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>Sĩ số: <Text style={{fontWeight: 'bold'}}>{totalStudents}</Text></Text>
            <Text style={[styles.statText, {color: '#10b981'}]}>Có mặt: <Text style={{fontWeight: 'bold'}}>{presentCount}</Text></Text>
            <Text style={[styles.statText, {color: '#ef4444'}]}>Vắng: <Text style={{fontWeight: 'bold'}}>{absentCount}</Text></Text>
          </View>
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllPresent}>
            <Ionicons name="checkmark-done-circle" size={18} color="#fff" style={{marginRight: 4}} />
            <Text style={styles.markAllText}>Có mặt tất cả</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Student List */}
      <View style={styles.listContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 50 }} />
          ) : students.length === 0 ? (
            <Text style={styles.emptyText}>Không có học sinh trong lớp này.</Text>
          ) : (
            students.map((student) => {
              const log = logs[student.childId];
              if (!log) return null;

              return (
                <View key={student.childId} style={styles.studentRow}>
                  <View style={styles.studentInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{student.childFullName.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Text style={styles.studentName} numberOfLines={1}>{student.childFullName}</Text>
                        {student.hasSevereAllergy && (
                          <Ionicons name="warning" size={16} color="#ef4444" style={{ marginLeft: 6 }} />
                        )}
                      </View>
                      {log.attendanceStatus === AttendanceStatus.PRESENT && (
                        <View style={styles.timeInfoRow}>
                          <TouchableOpacity 
                            style={styles.timeEditBtn}
                            onPress={() => openTimePicker(student.childId, 'in', log.checkInTime)}
                          >
                            <Text style={styles.timeInfoTextEdit}>
                              Đến: {formatTimeHM(log.checkInTime)} <Ionicons name="pencil" size={10} color="#3b82f6" />
                            </Text>
                          </TouchableOpacity>
                          {log.checkOutTime && (
                            <TouchableOpacity 
                              style={[styles.timeEditBtn, { marginLeft: 8 }]}
                              onPress={() => openTimePicker(student.childId, 'out', log.checkOutTime)}
                            >
                              <Text style={styles.timeInfoTextEdit}>
                                Về: {formatTimeHM(log.checkOutTime)} <Ionicons name="pencil" size={10} color="#3b82f6" />
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Fast Action Buttons */}
                  <View style={styles.actionButtons}>
                    {/* Check In (Present) */}
                    <TouchableOpacity 
                      style={[
                        styles.actionBtn, 
                        styles.actionBtnPresent,
                        log.attendanceStatus === AttendanceStatus.PRESENT && styles.actionBtnPresentActive
                      ]}
                      onPress={() => updateAttendance(student.childId, AttendanceStatus.PRESENT)}
                    >
                      <Ionicons name="checkmark" size={20} color={log.attendanceStatus === AttendanceStatus.PRESENT ? "#fff" : "#10b981"} />
                    </TouchableOpacity>

                    {/* Check Out - Only visible if PRESENT */}
                    {log.attendanceStatus === AttendanceStatus.PRESENT && (
                      <TouchableOpacity 
                        style={[
                          styles.actionBtn, 
                          styles.actionBtnCheckout,
                          log.checkOutTime ? styles.actionBtnCheckoutActive : null
                        ]}
                        onPress={() => handleCheckOut(student.childId)}
                      >
                        <Ionicons 
                          name="exit-outline" 
                          size={20} 
                          color={log.checkOutTime ? "#fff" : "#3b82f6"} 
                        />
                      </TouchableOpacity>
                    )}

                    {/* Absent Excused */}
                    <TouchableOpacity 
                      style={[
                        styles.actionBtn, 
                        styles.actionBtnExcused,
                        log.attendanceStatus === AttendanceStatus.ABSENT_EXCUSED && styles.actionBtnExcusedActive
                      ]}
                      onPress={() => updateAttendance(student.childId, AttendanceStatus.ABSENT_EXCUSED)}
                    >
                      <Text style={[
                        styles.actionBtnText, 
                        {color: log.attendanceStatus === AttendanceStatus.ABSENT_EXCUSED ? "#fff" : "#f59e0b"}
                      ]}>P</Text>
                    </TouchableOpacity>

                    {/* Absent Unexcused */}
                    <TouchableOpacity 
                      style={[
                        styles.actionBtn, 
                        styles.actionBtnUnexcused,
                        log.attendanceStatus === AttendanceStatus.ABSENT_UNEXCUSED && styles.actionBtnUnexcusedActive
                      ]}
                      onPress={() => updateAttendance(student.childId, AttendanceStatus.ABSENT_UNEXCUSED)}
                    >
                      <Text style={[
                        styles.actionBtnText, 
                        {color: log.attendanceStatus === AttendanceStatus.ABSENT_UNEXCUSED ? "#fff" : "#ef4444"}
                      ]}>K</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Save Button */}
      {!loading && students.length > 0 && (
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
                <Text style={styles.saveButtonText}>Lưu điểm danh</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {showTimePicker && (
        <DateTimePicker
          value={pickerTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <Modal visible={showHistoryModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày điểm danh</Text>
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
                todayTextColor: '#10b981',
                arrowColor: '#10b981'
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
    backgroundColor: '#10b981',
    borderColor: '#10b981',
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
  yearSelector: {
    maxHeight: 45,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  yearSelectorContent: {
    paddingRight: 20,
  },
  yearTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    marginRight: 10,
  },
  yearTabActive: {
    backgroundColor: '#334155',
  },
  yearTabText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 13,
  },
  yearTabTextActive: {
    color: '#ffffff',
  },
  classTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  classTabActive: {
    backgroundColor: '#10b981',
  },
  classTabText: {
    color: '#64748b',
    fontWeight: '500',
  },
  classTabTextActive: {
    color: '#fff',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 13,
    color: '#64748b',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  studentRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 14,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  timeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInfoText: {
    fontSize: 12,
    color: '#64748b',
  },
  timeEditBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeInfoTextEdit: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 36, // slightly smaller to fit 4 buttons
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  actionBtnPresent: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  actionBtnPresentActive: {
    backgroundColor: '#10b981',
  },
  actionBtnCheckout: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  actionBtnCheckoutActive: {
    backgroundColor: '#3b82f6',
  },
  actionBtnExcused: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  actionBtnExcusedActive: {
    backgroundColor: '#f59e0b',
  },
  actionBtnUnexcused: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  actionBtnUnexcusedActive: {
    backgroundColor: '#ef4444',
  },
  actionBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveButton: {
    backgroundColor: '#10b981', // green for save
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
