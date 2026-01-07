
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
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const formatError = (err: any) => {
    switch (err.code) {
      case 'auth/unauthorized-domain':
        return (
          <div className="space-y-2">
            <p>This domain is not authorized in Firebase.</p>
            <p className="text-[10px] opacity-80 leading-relaxed font-medium">
              Go to <span className="text-white">Firebase Console > Authentication > Settings > Authorized Domains</span> and add <span className="text-white">{window.location.hostname}</span> to the list.
            </p>
          </div>
        );
      case 'auth/popup-blocked':
        return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
      case 'auth/popup-closed-by-user':
        return "Sign-in was cancelled. Please try again.";
      case 'auth/operation-not-allowed':
        return "Google sign-in is not enabled in your Firebase project. Please enable it in the Firebase Console.";
      case 'auth/invalid-credential':
        return "Invalid login credentials. Please check your email and password.";
      default:
        return err.message || "An authentication error occurred.";
    }
  };

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
      console.error(err);
      setError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Using the explicit browserPopupRedirectResolver ensures compatibility 
      // when running inside nested iframes or specific dev environments.
      await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden font-body">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-2xl shadow-blue-500/20 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-white mb-2">
            AuditPro <span className="text-blue-500">SEO</span>
          </h1>
          <p className="text-slate-400 font-medium">Access your intelligence dashboard</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl">
          {view !== 'forgot-password' ? (
            <div className="flex bg-slate-950/50 p-1 rounded-xl mb-8 border border-white/5">
              <button 
                onClick={() => { setView('login'); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest-label rounded-lg transition-all ${view === 'login' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Login
              </button>
              <button 
                onClick={() => { setView('signup'); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest-label rounded-lg transition-all ${view === 'signup' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="mb-8">
              <button 
                onClick={() => { setView('login'); setResetSent(false); setError(null); }}
                className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest-label hover:text-blue-400 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Login
              </button>
              <h2 className="text-xl font-bold font-display text-white mt-4">Reset Password</h2>
              <p className="text-xs text-slate-500 mt-2 font-medium">We'll send a recovery link to your email.</p>
            </div>
          )}

          {resetSent ? (
            <div className="text-center py-6 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-emerald-400 font-bold font-display text-sm">Reset Link Sent!</p>
              <p className="text-slate-500 text-xs mt-2 font-medium">Check your inbox for further instructions.</p>
              <button 
                onClick={() => { setView('login'); setResetSent(false); }}
                className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest-label hover:text-white transition-colors underline decoration-slate-800 underline-offset-4"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400 font-bold mb-4 animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest-label ml-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-700"
                />
              </div>
              
              {view !== 'forgot-password' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest-label ml-1">Password</label>
                    <button 
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="text-[10px] font-black text-blue-500 uppercase tracking-widest-label hover:text-blue-400 transition-colors"
                    >
                      Forgot?
                    </button>
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-700"
                  />
                </div>
              )}
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-xl shadow-blue-600/20 uppercase text-xs tracking-widest-label mt-2"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{view === 'forgot-password' ? 'Sending...' : 'Authenticating...'}</span>
                  </div>
                ) : (
                  view === 'forgot-password' ? 'Send Reset Link' : view === 'login' ? 'Sign In to Dashboard' : 'Create Account'
                )}
              </button>
            </form>
          )}

          {view !== 'forgot-password' && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest-label">
                  <span className="bg-[#0f172a] px-4 text-slate-600">Or continue with</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest-label shadow-xl shadow-white/5 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                  </svg>
                )}
                {isLoading ? 'Verifying...' : 'Login with Google'}
              </button>
            </>
          )}
        </div>
        
        <p className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest-label">
          By continuing, you agree to AuditPro's Terms of Intelligence.
        </p>
      </div>
    </div>
  );
};

export default Auth;
