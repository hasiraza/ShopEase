import React, { useState } from 'react';
import { registerAdmin, loginAdmin } from '../model/service';

interface AuthScreenProps {
  onAuthSuccess: (email: string) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Email/Password Auth
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await registerAdmin(email, password);
        onAuthSuccess(res.user.email);
      } else {
        const res = await loginAdmin(email, password);
        onAuthSuccess(res.user.email);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#f0f2f5] p-4 text-slate-800 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Banner/Header */}
        <div className="bg-[#1a1f36] p-8 text-center text-white shrink-0 relative">
          <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 pointer-events-none select-none">
            🍃
          </div>
          <p className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 mb-2">
            <span>🛒</span> ShopEase
          </p>
          <p className="text-sm text-[#8892b0] font-medium uppercase tracking-wider">
            Shop Management Portal
          </p>
        </div>

        {/* Content Body */}
        <div className="p-8 flex-1">
          <h2 className="text-xl font-bold text-slate-800 text-center mb-6">
            {isSignUp ? 'Create Admin Account' : 'Sign In to Dashboard'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Admin Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@shopease.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#6c63ff] focus:outline-none transition-all text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Secret Access Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#6c63ff] focus:outline-none transition-all text-sm font-semibold"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs px-4 py-3 rounded-xl leading-relaxed whitespace-pre-line font-medium shadow-xs">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#6c63ff] hover:bg-[#5b54e0] disabled:bg-[#a5a1f8] text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-md hover:shadow-lg focus:outline-none cursor-pointer flex items-center justify-center"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                isSignUp ? 'Register & Enter' : 'Sign In'
              )}
            </button>
          </form>

          {/* Switch link */}
          <div className="mt-6 text-center text-xs text-slate-500 font-medium">
            {isSignUp ? 'Already have an admin account?' : "Don't have an account yet?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#6c63ff] font-bold hover:underline cursor-pointer ml-1"
            >
              {isSignUp ? 'Sign In' : 'Sign Up As Admin'}
            </button>
          </div>
        </div>

        {/* Console Config Instructions */}
        <div className="bg-slate-50 p-5 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed">
          <p className="font-bold uppercase tracking-wider text-slate-500 mb-1">🍃 ShopEase Architecture:</p>
          We have updated the authentication security framework to run natively inside our high-performance MongoDB data engine. Logins are saved directly to your MongoDB cluster database.
        </div>
      </div>
    </div>
  );
}
