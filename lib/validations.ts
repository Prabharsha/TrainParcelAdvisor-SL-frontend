import { z } from 'zod';

// ========================
// Authentication Schemas
// ========================

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(1, 'Full name is required'),
  nic: z.string().regex(/^\d{9}[vVxX]$|^\d{12}$/, 'Invalid NIC format'),
  mobileNumber: z.string().regex(/^0\d{9}$/, 'Invalid mobile number'),
  role: z.enum(['ADMIN', 'STATION_MASTER', 'CUSTOMER']),
  station: z.string().min(1, 'Station is required'),
});

// ========================
// Parcel Schemas
// ========================

export const calculateParcelSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  parcelType: z.string().min(1, 'Parcel type is required'),
  numberOfParcels: z.number().min(1, 'At least 1 parcel is required').max(10, 'Maximum 10 parcels allowed'),
  weightInKg: z.number().min(0.1, 'Weight must be at least 0.1 kg').max(100, 'Maximum weight is 100 kg'),
});

export const bookParcelSchema = z.object({
  senderName: z.string().min(1, 'Sender name is required'),
  senderAddress: z.string().min(1, 'Sender address is required'),
  senderNic: z.string().regex(/^\d{9}[vVxX]$|^\d{12}$/, 'Invalid NIC format'),
  senderMobile: z.string().regex(/^0\d{9}$/, 'Invalid mobile number'),
  senderEmail: z.string().email('Invalid email address'),
  startingDestination: z.string().min(1, 'Starting destination is required'),
  destination: z.string().min(1, 'Destination is required'),
  receiverName: z.string().min(1, 'Receiver name is required'),
  receiverAddress: z.string().min(1, 'Receiver address is required'),
  receiverEmail: z.string().email('Invalid email address'),
  parcelType: z.string().min(1, 'Parcel type is required'),
  numberOfParcels: z.number().min(1, 'At least 1 parcel is required').max(10, 'Maximum 10 parcels allowed'),
  date: z.string().min(1, 'Date is required'),
  weightInKg: z.number().min(0.1, 'Weight must be at least 0.1 kg').max(100, 'Maximum weight is 100 kg'),
  trainNumber: z.string().min(1, 'Train number is required'),
}).refine((data) => data.startingDestination !== data.destination, {
  message: 'Starting and ending destinations must be different',
  path: ['destination'],
});

export const trackParcelSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required'),
});

// ========================
// Ticket Schemas
// ========================

export const calculateTicketSchema = z.object({
  originStation: z.string().min(1, 'Origin station is required'),
  destinationStation: z.string().min(1, 'Destination station is required'),
  numberOfPassengers: z.number().min(1, 'At least 1 passenger is required').max(10, 'Maximum 10 passengers allowed'),
  seatClass: z.enum(['FIRST', 'SECOND', 'THIRD']),
});

export const bookTicketSchema = z.object({
  passengerName: z.string().min(1, 'Passenger name is required'),
  passengerNic: z.string().regex(/^\d{9}[vVxX]$|^\d{12}$/, 'Invalid NIC format'),
  passengerMobile: z.string().regex(/^0\d{9}$/, 'Invalid mobile number'),
  passengerEmail: z.string().email('Invalid email address'),
  originStation: z.string().min(1, 'Origin station is required'),
  destinationStation: z.string().min(1, 'Destination station is required'),
  trainNumber: z.string().min(1, 'Train number is required'),
  travelDate: z.string().min(1, 'Travel date is required'),
  numberOfPassengers: z.number().min(1, 'At least 1 passenger is required').max(10, 'Maximum 10 passengers allowed'),
  seatClass: z.enum(['FIRST', 'SECOND', 'THIRD']),
}).refine((data) => data.originStation !== data.destinationStation, {
  message: 'Origin and destination stations must be different',
  path: ['destinationStation'],
});

export const trackTicketSchema = z.object({
  bookingReference: z.string().min(1, 'Booking reference is required'),
});

// ========================
// Admin Schemas
// ========================

export const stationSchema = z.object({
  code: z.string().min(2, 'Station code must be at least 2 characters').max(5, 'Station code must be at most 5 characters'),
  name: z.string().min(1, 'Station name is required'),
  distanceMultiplier: z.number().min(0, 'Distance multiplier must be positive'),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

export const trainSchema = z.object({
  trainNumber: z.string().min(1, 'Train number is required'),
  name: z.string().min(1, 'Train name is required'),
  departureTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Invalid time format (HH:MM:SS)'),
  arrivalTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, 'Invalid time format (HH:MM:SS)'),
  departureStation: z.string().min(1, 'Departure station is required'),
  destinationStation: z.string().min(1, 'Destination station is required'),
  active: z.boolean().default(true),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CalculateParcelFormData = z.infer<typeof calculateParcelSchema>;
export type BookParcelFormData = z.infer<typeof bookParcelSchema>;
export type TrackParcelFormData = z.infer<typeof trackParcelSchema>;
export type CalculateTicketFormData = z.infer<typeof calculateTicketSchema>;
export type BookTicketFormData = z.infer<typeof bookTicketSchema>;
export type TrackTicketFormData = z.infer<typeof trackTicketSchema>;
export type StationFormData = z.infer<typeof stationSchema>;
export type TrainFormData = z.infer<typeof trainSchema>;
