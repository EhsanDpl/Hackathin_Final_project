// /pages/setup-profile.js
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";

export default function SetupProfile() {
  const roles = [
    "Junior Software Engineer",
    "Mid-level Software Engineer",
    "Senior Software Engineer",
    "Tech Lead",
  ];

  const skills = ["JavaScript", "Python", "React", "Node.js", "AWS", "Docker"];

  const [currentRole, setCurrentRole] = useState("");
  const [proficiency, setProficiency] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);

  const handleSkillClick = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const isFormValid = currentRole && proficiency && learningGoals;

  return (
    <ProtectedRoute roles={["learner"]}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="Setup Profile" />

          <main className="p-8 text-gray-800 overflow-auto space-y-10">
            {/* Heading */}
            <div>
              <h1 className="text-3xl font-bold mb-2">Let’s Build Your Skill Profile</h1>
              <p className="text-gray-600 mb-8">
                Help us understand your current skills & goals
              </p>
            </div>

            {/* Form */}
            <div className="space-y-8">
              {/* Current Role */}
              <div>
                <label className="block text-lg font-medium mb-2">Current Role</label>
                <select
                  className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-lg font-medium mb-2">Primary Tech Stack</label>
                <div className="flex flex-wrap gap-3 mt-4">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      onClick={() => handleSkillClick(skill)}
                      className={`px-4 py-2 rounded-full cursor-pointer border transition ${
                        selectedSkills.includes(skill)
                          ? "bg-purple-600 text-white border-purple-600 shadow-md scale-105"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Proficiency */}
              <div>
                <label className="block text-lg font-medium mb-3">Rate Your Proficiency</label>
                <div className="flex gap-6">
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="backend"
                        value={level}
                        checked={proficiency === level}
                        onChange={() => setProficiency(level)}
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>

              {/* Learning Goals */}
              <div>
                <label className="block text-lg font-medium mb-3">Learning Goals</label>
                <textarea
                  rows="4"
                  className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="E.g., I want to become a full-stack developer..."
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                ></textarea>
              </div>

              {/* Connect Accounts Section */}
              <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-6 space-y-6 mt-6">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🔗</span>
                  <div>
                    <h3 className="text-blue-800 font-semibold text-lg">Connect Your Accounts for AI-Powered Insights</h3>
                    <p className="text-blue-600 text-sm mt-1">
                      Link your professional accounts to let AI understand your skills and contributions. Get a personalized learning path just for you.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* LinkedIn */}
                  <div className="flex items-center justify-between border border-gray-300 p-4 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">in</div>
                      <div>
                        <strong className="text-gray-800">LinkedIn Profile</strong>
                        <p className="text-gray-500 text-xs mt-1">Showcase your skills, experience, and endorsements.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:scale-105 transition">
                      Connect
                    </button>
                  </div>

                  {/* GitHub */}
                  <div className="flex items-center justify-between border border-gray-300 p-4 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">GH</div>
                      <div>
                        <strong className="text-gray-800">GitHub Account</strong>
                        <p className="text-gray-500 text-xs mt-1">Share code activity and contributions for AI insights.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:scale-105 transition">
                      Connect
                    </button>
                  </div>

                  {/* JIRA */}
                  <div className="flex items-center justify-between border border-gray-300 p-4 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">J</div>
                      <div>
                        <strong className="text-gray-800">JIRA Workspace</strong>
                        <p className="text-gray-500 text-xs mt-1">Connect projects to assess workflow and project involvement.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:scale-105 transition">
                      Connect
                    </button>
                  </div>
                </div>

                {/* Privacy */}
                <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500 flex items-start gap-2">
                  <span className="text-xl">🔒</span>
                  <p className="text-blue-800 text-sm">
                    <strong>Your privacy matters:</strong> Only metadata is analyzed. Your personal data remains secure. Disconnect anytime.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                disabled={!isFormValid}
                className={`w-full text-white font-bold py-3 rounded-lg shadow-lg transition ${
                  isFormValid
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:scale-105"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Generate My Profile →
              </button>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
