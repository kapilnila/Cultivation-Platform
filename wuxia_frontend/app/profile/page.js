"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ city: "", region: "", country: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("access")) { router.push("/"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profRes, locRes] = await Promise.all([
        api.get("/api/users/profile/"),
        api.get("/api/users/location/"),
      ]);
      setProfile(profRes.data);
      setForm({
        city: locRes.data.city || "",
        region: locRes.data.region || "",
        country: locRes.data.country || "",
      });
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setMessage("");
    setError("");
    setSaving(true);
    try {
      await api.post("/api/users/location/", form);
      setMessage("Location saved successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save location.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-yellow-400 animate-pulse">Loading profile...</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-8">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-yellow-400">Profile</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-gray-400 hover:text-white px-3 py-1 border border-gray-700 rounded-lg transition"
          >
            Back
          </button>
        </div>

        {/* User Info */}
        {profile && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <p className="text-gray-500 text-xs uppercase tracking-widest">Account</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Username</p>
                <p className="text-white font-semibold">{profile.username}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Email</p>
                <p className="text-white font-semibold">{profile.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Location Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <p className="text-gray-500 text-xs uppercase tracking-widest">
            Location — used for scoped rankings
          </p>

          {[
            { key: "city", label: "City", placeholder: "e.g. Bangalore" },
            { key: "region", label: "Region / State", placeholder: "e.g. Karnataka" },
            { key: "country", label: "Country", placeholder: "e.g. India" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-gray-400 text-sm mb-1">{field.label}</label>
              <input
                type="text"
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition text-sm"
              />
            </div>
          ))}

          {message && <p className="text-green-400 text-sm">{message}</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Location"}
          </button>
        </div>

        {/* Location preview */}
        {form.city && form.region && form.country && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-400">
            Your rankings scope: {" "}
            <span className="text-white">{form.city}</span> ·{" "}
            <span className="text-white">{form.region}</span> ·{" "}
            <span className="text-white">{form.country}</span>
          </div>
        )}

      </div>
    </main>
  );
}