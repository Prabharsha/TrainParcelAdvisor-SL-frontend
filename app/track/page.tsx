'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaBox, FaTicketAlt, FaSearch, FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { parcelApi, ticketApi } from '@/lib/api';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import type { Parcel, Ticket } from '@/lib/types';

type TrackingType = 'parcel' | 'ticket';

export default function TrackPage() {
  const searchParams = useSearchParams();
  const [trackingType, setTrackingType] = useState<TrackingType>('parcel');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parcelResult, setParcelResult] = useState<Parcel | null>(null);
  const [ticketResult, setTicketResult] = useState<Ticket | null>(null);

  // Load from URL parameters
  useEffect(() => {
    const type = searchParams.get('type') as TrackingType;
    const number = searchParams.get('number');
    
    if (type && number) {
      setTrackingType(type);
      setTrackingNumber(number);
      // Auto-track if both parameters are present
      setTimeout(() => handleAutoTrack(type, number), 100);
    }
  }, [searchParams]);

  const handleAutoTrack = async (type: TrackingType, number: string) => {
    setIsLoading(true);
    setParcelResult(null);
    setTicketResult(null);

    try {
      if (type === 'parcel') {
        const result = await parcelApi.trackParcel(number);
        setParcelResult(result);
        toast.success('Parcel found!');
      } else {
        const result = await ticketApi.trackTicket(number);
        setTicketResult(result);
        toast.success('Ticket found!');
      }
    } catch (error) {
      toast.error('Not found', {
        description: error instanceof Error ? error.message : 'Please check your tracking number',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    handleAutoTrack(trackingType, trackingNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-railway-red-50 via-white to-railway-blue-50">
      <Navbar />
      
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-railway-blue-900 mb-2">Track Your Item</h1>
            <p className="text-gray-600">Enter your tracking number to see the current status</p>
          </div>

          {/* Tracking Type Selector */}
          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={() => {
                setTrackingType('parcel');
                setParcelResult(null);
                setTicketResult(null);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                trackingType === 'parcel'
                  ? 'bg-railway-red-700 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaBox />
              Track Parcel
            </button>
            <button
              onClick={() => {
                setTrackingType('ticket');
                setParcelResult(null);
                setTicketResult(null);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                trackingType === 'ticket'
                  ? 'bg-railway-red-700 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaTicketAlt />
              Track Ticket
            </button>
          </div>

          {/* Search Form */}
          <div className="card mb-8">
            <form onSubmit={handleTrack} className="flex gap-4">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder={
                  trackingType === 'parcel'
                    ? 'Enter parcel tracking number (e.g., PKG123456)'
                    : 'Enter ticket booking reference (e.g., TKT123456)'
                }
                className="input flex-1"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <FaSearch />
                    Track
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Parcel Result */}
          {parcelResult && (
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-railway-blue-900 mb-1">
                    Parcel Details
                  </h2>
                  <p className="text-gray-600">Tracking: {parcelResult.trackingNumber}</p>
                </div>
                <span className={`badge ${getStatusColor(parcelResult.status)}`}>
                  {parcelResult.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Sender Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-railway-blue-900 mb-3">Sender</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Name:</span>{' '}
                      <span className="font-medium">{parcelResult.senderName}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">NIC:</span>{' '}
                      <span className="font-medium">{parcelResult.senderNic}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Mobile:</span>{' '}
                      <span className="font-medium">{parcelResult.senderMobile}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Email:</span>{' '}
                      <span className="font-medium">{parcelResult.senderEmail}</span>
                    </p>
                  </div>
                </div>

                {/* Receiver Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-railway-blue-900 mb-3">Receiver</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Name:</span>{' '}
                      <span className="font-medium">{parcelResult.receiverName}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Email:</span>{' '}
                      <span className="font-medium">{parcelResult.receiverEmail}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Address:</span>{' '}
                      <span className="font-medium">{parcelResult.receiverAddress}</span>
                    </p>
                  </div>
                </div>

                {/* Journey Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-railway-blue-900 mb-3">Journey</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">From:</span>{' '}
                      <span className="font-medium">{parcelResult.startingDestination}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">To:</span>{' '}
                      <span className="font-medium">{parcelResult.destination}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Train:</span>{' '}
                      <span className="font-medium">{parcelResult.trainNumber}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Date:</span>{' '}
                      <span className="font-medium">{parcelResult.date}</span>
                    </p>
                  </div>
                </div>

                {/* Parcel Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-railway-blue-900 mb-3">Parcel Info</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Type:</span>{' '}
                      <span className="font-medium">{parcelResult.parcelType}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Quantity:</span>{' '}
                      <span className="font-medium">{parcelResult.numberOfParcels}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Weight:</span>{' '}
                      <span className="font-medium">{parcelResult.weightInKg} kg</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Charges:</span>{' '}
                      <span className="font-medium text-railway-gold-700">
                        {formatCurrency(parcelResult.charges || parcelResult.totalPrice)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {parcelResult.qrCodeBase64 && (
                <div className="mt-6 text-center">
                  <h3 className="font-semibold text-railway-blue-900 mb-3">QR Code</h3>
                  <img
                    src={`data:image/png;base64,${parcelResult.qrCodeBase64}`}
                    alt="QR Code"
                    className="mx-auto w-40 h-40"
                  />
                </div>
              )}

              {parcelResult.updatedDate && (
                <p className="text-sm text-gray-500 mt-6 text-center">
                  Last updated: {formatDateTime(parcelResult.updatedDate)}
                </p>
              )}
            </div>
          )}

          {/* Ticket Result */}
          {ticketResult && (
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-railway-blue-900 mb-1">
                    Ticket Details
                  </h2>
                  <p className="text-gray-600">Booking: {ticketResult.bookingReference}</p>
                </div>
                <span className={`badge ${getStatusColor(ticketResult.status)}`}>
                  {ticketResult.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Passenger Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-railway-blue-900 mb-3">Passenger</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Name:</span>{' '}
                      <span className="font-medium">{ticketResult.passengerName}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">NIC:</span>{' '}
                      <span className="font-medium">{ticketResult.passengerNic}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Mobile:</span>{' '}
                      <span className="font-medium">{ticketResult.passengerMobile}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Email:</span>{' '}
                      <span className="font-medium">{ticketResult.passengerEmail}</span>
                    </p>
                  </div>
                </div>

                {/* Journey Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-railway-blue-900 mb-3">Journey</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">From:</span>{' '}
                      <span className="font-medium">{ticketResult.fromStation}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">To:</span>{' '}
                      <span className="font-medium">{ticketResult.toStation}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Train:</span>{' '}
                      <span className="font-medium">{ticketResult.trainNumber}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Date:</span>{' '}
                      <span className="font-medium">{ticketResult.travelDate}</span>
                    </p>
                  </div>
                </div>

                {/* Ticket Info */}
                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <h3 className="font-semibold text-railway-blue-900 mb-3">Booking Info</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <p>
                      <span className="text-gray-600">Class:</span>{' '}
                      <span className="font-medium">{ticketResult.seatClass}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Passengers:</span>{' '}
                      <span className="font-medium">{ticketResult.numberOfPassengers}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Fare:</span>{' '}
                      <span className="font-medium text-railway-gold-700">
                        {formatCurrency(ticketResult.fare || ticketResult.totalFare)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {ticketResult.qrCodeBase64 && (
                <div className="mt-6 text-center">
                  <h3 className="font-semibold text-railway-blue-900 mb-3">QR Code</h3>
                  <img
                    src={`data:image/png;base64,${ticketResult.qrCodeBase64}`}
                    alt="QR Code"
                    className="mx-auto w-40 h-40"
                  />
                </div>
              )}

              {ticketResult.updatedDate && (
                <p className="text-sm text-gray-500 mt-6 text-center">
                  Last updated: {formatDateTime(ticketResult.updatedDate)}
                </p>
              )}
            </div>
          )}

          {/* Help Section */}
          {!parcelResult && !ticketResult && (
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-railway-blue-900 mb-2">Need Help?</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Parcel tracking numbers start with "PKG" followed by digits</li>
                <li>• Ticket booking references start with "TKT" followed by digits</li>
                <li>• Check your confirmation email for the tracking number</li>
                <li>
                  • Contact customer service at{' '}
                  <a href="tel:+94112345678" className="text-railway-red-700 font-medium">
                    +94 11 234 5678
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
