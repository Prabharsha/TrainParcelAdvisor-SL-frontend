import { apiClient, handleApiError } from './client';
import type { Train, Station, ParcelType, ApiResponse } from '../types';

export const publicApi = {
  // Get all trains
  getTrains: async (): Promise<Train[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Train[]>>('/api/user/trains');
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get all stations/destinations
  getDestinations: async (): Promise<Station[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Station[]>>('/api/user/destinations');
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get parcel types
  getParcelTypes: async (): Promise<ParcelType[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ParcelType[]>>('/api/user/parcel-types');
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
