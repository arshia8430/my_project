import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { Lock, User } from "lucide-react";
import { loginAdmin } from "../utils/adminAuth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ok = loginAdmin(username.trim(), password);
    if (!ok) {
      setError("Invalid username or password");
      return;
    }
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-white">Admin Login</h1>
        <p className="text-sm text-slate-400">Sign in to access the admin panel.</p>

        <label className="block space-y-1">
          <span className="text-sm text-slate-300">Username</span>
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800 px-3">
            <User size={16} className="text-slate-400" />
            <input className="w-full bg-transparent px-2 py-2 text-white outline-none" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-slate-300">Password</span>
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800 px-3">
            <Lock size={16} className="text-slate-400" />
            <input type="password" className="w-full bg-transparent px-2 py-2 text-white outline-none" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button type="submit" className="w-full rounded-lg bg-cyan-500 py-2 text-slate-950 font-semibold hover:bg-cyan-400 transition">Login</button>
      </form>
    </div>
  );
}
