export interface ChildAttendanceReportDto {
  childId: number;
  childName: string;
  totalPresentDays: number;
  totalExcusedAbsences: number;
  totalUnexcusedAbsences: number;
  totalCancelledMeals: number;
  totalCancelledBreakfasts: number;
  totalCancelledLunches: number;
  totalCancelledSnacks: number;
  attendanceRate: number;
}

export interface ClassAttendanceReportResponse {
  classId: number;
  className: string;
  month: number;
  year: number;
  totalSchoolDays: number;
  childReports: ChildAttendanceReportDto[];
}
