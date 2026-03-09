'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaQrcode, FaSpinner, FaEdit, FaCheckCircle,
  FaSearch, FaBox, FaTruck, FaClipboardCheck,
} from 'react-icons/fa';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import QrScannerModal from '@/components/QrScannerModal';
import ScannedParcelPanel from '@/components/ScannedParcelPanel';
import { adminApi, authApi } from '@/lib/api';
import { useStationLookup } from '@/lib/useStationLookup';
import type { AdminParcel, AdminParcelStats, StationParcel, ParcelStatus } from '@/lib/types';

// Quick-action: one-click status advance
const QUICK_NEXT_STATUS: Partial<Record<ParcelStatus, { label: string; next: ParcelStatus; color: string }>> = {
  PENDING:         { label: 'Accept',           next: 'ACCEPTED',        color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  ACCEPTED:        { label: 'Send In Transit',  next: 'IN_TRANSIT',      color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  IN_TRANSIT:      { label: 'Mark Arrived',     next: 'ARRIVED',         color: 'bg-purple-600 hover:bg-purple-700 text-white' },
  ARRIVED:         { label: 'Ready for Pickup', next: 'READY_FOR_PICKUP',color: 'bg-cyan-600 hover:bg-cyan-700 text-white' },
  READY_FOR_PICKUP:{ label: 'Mark Delivered',   next: 'DELIVERED',       color: 'bg-green-600 hover:bg-green-700 text-white' },
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
  ARRIVED: 'bg-purple-100 text-purple-800',
  READY_FOR_PICKUP: 'bg-cyan-100 text-cyan-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);

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

  // Parcel list state
  const [parcels, setParcels] = useState<AdminParcel[]>([]);
  const [stats, setStats] = useState<AdminParcelStats>({ totalParcels: 0, pending: 0, inTransit: 0, delivered: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const isInitialLoad = useRef(true);

  // QR scan state
  const [showScanner, setShowScanner] = useState(false);
  const [scannedParcel, setScannedParcel] = useState<StationParcel | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Quick-action state
  const [quickUpdating, setQuickUpdating] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

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
      toast.error('Failed to load parcels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
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

  // ── QR scan handlers ──────────────────────────────────────────

  const handleQrScanResult = async (trackingNumber: string) => {
    setShowScanner(false);
    setIsLookingUp(true);
    try {
      const parcel = await adminApi.scanAndLookupParcel(trackingNumber);
      setScannedParcel(parcel);
    } catch (error) {
      toast.error('Parcel not found', {
        description: error instanceof Error ? error.message : `No parcel found for ${trackingNumber}`,
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleParcelUpdated = (_updated: StationParcel) => {
    fetchParcels(searchTerm, statusFilter, dateFilter);
    setScannedParcel(null);
  };

  // Convert AdminParcel → StationParcel for the manage panel
  const openManagePanel = (parcel: AdminParcel) => {
    const stationParcel: StationParcel = {
      trackingNumber: parcel.trackingNumber,
      senderName: parcel.senderName,
      senderMobile: (parcel as any).senderMobile ?? '',
      senderEmail: (parcel as any).senderEmail ?? '',
      startingDestination: parcel.startingDestination,
      destination: parcel.destination,
      receiverName: parcel.receiverName,
      receiverEmail: (parcel as any).receiverEmail ?? '',
      parcelType: (parcel as any).parcelType ?? '',
      numberOfParcels: (parcel as any).numberOfParcels ?? 1,
      deliveryDate: parcel.deliveryDate ?? '',
      weightInKg: parcel.weightInKg,
      trainNumber: (parcel as any).trainNumber ?? '',
      totalCharge: parcel.totalCharge,
      status: parcel.status as ParcelStatus,
      statusUpdatedAt: null,
      statusUpdatedBy: null,
      remarks: null,
      createdDateTime: '',
    };
    setScannedParcel(stationParcel);
  };

  // ── Quick one-click status advance ───────────────────────────

  const handleQuickUpdate = async (parcel: AdminParcel, nextStatus: ParcelStatus) => {
    setQuickUpdating(parcel.trackingNumber);
    try {
      const updatedBy = authApi.getUserEmail() || authApi.getUserName() || 'ADMIN';
      await adminApi.updateAdminParcelStatus(parcel.trackingNumber, { status: nextStatus, updatedBy });
      toast.success(`${parcel.trackingNumber} → ${nextStatus.replace(/_/g, ' ')}`);
      fetchParcels(searchTerm, statusFilter, dateFilter);
    } catch (error) {
      toast.error('Failed to update status', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setQuickUpdating(null);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-railway-blue-50 to-railway-gold-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-railway-red-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-railway-blue-50 to-railway-gold-50">

      {/* QR Scanner Modal */}
      {showScanner && (
        <QrScannerModal onScan={handleQrScanResult} onClose={() => setShowScanner(false)} />
      )}

      {/* Lookup overlay */}
      {isLookingUp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 flex items-center gap-4 shadow-2xl">
            <FaSpinner className="animate-spin text-2xl text-railway-blue-700" />
            <span className="font-medium text-railway-blue-900">Looking up parcel...</span>
          </div>
        </div>
      )}

      {/* Parcel management panel */}
      {scannedParcel && (
        <ScannedParcelPanel
          parcel={scannedParcel}
          onClose={() => setScannedParcel(null)}
          onUpdated={handleParcelUpdated}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-railway-blue-700 hover:text-railway-blue-900 mb-4 inline-flex items-center gap-1 text-sm"
          >
            ← Back to Dashboard
          </button>

          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-railway-blue-900 mb-1 flex items-center gap-3">
                <FaBox className="text-railway-blue-400" />
                Manage Parcels
              </h1>
              <p className="text-gray-500 text-sm">View, update, and scan all parcel shipments</p>
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-railway-blue-700 hover:bg-railway-blue-800 text-white rounded-lg font-semibold transition-all shadow-sm"
            >
              <FaQrcode />
              Scan QR Code
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="text-3xl font-bold text-railway-blue-700">{stats.totalParcels}</div>
            <div className="text-gray-500 mt-1 text-sm">Total Parcels</div>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-sm p-5">
            <div className="text-3xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-gray-500 mt-1 text-sm flex items-center gap-1">
              <FaClipboardCheck size={12} className="text-yellow-500" /> Pending Acceptance
            </div>
          </div>
          <div className="bg-indigo-50 rounded-xl shadow-sm p-5">
            <div className="text-3xl font-bold text-indigo-700">{stats.inTransit}</div>
            <div className="text-gray-500 mt-1 text-sm flex items-center gap-1">
              <FaTruck size={12} className="text-indigo-500" /> In Transit
            </div>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm p-5">
            <div className="text-3xl font-bold text-green-700">{stats.delivered}</div>
            <div className="text-gray-500 mt-1 text-sm flex items-center gap-1">
              <FaCheckCircle size={12} className="text-green-500" /> Delivered
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 mb-6 flex items-start gap-3 text-sm text-blue-800">
          <FaQrcode className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
          <span>
            <strong>Parcel Management:</strong> Use <strong>Scan QR Code</strong> to look up any parcel by scanning its label.
            Use the coloured <strong>quick-action buttons</strong> to advance a status in one click, or <strong>Manage</strong> for full control and remarks.
          </span>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" size={12} />
                <input
                  type="text"
                  placeholder="Tracking, sender, receiver, NIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-8 w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-full">
                <option value="">All Statuses</option>
                {['PENDING','ACCEPTED','IN_TRANSIT','ARRIVED','READY_FOR_PICKUP','DELIVERED','CANCELLED','REJECTED'].map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Delivery Date</label>
              <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input w-full" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <FaSpinner className="animate-spin text-3xl text-railway-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-railway-blue-700 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Tracking #</th>
                    <th className="py-3 px-4 text-left font-semibold">Sender</th>
                    <th className="py-3 px-4 text-left font-semibold">Receiver</th>
                    <th className="py-3 px-4 text-left font-semibold">Route</th>
                    <th className="py-3 px-4 text-left font-semibold">Weight</th>
                    <th className="py-3 px-4 text-left font-semibold">Amount</th>
                    <th className="py-3 px-4 text-left font-semibold">Status</th>
                    <th className="py-3 px-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parcels.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-gray-400">
                        <FaBox className="text-5xl mx-auto mb-3 text-gray-200" />
                        <p>No parcels found</p>
                      </td>
                    </tr>
                  ) : (
                    parcels.map((parcel) => {
                      const quickAction = QUICK_NEXT_STATUS[parcel.status as ParcelStatus];
                      const isQuickUpdating = quickUpdating === parcel.trackingNumber;
                      return (
                        <tr key={parcel.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-semibold text-railway-blue-700">
                              {parcel.trackingNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{parcel.senderName}</div>
                            <div className="text-gray-400 text-xs">{(parcel as any).senderMobile}</div>
                          </td>
                          <td className="py-3 px-4 font-medium">{parcel.receiverName}</td>
                          <td className="py-3 px-4">
                            <div>{getStationName(parcel.startingDestination)} →</div>
                            <div className="text-gray-500">{getStationName(parcel.destination)}</div>
                          </td>
                          <td className="py-3 px-4">{parcel.weightInKg} kg</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-railway-gold-700">
                              {formatCurrency(parcel.totalCharge)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[parcel.status] || 'bg-gray-100 text-gray-800'}`}>
                              {parcel.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {quickAction && (
                                <button
                                  onClick={() => handleQuickUpdate(parcel, quickAction.next)}
                                  disabled={isQuickUpdating}
                                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-semibold transition-all ${quickAction.color} disabled:opacity-50`}
                                >
                                  {isQuickUpdating
                                    ? <FaSpinner className="animate-spin" size={10} />
                                    : <FaCheckCircle size={10} />}
                                  {quickAction.label}
                                </button>
                              )}
                              <button
                                onClick={() => openManagePanel(parcel)}
                                className="inline-flex items-center gap-1.5 text-xs bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded font-semibold transition-all"
                              >
                                <FaEdit size={10} />
                                Manage
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-gray-500 text-sm">
          Showing {totalCount} of {stats.totalParcels} parcels
        </div>
      </div>
    </div>
  );
}
