import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Chart from '../components/Chart';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest, getAvailableLinkedInProfiles, getAvailableJiraData, getAvailableTeamsData } from '../utils/api';
import { 
  ClipboardIcon, 
  PaperAirplaneIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
  PencilIcon,
  ArrowPathIcon,
  LinkSlashIcon,
  SparklesIcon,
  ChartBarIcon,
  AcademicCapIcon,
  TrophyIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [integrations, setIntegrations] = useState({
    linkedin: false,
    jira: false,
    teams: false,
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
        linkedin: connectedAccounts.some(acc => acc.accountType === 'linkedin') || data.linkedinConnected || false,
        jira: connectedAccounts.some(acc => acc.accountType === 'jira') || data.jiraConnected || false,
        teams: connectedAccounts.some(acc => acc.accountType === 'teams') || data.teamsConnected || false,
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
      if (integration === 'linkedin') {
        data = await getAvailableLinkedInProfiles();
      } else if (integration === 'jira') {
        data = await getAvailableJiraData();
      } else if (integration === 'teams') {
        // Teams is disabled
        data = [];
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

      if (integration === 'linkedin') {
        if (mockDataId) {
          updateData.linkedinProfileId = mockDataId;
        }
        if (profileData.linkedinProfile) {
          updateData.linkedinProfile = profileData.linkedinProfile;
        }
      } else if (integration === 'jira' && mockDataId) {
        updateData.jiraDataId = mockDataId;
      } else if (integration === 'teams' && mockDataId) {
        updateData.teamsCalendarId = mockDataId;
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
      if (integration === 'linkedin') {
        updateData.linkedinProfileId = null;
      } else if (integration === 'jira') {
        updateData.jiraDataId = null;
      } else if (integration === 'teams') {
        updateData.teamsCalendarId = null;
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

  const skills = [
    { id: 1, name: 'React Basics', progress: 80, points: 50 },
    { id: 2, name: 'Next.js Fundamentals', progress: 60, points: 40 },
    { id: 3, name: 'Tailwind CSS', progress: 90, points: 30 },
  ];

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [generatedLink, setGeneratedLink] = useState('');

  const displayData = () => {
    if (selectedSkill) return selectedSkill;
    const totalProgress = Math.round(skills.reduce((acc, s) => acc + s.progress, 0) / skills.length);
    const totalPoints = skills.reduce((acc, s) => acc + s.points, 0);
    return { progress: totalProgress, points: totalPoints, name: 'Overall' };
  };

  const data = displayData();

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
          <Navbar title="Home" />

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
              <div className="flex items-center space-x-2 mb-4">
                <UserIcon className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold">My Profile</h2>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                      <span>Email</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full pl-10 p-3 border rounded-lg bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <span>Name</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={profile?.name || ''}
                        disabled
                        className="w-full pl-10 p-3 border rounded-lg bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4 text-gray-500" />
                      <span>Phone</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                      <MapPinIcon className="h-4 w-4 text-gray-500" />
                      <span>Location</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="Enter location"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center space-x-2 font-semibold"
                >
                  {updating ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <PencilIcon className="h-5 w-5" />
                      <span>Update Profile</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Integrations Section */}
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 animate-fade-in-up">
              <div className="flex items-center space-x-2 mb-4">
                <LinkIcon className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold">Connect Integrations</h2>
              </div>
              
              <div className="space-y-4">
                {/* LinkedIn */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        in
                      </div>
                      <div>
                        <h3 className="font-semibold">LinkedIn</h3>
                        <p className="text-sm text-gray-500">Connect your LinkedIn profile</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {integrations.linkedin ? (
                        <>
                          <CheckCircleIcon className="w-6 h-6 text-green-500" />
                          <button
                            onClick={() => handleDisconnectIntegration('linkedin')}
                            disabled={updating}
                            className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-red-50 transition-all"
                          >
                            <LinkSlashIcon className="h-4 w-4" />
                            <span>Disconnect</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-6 h-6 text-gray-400" />
                          <button
                            onClick={() => handleOpenMockDataModal('linkedin')}
                            disabled={updating || loadingMockData}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-1 font-semibold"
                          >
                            {loadingMockData ? (
                              <>
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                <span>Loading...</span>
                              </>
                            ) : (
                              <>
                                <LinkIcon className="h-4 w-4" />
                                <span>Connect</span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Jira */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                        J
                      </div>
                      <div>
                        <h3 className="font-semibold">Jira</h3>
                        <p className="text-sm text-gray-500">Connect your Jira workspace</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {integrations.jira ? (
                        <>
                          <CheckCircleIcon className="w-6 h-6 text-green-500" />
                          <button
                            onClick={() => handleDisconnectIntegration('jira')}
                            disabled={updating}
                            className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-red-50 transition-all"
                          >
                            <LinkSlashIcon className="h-4 w-4" />
                            <span>Disconnect</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-6 h-6 text-gray-400" />
                          <button
                            onClick={() => handleConnectIntegration('jira')}
                            disabled={updating}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-1 font-semibold"
                          >
                            {updating ? (
                              <>
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                <span>Connecting...</span>
                              </>
                            ) : (
                              <>
                                <LinkIcon className="h-4 w-4" />
                                <span>Connect</span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Teams - Disabled */}
                {/* 
                <div className="border rounded-lg p-4 opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        T
                      </div>
                      <div>
                        <h3 className="font-semibold">Microsoft Teams</h3>
                        <p className="text-sm text-gray-500">Connect your Teams calendar</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <XCircleIcon className="w-6 h-6 text-gray-400" />
                      <button
                        disabled
                        className="bg-gray-400 text-white px-4 py-1 rounded text-sm cursor-not-allowed"
                      >
                        Disabled
                      </button>
                    </div>
                  </div>
                </div>
                */}
              </div>
            </div>

            {/* Mock Data Selection Modal */}
            {showMockDataModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4">
                    Select {selectedIntegration === 'linkedin' ? 'LinkedIn' : selectedIntegration === 'jira' ? 'Jira' : 'Teams'} Mock Data
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
                        if (selectedIntegration === 'linkedin') {
                          displayText = `${option.fullName || option.username} - ${option.headline || 'LinkedIn Profile'}`;
                        } else if (selectedIntegration === 'jira') {
                          displayText = `${option.issueKey || 'JIRA'} - ${option.issueTitle || option.sprintName || 'Jira Data'}`;
                        } else if (selectedIntegration === 'teams') {
                          displayText = `${option.eventTitle || 'Teams Event'} - ${option.eventType || 'Calendar Event'}`;
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
                                {selectedIntegration === 'linkedin' && option.location && (
                                  <p className="text-sm text-gray-500">{option.location}</p>
                                )}
                                {selectedIntegration === 'jira' && option.status && (
                                  <p className="text-sm text-gray-500">Status: {option.status}</p>
                                )}
                                {selectedIntegration === 'teams' && option.startTime && (
                                  <p className="text-sm text-gray-500">
                                    {new Date(option.startTime).toLocaleString()}
                                  </p>
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
