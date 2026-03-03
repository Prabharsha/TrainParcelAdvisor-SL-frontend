'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaTicketAlt, FaCalculator, FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { RouteRecommendationModal } from '@/components/RouteRecommendationModal';
import { ticketApi, publicApi } from '@/lib/api';
import { routeApi, PredictResponse } from '@/lib/api/route';
import { bookTicketSchema, type BookTicketFormData } from '@/lib/validations';
import { formatCurrency, getMinBookingDate, getMaxBookingDate } from '@/lib/utils';
import type { Station, Train } from '@/lib/types';

const SEAT_CLASSES = [
  { value: 'FIRST', label: 'First Class', description: 'Air-conditioned, Reserved' },
  { value: 'SECOND', label: 'Second Class', description: 'Non-AC, Reserved' },
  { value: 'THIRD', label: 'Third Class', description: 'Non-AC, Unreserved' },
];

export default function BookTicketPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedFare, setCalculatedFare] = useState<number | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState<{
    bookingReference: string;
    qrCode: string;
  } | null>(null);
  
  // Delivery prediction state
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [deliveryPrediction, setDeliveryPrediction] = useState<PredictResponse | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BookTicketFormData>({
    resolver: zodResolver(bookTicketSchema),
    defaultValues: {
      numberOfPassengers: 1,
    },
  });

  // Watch form values for auto-calculation
  const originStation = watch('originStation');
  const destinationStation = watch('destinationStation');
  const seatClass = watch('seatClass');
  const numberOfPassengers = watch('numberOfPassengers');

  // Load reference data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [stationsData, trainsData] = await Promise.all([
          publicApi.getDestinations(),
          publicApi.getTrains(),
        ]);
        setStations(stationsData);
        setTrains(trainsData);
      } catch (error) {
        toast.error('Failed to load data', {
          description: error instanceof Error ? error.message : 'Please refresh the page',
        });
      }
    };
    loadData();
  }, []);

  // Auto-calculate fare
  useEffect(() => {
    if (originStation && destinationStation && seatClass && numberOfPassengers) {
      calculateFare();
    }
  }, [originStation, destinationStation, seatClass, numberOfPassengers]);

  const calculateFare = async () => {
    if (!originStation || !destinationStation || !seatClass || !numberOfPassengers) return;

    // Resolve station codes to names for the backend API
    const originName = stations.find((s) => s.code === originStation)?.name || originStation;
    const destinationName = stations.find((s) => s.code === destinationStation)?.name || destinationStation;

    setIsCalculating(true);
    try {
      const fare = await ticketApi.calculateFare({
        originStation: originName,
        destinationStation: destinationName,
        seatClass,
        numberOfPassengers,
      });
      const total = fare?.total ?? fare?.baseFare ?? 0;
      setCalculatedFare(isNaN(total) ? 0 : total);
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleGetDeliveryPrediction = async () => {
    const travelDate = watch('travelDate');
    const origin = watch('originStation');
    const destination = watch('destinationStation');

    if (!travelDate || !origin || !destination) {
      toast.error('Please fill in the travel date and both stations');
      return;
    }

    setIsLoadingRoute(true);
    
    try {
      const prediction = await routeApi.getDeliveryPrediction({
        from_station: origin,
        to_station: destination,
        weather: {},  // Use API defaults for weather
        booking_date: travelDate,
        booking_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      });
      
      setDeliveryPrediction(prediction);
      setShowRouteModal(true);
    } catch (error) {
      toast.error('Failed to get delivery prediction', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // DEV ONLY - Fill test data
  const fillTestData = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    setValue('passengerName', 'John Doe');
    setValue('passengerNic', '199012345678');
    setValue('passengerMobile', '0771234567');
    setValue('passengerEmail', 'john@example.com');
    setValue('originStation', 'CMB');
    setValue('destinationStation', 'KDY');
    setValue('trainNumber', 'T1001');
    setValue('travelDate', tomorrowStr);
    setValue('seatClass', 'SECOND');
    setValue('numberOfPassengers', 2);
    
    toast.success('Test data filled!');
  };

  // DEV ONLY - Clear all data
  const clearFormData = () => {
    reset({
      numberOfPassengers: 1,
    });
    setCalculatedFare(null);
    toast.info('Form cleared');
  };

  const onSubmit = async (data: BookTicketFormData) => {
    setIsLoading(true);
    try {
      const result = await ticketApi.bookTicket(data);
      
      setBookingSuccess({
        bookingReference: result.bookingReference,
        qrCode: result.qrCodeBase64,
      });

      toast.success('Ticket booked successfully!', {
        description: `Booking Reference: ${result.bookingReference}`,
      });
    } catch (error) {
      toast.error('Booking failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-railway-red-50 via-white to-railway-blue-50">
        <Navbar />
        <div className="container-custom py-12">
          <div className="max-w-2xl mx-auto">
            <div className="card text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTicketAlt className="text-3xl text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                Ticket Booked Successfully!
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">Booking Reference:</p>
                <p className="text-2xl font-bold text-railway-blue-900">
                  {bookingSuccess.bookingReference}
                </p>
              </div>

              {bookingSuccess.qrCode && (
                <div className="mb-6">
                  <img
                    src={`data:image/png;base64,${bookingSuccess.qrCode}`}
                    alt="QR Code"
                    className="mx-auto w-48 h-48"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Show this QR code when boarding the train
                  </p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <button onClick={() => window.print()} className="btn-secondary">
                  Print Ticket
                </button>
                <button onClick={() => window.location.reload()} className="btn-outline">
                  Book Another Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-railway-red-50 via-white to-railway-blue-50">
      <Navbar />
      
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-railway-blue-900 mb-2">Book a Ticket</h1>
            <p className="text-gray-600">Fill in your journey details to book your ticket</p>
          </div>

          {/* DEV ONLY - Test Data Buttons */}
          <div className="card mb-4 bg-yellow-50 border-2 border-yellow-400">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-yellow-800">
                🔧 Development Mode - Test Data Controls
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={fillTestData}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Fill Test Data
                </button>
                <button
                  type="button"
                  onClick={clearFormData}
                  className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Form
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Passenger Information */}
            <div className="card">
              <h3 className="text-xl font-bold text-railway-blue-900 mb-4">
                Passenger Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('passengerName')}
                    className="input"
                    placeholder="John Doe"
                  />
                  {errors.passengerName && (
                    <p className="mt-1 text-sm text-red-600">{errors.passengerName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NIC *</label>
                  <input
                    {...register('passengerNic')}
                    className="input"
                    placeholder="199012345678"
                  />
                  {errors.passengerNic && (
                    <p className="mt-1 text-sm text-red-600">{errors.passengerNic.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    {...register('passengerMobile')}
                    className="input"
                    placeholder="0771234567"
                  />
                  {errors.passengerMobile && (
                    <p className="mt-1 text-sm text-red-600">{errors.passengerMobile.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    {...register('passengerEmail')}
                    type="email"
                    className="input"
                    placeholder="john@example.com"
                  />
                  {errors.passengerEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.passengerEmail.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Journey Details */}
            <div className="card">
              <h3 className="text-xl font-bold text-railway-blue-900 mb-4">Journey Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Station *
                  </label>
                  <select {...register('originStation')} className="input">
                    <option value="">Select departure station</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.code}>
                        {station.name} ({station.code})
                      </option>
                    ))}
                  </select>
                  {errors.originStation && (
                    <p className="mt-1 text-sm text-red-600">{errors.originStation.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Station *
                  </label>
                  <select {...register('destinationStation')} className="input">
                    <option value="">Select arrival station</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.code}>
                        {station.name} ({station.code})
                      </option>
                    ))}
                  </select>
                  {errors.destinationStation && (
                    <p className="mt-1 text-sm text-red-600">{errors.destinationStation.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Train *</label>
                  <select {...register('trainNumber')} className="input">
                    <option value="">Select train</option>
                    {trains.map((train) => (
                      <option key={train.id} value={train.trainNumber}>
                        {train.name} ({train.trainNumber})
                      </option>
                    ))}
                  </select>
                  {errors.trainNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.trainNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel Date *
                  </label>
                  <input
                    {...register('travelDate')}
                    type="date"
                    min={getMinBookingDate()}
                    max={getMaxBookingDate()}
                    className="input"
                  />
                  {errors.travelDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.travelDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seat Class *
                  </label>
                  <select {...register('seatClass')} className="input">
                    <option value="">Select seat class</option>
                    {SEAT_CLASSES.map((seatClass) => (
                      <option key={seatClass.value} value={seatClass.value}>
                        {seatClass.label} - {seatClass.description}
                      </option>
                    ))}
                  </select>
                  {errors.seatClass && (
                    <p className="mt-1 text-sm text-red-600">{errors.seatClass.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Passengers *
                  </label>
                  <input
                    {...register('numberOfPassengers', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="10"
                    className="input"
                  />
                  {errors.numberOfPassengers && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.numberOfPassengers.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Calculated Fare */}
            {calculatedFare !== null && (
              <div className="card bg-railway-gold-50 border-2 border-railway-gold-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCalculator className="text-3xl text-railway-gold-700" />
                    <div>
                      <p className="text-sm text-gray-600">Total Fare</p>
                      <p className="text-3xl font-bold text-railway-blue-900">
                        {isCalculating ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          formatCurrency(calculatedFare)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Prediction Button */}
            {watch('originStation') && watch('destinationStation') && watch('travelDate') && (
              <div className="card bg-blue-50 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-blue-900">Predict Journey Duration & Weather Risk</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Get AI-powered journey time prediction with weather-risk analysis
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetDeliveryPrediction}
                    disabled={isLoadingRoute}
                    className="btn-secondary whitespace-nowrap ml-4 flex items-center gap-2"
                  >
                    {isLoadingRoute ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Predicting...
                      </>
                    ) : (
                      '🚂 Get Prediction'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isCalculating}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Booking Ticket...
                </>
              ) : (
                <>
                  <FaTicketAlt />
                  Book Ticket
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Delivery Prediction Modal */}
      <RouteRecommendationModal
        isOpen={showRouteModal}
        prediction={deliveryPrediction}
        onClose={() => setShowRouteModal(false)}
      />
    </div>
  );
}
