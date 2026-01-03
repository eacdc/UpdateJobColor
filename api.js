// API Configuration
// Automatically detect environment: use production URL if not on localhost
// Points to main backend in CDC Site/backend folder
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001/api'  // Local: main backend runs on port 3001
  : 'https://cdcapi.onrender.com/api';  // Production: main backend

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    console.log('🌐 [API] Making request to:', url);
    console.log('🌐 [API] Request config:', {
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body ? (typeof config.body === 'string' ? config.body.substring(0, 200) + '...' : config.body) : undefined
    });
    
    const response = await fetch(url, config);
    console.log('🌐 [API] Response status:', response.status);
    console.log('🌐 [API] Response ok:', response.ok);
    
    const data = await response.json();
    console.log('🌐 [API] Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('❌ [API] Error:', error);
    console.error('❌ [API] Error message:', error.message);
    console.error('❌ [API] Error stack:', error.stack);
    throw error;
  }
}

// Jobs API
export const jobsAPI = {
  getAll: () => apiCall('/jobs'),
  search: (jobNumber) => apiCall(`/jobs/search/${encodeURIComponent(jobNumber)}`),
  getById: (id) => apiCall(`/jobs/${id}`),
  create: (jobData) => apiCall('/jobs', {
    method: 'POST',
    body: jobData
  }),
  // Search job numbers from MSSQL (4+ digits)
  searchJobNumbers: (jobNumberPart) => apiCall(`/jobs/search-numbers/${encodeURIComponent(jobNumberPart)}`),
  // Search job numbers for update job card app (uses same endpoint as completion app)
  searchJobNumbersForUpdate: (jobNumberPart) => apiCall(`/jobs/search-numbers-completion/${encodeURIComponent(jobNumberPart)}`),
  // Get job details from MSSQL
  getJobDetails: (jobNumber) => apiCall(`/jobs/details/${encodeURIComponent(jobNumber)}`),
  // Get job details for update job card app (with ClientName, JobName, OrderQuantity, PODate)
  getJobDetailsForUpdate: (jobNumber) => apiCall(`/jobs/details-update/${encodeURIComponent(jobNumber)}`),
  // Get job color details (returns PlanContName list)
  getJobColorDetails: (jobNumber) => apiCall(`/jobs/color-details/${encodeURIComponent(jobNumber)}`),
  // Get items from itemmaster for color dropdown
  getItemsForColor: () => apiCall('/jobs/items-for-color'),
  // Save color changes
  saveColorChanges: (colorData) => apiCall('/jobs/save-color-changes', {
    method: 'POST',
    body: colorData
  })
};
