// Central URL management for API endpoints
// This file manages all API URLs for both development and production environments

/**
 * Get the current environment from Vite environment variables
 * Defaults to 'development' if not specified
 */
const getEnvironment = () => {
  return import.meta.env.VITE_NODE_ENV || 'development';
};

/**
 * API Base URLs for different environments
 */
const API_BASE_URLS = {
  development: import.meta.env.VITE_DEV_API_URL || 'http://127.0.0.1:8000',
  production: import.meta.env.VITE_PROD_API_URL || 'https://svmps-frontend.onrender.com'
};

/**
 * Get the current API base URL based on environment
 * @returns {string} The base URL for API calls
 */
export const getApiBaseUrl = () => {
  const env = getEnvironment();
  return API_BASE_URLS[env] || API_BASE_URLS.development;
};

/**
 * API endpoint configuration
 * All API endpoints are defined here for centralized management
 */
export const API_ENDPOINTS = {
  // Users endpoints
  USERS: '/users/',
  USER_BY_ID: (id) => `/users/${id}`,
  
  // Areas endpoints
  AREAS: '/area/',
  AREA_BY_ID: (id) => `/area/${id}`,
  
  // Villages endpoints
  VILLAGES: '/village/',
  VILLAGE_BY_ID: (id) => `/village/${id}`,
  
  // Authentication endpoints (if needed in future)
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  }
};

/**
 * Get complete URL for an endpoint
 * @param {string} endpoint - The endpoint path (use API_ENDPOINTS constants)
 * @returns {string} Complete URL with base URL and endpoint
 */
export const getApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};

/**
 * Convenience functions for common API URLs
 */
export const API_URLS = {
  // Users
  getAllUsers: () => getApiUrl(API_ENDPOINTS.USERS),
  getUserById: (id) => getApiUrl(API_ENDPOINTS.USER_BY_ID(id)),
  createUser: () => getApiUrl(API_ENDPOINTS.USERS),
  updateUser: (id) => getApiUrl(API_ENDPOINTS.USER_BY_ID(id)),
  deleteUser: (id) => getApiUrl(API_ENDPOINTS.USER_BY_ID(id)),
  
  // Areas
  getAllAreas: () => getApiUrl(API_ENDPOINTS.AREAS),
  getAreaById: (id) => getApiUrl(API_ENDPOINTS.AREA_BY_ID(id)),
  createArea: () => getApiUrl(API_ENDPOINTS.AREAS),
  deleteArea: (id) => getApiUrl(API_ENDPOINTS.AREA_BY_ID(id)),
  
  // Villages
  getAllVillages: () => getApiUrl(API_ENDPOINTS.VILLAGES),
  getVillageById: (id) => getApiUrl(API_ENDPOINTS.VILLAGE_BY_ID(id)),
  createVillage: () => getApiUrl(API_ENDPOINTS.VILLAGES),
  deleteVillage: (id) => getApiUrl(API_ENDPOINTS.VILLAGE_BY_ID(id))
};

/**
 * Environment information for debugging
 */
export const ENV_INFO = {
  current: getEnvironment(),
  baseUrl: getApiBaseUrl(),
  isDevelopment: () => getEnvironment() === 'development',
  isProduction: () => getEnvironment() === 'production'
};

// Default export for backward compatibility
export default {
  getApiBaseUrl,
  getApiUrl,
  API_ENDPOINTS,
  API_URLS,
  ENV_INFO
};
