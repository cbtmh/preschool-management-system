export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface AcademicYearRequest {
  name: string;       // Regexp format: YYYY-YYYY (e.g., "2024-2025")
  startDate: string;  // LocalDate format: YYYY-MM-DD
  endDate: string;    // LocalDate format: YYYY-MM-DD
  isCurrent: boolean;
}

export interface AcademicYearResponse {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  current?: boolean;
}

export interface SchoolClassRequest {
  name: string;           // Max 100 characters
  ageGroup: string;       // Max 50 characters (e.g., "3-4 tuổi", "4-5 tuổi")
  academicYearId: number; // Foreign key to AcademicYear
}

export interface SchoolClassResponse {
  id: number;
  name: string;
  ageGroup: string;
  academicYearId: number;
  academicYearName: string; // Flattened from AcademicYear entity
}
export interface EnrollmentResponse {
  id: number;
  childId: number;
  childName: string;
  classId: number;
  className: string;
  academicYearId: number;
  academicYearName: string;
  enrollmentDate: string;
  status: string; // STUDYING, DROPPED, COMPLETED
  notes: string;
}

export interface ClassTeacherRequest {
  classId: number;
  teacherIds: number[];
}

export interface TeacherBasicInfo {
  teacherId: number;
  fullName: string;
  phone: string;
}

export interface ClassTeacherResponse {
  classId: number;
  className: string;
  teachers: TeacherBasicInfo[];
}
