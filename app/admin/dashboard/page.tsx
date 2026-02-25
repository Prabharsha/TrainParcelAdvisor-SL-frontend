'use client';

import { useState, useEffect } from 'react';
import { FaBox, FaTicketAlt, FaUsers, FaMoneyBillWave, FaTrain, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { adminApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/lib/types';

function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Set mounted flag after first render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      if (!mounted) return;
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (error) {
        toast.error('Failed to load dashboard data', {
          description: error instanceof Error ? error.message : 'Please refresh the page',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [mounted]);

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
          <h1 className="text-4xl font-bold text-railway-blue-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of system statistics and operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Parcels */}
          <div className="card bg-gradient-to-br from-railway-red-700 to-railway-red-900 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-railway-red-100 mb-1">Total Parcels</p>
                <p className="text-3xl font-bold">{stats?.totalParcels || 0}</p>
              </div>
              <FaBox className="text-4xl text-railway-red-300" />
            </div>
          </div>

          {/* Total Tickets */}
          <div className="card bg-gradient-to-br from-railway-blue-700 to-railway-blue-900 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-railway-blue-100 mb-1">Total Tickets</p>
                <p className="text-3xl font-bold">{stats?.totalTickets || 0}</p>
              </div>
              <FaTicketAlt className="text-4xl text-railway-blue-300" />
            </div>
          </div>

          {/* Total Users */}
          <div className="card bg-gradient-to-br from-railway-gold-600 to-railway-gold-800 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-railway-gold-100 mb-1">Total Users</p>
                <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <FaUsers className="text-4xl text-railway-gold-300" />
            </div>
          </div>

          {/* Total Revenue */}
          <div className="card bg-gradient-to-br from-green-600 to-green-800 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
              </div>
              <FaMoneyBillWave className="text-4xl text-green-300" />
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Parcel Stats */}
          <div className="card">
            <h3 className="text-xl font-bold text-railway-blue-900 mb-4 flex items-center gap-2">
              <FaBox className="text-railway-red-700" />
              Parcel Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-700">Pending</span>
                <span className="font-bold text-yellow-700">{stats?.pendingParcels || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">In Transit</span>
                <span className="font-bold text-blue-700">{stats?.inTransitParcels || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Delivered</span>
                <span className="font-bold text-green-700">{stats?.deliveredParcels || 0}</span>
              </div>
            </div>
          </div>

          {/* Ticket Stats */}
          <div className="card">
            <h3 className="text-xl font-bold text-railway-blue-900 mb-4 flex items-center gap-2">
              <FaTicketAlt className="text-railway-blue-700" />
              Ticket Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Active</span>
                <span className="font-bold text-green-700">{stats?.activeTickets || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Used</span>
                <span className="font-bold text-gray-700">{stats?.usedTickets || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-gray-700">Cancelled</span>
                <span className="font-bold text-red-700">{stats?.cancelledTickets || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-bold text-railway-blue-900 mb-4 flex items-center gap-2">
              <FaTrain className="text-railway-red-700" />
              Trains
            </h3>
            <p className="text-3xl font-bold text-railway-blue-900">
              {stats?.totalTrains || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Active trains in the system</p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-railway-blue-900 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-railway-blue-700" />
              Stations
            </h3>
            <p className="text-3xl font-bold text-railway-blue-900">
              {stats?.totalStations || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Railway stations</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 card">
          <h3 className="text-xl font-bold text-railway-blue-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={() => window.location.href = '/admin/parcels'}
              className="btn-outline text-sm"
            >
              Manage Parcels
            </button>
            <button
              onClick={() => window.location.href = '/admin/tickets'}
              className="btn-outline text-sm"
            >
              Manage Tickets
            </button>
            <button
              onClick={() => window.location.href = '/admin/trains'}
              className="btn-outline text-sm"
            >
              Manage Trains
            </button>
            <button
              onClick={() => window.location.href = '/admin/stations'}
              className="btn-outline text-sm"
            >
              Manage Stations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
