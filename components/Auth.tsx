
import React, { useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  browserPopupRedirectResolver
} from '../firebase';

type AuthView = 'login' | 'signup' | 'forgot-password';

const Auth: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (view === 'forgot-password') {
        await sendPasswordResetEmail(auth, email);
        setResetSent(true);
      } else if (view === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (view === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    } catch (err: any) {
      setError("Google authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#02040a] relative overflow-hidden font-display">
      {/* Refined Sophisticated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full"></div>
      </div>
      
      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Brand Identity */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-2xl shadow-violet-500/20 mb-6 mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            AuditPro <span className="text-violet-400">SEO</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">Professional Search Intelligence Dashboard</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-3xl">
          
          {/* Tab Switcher */}
          <div className="flex bg-black/40 p-1 rounded-xl mb-10 border border-white/5">
            <button 
              onClick={() => { setView('login'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${view === 'login' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setView('signup'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${view === 'signup' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all placeholder:text-slate-700 text-white"
              />
            </div>
            
            {view !== 'forgot-password' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => setView('forgot-password')}
                    className="text-[11px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all placeholder:text-slate-700 text-white"
                />
              </div>
            )}
            
            {error && (
              <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <p className="text-rose-400 text-xs font-semibold text-center leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            {resetSent && (
              <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-emerald-400 text-xs font-semibold text-center">
                  Password reset link has been sent.
                </p>
              </div>
            )}
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-violet-500/20 active:scale-[0.98] text-sm"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                view === 'login' ? 'Sign In to Dashboard' : view === 'signup' ? 'Create Your Account' : 'Reset Password'
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-[#0f111a] px-4 text-slate-500">Or continue with</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-sm hover:bg-slate-100 active:scale-[0.98] shadow-lg shadow-white/5"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
            Sign in with Google
          </button>
        </div>

        <p className="mt-8 text-center text-slate-500 text-xs font-medium">
          By continuing, you agree to our <span className="text-slate-300 underline cursor-pointer hover:text-white">Terms of Service</span> and <span className="text-slate-300 underline cursor-pointer hover:text-white">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default Auth;
