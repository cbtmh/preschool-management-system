import api from '../config/axios.instance';
import { ApiResponse } from '../types/core';
import { AdminIncidentResponse, AdminIncidentUpdateRequest } from '../types/incident';

export const incidentService = {
    getAllIncidents: async () => {
        const response = await api.get<ApiResponse<AdminIncidentResponse[]>>('/api/admin/incidents');
        return response.data;
    },
    
    getIncidentById: async (id: number) => {
        const response = await api.get<ApiResponse<AdminIncidentResponse>>(`/api/admin/incidents/${id}`);
        return response.data;
    },

    updateIncident: async (id: number, data: AdminIncidentUpdateRequest) => {
        const response = await api.put<ApiResponse<AdminIncidentResponse>>(`/api/admin/incidents/${id}`, data);
        return response.data;
    }
};
