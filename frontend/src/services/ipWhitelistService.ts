import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface IpWhitelistItem {
  _id: string;
  ip: string;
  description?: string;
  addedAt: string;
  addedBy: string;
}

interface IpWhitelistResponse {
  success: boolean;
  allowIpRestriction: boolean;
  whitelist: IpWhitelistItem[];
}

interface CurrentIpResponse {
  success: boolean;
  ip: string;
}

interface AddIpResponse {
  success: boolean;
  message: string;
  whitelist: IpWhitelistItem[];
}

interface ToggleRestrictionResponse {
  success: boolean;
  message: string;
  allowIpRestriction: boolean;
}

/**
 * Get current client IP
 */
export const getCurrentIp = async (): Promise<string> => {
  const token = localStorage.getItem('token');
  const response = await axios.get<CurrentIpResponse>(
    `${API_URL}/ip-whitelist/current-ip`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.ip;
};

/**
 * Get IP whitelist for current user
 */
export const getIpWhitelist = async (): Promise<IpWhitelistResponse> => {
  const token = localStorage.getItem('token');
  const response = await axios.get<IpWhitelistResponse>(
    `${API_URL}/ip-whitelist`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

/**
 * Add IP to whitelist
 */
export const addIpToWhitelist = async (
  ip: string,
  description?: string
): Promise<AddIpResponse> => {
  const token = localStorage.getItem('token');
  const response = await axios.post<AddIpResponse>(
    `${API_URL}/ip-whitelist/add`,
    { ip, description },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

/**
 * Remove IP from whitelist
 */
export const removeIpFromWhitelist = async (
  ipId: string
): Promise<{ success: boolean; message: string; whitelist: IpWhitelistItem[] }> => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(
    `${API_URL}/ip-whitelist/${ipId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

/**
 * Toggle IP restriction on/off
 */
export const toggleIpRestriction = async (
  enable: boolean
): Promise<ToggleRestrictionResponse> => {
  const token = localStorage.getItem('token');
  const response = await axios.patch<ToggleRestrictionResponse>(
    `${API_URL}/ip-whitelist/toggle`,
    { enable },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};