// 100% .env dependent API URL management - NO FALLBACKS!

// Validate and get base URL - STRICT MODE
const getBaseUrl = () => {
  // DEBUG: Log all environment variables
  console.log('🔍 DEBUG - All Vite env vars:', import.meta.env);
  console.log('🔍 DEBUG - VITE_NODE_ENV:', import.meta.env.VITE_NODE_ENV);
  console.log('🔍 DEBUG - VITE_DEV_API_URL:', import.meta.env.VITE_DEV_API_URL);
  console.log('🔍 DEBUG - VITE_PROD_API_URL:', import.meta.env.VITE_PROD_API_URL);
  
  const nodeEnv = import.meta.env.VITE_NODE_ENV;
  const devUrl = import.meta.env.VITE_DEV_API_URL;
  const prodUrl = import.meta.env.VITE_PROD_API_URL;
  
  // STRICT VALIDATION - No fallbacks allowed
  if (!nodeEnv) {
    throw new Error('❌ MISSING: VITE_NODE_ENV is required in .env file!');
  }
  
  if (nodeEnv !== 'development' && nodeEnv !== 'production') {
    throw new Error(`❌ INVALID: VITE_NODE_ENV must be 'development' or 'production', got: '${nodeEnv}'`);
  }
  
  if (nodeEnv === 'development') {
    if (!devUrl) {
      throw new Error('❌ MISSING: VITE_DEV_API_URL is required when VITE_NODE_ENV=development');
    }
    console.log('✅ Environment: development');
    console.log('✅ API URL:', devUrl);
    return devUrl;
  }
  
  if (nodeEnv === 'production') {
    if (!prodUrl) {
      throw new Error('❌ MISSING: VITE_PROD_API_URL is required when VITE_NODE_ENV=production');
    }
    console.log('✅ Environment: production');
    console.log('✅ API URL:', prodUrl);
    return prodUrl;
  }
};

// Simple API URLs
export const API_URLS = {
  // Users
  getAllUsers: () => `${getBaseUrl()}/users/`,
  getUserById: (id) => `${getBaseUrl()}/users/${id}`,
  createUser: () => `${getBaseUrl()}/users/`,
  updateUser: (id) => `${getBaseUrl()}/users/${id}`,
  deleteUser: (id) => `${getBaseUrl()}/users/${id}`,
  getUserStats: () => `${getBaseUrl()}/users/stats`,
  
  // Areas
  getAllAreas: () => `${getBaseUrl()}/area/`,
  getAreaById: (id) => `${getBaseUrl()}/area/${id}`,
  createArea: () => `${getBaseUrl()}/area/`,
  deleteArea: (id) => `${getBaseUrl()}/area/${id}`,
  
  // Villages
  getAllVillages: () => `${getBaseUrl()}/village/`,
  getVillageById: (id) => `${getBaseUrl()}/village/${id}`,
  createVillage: () => `${getBaseUrl()}/village/`,
  deleteVillage: (id) => `${getBaseUrl()}/village/${id}`
};
