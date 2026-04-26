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

  const [isSecretMode, setIsSecretMode] = useState(false);
  const [glitchCount, setGlitchCount] = useState(0);
  const [glitchWordIndex, setGlitchWordIndex] = useState(-1);
  const glitchWords = ["Your", "Heart", "In The", "System", "Your", "Head", "Full", "Of", "SYSTEM"];
  const [isDeadWeb, setIsDeadWeb] = useState(false);

  const [keySequence, setKeySequence] = useState<string[]>([]);
  const secretCode = [
    'w', 'a', 's', 'd', 
    'ArrowUp', 'ArrowUp', 
    'ArrowDown', 'ArrowDown', 
    'ArrowLeft', 'ArrowRight', 
    'ArrowLeft', 'ArrowRight'
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newSequence = [...keySequence, e.key];
      
      if (newSequence.length > secretCode.length) {
        newSequence.shift();
      }
      
      setKeySequence(newSequence);

      if (newSequence.join(',') === secretCode.join(',')) {
        setKeySequence([]);
        if (view === 'dashboard' && user) {
          const nextCount = glitchCount + 1;
          setGlitchCount(nextCount);
          
          if (nextCount > 13) {
            setIsDeadWeb(true);
            return;
          }

          // Trigger word glitch
          setGlitchWordIndex(0);
          const interval = setInterval(() => {
            setGlitchWordIndex(prev => {
              if (prev >= glitchWords.length - 1) {
                clearInterval(interval);
                return -1;
              }
              return prev + 1;
            });
          }, 150);
        } else {
          setIsSecretMode(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keySequence, view, user, glitchCount]);

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
    <div 
      className={`min-h-screen relative overflow-x-hidden flex flex-col bg-background selection:bg-primary/30 transition-colors duration-1000 ${
        glitchCount > 0 ? 'grayscale !brightness-[0.4] !contrast-125' : ''
      } ${glitchCount > 8 ? 'invert hue-rotate-180 brightness-[0.2]' : ''}`}
      style={{
        filter: glitchCount > 0 ? `grayscale(${Math.min(glitchCount * 10, 100)}%) brightness(${Math.max(1 - glitchCount * 0.05, 0.2)})` : '',
        backgroundColor: glitchCount > 0 ? (glitchCount % 2 === 0 ? '#0a0000' : '#050000') : ''
      }}
    >
      {glitchCount > 5 && (
        <div className="fixed inset-0 z-[100] pointer-events-none mix-blend-overlay">
          <div className="absolute inset-0 bg-red-900/10 animate-pulse"></div>
        </div>
      )}
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

      {/* Glitch Word Overlay */}
      <AnimatePresence>
        {glitchWordIndex !== -1 && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[11000] bg-red-600 flex items-center justify-center overflow-hidden"
          >
            <motion.div
              animate={{ 
                x: [0, -10, 10, -5, 5, 0],
                y: [0, 5, -5, 2, -2, 0],
              }}
              transition={{ repeat: Infinity, duration: 0.1 }}
              className="text-8xl md:text-[14rem] font-black text-black uppercase italic tracking-tighter"
            >
              {glitchWords[glitchWordIndex]}
            </motion.div>
            
            {/* Background noise scanlines */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,100,0.06))] bg-[length:100%_2px,3px_100%]"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secret Mode Overlay */}
      <AnimatePresence>
        {isSecretMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-6"
          >
            <motion.h1 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-4xl md:text-6xl font-bold text-black text-center"
            >
              นายกดทำไมง่ะ
            </motion.h1>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={() => setIsSecretMode(false)}
              className="mt-12 px-6 py-2 border border-black/20 rounded-full text-black/40 hover:text-black hover:border-black transition-all text-sm font-medium"
            >
              กลับไปหน้าปกติก็ได้...
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dead Web State */}
      <AnimatePresence>
        {isDeadWeb && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-[12000] bg-black flex flex-col items-center justify-center font-mono p-12 text-white"
          >
            <div className="max-w-2xl w-full">
              <div className="bg-red-600 text-white px-2 py-1 inline-block mb-8 font-bold">FATAL ERROR</div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter">
                This Website Delete By ******
              </h1>
              <div className="space-y-2 opacity-50 text-xs">
                <p>CORE_SEGMENT_FAULT: 0xDEADBEEF</p>
                <p>MEMORY_LEAK_IN_LOGIC_GATE</p>
                <p>TRACES_OF_HUMAN_INTERVENTION_DETECTED</p>
                <p>SYSTEM_PURGE_COMPLETE</p>
              </div>
              <motion.div 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="mt-12 w-4 h-8 bg-white"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
