"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

const ACTIVITIES = [
  { name: "Meditation", xp: 50, icon: "🧘" },
  { name: "Sparring", xp: 100, icon: "⚔️" },
  { name: "Alchemy", xp: 75, icon: "⚗️" },
  { name: "Scripture Study", xp: 60, icon: "📖" },
  { name: "Breakthrough Attempt", xp: 200, icon: "💥" },
  { name: "Studying", xp: 50, icon: "📚" },
];

export default function Activities() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");
  const [dailyCounts, setDailyCounts] = useState({});
  const DAILY_LIMIT = 3;

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) router.push("/");
  }, []);

  const perform = async (activityName) => {
    setError("");
    setResult(null);
    setLoading(activityName);
    try {
      const res = await api.post("/api/activities/perform/", {
        activity: activityName,
      });
      const data = res.data;
      setResult({ ...data, activityName });

      if (!data.blocked) {
        setDailyCounts((prev) => ({
          ...prev,
          [activityName]: data.daily_count,
        }));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        router.push("/");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(null);
    }
  };

  const getCount = (name) => dailyCounts[name] || 0;

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">⚔️ Training</h1>
            <p className="text-gray-400 text-sm">Max 3 sessions per activity per day</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition"
          >
            ← Dashboard
          </button>
        </div>

        {/* Streak Banner */}
        {result && !result.blocked && result.streak !== undefined && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-5 py-3 flex items-center justify-between">
            <span className="text-orange-400 font-semibold">🔥 Streak</span>
            <span className="text-orange-300 font-bold text-xl">{result.streak} days</span>
          </div>
        )}

        {/* Result Banner */}
        {result && (
          <div className={`border rounded-xl px-5 py-4 space-y-3 ${
            result.blocked
              ? "bg-red-900/20 border-red-500/30"
              : "bg-yellow-500/10 border-yellow-500/30"
          }`}>
            <div className="flex justify-between items-center">
              <span className={`font-semibold ${result.blocked ? "text-red-400" : "text-yellow-400"}`}>
                {result.blocked ? "⛔ Blocked" : "✅ XP Granted"}
              </span>
              {!result.blocked && (
                <span className="text-yellow-300 font-bold text-xl">+{result.xp_gained} XP</span>
              )}
            </div>

            {result.message && (
              <p className={`text-sm ${result.blocked ? "text-red-400" : "text-gray-400"}`}>
                {result.message}
              </p>
            )}

            {!result.blocked && (
              <>
                {/* XP Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Sublevel {result.sub_level} / 9</span>
                    <span>{result.current_xp} / {result.required_xp} XP</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div
                      className="bg-yellow-500 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${result.xp_percent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                  <span>Realm: <span className="text-white">{result.realm_level}</span></span>
                  <span>Total XP: <span className="text-white">{result.total_xp}</span></span>
                  {result.streak_multiplier > 1 && (
                    <span className="col-span-2 text-orange-400">
                      🔥 Streak bonus: {result.streak_multiplier}x
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-5 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Activity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACTIVITIES.map((act) => {
            const count = getCount(act.name);
            const exhausted = count >= DAILY_LIMIT;
            return (
              <button
                key={act.name}
                onClick={() => perform(act.name)}
                disabled={loading === act.name || exhausted}
                className={`bg-gray-900 border rounded-2xl p-5 text-left transition-all group ${
                  exhausted
                    ? "border-gray-700 opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-800 border-gray-800 hover:border-yellow-500/40"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="text-3xl mb-3">{act.icon}</div>
                <div className={`font-semibold transition ${
                  exhausted ? "text-gray-500" : "text-white group-hover:text-yellow-400"
                }`}>
                  {loading === act.name ? "Training..." : act.name}
                </div>
                <div className="text-gray-500 text-sm mt-1">+{act.xp} base XP</div>

                {/* Daily usage dots */}
                <div className="flex gap-1 mt-3">
                  {[...Array(DAILY_LIMIT)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < count ? "bg-yellow-500" : "bg-gray-700"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-600 ml-1">{count}/{DAILY_LIMIT} today</span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </main>
  );
}