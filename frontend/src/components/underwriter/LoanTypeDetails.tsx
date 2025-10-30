import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../../api';

interface ILoanType {
  _id?: string;
  name: string;
  title: string;
  catchyPhrase: string;
  interestRateMin: number;
  interestRateMax: number;
  maxAmount: number;
  maxTenure: number;
  features: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const LoanTypeDetails: React.FC = () => {
  const [loanTypes, setLoanTypes] = useState<ILoanType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ILoanType>({
    name: '',
    title: '',
    catchyPhrase: '',
    interestRateMin: 0,
    interestRateMax: 0,
    maxAmount: 0,
    maxTenure: 1,
    features: ['', '', ''],
    isActive: true,
  });

  useEffect(() => {
    fetchLoanTypes();
  }, []);

  const fetchLoanTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/loan-types?includeInactive=true');
      
      // Handle both formats: { loanTypes: [...] } and direct array
      const loanTypesArray = response.data.loanTypes || response.data;
      setLoanTypes(Array.isArray(loanTypesArray) ? loanTypesArray : []);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      console.error('Fetch error:', err);
      setError(errorMessage);
      // Don't block UI - allow creating loan types even if fetch fails
      setLoanTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setError(null);
    
    // Validation
    if (!formData.name.trim()) {
      setError('Loan name is required');
      return;
    }
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.catchyPhrase.trim()) {
      setError('Catchy phrase is required');
      return;
    }
    if (formData.interestRateMin <= 0 || formData.interestRateMax <= 0) {
      setError('Interest rates must be greater than 0');
      return;
    }
    if (formData.interestRateMin >= formData.interestRateMax) {
      setError('Min interest rate must be less than max interest rate');
      return;
    }
    if (formData.maxAmount <= 0) {
      setError('Max amount must be greater than 0');
      return;
    }
    if (formData.features.some(f => !f.trim())) {
      setError('All 3 features are required');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/loan-types', formData);
      
      await fetchLoanTypes();
      resetForm();
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      console.error('Create error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setError(null);
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (formData.interestRateMin >= formData.interestRateMax) {
      setError('Min interest rate must be less than max interest rate');
      return;
    }
    if (formData.features.some(f => !f.trim())) {
      setError('All 3 features are required');
      return;
    }
    
    setLoading(true);
    try {
      await api.put(`/loan-types/${id}`, formData);
      
      await fetchLoanTypes();
      setEditingId(null);
      resetForm();
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      console.error('Update error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this loan type?')) return;
    
    setError(null);
    setLoading(true);
    try {
      await api.delete(`/loan-types/${id}`);
      
      await fetchLoanTypes();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      console.error('Delete error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    setError(null);
    setLoading(true);
    try {
      await api.patch(`/loan-types/${id}/toggle`);
      
      await fetchLoanTypes();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      console.error('Toggle error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (loanType: ILoanType) => {
    setEditingId(loanType._id || null);
    setFormData({
      name: loanType.name,
      title: loanType.title,
      catchyPhrase: loanType.catchyPhrase,
      interestRateMin: loanType.interestRateMin,
      interestRateMax: loanType.interestRateMax,
      maxAmount: loanType.maxAmount,
      maxTenure: loanType.maxTenure,
      features: [...loanType.features],
      isActive: loanType.isActive,
    });
    setIsCreating(false);
    setError(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      catchyPhrase: '',
      interestRateMin: 0,
      interestRateMax: 0,
      maxAmount: 0,
      maxTenure: 1,
      features: ['', '', ''],
      isActive: true,
    });
    setEditingId(null);
    setIsCreating(false);
    setError(null);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loan Type Management</h1>
            <p className="text-gray-600 mt-1">Manage loan products and configurations</p>
          </div>
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingId(null);
              setError(null);
            }}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            Add New Loan Type
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {(isCreating || editingId) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-blue-200">
            <h2 className="text-xl font-semibold mb-4">
              {isCreating ? 'Create New Loan Type' : 'Edit Loan Type'}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Personal Loan"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Get instant personal loans"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catchy Phrase *
                </label>
                <input
                  type="text"
                  value={formData.catchyPhrase}
                  onChange={(e) => setFormData({ ...formData, catchyPhrase: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Quick funds for any personal need"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Interest Rate (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.interestRateMin}
                  onChange={(e) => setFormData({ ...formData, interestRateMin: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Interest Rate (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.interestRateMax}
                  onChange={(e) => setFormData({ ...formData, interestRateMax: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Amount (₹) *
                </label>
                <input
                  type="number"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Tenure (years) *
                </label>
                <input
                  type="number"
                  value={formData.maxTenure}
                  onChange={(e) => setFormData({ ...formData, maxTenure: parseInt(e.target.value) || 1 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features (3 required) *
                </label>
                {formData.features.map((feature, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder={`Feature ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
              <button
                onClick={resetForm}
                disabled={loading}
                className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading && !isCreating && !editingId ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading loan types...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {loanTypes.map((loanType) => (
              <div
                key={loanType._id}
                className={`bg-white rounded-lg shadow-md p-6 ${!loanType.isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-gray-900">{loanType.name}</h3>
                      {loanType.isActive ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mt-1 font-medium">{loanType.title}</p>
                    <p className="text-gray-600 mt-1">{loanType.catchyPhrase}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(loanType._id!)}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                      title={loanType.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {loanType.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => startEdit(loanType)}
                      disabled={loading}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(loanType._id!)}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Interest Rate</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {loanType.interestRateMin}% - {loanType.interestRateMax}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Max Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(loanType.maxAmount)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Max Tenure</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {loanType.maxTenure} years
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Last Updated</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {loanType.updatedAt ? new Date(loanType.updatedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                  <ul className="space-y-1">
                    {loanType.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && loanTypes.length === 0 && !isCreating && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No loan types found. Create your first loan type to get started.</p>
            <button
              onClick={() => {
                setIsCreating(true);
                setError(null);
              }}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              Create First Loan Type
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanTypeDetails;