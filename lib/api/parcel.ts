import { apiClient, handleApiError } from './client';
import type {
  CalculateParcelRequest,
  ParcelCharges,
  BookParcelRequest,
  BookParcelResponse,
  Parcel,
  ApiResponse,
} from '../types';

export const parcelApi = {
  // Calculate parcel charges
  calculateCharges: async (data: CalculateParcelRequest): Promise<ParcelCharges> => {
    try {
      const response = await apiClient.post<ApiResponse<ParcelCharges>>(
        '/api/parcel/calculate',
        data
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to calculate charges');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Book parcel
  bookParcel: async (data: BookParcelRequest): Promise<BookParcelResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<BookParcelResponse>>(
        '/api/parcel/book',
        data
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to book parcel');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Track parcel by tracking number
  trackParcel: async (trackingNumber: string): Promise<Parcel> => {
    try {
      const response = await apiClient.get<ApiResponse<Parcel>>(
        `/api/parcel/track/${trackingNumber}`
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Parcel not found');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get my parcels by NIC
  getMyParcels: async (nic: string): Promise<Parcel[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Parcel[]>>(
        `/api/customer/parcel/my-parcels/${nic}`
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get all parcels (Admin/Station Master)
  getAllParcels: async (): Promise<Parcel[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Parcel[]>>('/api/stationmaster/parcels');
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update parcel status (Station Master)
  updateParcelStatus: async (parcelId: number, status: string, remarks?: string): Promise<Parcel> => {
    try {
      const response = await apiClient.put<ApiResponse<Parcel>>(
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
};
