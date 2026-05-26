const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

// Token management
export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const setAccessToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
};

export const setRefreshToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('refresh_token', token);
  }
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

// API client with automatic token refresh
export const apiClient = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const accessToken = getAccessToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    let response = await fetch(url, config);
    
    // If unauthorized, try to refresh token
    if (response.status === 401 && accessToken) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        const refreshResponse = await fetch(`${API_URL}/api/auth/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setAccessToken(data.access);
          
          // Retry original request with new token
          config.headers['Authorization'] = `Bearer ${data.access}`;
          response = await fetch(url, config);
        } else {
          // Refresh failed, clear tokens and redirect to login
          clearTokens();
          window.location.href = '/login';
          return null;
        }
      }
    }
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication APIs
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/api/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  setAccessToken(data.access);
  setRefreshToken(data.refresh);
  return data;
};

export const register = async (userData) => {
  const response = await fetch(`${API_URL}/api/auth/signup/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error('Registration failed');
  }
  
  return await response.json();
};

export const logout = () => {
  clearTokens();
  window.location.href = '/login';
};