// /pages/create-employee.js
import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';

export default function CreateEmployee() {
  const { user } = useAuth();
  const [role, setRole] = useState('learner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [position, setPosition] = useState('');
  const [positionEntered, setPositionEntered] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestingSkills, setSuggestingSkills] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch AI-suggested skills when position is entered for a learner
  useEffect(() => {
    if (positionEntered && role === 'learner' && position.trim().length > 0) {
      fetchSkillSuggestions();
    } else if (!positionEntered || role !== 'learner') {
      setAvailableSkills([]);
    }
  }, [positionEntered, role, position]);

  const fetchSkillSuggestions = async () => {
    if (!position || position.trim().length === 0) {
      return;
    }

    try {
      setSuggestingSkills(true);
      setError(null);
      
      const response = await apiRequest(`/suggest-skills?position=${encodeURIComponent(position)}&role=${role}`);
      
      if (response.data && response.data.skills && Array.isArray(response.data.skills)) {
        setAvailableSkills(response.data.skills);
      } else {
        // Fallback to default skills if API doesn't return expected format
        setAvailableSkills(['JavaScript', 'React', 'Node.js', 'CSS', 'HTML', 'Tailwind', 'Python', 'Java']);
      }
    } catch (err) {
      console.error('Error fetching skill suggestions:', err);
      // Fallback to default skills on error
      setAvailableSkills(['JavaScript', 'React', 'Node.js', 'CSS', 'HTML', 'Tailwind', 'Python', 'Java']);
    } finally {
      setSuggestingSkills(false);
    }
  };

  const handleAddSkill = () => {
    if (selectedSkill && !selectedSkills.includes(selectedSkill)) {
      setSelectedSkills([...selectedSkills, selectedSkill]);
      setSelectedSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const payload = { 
        name, 
        email, 
        role, 
        position, 
        password,
        phone,
        location,
        skills: selectedSkills 
      };
      const result = await apiRequest('/employees', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      console.log('Employee created:', result);
      setSuccess(true);
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhone('');
      setLocation('');
      setRole('learner');
      setPosition('');
      setPositionEntered(false);
      setSelectedSkills([]);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error creating employee:', err);
      setError(err.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (!name || !email || !role || !position) return false;
    if (role === 'learner' && selectedSkills.length === 0) return false;
    return true;
  };

  // Filter skills to not show already selected
  const filteredSkills = availableSkills.filter((s) => !selectedSkills.includes(s));

  return (
    <ProtectedRoute roles={['admin', 'super_admin']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Create Employee" />
          <main className="flex-1 p-6 sm:p-10">
            <h1 className="text-3xl font-bold mb-6">Create Employee</h1>
            {success && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p className="font-semibold mb-2">✅ Employee created successfully!</p>
                <p className="text-sm">The employee account has been created and is ready to use.</p>
              </div>
            )}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <form className="space-y-6 w-full" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Enter password (min 6 characters)"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Confirm password"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Enter phone number (optional)"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Enter location (optional)"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="learner">Learner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Current Position</label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && position.trim() !== '') {
                      e.preventDefault();
                      setPositionEntered(true);
                    }
                  }}
                  onBlur={() => {
                    if (position.trim() !== '') setPositionEntered(true);
                  }}
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Enter current position and press Enter"
                />
              </div>

                     {role === 'learner' && positionEntered && (
                       <div>
                         <label className="block text-gray-700 font-medium mb-2">
                           Skills
                           {suggestingSkills && (
                             <span className="ml-2 text-sm text-purple-600 font-normal">
                               🤖 AI is suggesting skills based on "{position}"...
                             </span>
                           )}
                           {!suggestingSkills && availableSkills.length > 0 && (
                             <span className="ml-2 text-sm text-green-600 font-normal">
                               ✨ {availableSkills.length} AI-suggested skills available
                             </span>
                           )}
                         </label>
                         {suggestingSkills ? (
                           <div className="flex items-center justify-center p-4 border rounded-lg bg-purple-50">
                             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
                             <span className="text-gray-600">Getting AI suggestions...</span>
                           </div>
                         ) : (
                           <>
                             <div className="flex space-x-2 mb-2">
                               <select
                                 value={selectedSkill}
                                 onChange={(e) => setSelectedSkill(e.target.value)}
                                 className="flex-1 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
                                 disabled={availableSkills.length === 0}
                               >
                                 <option value="">
                                   {availableSkills.length === 0 ? 'No skills available' : 'Select skill'}
                                 </option>
                                 {filteredSkills.map((skill) => (
                                   <option key={skill} value={skill}>
                                     {skill}
                                   </option>
                                 ))}
                               </select>
                               <button
                                 type="button"
                                 onClick={handleAddSkill}
                                 disabled={!selectedSkill || availableSkills.length === 0}
                                 className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                               >
                                 Add
                               </button>
                               {availableSkills.length > 0 && (
                                 <button
                                   type="button"
                                   onClick={() => {
                                     // Add all suggested skills at once
                                     const newSkills = availableSkills.filter(s => !selectedSkills.includes(s));
                                     setSelectedSkills([...selectedSkills, ...newSkills]);
                                   }}
                                   className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm"
                                   title="Add all suggested skills"
                                 >
                                   Add All
                                 </button>
                               )}
                             </div>
                             <div className="flex flex-wrap gap-2">
                               {selectedSkills.map((skill) => (
                                 <span
                                   key={skill}
                                   className="flex items-center bg-purple-200 text-purple-800 px-3 py-1 rounded-full"
                                 >
                                   {skill}
                                   <XMarkIcon
                                     className="w-4 h-4 ml-1 cursor-pointer hover:text-red-600"
                                     onClick={() => handleRemoveSkill(skill)}
                                   />
                                 </span>
                               ))}
                             </div>
                             {selectedSkills.length === 0 && availableSkills.length > 0 && (
                               <p className="text-sm text-gray-500 mt-2">
                                 💡 Tip: Select skills from the AI suggestions above or click "Add All" to add all suggested skills.
                               </p>
                             )}
                           </>
                         )}
                       </div>
                     )}

              <button
                type="submit"
                disabled={!isFormValid() || loading}
                className={`w-full text-white font-bold py-3 rounded-lg shadow-lg transition transform ${
                  isFormValid() && !loading
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:scale-105'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {loading ? 'Creating...' : 'Create Employee'}
              </button>
            </form>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
