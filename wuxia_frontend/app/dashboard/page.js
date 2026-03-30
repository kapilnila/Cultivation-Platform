"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/");
      return;
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/api/cultivation/dashboard/");
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        router.push("/");
      } else {
        setError("Failed to load dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/");
  };

  if (loading) return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-yellow-400 text-lg animate-pulse">Loading your cultivation data...</p>
    </main>
  );

  if (error) return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-red-400">{error}</p>
    </main>
  );

  const { user, realm, progression, age, xp_blocked, next_goal } = data;

  const lifespanPercent = age.max_lifespan === -1
    ? 100
    : Math.min(100, Math.round((age.platform_age / age.max_lifespan) * 100));

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">🐉 Wuxia</h1>
            <p className="text-gray-400 text-sm">Welcome back, {user.username}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/activities")}
              className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition"
            >
              Train
            </button>
            <button
              onClick={() => router.push("/rankings")}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Rankings
            </button>

            <button
  onClick={() => router.push("/profile")}
  className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition"
>
  Profile
</button>
            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-red-900 text-gray-400 hover:text-red-400 px-4 py-2 rounded-lg text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Realm Card */}
        <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Current Realm</p>
              <h2 className="text-3xl font-bold text-yellow-400">{realm.name}</h2>
              <p className="text-yellow-600 text-sm mt-1">{realm.title}</p>
            </div>
            <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs px-3 py-1 rounded-full">
              {progression.stage} Stage
            </span>
          </div>
          <p className="text-gray-500 text-sm italic mt-3">{realm.intro}</p>
        </div>

        {/* Progression Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-gray-300 font-semibold">Cultivation Progress</h3>

          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Sublevel {progression.sub_level} / 9</span>
            <span>{progression.current_xp} / {progression.required_xp} XP</span>
          </div>

          {/* XP Bar */}
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progression.xp_percent}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Total XP: {progression.total_xp}</span>
            <span>Next: {next_goal}</span>
          </div>

          {xp_blocked && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              ⚠ Lifespan exhausted — breakthrough required to gain more XP
            </div>
          )}
        </div>

        {/* Lifespan Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-300 font-semibold">Lifespan</h3>
            <span className={`text-xs px-3 py-1 rounded-full border ${
              age.status === "immortal"
                ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                : age.status === "life_exhausted"
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : age.status === "life_warning"
                ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                : "bg-green-500/10 border-green-500/30 text-green-400"
            }`}>
              {age.status === "immortal" ? "Immortal" :
               age.status === "life_exhausted" ? "Exhausted" :
               age.status === "life_warning" ? "Warning" : "Normal"}
            </span>
          </div>

          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Age: {age.platform_age} years</span>
            <span>{age.max_lifespan === -1 ? "∞ Immortal" : `Max: ${age.max_lifespan} years`}</span>
          </div>

          {age.max_lifespan !== -1 && (
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  age.status === "life_exhausted" ? "bg-red-500" :
                  age.status === "life_warning" ? "bg-orange-500" : "bg-green-500"
                }`}
                style={{ width: `${lifespanPercent}%` }}
              />
            </div>
          )}
        </div>

      </div>
    </main>
  );
}