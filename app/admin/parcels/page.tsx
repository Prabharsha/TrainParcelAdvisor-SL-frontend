'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { adminApi } from '@/lib/api/admin';

interface Parcel {
  id: number;
  trackingNumber: string;
  senderName: string;
  senderMobile: string;
  receiverName: string;
  receiverMobile: string;
  fromStation: string;
  toStation: string;
  weightInKg: number;
  travelDate: string;
  totalPrice: number;
  status: string;
  createdDateTime: string;
}

export default function AdminParcelsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminParcelsContent />
    </ProtectedRoute>
  );
}

function AdminParcelsContent() {
  const router = useRouter();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [filteredParcels, setFilteredParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [mounted, setMounted] = useState(false);

  // Set mounted flag after first render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchParcels();
    }
  }, [mounted]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, dateFilter, parcels]);

  const fetchParcels = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllParcels();
      setParcels(data);
      setFilteredParcels(data);
    } catch (error) {
      console.error('Error fetching parcels:', error);
      alert('Failed to load parcels');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...parcels];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.trackingNumber.toLowerCase().includes(search) ||
          p.senderName.toLowerCase().includes(search) ||
          p.receiverName.toLowerCase().includes(search) ||
          p.fromStation.toLowerCase().includes(search) ||
          p.toStation.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((p) => p.travelDate === dateFilter);
    }

    setFilteredParcels(filtered);
  };

  const handleUpdateStatus = async (parcelId: number, newStatus: string) => {
    try {
      await adminApi.updateParcelStatus(parcelId, newStatus);
      alert('Parcel status updated successfully');
      fetchParcels();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update parcel status');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_TRANSIT: 'bg-blue-100 text-blue-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: parcels.length,
    pending: parcels.filter((p) => p.status === 'PENDING').length,
    inTransit: parcels.filter((p) => p.status === 'IN_TRANSIT').length,
    delivered: parcels.filter((p) => p.status === 'DELIVERED').length,
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
          <p className="text-railway-blue-800">Loading parcels...</p>
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
            <h1 className="text-4xl font-bold text-railway-blue-900 mb-2">Manage Parcels</h1>
            <p className="text-gray-600">View and manage all parcel shipments</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-railway-blue-700">{stats.total}</div>
            <div className="text-gray-600 mt-1">Total Parcels</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-gray-600 mt-1">Pending</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-blue-700">{stats.inTransit}</div>
            <div className="text-gray-600 mt-1">In Transit</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-green-700">{stats.delivered}</div>
            <div className="text-gray-600 mt-1">Delivered</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Tracking, sender, receiver, station..."
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
                <option value="PENDING">Pending</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
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

        {/* Parcels Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-railway-blue-700 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Tracking Number</th>
                  <th className="py-3 px-4 text-left">Sender</th>
                  <th className="py-3 px-4 text-left">Receiver</th>
                  <th className="py-3 px-4 text-left">Route</th>
                  <th className="py-3 px-4 text-left">Weight</th>
                  <th className="py-3 px-4 text-left">Travel Date</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredParcels.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      No parcels found
                    </td>
                  </tr>
                ) : (
                  filteredParcels.map((parcel) => (
                    <tr key={parcel.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-semibold text-railway-blue-700">
                          {parcel.trackingNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{parcel.senderName}</div>
                          <div className="text-sm text-gray-500">{parcel.senderMobile}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{parcel.receiverName}</div>
                          <div className="text-sm text-gray-500">{parcel.receiverMobile}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div>{parcel.fromStation} →</div>
                          <div>{parcel.toStation}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{parcel.weightInKg} kg</td>
                      <td className="py-3 px-4">{parcel.travelDate}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-railway-gold-700">
                          {formatCurrency(parcel.totalPrice)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                            parcel.status
                          )}`}
                        >
                          {parcel.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={parcel.status}
                          onChange={(e) => handleUpdateStatus(parcel.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          disabled={parcel.status === 'DELIVERED' || parcel.status === 'CANCELLED'}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_TRANSIT">In Transit</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
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
          Showing {filteredParcels.length} of {parcels.length} parcels
        </div>
      </div>
    </div>
  );
}
