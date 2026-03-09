'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaBox, FaSearch, FaSpinner, FaHistory, FaQrcode, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { parcelApi, ticketApi } from '@/lib/api';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import type { Parcel, Ticket, ParcelTrackingEvent } from '@/lib/types';

type TrackingType = 'parcel' | 'ticket';

const SCAN_METHOD_COLORS: Record<string, string> = {
  QR_SCAN: 'bg-blue-100 text-blue-700',
  MANUAL: 'bg-gray-100 text-gray-700',
};

export default function TrackPage() {
  const searchParams = useSearchParams();
  const [trackingType, setTrackingType] = useState<TrackingType>('parcel');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parcelResult, setParcelResult] = useState<Parcel | null>(null);
  const [ticketResult, setTicketResult] = useState<Ticket | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<ParcelTrackingEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Load from URL parameters
  useEffect(() => {
    const type = searchParams.get('type') as TrackingType;
    const number = searchParams.get('number');

    if (type && number) {
      setTrackingType(type);
      setTrackingNumber(number);
      setTimeout(() => handleAutoTrack(type, number), 100);
    }
  }, [searchParams]);

  const fetchTrackingEvents = async (tNumber: string) => {
    setIsLoadingEvents(true);
    try {
      const events = await parcelApi.getTrackingEvents(tNumber);
      setTrackingEvents(events);
    } catch {
      setTrackingEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleAutoTrack = async (type: TrackingType, number: string) => {
    setIsLoading(true);
    setParcelResult(null);
    setTicketResult(null);
    setTrackingEvents([]);

    try {
      if (type === 'parcel') {
        const result = await parcelApi.trackParcel(number);
        setParcelResult(result);
        toast.success('Parcel found!');
        await fetchTrackingEvents(number);
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

  const formatEventTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-railway-red-50 via-white to-railway-blue-50">
      <Navbar />

      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-railway-blue-900 mb-2">Track Your Item</h1>
            <p className="text-gray-600">Enter your tracking number to see the current status and history</p>
          </div>

          {/* Tracking Type Selector */}
          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={() => {
                setTrackingType('parcel');
                setParcelResult(null);
                setTicketResult(null);
                setTrackingEvents([]);
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
          </div>

          {/* Search Form */}
          <div className="card mb-8">
            <form onSubmit={handleTrack} className="flex gap-4">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter parcel tracking number (e.g., TPA12345678)"
                className="input flex-1"
              />
              <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
                {isLoading ? (
                  <><FaSpinner className="animate-spin" /> Searching...</>
                ) : (
                  <><FaSearch /> Track</>
                )}
              </button>
            </form>
          </div>

          {/* Parcel Result */}
          {parcelResult && (
            <>
              <div className="card mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-railway-blue-900 mb-1">Parcel Details</h2>
                    <p className="text-gray-600 font-mono">{parcelResult.trackingNumber}</p>
                  </div>
                  <span className={`badge ${getStatusColor(parcelResult.status)}`}>
                    {parcelResult.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-railway-blue-900 mb-3">Sender</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Name:</span> <span className="font-medium">{parcelResult.senderName}</span></p>
                      <p><span className="text-gray-600">NIC:</span> <span className="font-medium">{parcelResult.senderNic}</span></p>
                      <p><span className="text-gray-600">Mobile:</span> <span className="font-medium">{parcelResult.senderMobile}</span></p>
                      <p><span className="text-gray-600">Email:</span> <span className="font-medium">{parcelResult.senderEmail}</span></p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-railway-blue-900 mb-3">Receiver</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Name:</span> <span className="font-medium">{parcelResult.receiverName}</span></p>
                      <p><span className="text-gray-600">Email:</span> <span className="font-medium">{parcelResult.receiverEmail}</span></p>
                      <p><span className="text-gray-600">Address:</span> <span className="font-medium">{parcelResult.receiverAddress}</span></p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-railway-blue-900 mb-3">Journey</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">From:</span> <span className="font-medium">{parcelResult.startingDestination}</span></p>
                      <p><span className="text-gray-600">To:</span> <span className="font-medium">{parcelResult.destination}</span></p>
                      <p><span className="text-gray-600">Train:</span> <span className="font-medium">{parcelResult.trainNumber}</span></p>
                      <p><span className="text-gray-600">Date:</span> <span className="font-medium">{parcelResult.date}</span></p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-railway-blue-900 mb-3">Parcel Info</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Type:</span> <span className="font-medium">{parcelResult.parcelType}</span></p>
                      <p><span className="text-gray-600">Quantity:</span> <span className="font-medium">{parcelResult.numberOfParcels}</span></p>
                      <p><span className="text-gray-600">Weight:</span> <span className="font-medium">{parcelResult.weightInKg} kg</span></p>
                      <p><span className="text-gray-600">Charges:</span> <span className="font-medium text-railway-gold-700">{formatCurrency(parcelResult.charges || parcelResult.totalPrice)}</span></p>
                    </div>
                  </div>
                </div>

                {parcelResult.qrCodeBase64 && (
                  <div className="mt-6 text-center">
                    <h3 className="font-semibold text-railway-blue-900 mb-3 flex items-center justify-center gap-2">
                      <FaQrcode /> QR Code
                    </h3>
                    <img src={`data:image/png;base64,${parcelResult.qrCodeBase64}`} alt="QR Code" className="mx-auto w-40 h-40" />
                  </div>
                )}

                {parcelResult.updatedDate && (
                  <p className="text-sm text-gray-500 mt-6 text-center">
                    Last updated: {formatDateTime(parcelResult.updatedDate)}
                  </p>
                )}
              </div>

              {/* Tracking History Timeline */}
              <div className="card">
                <h3 className="text-xl font-bold text-railway-blue-900 mb-5 flex items-center gap-2">
                  <FaHistory className="text-railway-blue-600" />
                  Tracking History
                </h3>

                {isLoadingEvents ? (
                  <div className="flex items-center justify-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-railway-blue-700 mr-3" />
                    <span className="text-gray-600">Loading tracking history...</span>
                  </div>
                ) : trackingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <FaHistory className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No tracking events recorded yet.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Events are recorded when station staff scan the QR code or update the status.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline vertical line */}
                    <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gray-200" />

                    <div className="space-y-6">
                      {trackingEvents.map((event, index) => (
                        <div key={event.id} className="relative flex gap-4 pl-2">
                          {/* Timeline dot */}
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                            index === trackingEvents.length - 1
                              ? 'bg-railway-blue-700 text-white'
                              : 'bg-white border-2 border-railway-blue-300 text-railway-blue-600'
                          }`}>
                            <FaMapMarkerAlt size={14} />
                          </div>

                          {/* Event card */}
                          <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {event.previousStatus && (
                                  <>
                                    <span className={`badge text-xs ${getStatusColor(event.previousStatus)}`}>
                                      {event.previousStatus.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-gray-400 text-xs font-bold">→</span>
                                  </>
                                )}
                                <span className={`badge text-xs ${getStatusColor(event.newStatus)}`}>
                                  {event.newStatus.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                SCAN_METHOD_COLORS[event.scanMethod] || 'bg-gray-100 text-gray-600'
                              }`}>
                                {event.scanMethod === 'QR_SCAN' ? '📷 QR Scan' : '✏️ Manual'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                              <FaMapMarkerAlt className="text-railway-red-500 flex-shrink-0" size={12} />
                              <span className="font-semibold">{event.stationName || event.stationCode}</span>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                              <span>Updated by: <span className="font-medium">{event.updatedBy}</span></span>
                              <span>{formatEventTime(event.eventTimestamp)}</span>
                            </div>

                            {event.remarks && (
                              <p className="text-sm text-gray-600 mt-2 italic border-t border-gray-200 pt-2">
                                &ldquo;{event.remarks}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Ticket Result */}
          {ticketResult && (
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-railway-blue-900 mb-1">Ticket Details</h2>
                  <p className="text-gray-600">Booking: {ticketResult.bookingReference}</p>
                </div>
                <span className={`badge ${getStatusColor(ticketResult.status)}`}>
                  {ticketResult.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-railway-blue-900 mb-3">Passenger</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Name:</span> <span className="font-medium">{ticketResult.passengerName}</span></p>
                    <p><span className="text-gray-600">NIC:</span> <span className="font-medium">{ticketResult.passengerNic}</span></p>
                    <p><span className="text-gray-600">Mobile:</span> <span className="font-medium">{ticketResult.passengerMobile}</span></p>
                    <p><span className="text-gray-600">Email:</span> <span className="font-medium">{ticketResult.passengerEmail}</span></p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-railway-blue-900 mb-3">Journey</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">From:</span> <span className="font-medium">{ticketResult.fromStation}</span></p>
                    <p><span className="text-gray-600">To:</span> <span className="font-medium">{ticketResult.toStation}</span></p>
                    <p><span className="text-gray-600">Train:</span> <span className="font-medium">{ticketResult.trainNumber}</span></p>
                    <p><span className="text-gray-600">Date:</span> <span className="font-medium">{ticketResult.travelDate}</span></p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <h3 className="font-semibold text-railway-blue-900 mb-3">Booking Info</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <p><span className="text-gray-600">Class:</span> <span className="font-medium">{ticketResult.seatClass}</span></p>
                    <p><span className="text-gray-600">Passengers:</span> <span className="font-medium">{ticketResult.numberOfPassengers}</span></p>
                    <p><span className="text-gray-600">Fare:</span> <span className="font-medium text-railway-gold-700">{formatCurrency(ticketResult.fare || ticketResult.totalFare)}</span></p>
                  </div>
                </div>
              </div>

              {ticketResult.qrCodeBase64 && (
                <div className="mt-6 text-center">
                  <h3 className="font-semibold text-railway-blue-900 mb-3">QR Code</h3>
                  <img src={`data:image/png;base64,${ticketResult.qrCodeBase64}`} alt="QR Code" className="mx-auto w-40 h-40" />
                </div>
              )}
            </div>
          )}

          {/* Help Section */}
          {!parcelResult && !ticketResult && (
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-railway-blue-900 mb-2">Need Help?</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Parcel tracking numbers start with &quot;TPA&quot; followed by alphanumeric characters</li>
                <li>• Check your booking confirmation email for the tracking number</li>
                <li>• Tracking history shows all QR scan events and status updates at each station</li>
                <li>• Contact customer service at <a href="tel:+94112345678" className="text-railway-red-700 font-medium">+94 11 234 5678</a></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
