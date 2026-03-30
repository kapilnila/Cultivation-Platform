"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post("/api/auth/login/", {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        router.push("/dashboard");
      } else {
        await api.post("/api/auth/signup/", {
          email: form.email,
          username: form.username,
          password: form.password,
        });
        setIsLogin(true);
        setError("Account created! Please log in.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400 tracking-widest">🐉 WUXIA</h1>
          <p className="text-gray-400 mt-1 text-sm">Cultivation Platform</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              isLogin ? "bg-yellow-500 text-gray-900" : "text-gray-400 hover:text-white"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              !isLogin ? "bg-yellow-500 text-gray-900" : "text-gray-400 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="cultivator@wuxia.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-gray-400 text-sm mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="DragonSlayer99"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition"
            />
          </div>

          {error && (
            <p className={`text-sm text-center ${error.includes("created") ? "text-green-400" : "text-red-400"}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : isLogin ? "Enter the Realm" : "Begin Cultivation"}
          </button>
        </form>
      </div>
    </main>
  );
}