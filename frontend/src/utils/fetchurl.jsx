// Smart environment detection with fallbacks for GitHub Pages deployment

// Validate and get base URL - SMART MODE with fallbacks
const getBaseUrl = () => {
  // DEBUG: Log all environment variables
  console.log('🔍 DEBUG - All Vite env vars:', import.meta.env);
  console.log('🔍 DEBUG - VITE_NODE_ENV:', import.meta.env.VITE_NODE_ENV);
  console.log('🔍 DEBUG - VITE_DEV_API_URL:', import.meta.env.VITE_DEV_API_URL);
  console.log('🔍 DEBUG - VITE_PROD_API_URL:', import.meta.env.VITE_PROD_API_URL);
  console.log('🔍 DEBUG - window.location.hostname:', window.location.hostname);
  
  const nodeEnv = import.meta.env.VITE_NODE_ENV;
  const devUrl = import.meta.env.VITE_DEV_API_URL;
  const prodUrl = import.meta.env.VITE_PROD_API_URL;
  const hostname = window.location.hostname;
  
  // Auto-detect environment based on hostname if env vars not available
  const isGitHubPages = hostname.includes('github.io');
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  let detectedEnv = nodeEnv;
  if (!detectedEnv) {
    detectedEnv = isLocalhost ? 'development' : 'production';
    console.log(`🔍 AUTO-DETECTED Environment: ${detectedEnv} (based on hostname: ${hostname})`);
  }
  
  // Development environment
  if (detectedEnv === 'development') {
    const apiUrl = devUrl || 'http://localhost:8000';
    console.log('✅ Environment: development');
    console.log('✅ API URL:', apiUrl);
    return apiUrl;
  }
  
  // Production environment
  if (detectedEnv === 'production') {
    const apiUrl = prodUrl || 'https://svmps-frontend.onrender.com';
    console.log('✅ Environment: production');
    console.log('✅ API URL:', apiUrl);
    return apiUrl;
  }
  
  // Fallback error
  throw new Error(`❌ INVALID: Environment must be 'development' or 'production', got: '${detectedEnv}'`);
};

// Environment information for debugging
export const ENV_INFO = {
  get current() {
    const hostname = window.location.hostname;
    const nodeEnv = import.meta.env.VITE_NODE_ENV;
    return nodeEnv || (hostname === 'localhost' || hostname === '127.0.0.1' ? 'development' : 'production');
  },
  get baseUrl() {
    return getBaseUrl();
  },
  get hostname() {
    return window.location.hostname;
  },
  isDevelopment() {
    return this.current === 'development';
  },
  isProduction() {
    return this.current === 'production';
  },
  isGitHubPages() {
    return window.location.hostname.includes('github.io');
  }
};

// Simple API URLs
export const API_URLS = {
  // Users
  getAllUser_data: () => `${getBaseUrl()}/user_data/`,
  getUser_dataById: (id) => `${getBaseUrl()}/user_data/${id}`,
  createUser_data: () => `${getBaseUrl()}/user_data/`,
  updateUser_data: (id) => `${getBaseUrl()}/user_data/${id}`,
  deleteUser_data: (id) => `${getBaseUrl()}/user_data/${id}`,
  getUser_dataStats: () => `${getBaseUrl()}/user_data/stats`,
  
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
