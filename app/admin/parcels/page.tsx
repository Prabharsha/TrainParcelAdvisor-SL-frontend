'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { adminApi } from '@/lib/api/admin';
import { useStationLookup } from '@/lib/useStationLookup';
import type { AdminParcel, AdminParcelStats } from '@/lib/types';

export default function AdminParcelsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminParcelsContent />
    </ProtectedRoute>
  );
}

function AdminParcelsContent() {
  const router = useRouter();
  const { getStationName } = useStationLookup();
  const [parcels, setParcels] = useState<AdminParcel[]>([]);
  const [stats, setStats] = useState<AdminParcelStats>({ totalParcels: 0, pending: 0, inTransit: 0, delivered: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [mounted, setMounted] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchParcels = useCallback(async (search?: string, status?: string, deliveryDate?: string) => {
    try {
      setLoading(true);
      const data = await adminApi.getAdminParcels({
        search: search || undefined,
        status: status || undefined,
        deliveryDate: deliveryDate || undefined,
      });
      setStats(data.stats);
      setParcels(data.parcels);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error('Error fetching parcels:', error);
      alert('Failed to load parcels');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch with debounce for search, immediate for other filters
  useEffect(() => {
    if (!mounted) return;

    // Skip debounce on initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      fetchParcels();
      return;
    }

    const timer = setTimeout(() => {
      fetchParcels(searchTerm, statusFilter, dateFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, dateFilter, mounted, fetchParcels]);

  const handleUpdateStatus = async (trackingNumber: string, newStatus: string) => {
    try {
      setUpdatingStatus(trackingNumber);
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
      await adminApi.updateAdminParcelStatus(trackingNumber, {
        status: newStatus,
        updatedBy: userEmail,
      });
      alert('Parcel status updated successfully');
      fetchParcels(searchTerm, statusFilter, dateFilter);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update parcel status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      IN_TRANSIT: 'bg-blue-100 text-blue-800',
      ARRIVED: 'bg-teal-100 text-teal-800',
      READY_FOR_PICKUP: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pending',
      ACCEPTED: 'Accepted',
      IN_TRANSIT: 'In Transit',
      ARRIVED: 'Arrived',
      READY_FOR_PICKUP: 'Ready for Pickup',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
      REJECTED: 'Rejected',
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  const isTerminalStatus = (status: string) => {
    return ['DELIVERED', 'CANCELLED', 'REJECTED'].includes(status);
  };

  // Don't render loading state on initial server render
  if (!mounted) {
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
            <div className="text-3xl font-bold text-railway-blue-700">{stats.totalParcels}</div>
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
                placeholder="Tracking, sender, receiver, station, NIC..."
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
                <option value="ACCEPTED">Accepted</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="ARRIVED">Arrived</option>
                <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
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
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-railway-red-600"></div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-railway-blue-700 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Tracking Number</th>
                  <th className="py-3 px-4 text-left">Sender</th>
                  <th className="py-3 px-4 text-left">Receiver</th>
                  <th className="py-3 px-4 text-left">Route</th>
                  <th className="py-3 px-4 text-left">Weight</th>
                  <th className="py-3 px-4 text-left">Delivery Date</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {parcels.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      {loading ? 'Loading parcels...' : 'No parcels found'}
                    </td>
                  </tr>
                ) : (
                  parcels.map((parcel) => (
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
                        <div className="font-medium">{parcel.receiverName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div>{getStationName(parcel.startingDestination)} →</div>
                          <div>{getStationName(parcel.destination)}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{parcel.weightInKg} kg</td>
                      <td className="py-3 px-4">{parcel.deliveryDate}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-railway-gold-700">
                          {formatCurrency(parcel.totalCharge)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                            parcel.status
                          )}`}
                        >
                          {getStatusLabel(parcel.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={parcel.status}
                          onChange={(e) => handleUpdateStatus(parcel.trackingNumber, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          disabled={isTerminalStatus(parcel.status) || updatingStatus === parcel.trackingNumber}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="IN_TRANSIT">In Transit</option>
                          <option value="ARRIVED">Arrived</option>
                          <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="REJECTED">Rejected</option>
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
          Showing {totalCount} of {stats.totalParcels} parcels
        </div>
      </div>
    </div>
  );
}
