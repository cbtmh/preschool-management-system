
import axiosInstance from '../config/api.client';

export type SeverityLevel = 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
export type IncidentStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
export type InvolvedRole = 'VICTIM' | 'CAUSER' | 'INVOLVED';

export interface InvolvedChildReq {
  childId: number;
  role: InvolvedRole;
}

export interface IncidentReportRequest {
  incidentTime: string;
  description: string;
  severityLevel: SeverityLevel;
  classId: number;
  title: string;
  involvedChildren: InvolvedChildReq[];
  imageUrls: string[];
  initialHandling?: string;
}

export interface InvolvedChildRes {
  childId: number;
  childFullName: string;
  role: InvolvedRole;
}

export interface IncidentReportResponse {
  id: number;
  title: string;
  incidentTime: string;
  description: string;
  severityLevel: SeverityLevel;
  status: IncidentStatus;
  reportedByTeacherName: string;
  classId: number;
  className: string;
  imageUrls: string[];
  principalNotes?: string;
  createdAt: string;
  involvedChildren: InvolvedChildRes[];
  initialHandling?: string;
}

export const incidentService = {

  createIncident: async (data: IncidentReportRequest): Promise<IncidentReportResponse> => {
    const response = await axiosInstance.post<{status: number, message: string, data: IncidentReportResponse}>('/mobile/incidents/teacher', data);
    return response.data.data;
  },

  getTeacherIncidents: async (): Promise<IncidentReportResponse[]> => {
    const response = await axiosInstance.get<{status: number, message: string, data: IncidentReportResponse[]}>('/mobile/incidents/teacher');
    return response.data.data;
  },

  getTeacherIncidentDetail: async (id: number): Promise<IncidentReportResponse> => {
    const response = await axiosInstance.get<{status: number, message: string, data: IncidentReportResponse}>(`/mobile/incidents/teacher/${id}`);
    return response.data.data;
  },


  getParentIncidents: async (childId: number): Promise<IncidentReportResponse[]> => {
    const response = await axiosInstance.get<{status: number, message: string, data: IncidentReportResponse[]}>(`/mobile/incidents/parent/children/${childId}`);
    return response.data.data;
  },

  getParentIncidentDetail: async (id: number, childId: number): Promise<IncidentReportResponse> => {
    const response = await axiosInstance.get<{status: number, message: string, data: IncidentReportResponse}>(`/mobile/incidents/parent/${id}/children/${childId}`);
    return response.data.data;
  }
};
