import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import { AnimatePresence, motion } from 'motion/react';
import { auth, signInWithGoogle, logout as firebaseLogout } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { translations, Language } from './lib/translations';

type View = 'login' | 'signup' | 'dashboard';

export default function App() {
  const [view, setView] = useState<View>('login');
  const [user, setUser] = useState<{ name: string; email?: string | null } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<Language>('English');
  const [isLoading, setIsLoading] = useState(true);
  const [flash, setFlash] = useState<{ color: 'white' | 'black'; id: number } | null>(null);

  const t = translations[language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({ 
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email 
        });
        setView('dashboard');
      } else {
        setUser(null);
        if (view === 'dashboard') setView('login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [view]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // onAuthStateChanged will handle the state update
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseLogout();
      setUser(null);
      setView('login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Trigger flash immediately
    setFlash({ 
      color: newTheme === 'light' ? 'white' : 'black', 
      id: Date.now() 
    });

    // Change theme slightly after flash starts to cover the "snap" change
    setTimeout(() => {
      setTheme(newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, 50);
  };

  // Set initial theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col bg-background selection:bg-primary/30">
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        language={language} 
        setLanguage={(lang) => setLanguage(lang as Language)} 
      />
      
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6">
        <AnimatePresence mode="wait">
          {view === 'login' && (
            <Login 
              key="login"
              t={t}
              onGoogleLogin={handleGoogleLogin}
              onNavigateToSignUp={() => setView('signup')} 
            />
          )}
          {view === 'signup' && (
            <SignUp 
              key="signup"
              t={t}
              onGoogleLogin={handleGoogleLogin}
              onNavigateToLogin={() => setView('login')} 
            />
          )}
          {view === 'dashboard' && user && (
            <Dashboard 
              key="dashboard"
              t={t}
              userName={user.name} 
              onLogout={handleLogout} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Background Decoratives */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
      </div>

      {/* Theme Transition Flash Overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash.id}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ 
              duration: 10, 
              ease: [0.22, 1, 0.36, 1] // Out-expo for a smooth reveal
            }}
            onAnimationComplete={() => setFlash(null)}
            className={`fixed inset-0 z-[9999] pointer-events-none ${
              flash.color === 'white' ? 'bg-white' : 'bg-black'
            }`}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
