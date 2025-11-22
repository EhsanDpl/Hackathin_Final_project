// /pages/create-employee.js
import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export default function CreateEmployee() {
  const { user } = useAuth();
  const [role, setRole] = useState('learner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [positionEntered, setPositionEntered] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    if (positionEntered && role === 'learner') {
      const mockSkills = ['JavaScript', 'React', 'Node.js', 'CSS', 'HTML', 'Tailwind', 'Python', 'Java'];
      setAvailableSkills(mockSkills);
    }
  }, [positionEntered, role]);

  const handleAddSkill = () => {
    if (selectedSkill && !selectedSkills.includes(selectedSkill)) {
      setSelectedSkills([...selectedSkills, selectedSkill]);
      setSelectedSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name, email, role, position, skills: selectedSkills };
    console.log('Creating employee:', payload);
    alert('Employee created! Check console for payload.');
  };

  const isFormValid = () => {
    if (!name || !email || !role || !position) return false;
    if (role === 'learner' && selectedSkills.length === 0) return false;
    return true;
  };

  // Filter skills to not show already selected
  const filteredSkills = availableSkills.filter((s) => !selectedSkills.includes(s));

  return (
    <ProtectedRoute roles={['admin']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Create Employee" />
          <main className="flex-1 p-6 sm:p-10">
            <h1 className="text-3xl font-bold mb-6">Create Employee</h1>
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
                  <label className="block text-gray-700 font-medium mb-2">Skills</label>
                  <div className="flex space-x-2 mb-2">
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="flex-1 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="">Select skill</option>
                      {filteredSkills.map((skill) => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center bg-purple-200 text-purple-800 px-3 py-1 rounded-full"
                      >
                        {skill}
                        <XMarkIcon
                          className="w-4 h-4 ml-1 cursor-pointer"
                          onClick={() => handleRemoveSkill(skill)}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!isFormValid()}
                className={`w-full text-white font-bold py-3 rounded-lg shadow-lg transition transform ${
                  isFormValid()
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:scale-105'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Create Employee
              </button>
            </form>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
