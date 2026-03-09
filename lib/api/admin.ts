import { apiClient, handleApiError } from './client';
import type {
  User, Station, Train, DashboardStats, ApiResponse,
  AdminParcelsResponse, AdminParcelFilters,
  AdminTicketsResponse, AdminTicketFilters,
  AdminUpdateStatusRequest,
  StationParcel,
  QrScanUpdateRequest,
} from '../types';

export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get<ApiResponse<DashboardStats>>('/api/admin/dashboard');
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to fetch dashboard stats');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // User Management
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<ApiResponse<User[]>>('/api/admin/users');
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  changeUserStatus: async (userId: number, status: string): Promise<User> => {
    try {
      const response = await apiClient.put<ApiResponse<User>>(
        '/api/admin/users/status',
        { userId, status }
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to update user status');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteUser: async (userId: number): Promise<void> => {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/api/admin/users/${userId}`);
      
      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Station Management
  getAllStations: async (): Promise<Station[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Station[]>>('/api/admin/stations');
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createStation: async (station: Omit<Station, 'id' | 'createdDateTime' | 'updatedDateTime'>): Promise<Station> => {
    try {
      const response = await apiClient.post<ApiResponse<Station>>('/api/admin/stations', station);
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to create station');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateStation: async (stationId: number, station: Partial<Station>): Promise<Station> => {
    try {
      const response = await apiClient.put<ApiResponse<Station>>(
        `/api/admin/stations/${stationId}`,
        station
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to update station');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteStation: async (stationId: number): Promise<void> => {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/api/admin/stations/${stationId}`);
      
      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || 'Failed to delete station');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Train Management
  getAllTrains: async (): Promise<Train[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Train[]>>('/api/admin/trains');
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createTrain: async (train: Omit<Train, 'id' | 'createdDateTime' | 'updatedDateTime'>): Promise<Train> => {
    try {
      const response = await apiClient.post<ApiResponse<Train>>('/api/admin/trains', train);
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to create train');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateTrain: async (trainId: number, train: Partial<Train>): Promise<Train> => {
    try {
      const response = await apiClient.put<ApiResponse<Train>>(
        `/api/admin/trains/${trainId}`,
        train
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to update train');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteTrain: async (trainId: number): Promise<void> => {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/api/admin/trains/${trainId}`);
      
      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || 'Failed to delete train');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get all parcels (for station master)
  getAllParcels: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/api/stationmaster/parcels');
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to fetch parcels');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Update parcel status
  updateParcelStatus: async (parcelId: number, status: string, remarks?: string): Promise<any> => {
    try {
      const response = await apiClient.put<ApiResponse<any>>(
        '/api/stationmaster/parcel/status',
        { parcelId, status, remarks }
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to update status');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ========================
  // Admin Parcel Management
  // ========================

  getAdminParcels: async (filters?: AdminParcelFilters): Promise<AdminParcelsResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.deliveryDate) params.append('deliveryDate', filters.deliveryDate);

      const queryString = params.toString();
      const url = `/api/admin/parcels${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<ApiResponse<AdminParcelsResponse>>(url);

      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch parcels');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  updateAdminParcelStatus: async (trackingNumber: string, body: AdminUpdateStatusRequest): Promise<void> => {
    try {
      const response = await apiClient.patch<ApiResponse<null>>(
        `/api/admin/parcels/${trackingNumber}/status`,
        body
      );

      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || 'Failed to update parcel status');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ========================
  // Admin Ticket Management
  // ========================

  getAdminTickets: async (filters?: AdminTicketFilters): Promise<AdminTicketsResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.seatClass) params.append('seatClass', filters.seatClass);
      if (filters?.travelDate) params.append('travelDate', filters.travelDate);

      const queryString = params.toString();
      const url = `/api/admin/tickets${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<ApiResponse<AdminTicketsResponse>>(url);

      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch tickets');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  updateAdminTicketStatus: async (bookingReference: string, body: AdminUpdateStatusRequest): Promise<void> => {
    try {
      const response = await apiClient.patch<ApiResponse<null>>(
        `/api/admin/tickets/${bookingReference}/status`,
        body
      );

      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || 'Failed to update ticket status');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ========================
  // Station Master - QR Scan Operations
  // ========================

  scanAndLookupParcel: async (trackingNumber: string): Promise<StationParcel> => {
    try {
      const response = await apiClient.get<ApiResponse<StationParcel>>(
        `/api/station-master/parcels/scan/${trackingNumber}`
      );
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Parcel not found');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  scanAndUpdateParcel: async (trackingNumber: string, request: QrScanUpdateRequest): Promise<StationParcel> => {
    try {
      const response = await apiClient.post<ApiResponse<StationParcel>>(
        `/api/station-master/parcels/scan/${trackingNumber}/update`,
        request
      );
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update parcel');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStationParcels: async (stationCode: string): Promise<StationParcel[]> => {
    try {
      const response = await apiClient.get<ApiResponse<StationParcel[]>>(
        `/api/station-master/parcels/all/${stationCode}`
      );
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
