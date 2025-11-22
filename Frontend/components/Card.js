// /components/Card.js
export default function Card({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
      <span className="text-3xl">{icon}</span>
      <h2 className="text-xl font-bold mt-2">{title}</h2>
      <p className="text-2xl">{value}</p>
    </div>
  );
}
