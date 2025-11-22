import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { ClipboardIcon } from '@heroicons/react/outline';

export default function Admin() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [link, setLink] = useState('');

  const employees = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  const handleGenerateLink = () => {
    if (!selectedEmployee) return;
    setLink(`https://example.com/learner/${selectedEmployee.id}`);
  };

  const handleCopy = () => navigator.clipboard.writeText(link);
  const handleSendEmail = () => alert(`Link sent to ${selectedEmployee.email}`);

  return (
    <ProtectedRoute roles={['admin', 'super_admin']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="p-6">
            <h1 className="text-2xl font-bold mb-6">Create Learner Link</h1>
            <select
              className="p-3 border rounded-lg w-full mb-4"
              value={selectedEmployee?.id || ''}
              onChange={(e) => setSelectedEmployee(employees.find(emp => emp.id === parseInt(e.target.value)))}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
            <button
              onClick={handleGenerateLink}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg mb-4 hover:bg-blue-700 transition"
            >
              Generate Link
            </button>
            {link && (
              <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg">
                <input type="text" readOnly value={link} className="flex-1 bg-transparent focus:outline-none"/>
                <ClipboardIcon className="w-6 h-6 text-gray-600 cursor-pointer" onClick={handleCopy}/>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  onClick={handleSendEmail}
                >
                  Send Email
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
