// API utility functions
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiRequest = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
      throw new Error('Unauthorized');
    }
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

export const getLearners = () => apiRequest('/learners');
export const getLearnerById = (id) => apiRequest(`/learners/${id}`);
export const getGitHubProfiles = (learnerId) => {
  const query = learnerId ? `?learnerId=${learnerId}` : '';
  return apiRequest(`/githubProfiles${query}`);
};

// Mock data endpoints
export const getAvailableLinkedInProfiles = async () => {
  // Fetch from mock server's linkedinProfiles endpoint
  const profiles = await apiRequest('/linkedinProfiles');
  // Filter out already linked profiles on frontend if needed
  // The backend service already handles filtering, but we can add additional client-side filtering here if needed
  return Array.isArray(profiles) ? profiles : [];
};

export const getAvailableJiraData = async () => {
  const response = await apiRequest('/mock-data/jira');
  return response.data || [];
};

export const getAvailableTeamsData = async () => {
  const response = await apiRequest('/mock-data/teams');
  return response.data || [];
};

// Chatbot API
export const sendChatMessage = async (message, history = []) => {
  const response = await apiRequest('/api/v1/llama-chat/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
  return response.data || { response: '', model: '' };
};

// Get all mentors
export const getMentors = async () => {
  const response = await apiRequest('/mentors');
  return response || [];
};

