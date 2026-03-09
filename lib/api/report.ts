import { apiClient, handleApiError } from './client';
import type { ApiResponse, AnalyticsResponse, ReportFilters } from '../types';

export const reportApi = {
  // Fetch analytics data with optional filters
  getAnalytics: async (filters?: ReportFilters): Promise<AnalyticsResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.stationCode) params.append('stationCode', filters.stationCode);

      const queryString = params.toString();
      const url = `/api/reports/analytics${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<ApiResponse<AnalyticsResponse>>(url);
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch analytics');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Download Excel report as file
  downloadExcelReport: async (filters?: ReportFilters): Promise<void> => {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.stationCode) params.append('stationCode', filters.stationCode);

      const queryString = params.toString();
      const url = `/api/reports/parcels/export${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `parcel-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
