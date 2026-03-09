'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { FaChartBar, FaFileExcel, FaSpinner, FaBox, FaDollarSign, FaTruck, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { reportApi, authApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { resolveStationCode } from '@/lib/useStationLookup';
import type { AnalyticsResponse, ReportFilters } from '@/lib/types';

const PIE_COLORS = ['#1e40af', '#d97706', '#16a34a', '#dc2626', '#7c3aed', '#0891b2', '#64748b', '#b45309'];

function StationAnalyticsContent() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return {
      startDate: thirtyDaysAgo.toISOString().slice(0, 10),
      endDate: today.toISOString().slice(0, 10),
    };
  });
  const [mounted, setMounted] = useState(false);
  const rawStation = authApi.getUserStation() || undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadAnalytics();
    }
  }, [mounted]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const stationCode = rawStation ? await resolveStationCode(rawStation) : undefined;
      const data = await reportApi.getAnalytics({ ...filters, stationCode });
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to load analytics', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const stationCode = rawStation ? await resolveStationCode(rawStation) : undefined;
      await reportApi.downloadExcelReport({ ...filters, stationCode });
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to export report', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-railway-red-50 via-white to-railway-blue-50">
        <Navbar />
        <div className="container-custom py-12 flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-railway-red-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-railway-red-50 via-white to-railway-blue-50">
      <Navbar />

      <div className="container-custom py-12">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-railway-blue-900 mb-2 flex items-center gap-3">
              <FaChartBar className="text-purple-600" />
              Station Analytics
            </h1>
            <p className="text-gray-600">
              Parcel analytics for station: <span className="font-semibold text-railway-blue-700">{rawStation?.replace(/_/g, ' ') || 'All Stations'}</span>
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-sm disabled:opacity-60"
            >
              {isExporting ? <FaSpinner className="animate-spin" /> : <FaFileExcel />}
              Export Excel Report
            </button>
          </div>
        </div>

        {/* Date Filters */}
        <div className="card mb-8">
          <h3 className="font-semibold text-gray-700 mb-4">Filter by Date</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value || undefined }))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value || undefined }))}
                className="input w-full"
              />
            </div>
            <div className="flex items-end">
              <button onClick={loadAnalytics} className="btn-primary w-full">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {analytics && (
          <>
            {/* Summary Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="card bg-white border-l-4 border-railway-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Parcels</p>
                    <p className="text-3xl font-bold text-railway-blue-900">{(analytics.summary?.totalParcels ?? 0).toLocaleString()}</p>
                  </div>
                  <FaBox className="text-4xl text-railway-blue-300" />
                </div>
              </div>

              <div className="card bg-white border-l-4 border-railway-gold-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-railway-gold-700">{formatCurrency(analytics.summary?.totalRevenue ?? 0)}</p>
                  </div>
                  {/* <FaDollarSign className="text-4xl text-railway-gold-300" /> */}
                </div>
              </div>

              <div className="card bg-white border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">In Transit</p>
                    <p className="text-3xl font-bold text-blue-700">{(analytics.summary?.inTransitCount ?? 0).toLocaleString()}</p>
                  </div>
                  <FaTruck className="text-4xl text-blue-300" />
                </div>
              </div>

              <div className="card bg-white border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Delivered</p>
                    <p className="text-3xl font-bold text-green-700">{(analytics.summary?.deliveredCount ?? 0).toLocaleString()}</p>
                  </div>
                  <FaCheckCircle className="text-4xl text-green-300" />
                </div>
              </div>
            </div>

            {/* Daily Trends */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="card">
                <h3 className="font-bold text-railway-blue-900 mb-4">
                  Daily Parcel Volume
                  {filters.startDate && filters.endDate && (
                    <span className="text-sm font-normal text-gray-500 ml-2">({filters.startDate} to {filters.endDate})</span>
                  )}
                </h3>
                {(analytics.dailyTrends ?? []).length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analytics.dailyTrends ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="parcelCount" stroke="#1e40af" strokeWidth={2} dot={false} name="Parcels" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No parcel data for the selected period</div>
                )}
              </div>

              <div className="card">
                <h3 className="font-bold text-railway-blue-900 mb-4">Status Distribution</h3>
                {(analytics.statusDistribution ?? []).length > 0 ? (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="60%" height={220}>
                      <PieChart>
                        <Pie
                          data={analytics.statusDistribution ?? []}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ percent }) => percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ''}
                          labelLine={false}
                        >
                          {(analytics.statusDistribution ?? []).map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2 text-sm">
                      {(analytics.statusDistribution ?? []).map((item, i) => (
                        <div key={item.status} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-gray-700 text-xs">{item.status.replace(/_/g, ' ')}: <span className="font-semibold">{item.count}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No status data for the selected period</div>
                )}
              </div>
            </div>

            {(analytics.dailyTrends ?? []).length > 0 && (
              <div className="card mb-6">
                <h3 className="font-bold text-railway-blue-900 mb-4">Daily Revenue (LKR)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.dailyTrends ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={((v: unknown) => [`LKR ${Number(v ?? 0).toLocaleString()}`, 'Revenue']) as any} />
                    <Bar dataKey="revenue" fill="#d97706" name="Revenue" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Average per parcel */}
            <div className="card bg-gradient-to-r from-railway-blue-50 to-purple-50 border border-railway-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-railway-blue-900 mb-1">Average Revenue per Parcel</h3>
                  <p className="text-sm text-gray-600">Calculated from {(analytics.summary?.totalParcels ?? 0).toLocaleString()} parcels</p>
                </div>
                <p className="text-3xl font-bold text-railway-gold-700">
                  {(analytics.summary?.totalParcels ?? 0) > 0
                    ? formatCurrency((analytics.summary?.totalRevenue ?? 0) / (analytics.summary?.totalParcels ?? 1))
                    : 'N/A'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function StationMasterAnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'STATION_MASTER']}>
      <StationAnalyticsContent />
    </ProtectedRoute>
  );
}
