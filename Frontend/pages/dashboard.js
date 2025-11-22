import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Chart from '../components/Chart';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest, getAvailableGitHubProfiles, getAvailableJiraData } from '../utils/api';
import { 
  ClipboardIcon, 
  PaperAirplaneIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [integrations, setIntegrations] = useState({
    github: false,
    jira: false,
  });
  const [profileData, setProfileData] = useState({
    phone: '',
    location: '',
    linkedinProfile: '',
  });
  const [showMockDataModal, setShowMockDataModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [mockDataOptions, setMockDataOptions] = useState([]);
  const [selectedMockDataId, setSelectedMockDataId] = useState(null);
  const [loadingMockData, setLoadingMockData] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/profile');
      setProfile(data);
      
      // Check connected accounts from bridge table (connectedAccounts array)
      const connectedAccounts = data.connectedAccounts || [];
      setIntegrations({
        github: connectedAccounts.some(acc => acc.accountType === 'github') || data.githubConnected || false,
        jira: connectedAccounts.some(acc => acc.accountType === 'jira') || data.jiraConnected || false,
      });
      setProfileData({
        phone: data.phone || '',
        location: data.location || '',
        linkedinProfile: data.linkedinProfile || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMockDataModal = async (integration) => {
    try {
      setLoadingMockData(true);
      setSelectedIntegration(integration);
      setSelectedMockDataId(null);
      
      let data = [];
      if (integration === 'github') {
        data = await getAvailableGitHubProfiles();
      } else if (integration === 'jira') {
        data = await getAvailableJiraData();
      }
      
      setMockDataOptions(data);
      setShowMockDataModal(true);
    } catch (err) {
      console.error('Error loading mock data:', err);
      setError(`Failed to load ${selectedIntegration} mock data`);
    } finally {
      setLoadingMockData(false);
    }
  };

  const handleConnectIntegration = async (integration, mockDataId = null) => {
    try {
      setUpdating(true);
      setError(null);
      
      const updateData = {
        [`${integration}Connected`]: true,
      };

      if (integration === 'github' && mockDataId) {
        updateData.githubProfileId = mockDataId;
      } else if (integration === 'jira' && mockDataId) {
        updateData.jiraDataId = mockDataId;
      }

      const updated = await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      setProfile(updated);
      setIntegrations({
        ...integrations,
        [integration]: true,
      });
      setShowMockDataModal(false);
      setSelectedIntegration(null);
      setSelectedMockDataId(null);
      setMockDataOptions([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error connecting integration:', err);
      setError(`Failed to connect ${integration}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDisconnectIntegration = async (integration) => {
    try {
      setUpdating(true);
      setError(null);
      
      const updateData = {
        [`${integration}Connected`]: false,
      };

      // Clear the reference IDs when disconnecting
      if (integration === 'github') {
        updateData.githubProfileId = null;
      } else if (integration === 'jira') {
        updateData.jiraDataId = null;
      }
      
      const updated = await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      setProfile(updated);
      setIntegrations({
        ...integrations,
        [integration]: false,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error disconnecting integration:', err);
      setError(`Failed to disconnect ${integration}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);
      
      const updated = await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const hasConnectedIntegrations = () => {
    return integrations.github || integrations.jira;
  };

  const handleSaveDraft = async () => {
    try {
      setUpdating(true);
      setError(null);
      
      await apiRequest('/skill-profile/draft', {
        method: 'POST',
        body: JSON.stringify({
          integrations: integrations,
          profileData: profileData,
        }),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Failed to save draft');
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateProfile = async () => {
    try {
      setUpdating(true);
      setError(null);
      
      const response = await apiRequest('/skill-profile/generate', {
        method: 'POST',
        body: JSON.stringify({
          integrations: integrations,
        }),
      });

      // Redirect to skill profile results page
      if (typeof window !== 'undefined') {
        window.location.href = '/skill-profile-results';
      }
    } catch (err) {
      console.error('Error generating profile:', err);
      setError('Failed to generate profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };


  if (loading) {
    return (
      <ProtectedRoute roles={['learner']}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-auto">
            <Navbar title="Dashboard" />
            <main className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={['learner']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Employee Dashboard" />

          <main className="p-6">
            <h1 className="text-3xl font-bold mb-6 animate-fade-in-up">Welcome, {profile?.name || user?.email}</h1>

            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                Profile updated successfully!
              </div>
            )}

            {/* Profile Section */}
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 animate-fade-in-up">
              <h2 className="text-2xl font-bold mb-4">My Profile</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full p-3 border rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={profile?.name || ''}
                      disabled
                      className="w-full p-3 border rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-400"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-400"
                      placeholder="Enter location"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* Integrations Section */}
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 animate-fade-in-up transform transition-all duration-300 hover:shadow-xl">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Connect Integrations
              </h2>
              
              <div className="space-y-4">
                {/* GitHub */}
                <div className="border-2 border-gray-200 rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-400 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-md">
                        GH
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-gray-900 transition-colors">GitHub</h3>
                        <p className="text-sm text-gray-500">Connect your GitHub profile</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {integrations.github ? (
                        <>
                          <CheckCircleIcon className="w-6 h-6 text-green-500 animate-pulse" />
                          <button
                            onClick={() => handleDisconnectIntegration('github')}
                            disabled={updating}
                            className="text-red-600 hover:text-red-700 text-sm font-semibold transition-colors transform hover:scale-105"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-6 h-6 text-gray-400" />
                          <button
                            onClick={() => handleOpenMockDataModal('github')}
                            disabled={updating || loadingMockData}
                            className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                          >
                            {loadingMockData ? 'Loading...' : 'Connect'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Jira */}
                <div className="border-2 border-gray-200 rounded-lg p-4 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-400 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-md">
                        J
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-blue-600 transition-colors">Jira</h3>
                        <p className="text-sm text-gray-500">Connect your Jira workspace</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {integrations.jira ? (
                        <>
                          <CheckCircleIcon className="w-6 h-6 text-green-500 animate-pulse" />
                          <button
                            onClick={() => handleDisconnectIntegration('jira')}
                            disabled={updating}
                            className="text-red-600 hover:text-red-700 text-sm font-semibold transition-colors transform hover:scale-105"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-6 h-6 text-gray-400" />
                          <button
                            onClick={() => handleOpenMockDataModal('jira')}
                            disabled={updating || loadingMockData}
                            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                          >
                            {loadingMockData ? 'Loading...' : 'Connect'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                      </div>

              {/* Draft and Generate Profile Buttons */}
              <div className="mt-6 pt-6 border-t flex gap-4">
                          <button
                  onClick={handleSaveDraft}
                            disabled={updating}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md hover:shadow-lg"
                          >
                  Save Draft
                          </button>
                          <button
                  onClick={handleGenerateProfile}
                  disabled={updating || !hasConnectedIntegrations()}
                  className="flex-1 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:via-pink-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl relative overflow-hidden group"
                >
                  <span className="relative z-10">Generate My Profile</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                          </button>
              </div>
            </div>

            {/* Mock Data Selection Modal */}
            {showMockDataModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4">
                    Select {selectedIntegration === 'github' ? 'GitHub' : selectedIntegration === 'jira' ? 'Jira' : 'Integration'} Mock Data
                  </h3>
                  
                  {loadingMockData ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : mockDataOptions.length === 0 ? (
                    <p className="text-gray-500 py-4">No available mock data found.</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {mockDataOptions.map((option) => {
                        let displayText = '';
                        if (selectedIntegration === 'github') {
                          displayText = `${option.fullName || option.username} - ${option.bio || 'GitHub Profile'}`;
                        } else if (selectedIntegration === 'jira') {
                          displayText = `${option.issueKey || 'JIRA'} - ${option.issueTitle || option.sprintName || 'Jira Data'}`;
                        }
                        
                        return (
                          <div
                            key={option.id}
                            onClick={() => setSelectedMockDataId(option.id)}
                            className={`p-3 border rounded-lg cursor-pointer transition ${
                              selectedMockDataId === option.id
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center">
                              <input
                                type="radio"
                                checked={selectedMockDataId === option.id}
                                onChange={() => setSelectedMockDataId(option.id)}
                                className="mr-3"
                              />
                              <div className="flex-1">
                                <p className="font-medium">{displayText}</p>
                                {selectedIntegration === 'github' && option.location && (
                                  <p className="text-sm text-gray-500">{option.location}</p>
                                )}
                                {selectedIntegration === 'jira' && option.status && (
                                  <p className="text-sm text-gray-500">Status: {option.status}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowMockDataModal(false);
                        setSelectedIntegration(null);
                        setSelectedMockDataId(null);
                        setMockDataOptions([]);
                      }}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConnectIntegration(selectedIntegration, selectedMockDataId)}
                      disabled={!selectedMockDataId || updating}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {updating ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
