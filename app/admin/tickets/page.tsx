'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ticketApi } from '@/lib/api/ticket';

interface Ticket {
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
  seatClass: string;
  totalFare: number;
  status: string;
  bookingDate: string;
}

export default function AdminTicketsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminTicketsContent />
    </ProtectedRoute>
  );
}

function AdminTicketsContent() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [mounted, setMounted] = useState(false);

  // Set mounted flag after first render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchTickets();
    }
  }, [mounted]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, dateFilter, classFilter, tickets]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketApi.getAllTickets();
      setTickets(data);
      setFilteredTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      alert('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.bookingReference.toLowerCase().includes(search) ||
          t.passengerName.toLowerCase().includes(search) ||
          t.passengerNic.toLowerCase().includes(search) ||
          t.trainNumber.toLowerCase().includes(search) ||
          t.originStation.toLowerCase().includes(search) ||
          t.destinationStation.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Class filter
    if (classFilter !== 'ALL') {
      filtered = filtered.filter((t) => t.seatClass === classFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((t) => t.travelDate === dateFilter);
    }

    setFilteredTickets(filtered);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      BOOKED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      TRAVELLED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getClassBadge = (seatClass: string) => {
    const styles = {
      FIRST: 'bg-yellow-100 text-yellow-800',
      SECOND: 'bg-blue-100 text-blue-800',
      THIRD: 'bg-green-100 text-green-800',
    };
    return styles[seatClass as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: tickets.length,
    booked: tickets.filter((t) => t.status === 'BOOKED' || t.status === 'CONFIRMED').length,
    travelled: tickets.filter((t) => t.status === 'TRAVELLED' || t.status === 'COMPLETED').length,
    cancelled: tickets.filter((t) => t.status === 'CANCELLED').length,
    totalRevenue: tickets
      .filter((t) => t.status !== 'CANCELLED')
      .reduce((sum, t) => sum + t.totalFare, 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  // Don't render loading state on initial server render
  if (!mounted || loading) {
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
            <div className="text-3xl font-bold text-railway-blue-700">{stats.total}</div>
            <div className="text-gray-600 mt-1">Total Tickets</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-blue-700">{stats.booked}</div>
            <div className="text-gray-600 mt-1">Active Bookings</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-green-700">{stats.travelled}</div>
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
                <option value="ALL">All Statuses</option>
                <option value="BOOKED">Booked</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="TRAVELLED">Travelled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="input"
              >
                <option value="ALL">All Classes</option>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
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
                          <div>{ticket.originStation} →</div>
                          <div>{ticket.destinationStation}</div>
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
                          {ticket.status}
                        </span>
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
          Showing {filteredTickets.length} of {tickets.length} tickets
        </div>
      </div>
    </div>
  );
}
