import { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { registerWithEmail } from '../lib/firebase';

interface SignUpProps {
  onNavigateToLogin: () => void;
  onGoogleLogin: () => void;
  t: any;
  key?: string;
}

export default function SignUp({ onNavigateToLogin, onGoogleLogin, t }: SignUpProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (password.length < 8) {
        throw { code: 'auth/weak-password' };
      }
      await registerWithEmail(email, password, name);
      // Firebase auth state change will be picked up by App.tsx
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError(t.errorEmailInUse || 'อีเมลนี้ถูกใช้งานไปแล้ว');
      } else if (err.code === 'auth/weak-password') {
        setError(t.errorWeakPassword || 'รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร');
      } else if (err.code === 'auth/invalid-email') {
        setError(t.errorInvalidEmail || 'รูปแบบอีเมลไม่ถูกต้อง');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('กรุณาเปิดใช้งาน Email/Password ใน Firebase Console');
      } else {
        setError(t.errorDefault || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-[440px] bg-card p-8 rounded-2xl border border-border shadow-2xl"
    >
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">{t.createAccount}</h1>
        <p className="text-on-surface-variant font-medium">{t.joinCommunity}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="name">
            {t.fullName}
          </label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-on-surface/5 focus:border-primary/50 focus:bg-on-surface/[0.08] transition-all outline-none text-on-surface placeholder:text-on-surface-variant/40"
              required
            />
          </div>
        </div>

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
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="password">
            {t.password}
          </label>
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
          className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center shadow-lg shadow-primary/20"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            t.signUp
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
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {t.continueWithGoogle}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-border pt-8">
        <p className="text-sm text-on-surface-variant font-medium">
          {t.alreadyHaveAccount}{" "}
          <button 
            onClick={onNavigateToLogin}
            className="text-primary font-bold hover:text-primary-hover transition-colors"
          >
            {t.login}
          </button>
        </p>
      </div>
    </motion.div>
  );
}
