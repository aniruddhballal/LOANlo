import React, { useState, useEffect } from 'react';
import {
  getCurrentIp,
  getIpWhitelist,
  addIpToWhitelist,
  removeIpFromWhitelist,
  toggleIpRestriction,
} from '../services/ipWhitelistService';

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

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">IP Whitelist Settings</h2>

      {/* Alerts */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Current IP Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-lg mb-2">Your Current IP Address</h3>
        <p className="text-2xl font-mono text-blue-700 mb-3">{currentIp}</p>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Description (e.g., Office, Home)"
            value={newIpDescription}
            onChange={(e) => setNewIpDescription(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleAddCurrentIp}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Current IP
          </button>
        </div>
      </div>

      {/* IP Restriction Toggle */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">IP Restriction</h3>
            <p className="text-sm text-gray-600">
              {allowIpRestriction
                ? 'Only whitelisted IPs can access your account'
                : 'IP restriction is disabled'}
            </p>
          </div>
          <button
            onClick={handleToggleRestriction}
            disabled={whitelist.length === 0 && !allowIpRestriction}
            className={`px-6 py-2 rounded font-semibold ${
              allowIpRestriction
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
            title={whitelist.length === 0 ? 'Add at least one IP before enabling' : ''}
          >
            {allowIpRestriction ? 'Disable' : 'Enable'}
          </button>
        </div>
        {whitelist.length === 0 && (
          <p className="text-sm text-yellow-600 mt-2">
            ⚠️ Add at least one IP address before enabling IP restriction
          </p>
        )}
      </div>

      {/* Whitelist Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <h3 className="font-semibold text-lg p-4 border-b">Whitelisted IP Addresses</h3>
        {whitelist.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">No IP addresses whitelisted yet</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">IP Address</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Added</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {whitelist.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{item.ip}</td>
                  <td className="px-4 py-3 text-sm">{item.description || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(item.addedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleRemoveIp(item._id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Warning */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notice</h4>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Make sure to whitelist your current IP before enabling restrictions</li>
          <li>If you have a dynamic IP, you may need to update the whitelist regularly</li>
          <li>You will be locked out if you enable restrictions without whitelisting your IP</li>
          <li>Contact support if you get locked out of your account</li>
        </ul>
      </div>
    </div>
  );
};

export default IpWhitelistSettings;