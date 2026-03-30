"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

export default function ClansPage() {
  const router = useRouter();
  const [myClan, setMyClan] = useState(null);
  const [clans, setClans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", region: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("access")) { router.push("/"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [myRes, allRes] = await Promise.all([
        api.get("/api/clans/my/"),
        api.get("/api/clans/"),
      ]);
      setMyClan(myRes.data);
      setClans(allRes.data);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setError("");
    setMessage("");
    if (!form.name || !form.description || !form.region) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/api/clans/", form);
      setMessage("Clan created successfully.");
      setShowCreate(false);
      setForm({ name: "", description: "", region: "" });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create clan.");
    } finally {
      setSaving(false);
    }
  };

  const handleJoin = async (clanId, clanName) => {
    setError("");
    setMessage("");
    try {
      await api.post("/api/clans/" + clanId + "/join/");
      setMessage("Joined " + clanName + " successfully.");
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to join clan.");
    }
  };

  const handleLeave = async () => {
    setError("");
    setMessage("");
    try {
      const res = await api.post("/api/clans/leave/");
      setMessage(res.data.message);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to leave clan.");
    }
  };

  if (loading) return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-yellow-400 animate-pulse">Loading clans...</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-yellow-400">Clans</h1>
            <p className="text-gray-400 text-sm">Join or create a clan</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-gray-400 hover:text-white px-3 py-1 border border-gray-700 rounded-lg transition"
          >
            Back
          </button>
        </div>

        {message && (
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {myClan?.in_clan && (
          <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Your Clan</p>
                <h2 className="text-xl font-bold text-yellow-400">{myClan.clan.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{myClan.clan.description}</p>
                <p className="text-gray-600 text-xs mt-1">Region: {myClan.clan.region}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full border border-yellow-500/30 text-yellow-400">
                {myClan.role}
              </span>
            </div>

            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">
                Members ({myClan.members.length})
              </p>
              <div className="space-y-2">
                {myClan.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="text-white">{m.username}</span>
                    <span className="text-gray-500 text-xs">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleLeave}
              className="text-sm text-red-400 hover:text-red-300 border border-red-500/30 px-4 py-2 rounded-lg transition"
            >
              {myClan.role === "LEADER" && myClan.members.length === 1 ? "Disband Clan" : "Leave Clan"}
            </button>
          </div>
        )}

        {!myClan?.in_clan && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-300 font-semibold">Create a Clan</p>
                <button
                  onClick={() => setShowCreate(!showCreate)}
                  className="text-sm text-yellow-400 hover:text-yellow-300 transition"
                >
                  {showCreate ? "Cancel" : "+ New Clan"}
                </button>
              </div>

              {showCreate && (
                <div className="space-y-3">
                  {[
                    { key: "name", label: "Clan Name", placeholder: "e.g. Dragon Sect" },
                    { key: "description", label: "Description", placeholder: "e.g. Elite cultivators of the east" },
                    { key: "region", label: "Region", placeholder: "e.g. Eastern Continent" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-gray-400 text-xs mb-1">{field.label}</label>
                      <input
                        type="text"
                        value={form[field.key]}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition text-sm"
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleCreate}
                    disabled={saving}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold py-2 rounded-lg text-sm transition disabled:opacity-50"
                  >
                    {saving ? "Creating..." : "Create Clan"}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-gray-500 text-xs uppercase tracking-widest">
                All Clans ({clans.length})
              </p>
              {clans.length === 0 ? (
                <p className="text-gray-600 text-sm">No clans yet. Be the first to create one.</p>
              ) : (
                clans.map((clan) => (
                  <div key={clan.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{clan.name}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{clan.description}</p>
                      <p className="text-gray-600 text-xs mt-1">{clan.region} · {clan.member_count} members</p>
                    </div>
                    <button
                      onClick={() => handleJoin(clan.id, clan.name)}
                      className="text-sm bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded-lg transition shrink-0 ml-4"
                    >
                      Join
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}