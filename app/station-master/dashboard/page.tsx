'use client';

import { useState, useEffect } from 'react';
import { FaBox, FaSpinner, FaQrcode, FaCheckCircle, FaTruck } from 'react-icons/fa';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { adminApi } from '@/lib/api';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import type { Parcel } from '@/lib/types';

function StationMasterDashboardContent() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_TRANSIT' | 'DELIVERED'>('ALL');

  // Set mounted flag after first render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadParcels();
    }
  }, [mounted]);

  const loadParcels = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllParcels();
      setParcels(data);
    } catch (error) {
      toast.error('Failed to load parcels', {
        description: error instanceof Error ? error.message : 'Please refresh the page',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await adminApi.updateParcelStatus(id, newStatus);
      toast.success('Status updated successfully');
      loadParcels();
    } catch (error) {
      toast.error('Failed to update status', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const filteredParcels = filter === 'ALL' 
    ? parcels 
    : parcels.filter(p => p.status === filter);

  const stats = {
    total: parcels.length,
    pending: parcels.filter(p => p.status === 'PENDING').length,
    inTransit: parcels.filter(p => p.status === 'IN_TRANSIT').length,
    delivered: parcels.filter(p => p.status === 'DELIVERED').length,
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
          <h1 className="text-4xl font-bold text-railway-blue-900 mb-2">
            Station Master Dashboard
          </h1>
          <p className="text-gray-600">Manage parcels at your station</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Parcels</p>
                <p className="text-3xl font-bold text-railway-blue-900">{stats.total}</p>
              </div>
              <FaBox className="text-4xl text-railway-blue-300" />
            </div>
          </div>

          <div className="card bg-yellow-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <FaQrcode className="text-4xl text-yellow-300" />
            </div>
          </div>

          <div className="card bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Transit</p>
                <p className="text-3xl font-bold text-blue-700">{stats.inTransit}</p>
              </div>
              <FaTruck className="text-4xl text-blue-300" />
            </div>
          </div>

          <div className="card bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Delivered</p>
                <p className="text-3xl font-bold text-green-700">{stats.delivered}</p>
              </div>
              <FaCheckCircle className="text-4xl text-green-300" />
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="card mb-6">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'ALL'
                  ? 'bg-railway-blue-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'PENDING'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('IN_TRANSIT')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'IN_TRANSIT'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Transit ({stats.inTransit})
            </button>
            <button
              onClick={() => setFilter('DELIVERED')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'DELIVERED'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Delivered ({stats.delivered})
            </button>
          </div>
        </div>

        {/* Parcels Table */}
        <div className="card overflow-x-auto">
          {filteredParcels.length === 0 ? (
            <div className="text-center py-12">
              <FaBox className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No parcels found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">
                    Tracking #
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">
                    Sender
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">
                    Route
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">
                    Charges
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.map((parcel) => (
                  <tr key={parcel.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-semibold text-railway-blue-700">
                        {parcel.trackingNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p className="font-medium">{parcel.senderName}</p>
                        <p className="text-gray-600">{parcel.senderMobile}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p>{parcel.startingDestination} → {parcel.destination}</p>
                        <p className="text-gray-600">Train: {parcel.trainNumber}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusColor(parcel.status)}`}>
                        {parcel.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-railway-gold-700">
                        {formatCurrency(parcel.charges || parcel.totalPrice)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {parcel.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(parcel.id!, 'IN_TRANSIT')}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Mark In Transit
                          </button>
                        )}
                        {parcel.status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => handleUpdateStatus(parcel.id!, 'DELIVERED')}
                            className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StationMasterDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['STATION_MASTER']}>
      <StationMasterDashboardContent />
    </ProtectedRoute>
  );
}
