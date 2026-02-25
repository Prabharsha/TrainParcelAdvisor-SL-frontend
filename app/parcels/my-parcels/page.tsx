'use client';

import { useState, useEffect } from 'react';
import { FaBox, FaSpinner, FaSearch } from 'react-icons/fa';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { parcelApi, authApi } from '@/lib/api';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import type { Parcel } from '@/lib/types';

function MyParcelsContent() {
  const router = useRouter();
  const [parcels, setParcels] = useState<Parcel[]>([]);
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
      loadMyParcels();
    }
  }, [mounted]);

  const loadMyParcels = async () => {
    setIsLoading(true);
    try {
      const userEmail = authApi.getUserEmail();
      if (!userEmail) {
        toast.error('User email not found');
        router.push('/login');
        return;
      }

      // In a real app, you'd have an endpoint like /parcels/my-parcels
      // For now, we'll use getAllParcels and filter client-side
      const allParcels = await parcelApi.getAllParcels?.() || [];
      const myParcels = allParcels.filter(
        (p: Parcel) => p.senderEmail === userEmail || p.receiverEmail === userEmail
      );
      setParcels(myParcels);
    } catch (error) {
      toast.error('Failed to load parcels', {
        description: error instanceof Error ? error.message : 'Please refresh the page',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredParcels = parcels.filter((parcel) => {
    const matchesSearch =
      searchTerm === '' ||
      parcel.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.receiverName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || parcel.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: parcels.length,
    pending: parcels.filter((p) => p.status === 'PENDING').length,
    inTransit: parcels.filter((p) => p.status === 'IN_TRANSIT').length,
    delivered: parcels.filter((p) => p.status === 'DELIVERED').length,
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
          <h1 className="text-4xl font-bold text-railway-blue-900 mb-2">My Parcels</h1>
          <p className="text-gray-600">View and track all your parcel shipments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-white">
            <p className="text-sm text-gray-600 mb-1">Total Parcels</p>
            <p className="text-3xl font-bold text-railway-blue-900">{stats.total}</p>
          </div>
          <div className="card bg-yellow-50">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="card bg-blue-50">
            <p className="text-sm text-gray-600 mb-1">In Transit</p>
            <p className="text-3xl font-bold text-blue-700">{stats.inTransit}</p>
          </div>
          <div className="card bg-green-50">
            <p className="text-sm text-gray-600 mb-1">Delivered</p>
            <p className="text-3xl font-bold text-green-700">{stats.delivered}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tracking number, sender, or receiver..."
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
              <option value="PENDING">Pending</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
        </div>

        {/* Parcels Grid */}
        {filteredParcels.length === 0 ? (
          <div className="card text-center py-12">
            <FaBox className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {parcels.length === 0 ? 'No parcels found' : 'No parcels match your search'}
            </p>
            <button onClick={() => router.push('/parcels/book')} className="btn-primary">
              Book a Parcel
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredParcels.map((parcel) => (
              <div key={parcel.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-mono font-bold text-railway-blue-700">
                      {parcel.trackingNumber}
                    </p>
                  </div>
                  <span className={`badge ${getStatusColor(parcel.status)}`}>
                    {parcel.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium">{parcel.startingDestination}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium">{parcel.destination}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Train:</span>
                    <span className="font-medium">{parcel.trainNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{parcel.date || parcel.travelDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">{parcel.weightInKg} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-3">
                    <span className="text-gray-600">Charges:</span>
                    <span className="font-bold text-railway-gold-700">
                      {formatCurrency(parcel.charges || parcel.totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/track?type=parcel&number=${parcel.trackingNumber}`)}
                    className="btn-outline flex-1 text-sm"
                  >
                    Track Parcel
                  </button>
                  {parcel.qrCodeBase64 && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `data:image/png;base64,${parcel.qrCodeBase64}`;
                        link.download = `${parcel.trackingNumber}-QR.png`;
                        link.click();
                      }}
                      className="btn-secondary text-sm"
                    >
                      Download QR
                    </button>
                  )}
                </div>

                {parcel.updatedDate && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Last updated: {formatDateTime(parcel.updatedDate)}
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

export default function MyParcelsPage() {
  return (
    <ProtectedRoute>
      <MyParcelsContent />
    </ProtectedRoute>
  );
}
