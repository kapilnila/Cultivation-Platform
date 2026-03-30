"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

const SCOPES = [
  { label: "Global", value: "global" },
  { label: "Country", value: "country" },
  { label: "Region", value: "region" },
  { label: "City", value: "city" },
];

const REALM_NAMES = {
  0: "Mortal",
  1: "Body Tempering",
  2: "Qi Condensation",
  3: "Foundation Establishment",
  4: "Core Formation",
  5: "Nascent Soul",
  6: "Immortal Ascension",
};

export default function Rankings() {
  const router = useRouter();
  const [rankings, setRankings] = useState([]);
  const [scope, setScope] = useState("global");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) { router.push("/"); return; }
    fetchProfile();
    fetchRankings("global", "");
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/users/profile/");
      setCurrentUser(res.data.username);
    } catch {}
  };

  const fetchRankings = async (s, v) => {
    setLoading(true);
    setError("");
    try {
      const params = s === "global" ? "" : `?scope=${s}&value=${v}`;
      const res = await api.get(`/api/cultivation/rankings/${params}`);
      setRankings(res.data.results);
    } catch (err) {
      if (err.response?.status === 401) {
        router.push("/");
      } else {
        setError("Failed to load rankings.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (scope !== "global" && !value.trim()) {
      setError("Please enter a value to filter by.");
      return;
    }
    fetchRankings(scope, value);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRealmColor = (level) => {
    if (level >= 6) return "text-purple-400";
    if (level >= 4) return "text-blue-400";
    if (level >= 2) return "text-teal-400";
    return "text-gray-400";
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">🏆 Rankings</h1>
            <p className="text-gray-400 text-sm">Top cultivators across the realm</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition"
          >
            ← Dashboard
          </button>
        </div>

        {/* Scope Filter */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {SCOPES.map((s) => (
              <button
                key={s.value}
                onClick={() => { setScope(s.value); setValue(""); setError(""); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  scope === s.value
                    ? "bg-yellow-500 text-gray-900"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {scope !== "global" && (
            <div className="flex gap-2">
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={
                  scope === "city" ? "e.g. Bangalore" :
                  scope === "region" ? "e.g. Karnataka" :
                  "e.g. India"
                }
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition text-sm"
              />
              <button
                onClick={handleSearch}
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition"
              >
                Search
              </button>
            </div>
          )}

          {scope === "global" && (
            <button
              onClick={() => fetchRankings("global", "")}
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-sm transition"
            >
              Refresh
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-5 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Rankings List */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-yellow-400 animate-pulse py-8">
              Loading rankings...
            </p>
          ) : rankings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No cultivators found.</p>
          ) : (
            rankings.map((entry) => {
              const isMe = entry.username === currentUser;
              return (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-4 bg-gray-900 border rounded-xl px-5 py-4 transition ${
                    isMe
                      ? "border-yellow-500/50 bg-yellow-500/5"
                      : "border-gray-800"
                  }`}
                >
                  {/* Rank */}
                  <div className="text-xl font-bold w-10 text-center shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold truncate ${isMe ? "text-yellow-400" : "text-white"}`}>
                        {entry.username}
                      </span>
                      {isMe && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <div className={`text-sm mt-0.5 ${getRealmColor(entry.realm_level)}`}>
                      {REALM_NAMES[entry.realm_level] || `Realm ${entry.realm_level}`}
                      <span className="text-gray-600 mx-1">·</span>
                      <span className="text-gray-500">Sublevel {entry.sub_level}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right shrink-0">
                    <div className="text-yellow-400 font-semibold text-sm">
                      {entry.total_xp.toLocaleString()} XP
                    </div>
                    <div className="text-gray-600 text-xs mt-0.5">
                      Age {entry.age}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </main>
  );
}