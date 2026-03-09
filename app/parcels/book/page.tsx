'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaBox, FaCalculator, FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { RouteRecommendationModal } from '@/components/RouteRecommendationModal';
import { parcelApi, publicApi } from '@/lib/api';
import { routeApi, PredictResponse } from '@/lib/api/route';
import { bookParcelSchema, type BookParcelFormData } from '@/lib/validations';
import { formatCurrency, getMinBookingDate, getMaxBookingDate } from '@/lib/utils';
import type { Station, ParcelType, Train } from '@/lib/types';

export default function BookParcelPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedCharges, setCalculatedCharges] = useState<number | null>(null);
  const [chargeError, setChargeError] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [parcelTypes, setParcelTypes] = useState<ParcelType[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState<{
    trackingNumber: string;
    qrCode: string;
  } | null>(null);
  
  // Delivery prediction state
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [deliveryPrediction, setDeliveryPrediction] = useState<PredictResponse | null>(null);
  const [showRecommendationButton, setShowRecommendationButton] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BookParcelFormData>({
    resolver: zodResolver(bookParcelSchema),
    defaultValues: {
      numberOfParcels: 1,
      weightInKg: 1,
    },
  });

  // Watch form values for auto-calculation
  const destination = watch('destination');
  const parcelType = watch('parcelType');
  const numberOfParcels = watch('numberOfParcels');
  const weightInKg = watch('weightInKg');

  // Load reference data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [stationsData, typesData, trainsData] = await Promise.all([
          publicApi.getDestinations(),
          publicApi.getParcelTypes(),
          publicApi.getTrains(),
        ]);
        setStations(stationsData);
        setParcelTypes(typesData);
        setTrains(trainsData);
      } catch (error) {
        toast.error('Failed to load data', {
          description: error instanceof Error ? error.message : 'Please refresh the page',
        });
      }
    };
    loadData();
  }, []);

  // Auto-calculate charges
  useEffect(() => {
    if (destination && parcelType && numberOfParcels && weightInKg) {
      calculateCharges();
    }
  }, [destination, parcelType, numberOfParcels, weightInKg]);

  const calculateCharges = async () => {
    if (!destination || !parcelType || !numberOfParcels || !weightInKg) return;

    setIsCalculating(true);
    setChargeError(false);
    try {
      const charges = await parcelApi.calculateCharges({
        destination,
        parcelType,
        numberOfParcels,
        weightInKg,
      });
      const total = charges?.total ?? charges?.baseRate ?? 0;
      setCalculatedCharges(isNaN(total) ? 0 : total);
    } catch (error) {
      console.error('Calculation error:', error);
      setChargeError(true);
      setCalculatedCharges(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleGetDeliveryPrediction = async () => {
    const travelDate = watch('date');
    const startingDestination = watch('startingDestination');
    const endingDestination = watch('destination');

    if (!travelDate || !startingDestination || !endingDestination) {
      toast.error('Please fill in the travel date and both stations');
      return;
    }

    setIsLoadingRoute(true);
    
    try {
      const prediction = await routeApi.getDeliveryPrediction({
        from_station: startingDestination,
        to_station: endingDestination,
        weather: {},  // Use API defaults for weather
        booking_date: travelDate,
        booking_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      });
      
      setDeliveryPrediction(prediction);
      setShowRouteModal(true);
      setShowRecommendationButton(false);
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

    setValue('senderName', 'John Doe');
    setValue('senderNic', '199012345678');
    setValue('senderMobile', '0771234567');
    setValue('senderEmail', 'john@example.com');
    setValue('senderAddress', '123 Main Street, Colombo 07');
    setValue('receiverName', 'Jane Smith');
    setValue('receiverEmail', 'jane@example.com');
    setValue('receiverAddress', '456 Station Road, Kandy');
    setValue('startingDestination', 'CMB');
    setValue('destination', 'KDY');
    setValue('parcelType', 'STANDARD');
    setValue('numberOfParcels', 2);
    setValue('weightInKg', 5);
    setValue('date', tomorrowStr);
    setValue('trainNumber', 'T1001');
    
    toast.success('Test data filled!');
  };

  // DEV ONLY - Clear all data
  const clearFormData = () => {
    reset({
      numberOfParcels: 1,
      weightInKg: 1,
    });
    setCalculatedCharges(null);
    setShowRecommendationButton(false);
    toast.info('Form cleared');
  };

  const onSubmit = async (data: BookParcelFormData) => {
    setIsLoading(true);
    try {
      const result = await parcelApi.bookParcel(data);
      console.log('Book parcel API result:', JSON.stringify(result));
      
      setBookingSuccess({
        trackingNumber: result.trackingNumber || result.message || '',
        qrCode: result.qrCodeBase64 || '',
      });

      toast.success('Parcel booked successfully!', {
        description: `Tracking Number: ${result.trackingNumber || result.message}`,
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
                <FaBox className="text-3xl text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-4">Parcel Booked Successfully!</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">Tracking Number:</p>
                <p className="text-2xl font-bold text-railway-blue-900">{bookingSuccess.trackingNumber}</p>
              </div>

              {bookingSuccess.qrCode && (
                <div className="mb-6">
                  <img
                    src={`data:image/png;base64,${bookingSuccess.qrCode}`}
                    alt="QR Code"
                    className="mx-auto w-48 h-48"
                  />
                  <p className="text-sm text-gray-600 mt-2">Scan this QR code at the station</p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.print()}
                  className="btn-secondary"
                >
                  Print Receipt
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-outline"
                >
                  Book Another Parcel
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
            <h1 className="text-4xl font-bold text-railway-blue-900 mb-2">Send a Parcel</h1>
            <p className="text-gray-600">Fill in the details below to book your parcel</p>
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
            {/* Sender Information */}
            <div className="card">
              <h3 className="text-xl font-bold text-railway-blue-900 mb-4">Sender Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input {...register('senderName')} className="input" placeholder="John Doe" />
                  {errors.senderName && (
                    <p className="mt-1 text-sm text-red-600">{errors.senderName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NIC *</label>
                  <input
                    {...register('senderNic')}
                    className="input"
                    placeholder="199012345678"
                  />
                  {errors.senderNic && (
                    <p className="mt-1 text-sm text-red-600">{errors.senderNic.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    {...register('senderMobile')}
                    className="input"
                    placeholder="0771234567"
                  />
                  {errors.senderMobile && (
                    <p className="mt-1 text-sm text-red-600">{errors.senderMobile.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    {...register('senderEmail')}
                    type="email"
                    className="input"
                    placeholder="john@example.com"
                  />
                  {errors.senderEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.senderEmail.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    {...register('senderAddress')}
                    className="input"
                    rows={2}
                    placeholder="123, Main Street, Colombo"
                  />
                  {errors.senderAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.senderAddress.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Receiver Information */}
            <div className="card">
              <h3 className="text-xl font-bold text-railway-blue-900 mb-4">Receiver Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('receiverName')}
                    className="input"
                    placeholder="Jane Smith"
                  />
                  {errors.receiverName && (
                    <p className="mt-1 text-sm text-red-600">{errors.receiverName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    {...register('receiverEmail')}
                    type="email"
                    className="input"
                    placeholder="jane@example.com"
                  />
                  {errors.receiverEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.receiverEmail.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    {...register('receiverAddress')}
                    className="input"
                    rows={2}
                    placeholder="456, Station Road, Kandy"
                  />
                  {errors.receiverAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.receiverAddress.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Parcel Details */}
            <div className="card">
              <h3 className="text-xl font-bold text-railway-blue-900 mb-4">Parcel Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Station *
                  </label>
                  <select {...register('startingDestination')} className="input">
                    <option value="">Select starting station</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.code}>
                        {station.name} ({station.code})
                      </option>
                    ))}
                  </select>
                  {errors.startingDestination && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.startingDestination.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Station *
                  </label>
                  <select {...register('destination')} className="input">
                    <option value="">Select destination</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.code}>
                        {station.name} ({station.code})
                      </option>
                    ))}
                  </select>
                  {errors.destination && (
                    <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parcel Type *
                  </label>
                  <select {...register('parcelType')} className="input">
                    <option value="">Select parcel type</option>
                    {parcelTypes.map((type) => (
                      <option key={type.id} value={type.code}>
                        {type.name} - {type.description}
                      </option>
                    ))}
                  </select>
                  {errors.parcelType && (
                    <p className="mt-1 text-sm text-red-600">{errors.parcelType.message}</p>
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
                    Number of Parcels *
                  </label>
                  <input
                    {...register('numberOfParcels', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="10"
                    className="input"
                  />
                  {errors.numberOfParcels && (
                    <p className="mt-1 text-sm text-red-600">{errors.numberOfParcels.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg) *
                  </label>
                  <input
                    {...register('weightInKg', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    className="input"
                  />
                  {errors.weightInKg && (
                    <p className="mt-1 text-sm text-red-600">{errors.weightInKg.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel Date *
                  </label>
                  <input
                    {...register('date')}
                    type="date"
                    min={getMinBookingDate()}
                    max={getMaxBookingDate()}
                    className="input"
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Calculated Charges */}
            {(destination && parcelType && numberOfParcels && weightInKg) && (
              <div className={`card border-2 ${
                chargeError ? 'bg-red-50 border-red-300' : 'bg-railway-gold-50 border-railway-gold-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCalculator className={`text-3xl ${
                      chargeError ? 'text-red-500' : 'text-railway-gold-700'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-600">Estimated Total Charges</p>
                      <p className="text-3xl font-bold text-railway-blue-900">
                        {isCalculating ? (
                          <span className="flex items-center gap-2">
                            <FaSpinner className="animate-spin text-xl" />
                            <span className="text-lg text-gray-500">Calculating...</span>
                          </span>
                        ) : chargeError ? (
                          <span className="text-lg text-red-600">Unable to calculate. Please verify your selections.</span>
                        ) : calculatedCharges !== null ? (
                          formatCurrency(calculatedCharges)
                        ) : (
                          <span className="text-lg text-gray-400">--</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Prediction Button */}
            {watch('startingDestination') && watch('destination') && watch('date') && (
              <div className="card bg-blue-50 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-blue-900">Predict Delivery Duration & Weather Risk</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Get AI-powered delivery time prediction with weather-risk analysis
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
                  Booking Parcel...
                </>
              ) : (
                <>
                  <FaBox />
                  Book Parcel
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
