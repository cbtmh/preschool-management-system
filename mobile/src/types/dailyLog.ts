export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT_EXCUSED = 'ABSENT_EXCUSED',
  ABSENT_UNEXCUSED = 'ABSENT_UNEXCUSED'
}

export enum MealLevel {
  ALL = 'ALL',
  MOST = 'MOST',
  HALF = 'HALF',
  LITTLE = 'LITTLE',
  NONE = 'NONE'
}

export enum SleepQuality {
  GOOD = 'GOOD',
  RESTLESS = 'RESTLESS',
  NONE = 'NONE'
}

export interface DailyLogResponse {
  id?: number;
  childId: number;
  childFullName: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  attendanceStatus: AttendanceStatus;
  mealStatus?: MealLevel;
  sleepStatus?: SleepQuality;
  teacherNotes?: string;
  hasSevereAllergy?: boolean;
}

export interface DailyLogItem {
  childId: number;
  attendanceStatus: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  mealStatus?: MealLevel;
  sleepStatus?: SleepQuality;
  teacherNotes?: string;
}

export interface DailyLogBatchUpdateRequest {
  classId: number;
  logs: DailyLogItem[];
}

export interface DailyLogHistoryResponse {
  date: string;
  attendanceStatus: AttendanceStatus;
}
