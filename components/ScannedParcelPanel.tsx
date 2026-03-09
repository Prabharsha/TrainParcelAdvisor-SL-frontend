'use client';

import { useState } from 'react';
import { FaBox, FaQrcode, FaTimes, FaCheckCircle, FaTruck, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import { adminApi, authApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { resolveStationCode } from '@/lib/useStationLookup';
import type { StationParcel, ParcelStatus, QrScanUpdateRequest } from '@/lib/types';

const PARCEL_STATUSES: ParcelStatus[] = [
  'PENDING',
  'ACCEPTED',
  'IN_TRANSIT',
  'ARRIVED',
  'READY_FOR_PICKUP',
  'DELIVERED',
  'CANCELLED',
  'REJECTED',
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
  ARRIVED: 'bg-purple-100 text-purple-800',
  READY_FOR_PICKUP: 'bg-cyan-100 text-cyan-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REJECTED: 'bg-red-100 text-red-800',
};

interface ScannedParcelPanelProps {
  parcel: StationParcel;
  onClose: () => void;
  onUpdated: (updated: StationParcel) => void;
}

export default function ScannedParcelPanel({ parcel, onClose, onUpdated }: ScannedParcelPanelProps) {
  const [selectedStatus, setSelectedStatus] = useState<ParcelStatus>(parcel.status);
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    if (selectedStatus === parcel.status) {
      toast.info('No status change detected');
      return;
    }

    setIsUpdating(true);
    try {
      const raw = authApi.getUserStation() || '';
      const stationCode = await resolveStationCode(raw);
      const updatedBy = authApi.getUserName() || 'STATION_MASTER';

      const request: QrScanUpdateRequest = {
        status: selectedStatus,
        remarks: remarks.trim() || undefined,
        stationCode,
        updatedBy,
        scanMethod: 'QR_SCAN',
      };

      const updated = await adminApi.scanAndUpdateParcel(parcel.trackingNumber, request);
      toast.success(`Parcel status updated to ${selectedStatus}`);
      onUpdated(updated);
      onClose();
    } catch (error) {
      toast.error('Failed to update status', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <FaBox className="text-2xl text-railway-blue-700" />
            <div>
              <h2 className="text-lg font-bold text-railway-blue-900">Parcel Found</h2>
              <p className="text-sm font-mono text-railway-blue-600">{parcel.trackingNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Current Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">Current Status</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[parcel.status] || 'bg-gray-100 text-gray-800'}`}>
              {parcel.status}
            </span>
          </div>

          {/* Parcel Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-1">Sender</p>
              <p className="font-semibold">{parcel.senderName}</p>
              <p className="text-gray-600">{parcel.senderMobile}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-1">Receiver</p>
              <p className="font-semibold">{parcel.receiverName}</p>
              <p className="text-gray-600">{parcel.receiverEmail}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                <FaMapMarkerAlt className="text-railway-red-600" /> Route
              </p>
              <p className="font-semibold">{parcel.startingDestination} → {parcel.destination}</p>
              <p className="text-gray-600">Train: {parcel.trainNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-1">Parcel Info</p>
              <p className="font-semibold">{parcel.parcelType}</p>
              <p className="text-gray-600">
                {parcel.numberOfParcels} pcs · {parcel.weightInKg} kg
              </p>
            </div>
          </div>

          {/* Charge */}
          <div className="flex items-center justify-between bg-railway-gold-50 rounded-lg p-3">
            <span className="text-sm text-gray-600">Total Charge</span>
            <span className="font-bold text-railway-gold-700 text-lg">
              {formatCurrency(parcel.totalCharge)}
            </span>
          </div>

          {/* Update Status */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaTruck className="text-railway-blue-600" />
              Update Status via QR Scan
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">New Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ParcelStatus)}
                  className="input w-full"
                >
                  {PARCEL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Remarks (optional)</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any notes about this scan..."
                  className="input w-full h-20 resize-none"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating || selectedStatus === parcel.status}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedStatus !== parcel.status
                    ? 'bg-railway-blue-700 hover:bg-railway-blue-800 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isUpdating ? (
                  <>
                    <span className="animate-spin">⟳</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Confirm Status Update
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
