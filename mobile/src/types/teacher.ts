export interface TeacherProfile {
  teacherId: number;
  fullName: string;
  dob: string;
  gender: string;
  address: string;
}

export interface MeResponse {
  userId: number;
  username: string;
  role: string;
  profile: TeacherProfile;
  requiresPasswordChange: boolean;
}

export interface SchoolClassResponse {
  id: number;
  name: string;
  ageGroup: string;
  academicYearId: number;
  academicYearName: string;
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
  status: string; // 'STUDYING', 'DROPPED', 'COMPLETED'
  notes: string;
}

export interface ClassTeacherResponse {
  classId: number;
  className: string;
  teachers: {
    teacherId: number;
    fullName: string;
    phone: string;
  }[];
}

export interface AllergyResponse {
  id: number;
  allergen: string;
  severity: string;
  description: string;
}

export interface ChildDetailResponse {
  id: number;
  fullName: string;
  dob: string;
  gender: string;
  status: string;
  healthNotes: string;
  parentId: number;
  parentName: string;
  parentPhone: string;
  hasCurrentEnrollment: boolean;
  allergyDeclared: boolean;
  allergies: AllergyResponse[];
}
