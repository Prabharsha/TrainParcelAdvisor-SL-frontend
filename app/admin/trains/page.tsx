'use client';

import { useState, useEffect } from 'react';
import { FaTrain, FaSpinner, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { adminApi } from '@/lib/api';
import type { Train } from '@/lib/types';

function AdminTrainsContent() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState<Train | null>(null);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    trainNumber: '',
    name: '',
    type: 'EXPRESS',
    capacity: 500,
    active: true,
  });

  // Set mounted flag after first render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadTrains();
    }
  }, [mounted]);

  const loadTrains = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllTrains();
      setTrains(data);
    } catch (error) {
      toast.error('Failed to load trains', {
        description: error instanceof Error ? error.message : 'Please refresh the page',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTrain) {
        await adminApi.updateTrain(editingTrain.id!, formData);
        toast.success('Train updated successfully');
      } else {
        await adminApi.createTrain(formData);
        toast.success('Train created successfully');
      }
      
      setIsModalOpen(false);
      setEditingTrain(null);
      resetForm();
      loadTrains();
    } catch (error) {
      toast.error('Operation failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const handleEdit = (train: Train) => {
    setEditingTrain(train);
    setFormData({
      trainNumber: train.trainNumber,
      name: train.name,
      type: train.type || 'EXPRESS',
      capacity: train.capacity || 500,
      active: train.active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this train?')) return;
    
    try {
      await adminApi.deleteTrain(id);
      toast.success('Train deleted successfully');
      loadTrains();
    } catch (error) {
      toast.error('Failed to delete train', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      trainNumber: '',
      name: '',
      type: 'EXPRESS',
      capacity: 500,
      active: true,
    });
  };

  const openCreateModal = () => {
    setEditingTrain(null);
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
            <h1 className="text-4xl font-bold text-railway-blue-900 mb-2">Manage Trains</h1>
            <p className="text-gray-600">Add, edit, or remove trains from the system</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
            <FaPlus />
            Add Train
          </button>
        </div>

        {/* Trains Table */}
        <div className="card overflow-x-auto">
          {trains.length === 0 ? (
            <div className="text-center py-12">
              <FaTrain className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No trains found</p>
              <button onClick={openCreateModal} className="btn-primary">
                Add First Train
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">
                    Train Number
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-railway-blue-900">
                    Capacity
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
                {trains.map((train) => (
                  <tr key={train.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-railway-blue-700">
                        {train.trainNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{train.name}</td>
                    <td className="py-3 px-4">
                      <span className="badge bg-blue-100 text-blue-700">
                        {train.type || 'EXPRESS'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{train.capacity || 500}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`badge ${
                          train.active !== false
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {train.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(train)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(train.id!)}
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
              {editingTrain ? 'Edit Train' : 'Add New Train'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Train Number *
                </label>
                <input
                  type="text"
                  value={formData.trainNumber}
                  onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
                  className="input"
                  required
                  placeholder="e.g., T1001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Train Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                  placeholder="e.g., Udarata Menike"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input"
                >
                  <option value="EXPRESS">Express</option>
                  <option value="INTERCITY">Intercity</option>
                  <option value="SLOW">Slow</option>
                  <option value="LUXURY">Luxury</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="input"
                  min="1"
                  placeholder="500"
                />
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
                  {editingTrain ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTrain(null);
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

export default function AdminTrainsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminTrainsContent />
    </ProtectedRoute>
  );
}
