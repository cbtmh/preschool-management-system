// --- TEACHER ---
export interface TeacherCreateRequest {
  phone: string; // Used as username
  fullName: string;
  dob: string; // YYYY-MM-DD
  gender: string; // MALE, FEMALE, OTHER
  email?: string;
  address?: string;
}

export interface TeacherUpdateRequest {
  fullName: string;
  dob: string;
  gender: string;
  email?: string;
  address?: string;
}

export interface TeacherResponse {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  dob: string;
  gender: string;
  email?: string;
  address: string;
  assignedClasses?: string[];
}

// --- PARENT ---
export interface ParentCreateRequest {
  phone: string; // Used as username
  fullName: string;
  email?: string;
  address?: string;
}

export interface ParentUpdateRequest {
  fullName: string;
  email?: string;
  address?: string;
}

export interface ParentResponse {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  email?: string;
  address: string;
  childrenNames?: string[];
}

// --- ALLERGY ---
export interface AllergyRequest {
  allergen: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  description?: string;
}

export interface AllergyResponse {
  id: number;
  allergen: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  description?: string;
}

// --- CHILD & PLACEMENT ---
export interface ChildRequest {
  fullName: string;
  dob: string;
  gender: string;
  status: string; // STUDYING, RESERVED, ENTRANCE_PRIMARY
  healthNotes?: string;
  parentId: number;
  allergyDeclared?: boolean;
  allergies?: AllergyRequest[];
}

export interface ChildResponse {
  id: number;
  fullName: string;
  dob: string;
  gender: string;
  status: string;
  healthNotes: string;
  parentId: number;
  hasCurrentEnrollment?: boolean;
  allergyDeclared?: boolean;
  allergies?: AllergyResponse[];
}

export interface TransferClassRequest {
  newClassId: number;
  note?: string;
  forceEnrollment?: boolean;
}

export interface DropOutRequest {
  note: string;
}

export interface AutoEnrollmentRequest {
  academicYearId: number;
}

export interface UnassignedChildDto {
  childId: number;
  fullName: string;
  reason: string;
}

export interface AutoEnrollmentResponse {
  totalProcessed: number;
  totalAssigned: number;
  totalUnassigned: number;
  unassignedChildren: UnassignedChildDto[];
}
