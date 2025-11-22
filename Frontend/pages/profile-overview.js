// /pages/profile-overview.js
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import { useRouter } from "next/router";

export default function ProfileOverview() {
  const router = useRouter();

  const connectedAccounts = [
    {
      type: "GitHub",
      icon: "GH",
      bgColor: "bg-gray-900",
      analysis: "78% JavaScript, 15% Python code. Strong in React components & API integration.",
      linked: true,
    },
    {
      type: "JIRA",
      icon: "J",
      bgColor: "bg-blue-700",
      analysis: "Completed 43 frontend tickets. Limited backend/infrastructure work detected.",
      linked: true,
    },
    {
      type: "LinkedIn",
      icon: "in",
      bgColor: "bg-blue-600",
      analysis: "15 endorsements for React, 8 for JavaScript. Career goal: Full-stack development.",
      linked: false,
    },
  ];

  const strengths = [
    "Frontend Development: Advanced React skills",
    "UI/UX: Strong design understanding",
    "Version Control: Proficient with Git",
    "Problem Solving: Analytical thinking",
  ];

  const growthAreas = [
    "Backend: Limited server-side experience",
    "Cloud: Basic AWS knowledge needed",
    "Database: SQL/NoSQL optimization",
    "Testing: Unit testing practices",
  ];

  const skillMap = [
    { name: "Frontend Development", value: 85 },
    { name: "Backend Development", value: 45 },
    { name: "Cloud & DevOps", value: 35 },
  ];

  return (
    <ProtectedRoute roles={["learner"]}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar title="My Profile" />

          <main className="p-8 text-gray-800 overflow-auto space-y-10">

            {/* Connected Accounts */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Connected Accounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {connectedAccounts.map((account, idx) => (
                  <div
                    key={idx}
                    className={`border-2 rounded-xl p-4 flex flex-col gap-2 transition ${
                      account.linked ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${account.bgColor}`}>
                        {account.icon}
                      </div>
                      <h3 className="text-gray-800 font-semibold">{account.type}</h3>
                    </div>
                    <p className="text-gray-700 text-sm">{account.analysis}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="bg-white border-2 border-purple-500 p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">AI Recommendation</h2>
              <p className="text-gray-700">
                Based on your work patterns, we've identified you excel at frontend but have minimal backend exposure.
                Your learning path prioritizes hands-on backend projects with real-world scenarios similar to your current workflow.
              </p>
            </div>

            {/* Strengths and Growth Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-green-500 p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Your Strengths</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              </div>
              <div className="bg-white border-2 border-red-500 p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-red-800 mb-3">🎯 Growth Areas</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {growthAreas.map((g, idx) => <li key={idx}>{g}</li>)}
                </ul>
              </div>
            </div>

            {/* Skill Map */}
            <div className="bg-white border-2 border-indigo-500 p-6 rounded-xl shadow-md space-y-4">
              <h3 className="text-lg font-semibold text-indigo-800 mb-3">📊 Skill Map</h3>
              {skillMap.map((skill, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-gray-700 font-medium">
                    <span>{skill.name}</span>
                    <span>{skill.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${skill.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
<div className="flex flex-col md:flex-row gap-4 mt-6 justify-center">
  <button
    className="w-full md:w-60 text-gray-800 font-bold py-3 rounded-lg shadow-lg border-2 border-gray-300 hover:bg-gray-100 transition"
    onClick={() => router.push("/setup-profile")}
  >
     Go Back to Setup
  </button>
    <button
    className="w-full md:w-60 text-white font-bold py-3 rounded-lg shadow-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:scale-105 transition"
    onClick={() => router.push("/learning-path")}
  >
    Create New Profile →
  </button>
</div>

          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
