import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, AlertTriangle, CheckCircle, Globe, Lock, Unlock } from 'lucide-react';
import { IpWhitelistSkeleton } from '../ui/SkeletonComponents';
import {
  getCurrentIp,
  getIpWhitelist,
  addIpToWhitelist,
  removeIpFromWhitelist,
  toggleIpRestriction,
} from '../../services/ipWhitelistService';

interface IpWhitelistItem {
  _id: string;
  ip: string;
  description?: string;
  addedAt: string;
}

const IpWhitelistSettings: React.FC = () => {
  const [currentIp, setCurrentIp] = useState<string>('');
  const [whitelist, setWhitelist] = useState<IpWhitelistItem[]>([]);
  const [allowIpRestriction, setAllowIpRestriction] = useState<boolean>(false);
  const [newIpDescription, setNewIpDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ip, whitelistData] = await Promise.all([
        getCurrentIp(),
        getIpWhitelist(),
      ]);
      setCurrentIp(ip);
      setWhitelist(whitelistData.whitelist);
      setAllowIpRestriction(whitelistData.allowIpRestriction);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load IP whitelist data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCurrentIp = async () => {
    try {
      setError('');
      setSuccess('');
      const result = await addIpToWhitelist(currentIp, newIpDescription || 'Current location');
      setWhitelist(result.whitelist);
      setNewIpDescription('');
      setSuccess('Current IP address added to whitelist');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add IP to whitelist');
    }
  };

  const handleRemoveIp = async (ipId: string) => {
    if (!window.confirm('Are you sure you want to remove this IP from the whitelist?')) {
      return;
    }
    try {
      setError('');
      setSuccess('');
      const result = await removeIpFromWhitelist(ipId);
      setWhitelist(result.whitelist);
      setSuccess('IP address removed from whitelist');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove IP from whitelist');
    }
  };

  const handleToggleRestriction = async () => {
    try {
      setError('');
      setSuccess('');
      const newValue = !allowIpRestriction;
      const result = await toggleIpRestriction(newValue);
      setAllowIpRestriction(result.allowIpRestriction);
      setSuccess(result.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle IP restriction');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <IpWhitelistSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-light text-gray-900">IP Whitelist Settings</h1>
          </div>
          <p className="text-gray-600 font-light ml-13">
            Manage IP addresses allowed to access your account
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Current IP Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-gray-700" />
              <h2 className="text-xl font-light text-gray-900">Your Current IP Address</h2>
            </div>
            <p className="text-sm text-gray-600 font-light">
              Add your current IP to the whitelist to ensure continued access
            </p>
          </div>
          
          <div className="p-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
              <p className="text-3xl font-mono text-blue-700 mb-4 font-semibold tracking-wide">
                {currentIp}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Description (e.g., Office, Home)"
                  value={newIpDescription}
                  onChange={(e) => setNewIpDescription(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900"
                />
                <button
                  onClick={handleAddCurrentIp}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Current IP
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* IP Restriction Toggle */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 mb-2">
              {allowIpRestriction ? (
                <Lock className="w-5 h-5 text-gray-700" />
              ) : (
                <Unlock className="w-5 h-5 text-gray-700" />
              )}
              <h2 className="text-xl font-light text-gray-900">IP Restriction</h2>
            </div>
            <p className="text-sm text-gray-600 font-light">
              Control whether only whitelisted IPs can access your account
            </p>
          </div>
          
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex-1">
                <p className={`text-lg font-medium ${allowIpRestriction ? 'text-red-700' : 'text-green-700'}`}>
                  {allowIpRestriction
                    ? 'Only whitelisted IPs can access your account'
                    : 'IP restriction is currently disabled'}
                </p>
                <p className="text-sm text-gray-600 mt-1 font-light">
                  {allowIpRestriction
                    ? 'Your account is protected by IP whitelist'
                    : 'Anyone can access from any IP address'}
                </p>
              </div>
              <button
                onClick={handleToggleRestriction}
                disabled={whitelist.length === 0 && !allowIpRestriction}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                  allowIpRestriction
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                title={whitelist.length === 0 ? 'Add at least one IP before enabling' : ''}
              >
                {allowIpRestriction ? 'Disable Restriction' : 'Enable Restriction'}
              </button>
            </div>
            {whitelist.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Add at least one IP address before enabling IP restriction
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Whitelist Table */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <header className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-light text-gray-900 mb-1">
                  Whitelisted IP Addresses
                </h2>
                <p className="text-sm text-gray-600 font-light">
                  Manage IP addresses that can access your account
                </p>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {whitelist.length} {whitelist.length === 1 ? 'Address' : 'Addresses'}
              </div>
            </div>
          </header>

          <div className="p-8">
            {whitelist.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No IP Addresses</h3>
                <p className="text-gray-500 font-light">
                  No IP addresses whitelisted yet. Add your current IP to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            IP Address
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Added
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {whitelist.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50/50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono bg-gray-900 text-white px-3 py-1.5 rounded text-sm font-medium">
                                {item.ip}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-900 font-medium">
                                {item.description || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div>{formatDate(item.addedAt)}</div>
                              <div className="text-xs text-gray-500 font-light">
                                {formatTime(item.addedAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleRemoveIp(item._id)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                <Trash2 className="w-3 h-3" />
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {whitelist.map((item) => (
                    <div
                      key={item._id}
                      className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50/50 hover:border-gray-300 transition-all duration-200"
                    >
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-gray-600 font-light">IP Address</span>
                          <span className="font-mono bg-gray-900 text-white px-3 py-1 rounded text-xs font-medium">
                            {item.ip}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 font-light">Description</span>
                          <span className="text-sm text-gray-900 font-medium">
                            {item.description || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 font-light">Added</span>
                          <div className="text-right">
                            <div className="text-sm text-gray-900">{formatDate(item.addedAt)}</div>
                            <div className="text-xs text-gray-500 font-light">
                              {formatTime(item.addedAt)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveIp(item._id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove IP Address
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Warning Notice */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-3 text-lg">Important Security Notice</h3>
              <ul className="text-sm text-yellow-800 space-y-2 font-light">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Make sure to whitelist your current IP before enabling restrictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>If you have a dynamic IP, you may need to update the whitelist regularly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>You will be locked out if you enable restrictions without whitelisting your IP</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Contact support immediately if you get locked out of your account</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default IpWhitelistSettings;