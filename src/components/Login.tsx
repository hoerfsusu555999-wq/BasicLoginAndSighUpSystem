import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { loginWithEmail, resetPassword } from '../lib/firebase';

interface LoginProps {
  onNavigateToSignUp: () => void;
  onGoogleLogin: () => void;
  t: any;
  key?: string;
}

export default function Login({ onNavigateToSignUp, onGoogleLogin, t }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError(t.errorInvalidCredential || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (err.code === 'auth/user-not-found') {
        setError(t.errorUserNotFound || 'ไม่พบผู้ใช้งานนี้ในระบบ');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('กรุณาเปิดใช้งาน Email/Password ใน Firebase Console');
      } else {
        setError(t.errorDefault || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t.enterEmail || 'กรุณากรอกอีเมล');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: any) {
      console.error(err);
      setError(t.errorReset || 'ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-[440px] bg-card p-8 rounded-2xl border border-border shadow-2xl overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {view === 'login' ? (
          <motion.div
            key="login-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="mb-8 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">{t.welcomeBack}</h1>
              <p className="text-on-surface-variant font-medium">{t.enterDetails}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm font-medium"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="email">
                  {t.email}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-on-surface/5 focus:border-primary/50 focus:bg-on-surface/[0.08] transition-all outline-none text-on-surface placeholder:text-on-surface-variant/40"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="password">
                    {t.password}
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setView('forgot')}
                    className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-12 rounded-xl border border-border bg-on-surface/5 focus:border-primary/50 focus:bg-on-surface/[0.08] transition-all outline-none text-on-surface placeholder:text-on-surface-variant/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-on-surface/10 rounded-md transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-on-surface-variant" />
                    ) : (
                      <Eye className="w-5 h-5 text-on-surface-variant" />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isLoading}
                className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 overflow-hidden relative shadow-lg shadow-primary/20 disabled:opacity-70"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  t.login
                )}
              </motion.button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-card text-on-surface-variant uppercase tracking-widest font-bold">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onGoogleLogin}
                className="w-full h-12 bg-surface border border-border rounded-xl flex items-center justify-center gap-3 hover:bg-on-surface/5 transition-colors font-bold text-on-surface shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {t.continueWithGoogle}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-border pt-8">
              <p className="text-sm text-on-surface-variant font-medium">
                {t.noAccount}{" "}
                <button 
                  onClick={onNavigateToSignUp}
                  className="text-primary font-bold hover:text-primary-hover transition-colors"
                >
                  {t.signUp}
                </button>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="forgot-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button 
              onClick={() => {
                setView('login');
                setResetSent(false);
                setError(null);
              }}
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-bold mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToLogin}
            </button>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">{t.resetPassword}</h1>
              <p className="text-on-surface-variant font-medium leading-relaxed">
                {t.resetInstructions}
              </p>
            </div>

            {resetSent ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-green-500 w-6 h-6" />
                </div>
                <h3 className="text-green-500 font-bold mb-2">{t.resetSent}</h3>
                <p className="text-on-surface-variant text-sm">
                  {t.checkEmail}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="reset-email">
                    {t.email}
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-on-surface/5 focus:border-primary/50 focus:bg-on-surface/[0.08] transition-all outline-none text-on-surface placeholder:text-on-surface-variant/40"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={isLoading}
                  className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 overflow-hidden relative shadow-lg shadow-primary/20 disabled:opacity-70"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    t.resetPassword
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
