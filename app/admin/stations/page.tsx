'use client';

import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaSpinner, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { adminApi } from '@/lib/api';
import type { Station } from '@/lib/types';

function AdminStationsContent() {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    district: '',
    province: '',
    active: true,
  });

  // Set mounted flag after first render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadStations();
    }
  }, [mounted]);

  const loadStations = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllStations();
      setStations(data);
    } catch (error) {
      toast.error('Failed to load stations', {
        description: error instanceof Error ? error.message : 'Please refresh the page',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingStation) {
        await adminApi.updateStation(editingStation.id!, formData);
        toast.success('Station updated successfully');
      } else {
        await adminApi.createStation(formData);
        toast.success('Station created successfully');
      }
      
      setIsModalOpen(false);
      setEditingStation(null);
      resetForm();
      loadStations();
    } catch (error) {
      toast.error('Operation failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const handleEdit = (station: Station) => {
    setEditingStation(station);
    setFormData({
      code: station.code,
      name: station.name,
      district: station.district || '',
      province: station.province || '',
      active: station.active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this station?')) return;
    
    try {
      await adminApi.deleteStation(id);
      toast.success('Station deleted successfully');
      loadStations();
    } catch (error) {
      toast.error('Failed to delete station', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      district: '',
      province: '',
      active: true,
    });
  };

  const openCreateModal = () => {
    setEditingStation(null);
    resetForm();
    setIsModalOpen(true);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-railway-blue-900 mb-2">Manage Stations</h1>
            <p className="text-gray-600">Add, edit, or remove stations from the system</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
            <FaPlus />
            Add Station
          </button>
        </div>

        {/* Stations Table */}
        <div className="card overflow-x-auto">
          {stations.length === 0 ? (
            <div className="text-center py-12">
              <FaMapMarkerAlt className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No stations found</p>
              <button onClick={openCreateModal} className="btn-primary">
                Add First Station
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">Code</th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">
                    District
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">
                    Province
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {stations.map((station) => (
                  <tr key={station.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-railway-blue-700">
                        {station.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{station.name}</td>
                    <td className="py-3 px-4">{station.district || 'N/A'}</td>
                    <td className="py-3 px-4">{station.province || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`badge ${
                          station.active !== false
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {station.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(station)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(station.id!)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-railway-blue-900 mb-4">
              {editingStation ? 'Edit Station' : 'Add New Station'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Station Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="input"
                  required
                  placeholder="e.g., CMB"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Station Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                  placeholder="e.g., Colombo Fort"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="input"
                  placeholder="e.g., Colombo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                <select
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="input"
                >
                  <option value="">Select Province</option>
                  <option value="Western">Western</option>
                  <option value="Central">Central</option>
                  <option value="Southern">Southern</option>
                  <option value="Northern">Northern</option>
                  <option value="Eastern">Eastern</option>
                  <option value="North Western">North Western</option>
                  <option value="North Central">North Central</option>
                  <option value="Uva">Uva</option>
                  <option value="Sabaragamuwa">Sabaragamuwa</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingStation ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingStation(null);
                    resetForm();
                  }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminStationsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminStationsContent />
    </ProtectedRoute>
  );
}
