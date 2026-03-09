'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FaChartBar, FaFileExcel, FaSpinner, FaBox, FaDollarSign, FaTruck, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { reportApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { AnalyticsResponse, ReportFilters } from '@/lib/types';

const PIE_COLORS = ['#1e40af', '#d97706', '#16a34a', '#dc2626', '#7c3aed', '#0891b2', '#64748b', '#b45309'];

function AdminAnalyticsContent() {
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
      const data = await reportApi.getAnalytics(filters);
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to load analytics', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadAnalytics();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await reportApi.downloadExcelReport(filters);
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
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">System-wide parcel analytics and reporting</p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-sm disabled:opacity-60"
          >
            {isExporting ? <FaSpinner className="animate-spin" /> : <FaFileExcel />}
            Export Excel Report
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <h3 className="font-semibold text-gray-700 mb-4">Filter Analytics</h3>
          <div className="grid md:grid-cols-4 gap-4">
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
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
                className="input w-full"
              >
                <option value="">All Statuses</option>
                {['PENDING', 'ACCEPTED', 'IN_TRANSIT', 'ARRIVED', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED', 'REJECTED'].map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleApplyFilters}
                className="btn-primary w-full"
              >
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
                    <p className="text-3xl font-bold text-railway-gold-700">{formatCurrency(analytics.summary?.totalRevenue ?? 0)}</p>
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

            {/* Charts Row 1: Daily Trends */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Daily Bookings Trend */}
              <div className="card">
                <h3 className="font-bold text-railway-blue-900 mb-4">
                  Daily Parcel Bookings
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
                  <div className="h-64 flex items-center justify-center text-gray-400">No bookings data for the selected period</div>
                )}
              </div>

              {/* Daily Revenue Trend */}
              <div className="card">
                <h3 className="font-bold text-railway-blue-900 mb-4">
                  Daily Revenue Trend (LKR)
                  {filters.startDate && filters.endDate && (
                    <span className="text-sm font-normal text-gray-500 ml-2">({filters.startDate} to {filters.endDate})</span>
                  )}
                </h3>
                {(analytics.dailyTrends ?? []).length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.dailyTrends ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={((v: unknown) => [`LKR ${Number(v ?? 0).toLocaleString()}`, 'Revenue']) as any} />
                      <Bar dataKey="revenue" fill="#d97706" name="Revenue (LKR)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No revenue data for the selected period</div>
                )}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Status Distribution */}
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
                        <Tooltip formatter={((v: unknown, name: unknown) => [v, String(name).replace(/_/g, ' ')]) as any} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2 text-sm">
                      {(analytics.statusDistribution ?? []).map((item, i) => (
                        <div key={item.status} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-gray-700">{item.status.replace(/_/g, ' ')}: <span className="font-semibold">{item.count}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
                )}
              </div>

              {/* Top Stations */}
              <div className="card">
                <h3 className="font-bold text-railway-blue-900 mb-4">Top 10 Stations by Parcel Volume</h3>
                {(analytics.topStations ?? []).length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.topStations ?? []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="stationName" type="category" tick={{ fontSize: 10 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="parcelCount" fill="#1e40af" name="Parcels" radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
                )}
              </div>
            </div>

            {/* Station Revenue Table */}
            {(analytics.topStations ?? []).length > 0 && (
              <div className="card">
                <h3 className="font-bold text-railway-blue-900 mb-4">Station-wise Revenue Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">Station</th>
                        <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">Code</th>
                        <th className="text-right py-3 px-4 font-semibold text-railway-blue-900">Parcels</th>
                        <th className="text-right py-3 px-4 font-semibold text-railway-blue-900">Revenue</th>
                        <th className="text-right py-3 px-4 font-semibold text-railway-blue-900">Avg/Parcel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analytics.topStations ?? []).map((station) => (
                        <tr key={station.stationCode} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium">{station.stationName}</td>
                          <td className="py-2 px-4 text-gray-600 font-mono">{station.stationCode}</td>
                          <td className="py-2 px-4 text-right">{(station.parcelCount ?? 0).toLocaleString()}</td>
                          <td className="py-2 px-4 text-right font-semibold text-railway-gold-700">{formatCurrency(station.totalRevenue ?? 0)}</td>
                          <td className="py-2 px-4 text-right text-gray-600">
                            {(station.parcelCount ?? 0) > 0 ? formatCurrency((station.totalRevenue ?? 0) / station.parcelCount) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminAnalyticsContent />
    </ProtectedRoute>
  );
}
