import { apiClient, handleApiError } from './client';
import type {
  CalculateTicketRequest,
  TicketFare,
  BookTicketRequest,
  BookTicketResponse,
  Ticket,
  ApiResponse,
} from '../types';

export const ticketApi = {
  // Calculate ticket fare
  calculateFare: async (data: CalculateTicketRequest): Promise<TicketFare> => {
    try {
      const response = await apiClient.post<ApiResponse<TicketFare>>(
        '/api/ticket/calculate',
        data
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to calculate fare');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Book ticket
  bookTicket: async (data: BookTicketRequest): Promise<BookTicketResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<BookTicketResponse>>(
        '/api/ticket/book',
        data
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to book ticket');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Track ticket by booking reference
  trackTicket: async (bookingReference: string): Promise<Ticket> => {
    try {
      const response = await apiClient.get<ApiResponse<Ticket>>(
        `/api/ticket/track/${bookingReference}`
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Ticket not found');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get my bookings by NIC
  getMyBookings: async (nic: string): Promise<Ticket[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Ticket[]>>(
        `/api/ticket/my-bookings/${nic}`
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Cancel ticket
  cancelTicket: async (bookingReference: string): Promise<Ticket> => {
    try {
      const response = await apiClient.put<ApiResponse<Ticket>>(
        `/api/ticket/cancel/${bookingReference}`
      );
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to cancel ticket');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get all tickets (Admin/Station Master)
  getAllTickets: async (): Promise<Ticket[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Ticket[]>>('/api/ticket/all');
      
      if (response.data.statusCode === 200 && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
