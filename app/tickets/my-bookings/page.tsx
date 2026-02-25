'use client';

import { useState, useEffect } from 'react';
import { FaTicketAlt, FaSpinner, FaSearch } from 'react-icons/fa';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ticketApi, authApi } from '@/lib/api';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import type { Ticket } from '@/lib/types';

function MyBookingsContent() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [mounted, setMounted] = useState(false);

  // Set mounted flag after first render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadMyBookings();
    }
  }, [mounted]);

  const loadMyBookings = async () => {
    setIsLoading(true);
    try {
      const userEmail = authApi.getUserEmail();
      if (!userEmail) {
        toast.error('User email not found');
        router.push('/login');
        return;
      }

      // In a real app, you'd have an endpoint like /tickets/my-bookings
      // For now, we'll use getAllTickets and filter client-side
      const allTickets = await ticketApi.getAllTickets?.() || [];
      const myTickets = allTickets.filter((t: Ticket) => t.passengerEmail === userEmail);
      setTickets(myTickets);
    } catch (error) {
      toast.error('Failed to load bookings', {
        description: error instanceof Error ? error.message : 'Please refresh the page',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      searchTerm === '' ||
      ticket.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.trainNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || ticket.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tickets.length,
    active: tickets.filter((t) => t.status === 'BOOKED').length,
    used: tickets.filter((t) => t.status === 'TRAVELLED').length,
    cancelled: tickets.filter((t) => t.status === 'CANCELLED').length,
  };

  // Don't render loading state on initial server render
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-railway-red-50 via-white to-railway-blue-50">
        <Navbar />
        <div className="container-custom py-12">
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="animate-spin text-4xl text-railway-red-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-railway-red-50 via-white to-railway-blue-50">
      <Navbar />

      <div className="container-custom py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-railway-blue-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage all your ticket bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-white">
            <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-railway-blue-900">{stats.total}</p>
          </div>
          <div className="card bg-green-50">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-700">{stats.active}</p>
          </div>
          <div className="card bg-gray-50">
            <p className="text-sm text-gray-600 mb-1">Used</p>
            <p className="text-3xl font-bold text-gray-700">{stats.used}</p>
          </div>
          <div className="card bg-red-50">
            <p className="text-sm text-gray-600 mb-1">Cancelled</p>
            <p className="text-3xl font-bold text-red-700">{stats.cancelled}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by booking reference, name, or train..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input md:w-48"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="USED">Used</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="card text-center py-12">
            <FaTicketAlt className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {tickets.length === 0 ? 'No bookings found' : 'No bookings match your search'}
            </p>
            <button onClick={() => router.push('/tickets/book')} className="btn-primary">
              Book a Ticket
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Booking Reference</p>
                    <p className="font-mono font-bold text-railway-blue-700">
                      {ticket.bookingReference}
                    </p>
                  </div>
                  <span className={`badge ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Passenger:</span>
                    <span className="font-medium">{ticket.passengerName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium">{ticket.fromStation || ticket.originStation}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium">{ticket.toStation || ticket.destinationStation}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Train:</span>
                    <span className="font-medium">{ticket.trainNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Travel Date:</span>
                    <span className="font-medium">{ticket.travelDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-medium">{ticket.seatClass}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Passengers:</span>
                    <span className="font-medium">{ticket.numberOfPassengers}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-3">
                    <span className="text-gray-600">Fare:</span>
                    <span className="font-bold text-railway-gold-700">
                      {formatCurrency(ticket.fare || ticket.totalFare)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/track?type=ticket&number=${ticket.bookingReference}`)}
                    className="btn-outline flex-1 text-sm"
                  >
                    Track Booking
                  </button>
                  {ticket.qrCodeBase64 && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `data:image/png;base64,${ticket.qrCodeBase64}`;
                        link.download = `${ticket.bookingReference}-QR.png`;
                        link.click();
                      }}
                      className="btn-secondary text-sm"
                    >
                      Download QR
                    </button>
                  )}
                </div>

                {ticket.updatedDate && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Last updated: {formatDateTime(ticket.updatedDate)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <ProtectedRoute>
      <MyBookingsContent />
    </ProtectedRoute>
  );
}
