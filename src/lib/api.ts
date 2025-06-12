// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}/api/user/profile`,
  PASSWORD: `${API_BASE_URL}/api/user/password`,
  PREFERENCES: `${API_BASE_URL}/api/user/preferences`,
};
