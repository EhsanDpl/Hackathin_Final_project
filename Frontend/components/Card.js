// /components/Card.js
export default function Card({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg transform transition hover:scale-105 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
