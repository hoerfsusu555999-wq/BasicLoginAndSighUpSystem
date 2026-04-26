import { Moon, Sun, ChevronDown, Languages } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: string) => void;
}

export default function Navbar({ theme, toggleTheme, language, setLanguage }: NavbarProps) {
  const languages = ['English', 'ภาษาไทย', '日本語'];

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-10 h-16 bg-surface/50 backdrop-blur-md border-b border-border shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
          S
        </div>
        <span className="font-bold text-lg tracking-tight text-on-surface whitespace-nowrap">
          Symmetry Auth
        </span>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 hover:bg-on-surface/5 rounded-lg transition-colors border border-border"
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-on-surface-variant" />
          )}
        </motion.button>
        
        <div className="h-6 w-px bg-border hidden sm:block"></div>
        
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-on-surface/5 rounded-lg transition-colors border border-border">
            <Languages className="w-4 h-4 text-on-surface-variant" />
            <span className="text-sm font-medium text-on-surface/80 min-w-[60px]">{language}</span>
            <ChevronDown className="w-4 h-4 text-on-surface-variant group-hover:rotate-180 transition-transform" />
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-40 bg-surface border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-primary/10 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
