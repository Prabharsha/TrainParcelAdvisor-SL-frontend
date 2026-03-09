'use client';

import { useState, useEffect } from 'react';
import {
  FaBox, FaSpinner, FaQrcode, FaCheckCircle, FaTruck,
  FaFileExcel, FaChartBar, FaEdit, FaClipboardCheck,
} from 'react-icons/fa';
import { toast } from 'sonner';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import QrScannerModal from '@/components/QrScannerModal';
import ScannedParcelPanel from '@/components/ScannedParcelPanel';
import { adminApi, authApi, reportApi } from '@/lib/api';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import { resolveStationCode } from '@/lib/useStationLookup';
import type { StationParcel, ParcelStatus } from '@/lib/types';

// Maps each status to the logical NEXT status for quick-action buttons
const QUICK_NEXT_STATUS: Partial<Record<ParcelStatus, { label: string; next: ParcelStatus; color: string }>> = {
  PENDING:        { label: 'Accept',          next: 'ACCEPTED',       color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  ACCEPTED:       { label: 'Send In Transit', next: 'IN_TRANSIT',     color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  IN_TRANSIT:     { label: 'Mark Arrived',    next: 'ARRIVED',        color: 'bg-purple-600 hover:bg-purple-700 text-white' },
  ARRIVED:        { label: 'Ready for Pickup',next: 'READY_FOR_PICKUP',color: 'bg-cyan-600 hover:bg-cyan-700 text-white' },
  READY_FOR_PICKUP:{ label: 'Mark Delivered', next: 'DELIVERED',      color: 'bg-green-600 hover:bg-green-700 text-white' },
};

type FilterKey = 'ALL' | 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'ARRIVED' | 'READY_FOR_PICKUP' | 'DELIVERED';

function StationMasterDashboardContent() {
  const [parcels, setParcels] = useState<StationParcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [resolvedStation, setResolvedStation] = useState<string>('');

  // QR Scan state
  const [showScanner, setShowScanner] = useState(false);
  const [scannedParcel, setScannedParcel] = useState<StationParcel | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Quick-action updating state (trackingNumber → loading)
  const [quickUpdating, setQuickUpdating] = useState<string | null>(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted) loadParcels(); }, [mounted]);

  const loadParcels = async () => {
    setIsLoading(true);
    try {
      const raw = authApi.getUserStation();
      const stationCode = raw ? await resolveStationCode(raw) : null;
      setResolvedStation(stationCode || '');
      let data: StationParcel[];
      if (stationCode) {
        data = await adminApi.getStationParcels(stationCode);
      } else {
        data = (await adminApi.getAllParcels()) as unknown as StationParcel[];
      }
      setParcels(data);
    } catch (error) {
      toast.error('Failed to load parcels', {
        description: error instanceof Error ? error.message : 'Please refresh the page',
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleParcelUpdated = (updated: StationParcel) => {
    setParcels((prev) =>
      prev.map((p) => (p.trackingNumber === updated.trackingNumber ? updated : p))
    );
    setScannedParcel(null);
  };

  // Quick one-click status advancement
  const handleQuickUpdate = async (parcel: StationParcel, nextStatus: ParcelStatus) => {
    setQuickUpdating(parcel.trackingNumber);
    try {
      const raw = authApi.getUserStation() || '';
      const stationCode = resolvedStation || await resolveStationCode(raw);
      const updatedBy = authApi.getUserName() || 'STATION_MASTER';
      const updated = await adminApi.scanAndUpdateParcel(parcel.trackingNumber, {
        status: nextStatus,
        stationCode,
        updatedBy,
        scanMethod: 'MANUAL',
      });
      toast.success(`Parcel ${parcel.trackingNumber} → ${nextStatus.replace(/_/g, ' ')}`);
      handleParcelUpdated(updated);
    } catch (error) {
      toast.error('Failed to update status', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setQuickUpdating(null);
    }
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      const raw = authApi.getUserStation() || undefined;
      const stationCode = raw ? (resolvedStation || await resolveStationCode(raw)) : undefined;
      await reportApi.downloadExcelReport({ stationCode });
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to export report', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const filteredParcels = filter === 'ALL'
    ? parcels
    : parcels.filter((p) => p.status === filter);

  const countOf = (s: ParcelStatus) => parcels.filter((p) => p.status === s).length;

  const filterTabs: { key: FilterKey; label: string; color: string }[] = [
    { key: 'ALL',            label: `All (${parcels.length})`,                   color: 'bg-railway-blue-700 text-white' },
    { key: 'PENDING',        label: `Pending (${countOf('PENDING')})`,           color: 'bg-yellow-600 text-white' },
    { key: 'ACCEPTED',       label: `Accepted (${countOf('ACCEPTED')})`,         color: 'bg-blue-600 text-white' },
    { key: 'IN_TRANSIT',     label: `In Transit (${countOf('IN_TRANSIT')})`,     color: 'bg-indigo-600 text-white' },
    { key: 'ARRIVED',        label: `Arrived (${countOf('ARRIVED')})`,           color: 'bg-purple-600 text-white' },
    { key: 'READY_FOR_PICKUP',label:`Ready (${countOf('READY_FOR_PICKUP')})`,   color: 'bg-cyan-600 text-white' },
    { key: 'DELIVERED',      label: `Delivered (${countOf('DELIVERED')})`,       color: 'bg-green-600 text-white' },
  ];

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

      {/* QR Scanner Modal */}
      {showScanner && (
        <QrScannerModal
          onScan={handleQrScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Lookup loading overlay */}
      {isLookingUp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 flex items-center gap-4">
            <FaSpinner className="animate-spin text-2xl text-railway-blue-700" />
            <span className="font-medium text-railway-blue-900">Looking up parcel...</span>
          </div>
        </div>
      )}

      {/* Parcel Management Panel */}
      {scannedParcel && (
        <ScannedParcelPanel
          parcel={scannedParcel}
          onClose={() => setScannedParcel(null)}
          onUpdated={handleParcelUpdated}
        />
      )}

      <div className="container-custom py-12">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-railway-blue-900 mb-2">
              Station Master Dashboard
            </h1>
            <p className="text-gray-600">
              Manage parcels at your station · <span className="font-semibold">{resolvedStation || authApi.getUserStation() || 'All Stations'}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-railway-blue-700 hover:bg-railway-blue-800 text-white rounded-lg font-semibold transition-all shadow-sm"
            >
              <FaQrcode />
              Scan QR Code
            </button>
            <button
              onClick={handleExportReport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-sm disabled:opacity-60"
            >
              {isExporting ? <FaSpinner className="animate-spin" /> : <FaFileExcel />}
              Export Report
            </button>
            <Link
              href="/station-master/analytics"
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all shadow-sm"
            >
              <FaChartBar />
              Analytics
            </Link>
          </div>
        </div>

        {/* How-to hint */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 mb-6 flex items-start gap-3 text-sm text-blue-800">
          <FaClipboardCheck className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
          <span>
            <strong>Parcel Management:</strong> Use the <strong>quick-action buttons</strong> on each row to advance a parcel's status in one click, or click <strong>Manage</strong> for full control (change any status, add remarks). Use <strong>Scan QR Code</strong> to look up any parcel by scanning its label.
          </span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-railway-blue-900">{parcels.length}</p>
              </div>
              <FaBox className="text-4xl text-railway-blue-300" />
            </div>
          </div>
          <div className="card bg-yellow-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Pending Acceptance</p>
                <p className="text-3xl font-bold text-yellow-700">{countOf('PENDING')}</p>
              </div>
              <FaClipboardCheck className="text-4xl text-yellow-300" />
            </div>
          </div>
          <div className="card bg-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">In Transit</p>
                <p className="text-3xl font-bold text-indigo-700">{countOf('IN_TRANSIT')}</p>
              </div>
              <FaTruck className="text-4xl text-indigo-300" />
            </div>
          </div>
          <div className="card bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Delivered</p>
                <p className="text-3xl font-bold text-green-700">{countOf('DELIVERED')}</p>
              </div>
              <FaCheckCircle className="text-4xl text-green-300" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="card mb-6">
          <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Filter by Status</p>
          <div className="flex gap-2 flex-wrap">
            {filterTabs.map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  filter === key ? color : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Parcels Table */}
        <div className="card overflow-x-auto">
          {filteredParcels.length === 0 ? (
            <div className="text-center py-12">
              <FaBox className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-1">No parcels found for this filter</p>
              <p className="text-gray-400 text-sm mb-4">Try a different status filter or scan a parcel QR code</p>
              <button
                onClick={() => setShowScanner(true)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-railway-blue-700 text-white rounded-lg hover:bg-railway-blue-800"
              >
                <FaQrcode />
                Scan a Parcel
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900 text-sm">Tracking #</th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900 text-sm">Sender</th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900 text-sm">Route</th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900 text-sm">Current Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900 text-sm">Charges</th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.map((parcel) => {
                  const quickAction = QUICK_NEXT_STATUS[parcel.status];
                  const isQuickUpdating = quickUpdating === parcel.trackingNumber;
                  return (
                    <tr key={parcel.trackingNumber} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-semibold text-railway-blue-700">
                          {parcel.trackingNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="font-medium">{parcel.senderName}</p>
                          <p className="text-gray-500 text-xs">{parcel.senderMobile}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="font-medium">{parcel.startingDestination} → {parcel.destination}</p>
                          <p className="text-gray-500 text-xs">Train: {parcel.trainNumber}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${getStatusColor(parcel.status)}`}>
                          {parcel.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-railway-gold-700 text-sm">
                          {formatCurrency(parcel.totalCharge)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {/* Quick-action: one-click status advance */}
                          {quickAction && (
                            <button
                              onClick={() => handleQuickUpdate(parcel, quickAction.next)}
                              disabled={isQuickUpdating}
                              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-semibold transition-all ${quickAction.color} disabled:opacity-50`}
                            >
                              {isQuickUpdating ? (
                                <FaSpinner className="animate-spin" size={10} />
                              ) : (
                                <FaCheckCircle size={10} />
                              )}
                              {quickAction.label}
                            </button>
                          )}
                          {/* Full management panel */}
                          <button
                            onClick={() => setScannedParcel(parcel)}
                            className="inline-flex items-center gap-1.5 text-xs bg-gray-700 text-white px-3 py-1.5 rounded hover:bg-gray-800 font-semibold transition-all"
                          >
                            <FaEdit size={10} />
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
    <ProtectedRoute allowedRoles={['ADMIN', 'STATION_MASTER']}>
      <StationMasterDashboardContent />
    </ProtectedRoute>
  );
}
