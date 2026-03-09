'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { adminApi } from '@/lib/api/admin';
import { useStationLookup } from '@/lib/useStationLookup';
import type { AdminTicket, AdminTicketStats } from '@/lib/types';

export default function AdminTicketsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminTicketsContent />
    </ProtectedRoute>
  );
}

function AdminTicketsContent() {
  const router = useRouter();
  const { getStationName } = useStationLookup();
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [stats, setStats] = useState<AdminTicketStats>({ totalTickets: 0, activeBookings: 0, completed: 0, totalRevenue: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [mounted, setMounted] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchTickets = useCallback(async (search?: string, status?: string, seatClass?: string, travelDate?: string) => {
    try {
      setLoading(true);
      const data = await adminApi.getAdminTickets({
        search: search || undefined,
        status: status || undefined,
        seatClass: seatClass || undefined,
        travelDate: travelDate || undefined,
      });
      setStats(data.stats);
      setTickets(data.tickets);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      alert('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch with debounce for search, immediate for other filters
  useEffect(() => {
    if (!mounted) return;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      fetchTickets();
      return;
    }

    const timer = setTimeout(() => {
      fetchTickets(searchTerm, statusFilter, classFilter, dateFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, classFilter, dateFilter, mounted, fetchTickets]);

  const handleUpdateStatus = async (bookingReference: string, newStatus: string) => {
    try {
      setUpdatingStatus(bookingReference);
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
      await adminApi.updateAdminTicketStatus(bookingReference, {
        status: newStatus,
        updatedBy: userEmail,
      });
      alert('Ticket status updated successfully');
      fetchTickets(searchTerm, statusFilter, classFilter, dateFilter);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update ticket status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-orange-100 text-orange-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      NO_SHOW: 'No Show',
    };
    return labels[status] || status;
  };

  const getClassBadge = (seatClass: string) => {
    const styles: Record<string, string> = {
      FIRST: 'bg-yellow-100 text-yellow-800',
      SECOND: 'bg-blue-100 text-blue-800',
      THIRD: 'bg-green-100 text-green-800',
    };
    return styles[seatClass] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  const isTerminalStatus = (status: string) => {
    return ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(status);
  };

  // Don't render loading state on initial server render
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-railway-blue-50 to-railway-gold-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-railway-red-600 mx-auto mb-4"></div>
          <p className="text-railway-blue-800">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-railway-blue-50 to-railway-gold-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-railway-blue-700 hover:text-railway-blue-900 mb-4 inline-flex items-center"
          >
            ← Back to Dashboard
          </button>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-4xl font-bold text-railway-blue-900 mb-2">Manage Tickets</h1>
            <p className="text-gray-600">View and manage all ticket bookings</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-railway-blue-700">{stats.totalTickets}</div>
            <div className="text-gray-600 mt-1">Total Tickets</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-blue-700">{stats.activeBookings}</div>
            <div className="text-gray-600 mt-1">Active Bookings</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-green-700">{stats.completed}</div>
            <div className="text-gray-600 mt-1">Completed</div>
          </div>
          <div className="bg-railway-gold-50 rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-railway-gold-700">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="text-gray-600 mt-1">Total Revenue</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Reference, passenger, NIC, train..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="input"
              >
                <option value="">All Classes</option>
                <option value="FIRST">First Class</option>
                <option value="SECOND">Second Class</option>
                <option value="THIRD">Third Class</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Travel Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-railway-red-600"></div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-railway-blue-700 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Reference</th>
                  <th className="py-3 px-4 text-left">Passenger</th>
                  <th className="py-3 px-4 text-left">Route</th>
                  <th className="py-3 px-4 text-left">Train</th>
                  <th className="py-3 px-4 text-left">Travel Date</th>
                  <th className="py-3 px-4 text-left">Class</th>
                  <th className="py-3 px-4 text-left">Passengers</th>
                  <th className="py-3 px-4 text-left">Fare</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-gray-500">
                      {loading ? 'Loading tickets...' : 'No tickets found'}
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-semibold text-railway-blue-700">
                          {ticket.bookingReference}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{ticket.passengerName}</div>
                          <div className="text-sm text-gray-500">{ticket.passengerNic}</div>
                          <div className="text-sm text-gray-500">{ticket.passengerMobile}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div>{getStationName(ticket.originStation)} →</div>
                          <div>{getStationName(ticket.destinationStation)}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm">{ticket.trainNumber}</span>
                      </td>
                      <td className="py-3 px-4">{ticket.travelDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getClassBadge(
                            ticket.seatClass
                          )}`}
                        >
                          {ticket.seatClass}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">{ticket.numberOfPassengers}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-railway-gold-700">
                          {formatCurrency(ticket.totalFare)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                            ticket.status
                          )}`}
                        >
                          {getStatusLabel(ticket.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleUpdateStatus(ticket.bookingReference, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          disabled={isTerminalStatus(ticket.status) || updatingStatus === ticket.bookingReference}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="NO_SHOW">No Show</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-center text-gray-600">
          Showing {totalCount} of {stats.totalTickets} tickets
        </div>
      </div>
    </div>
  );
}
