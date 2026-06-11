import React, { useState } from 'react';

interface AuthScreenProps {
  onAuthSuccess: (email: string) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Register: save credentials to localStorage
        const existing = localStorage.getItem('shopease_registered_email');
        if (existing === email) {
          throw new Error('An account with this email already exists. Please sign in.');
        }
        localStorage.setItem('shopease_registered_email', email);
        localStorage.setItem('shopease_registered_password', password);
        onAuthSuccess(email);
      } else {
        // Login: check against stored credentials
        const storedEmail = localStorage.getItem('shopease_registered_email');
        const storedPassword = localStorage.getItem('shopease_registered_password');

        // Allow any login if no account registered yet (first-time / demo mode)
        if (!storedEmail && !storedPassword) {
          onAuthSuccess(email);
          return;
        }

        if (email !== storedEmail || password !== storedPassword) {
          throw new Error('Incorrect email or password. Please try again.');
        }

        onAuthSuccess(email);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#f0f2f5] p-4 text-slate-800 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Banner */}
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

        {/* Form */}
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
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs px-4 py-3 rounded-xl leading-relaxed font-medium">
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
              ) : isSignUp ? (
                'Register & Enter'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 font-medium">
            {isSignUp ? 'Already have an admin account?' : "Don't have an account yet?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="text-[#6c63ff] font-bold hover:underline cursor-pointer ml-1"
            >
              {isSignUp ? 'Sign In' : 'Sign Up As Admin'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-5 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed">
          <p className="font-bold uppercase tracking-wider text-slate-500 mb-1">🔒 Local Auth Mode</p>
          Credentials are stored securely in your browser. No external server required.
        </div>
      </div>
    </div>
  );
}