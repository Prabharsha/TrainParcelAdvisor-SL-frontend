// ========================
// Common Types
// ========================

export interface ApiResponse<T> {
  statusCode: number;
  title: string;
  message: string;
  data: T;
}

export type UserRole = 'ADMIN' | 'STATION_MASTER' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'DISABLED';
export type ParcelStatus = 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'ARRIVED' | 'READY_FOR_PICKUP' | 'DELIVERED' | 'CANCELLED' | 'REJECTED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'BOOKED' | 'TRAVELLED';
export type SeatClass = 'FIRST' | 'SECOND' | 'THIRD';

// ========================
// Authentication Types
// ========================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  userName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  station: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  nic: string;
  mobileNumber: string;
  role: UserRole;
  status: UserStatus;
  station: string;
  createdDateTime: string;
  updatedDateTime: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  nic: string;
  mobileNumber: string;
  role: UserRole;
  station: string;
}

// ========================
// Train & Station Types
// ========================

export interface Train {
  id?: number;
  trainNumber: string;
  name: string;
  departureTime?: string;
  arrivalTime?: string;
  departureStation?: string;
  destinationStation?: string;
  type?: string;
  capacity?: number;
  active: boolean;
  createdDateTime?: string;
  updatedDateTime?: string;
}

export interface Station {
  id?: number;
  code: string;
  name: string;
  distanceMultiplier?: number;
  description?: string;
  district?: string;
  province?: string;
  active: boolean;
  createdDateTime?: string;
  updatedDateTime?: string;
}

// ========================
// Parcel Types
// ========================

export interface ParcelType {
  id: number;
  code: string;
  name: string;
  multiplier: number;
  description: string;
  active: boolean;
}

export interface CalculateParcelRequest {
  destination: string;
  parcelType: string;
  numberOfParcels: number;
  weightInKg: number;
}

export interface ParcelCharges {
  baseRate: number;
  weightCharge: number;
  typeCharge: number;
  total: number;
  currency: string;
}

export interface BookParcelRequest {
  senderName: string;
  senderAddress: string;
  senderNic: string;
  senderMobile: string;
  senderEmail: string;
  startingDestination: string;
  destination: string;
  receiverName: string;
  receiverAddress: string;
  receiverEmail: string;
  parcelType: string;
  numberOfParcels: number;
  date: string;
  weightInKg: number;
  trainNumber: string;
}

export interface BookParcelResponse {
  trackingNumber: string;
  qrCodeBase64: string;
  message: string;
}

export interface Parcel {
  id: number;
  trackingNumber: string;
  senderName: string;
  senderAddress: string;
  senderNic: string;
  senderMobile: string;
  senderEmail: string;
  startingDestination: string;
  destination: string;
  receiverName: string;
  receiverAddress: string;
  receiverEmail: string;
  parcelType: string;
  numberOfParcels: number;
  weightInKg: number;
  trainNumber: string;
  bookingDate: string;
  travelDate: string;
  date?: string;
  totalPrice: number;
  charges?: number;
  status: ParcelStatus;
  qrCodeBase64?: string;
  updatedDate?: string;
  createdDateTime: string;
  updatedDateTime: string;
}

// ========================
// Ticket Booking Types
// ========================

export interface CalculateTicketRequest {
  originStation: string;
  destinationStation: string;
  numberOfPassengers: number;
  seatClass: SeatClass;
}

export interface TicketFare {
  baseFare: number;
  distanceCharge: number;
  classCharge: number;
  total: number;
  currency: string;
}

export interface BookTicketRequest {
  passengerName: string;
  passengerNic: string;
  passengerMobile: string;
  passengerEmail: string;
  originStation: string;
  destinationStation: string;
  trainNumber: string;
  travelDate: string;
  numberOfPassengers: number;
  seatClass: SeatClass;
}

export interface BookTicketResponse {
  bookingReference: string;
  qrCodeBase64: string;
  message: string;
}

export interface Ticket {
  id: number;
  bookingReference: string;
  passengerName: string;
  passengerNic: string;
  passengerMobile: string;
  passengerEmail: string;
  originStation: string;
  destinationStation: string;
  fromStation?: string;
  toStation?: string;
  trainNumber: string;
  travelDate: string;
  numberOfPassengers: number;
  seatClass: SeatClass;
  totalFare: number;
  fare?: number;
  status: BookingStatus;
  qrCodeBase64?: string;
  updatedDate?: string;
  bookingDate: string;
  createdDateTime: string;
  updatedDateTime: string;
}

// ========================
// Dashboard Types
// ========================

export interface DashboardStats {
  totalParcels: number;
  totalTickets: number;
  totalRevenue: number;
  pendingParcels: number;
  inTransitParcels?: number;
  deliveredParcels?: number;
  activeTickets?: number;
  usedTickets?: number;
  cancelledTickets?: number;
  activeTrains: number;
  activeStations: number;
  totalTrains?: number;
  totalStations?: number;
  totalUsers: number;
  monthlyRevenue: number;
}

export interface RevenueData {
  month: string;
  parcelRevenue: number;
  ticketRevenue: number;
  totalRevenue: number;
}

// ========================
// Station Master Types
// ========================

export interface StationMasterDashboard {
  stationCode: string;
  stationName: string;
  totalIncomingParcels: number;
  totalOutgoingParcels: number;
  pendingParcels: number;
  deliveredParcels: number;
}

export interface UpdateParcelStatusRequest {
  parcelId: number;
  status: ParcelStatus;
  remarks?: string;
}

// ========================
// Admin Management Types
// ========================

export interface AdminParcelStats {
  totalParcels: number;
  pending: number;
  inTransit: number;
  delivered: number;
}

export interface AdminParcel {
  id: number;
  trackingNumber: string;
  senderName: string;
  senderNic: string;
  senderMobile: string;
  receiverName: string;
  startingDestination: string;
  destination: string;
  weightInKg: number;
  deliveryDate: string;
  totalCharge: number;
  trainNumber: string;
  numberOfParcels: number;
  parcelType: string;
  status: string;
  statusUpdatedAt: string | null;
  statusUpdatedBy: string | null;
  remarks: string | null;
  createdDateTime: string;
}

export interface AdminParcelsResponse {
  stats: AdminParcelStats;
  parcels: AdminParcel[];
  totalCount: number;
}

export interface AdminParcelFilters {
  search?: string;
  status?: string;
  deliveryDate?: string;
}

export interface AdminTicketStats {
  totalTickets: number;
  activeBookings: number;
  completed: number;
  totalRevenue: number;
}

export interface AdminTicket {
  id: number;
  bookingReference: string;
  passengerName: string;
  passengerNic: string;
  passengerMobile: string;
  passengerEmail: string;
  originStation: string;
  destinationStation: string;
  trainNumber: string;
  travelDate: string;
  numberOfPassengers: number;
  totalFare: number;
  seatClass: string;
  status: string;
  statusUpdatedAt: string | null;
  remarks: string | null;
  createdDateTime: string;
}

export interface AdminTicketsResponse {
  stats: AdminTicketStats;
  tickets: AdminTicket[];
  totalCount: number;
}

export interface AdminTicketFilters {
  search?: string;
  status?: string;
  seatClass?: string;
  travelDate?: string;
}

export interface AdminUpdateStatusRequest {
  status: string;
  updatedBy?: string;
  remarks?: string;
}

// ========================
// Form Validation Schemas
// ========================

export interface FormErrors {
  [key: string]: string;
}
