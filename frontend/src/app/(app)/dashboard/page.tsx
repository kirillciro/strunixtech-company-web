export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Placeholder summary cards for the future client workspace. */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl shadow-sm">Projects</div>
        <div className="p-4 bg-white rounded-xl shadow-sm">Messages</div>
        <div className="p-4 bg-white rounded-xl shadow-sm">Templates</div>
      </div>
    </div>
  );
}
