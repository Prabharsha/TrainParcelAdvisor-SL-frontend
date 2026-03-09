'use client';

import { useEffect, useRef, useState } from 'react';
import { FaTimes, FaQrcode, FaSpinner } from 'react-icons/fa';

interface QrScannerModalProps {
  onScan: (trackingNumber: string) => void;
  onClose: () => void;
}

export default function QrScannerModal({ onScan, onClose }: QrScannerModalProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManual, setShowManual] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let scanner: any = null;

    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');

        scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
          },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText: string) => {
            // Parse QR content: "TrainParcelAdvisorSL Tracking | TPAxxxxxxxx"
            const match = decodedText.match(/TPA[A-Z0-9]+/i);
            if (match) {
              scanner.clear().catch(() => {});
              onScan(match[0].toUpperCase());
            } else {
              setError('Invalid QR code. Please scan a TrainParcelAdvisor parcel QR code.');
            }
          },
          (errorMessage: string) => {
            // Continuous errors are expected (no QR code in frame) — ignore
          }
        );

        scannerRef.current = scanner;
        setIsInitializing(false);
      } catch (err) {
        setError('Unable to access camera. Please use manual entry below.');
        setIsInitializing(false);
        setShowManual(true);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualInput.trim().toUpperCase();
    if (trimmed.startsWith('TPA') && trimmed.length >= 11) {
      onScan(trimmed);
    } else {
      setError('Invalid tracking number. Must start with TPA and be at least 11 characters.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaQrcode className="text-2xl text-railway-blue-700" />
            <h2 className="text-xl font-bold text-railway-blue-900">Scan Parcel QR Code</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="p-5">
          {isInitializing && (
            <div className="flex flex-col items-center justify-center py-12">
              <FaSpinner className="animate-spin text-4xl text-railway-blue-700 mb-3" />
              <p className="text-gray-600">Initializing camera...</p>
            </div>
          )}

          {!showManual && (
            <div
              id="qr-reader"
              className={`w-full rounded-xl overflow-hidden ${isInitializing ? 'hidden' : ''}`}
            />
          )}

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Toggle Manual Entry */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setShowManual(!showManual);
                setError(null);
                if (!showManual && scannerRef.current) {
                  scannerRef.current.clear().catch(() => {});
                }
              }}
              className="text-sm text-railway-blue-700 hover:text-railway-blue-900 underline"
            >
              {showManual ? 'Use Camera Scanner' : 'Enter tracking number manually'}
            </button>
          </div>

          {/* Manual Input */}
          {showManual && (
            <form onSubmit={handleManualSubmit} className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                  placeholder="e.g. TPA12345678"
                  className="input flex-1 font-mono"
                  autoFocus
                />
                <button type="submit" className="btn-primary">
                  Look Up
                </button>
              </div>
            </form>
          )}

          <p className="text-xs text-gray-500 mt-4 text-center">
            Point the camera at the QR code on the parcel label
          </p>
        </div>
      </div>
    </div>
  );
}
