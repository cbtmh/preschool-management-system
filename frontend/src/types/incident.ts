export interface AdminIncidentResponse {
    id: number;
    title: string;
    incidentTime: string;
    description: string;
    initialHandling?: string;
    severityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
    reportedByTeacherName: string;
    classId: number;
    className: string;
    imageUrls: string[];
    principalNotes: string;
    createdAt: string;
    involvedChildren: {
        childId: number;
        childFullName: string;
        role: 'VICTIM' | 'AGGRESSOR' | 'WITNESS' | 'INVOLVED';
    }[];
}

export interface AdminIncidentUpdateRequest {
    status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
    principalNotes?: string;
}
