import { 
  Gauge, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Shield, 
  History, 
  LogOut, 
  Bolt, 
  Trash2, 
  AlertTriangle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { deleteUserAccount } from '../lib/firebase';

interface DashboardProps {
  userName: string;
  onLogout: () => void;
  t: any;
  key?: string;
}

export default function Dashboard({ userName, onLogout, t }: DashboardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    
    setIsDeleting(true);
    setError(null);
    try {
      await deleteUserAccount();
      onLogout();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Security threshold exceeded. Please sign out and sign in again before deleting your account.');
      } else {
        setError('Account synchronization failure. Please try again later.');
      }
      setIsDeleting(false);
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-[440px] flex flex-col gap-8"
    >
      <section className="flex flex-col gap-2">
        <h1 className="text-4xl font-light italic text-on-surface tracking-tight">{t.welcomeBack} {userName}!</h1>
        <p className="text-on-surface-variant font-medium">Your secure workspace is ready.</p>
        
        <motion.div 
          variants={item}
          className="mt-4 rounded-3xl overflow-hidden bg-surface aspect-[16/9] flex items-center justify-center relative border border-border group cursor-pointer"
        >
          <img 
            alt="Workspace" 
            className="absolute inset-0 w-full h-full object-cover opacity-10 transition-transform duration-700 group-hover:scale-110"
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1472&auto=format&fit=crop" 
          />
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <div className="bg-on-surface/5 backdrop-blur-md p-4 rounded-2xl mb-3 border border-border">
              <Bolt className="text-primary w-10 h-10 shadow-glow" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Status</span>
            <span className="font-light italic text-on-surface text-xl">Tactical Ready</span>
          </div>
        </motion.div>
      </section>

      <motion.div 
        variants={item}
        className="bg-card p-6 rounded-2xl border border-border flex flex-col gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-on-surface/5 border border-border flex items-center justify-center">
            <Gauge className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-on-surface tracking-tight">{t.dashboard}</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Throughput: 98.2%</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-4 py-3.5 bg-on-surface/5 rounded-xl border border-border group cursor-pointer hover:bg-on-surface/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-1 rounded-md border border-primary/20">
                <CheckCircle2 className="text-primary w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-on-surface/80">Neural Handshake Multi-Verified</span>
            </div>
          </div>

          <div className="flex justify-between items-center px-4 py-3.5 bg-on-surface/5 rounded-xl border border-border group cursor-pointer hover:bg-on-surface/10 transition-all">
            <div className="flex items-center gap-3">
              <Circle className="text-on-surface/20 w-5 h-5" />
              <span className="text-sm font-medium text-on-surface/40">Initialize MFA Quantum Encryption</span>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface/20 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          variants={item}
          whileHover={{ y: -5 }}
          className="bg-card p-5 rounded-2xl flex flex-col gap-3 group cursor-pointer border border-border hover:border-primary/30 transition-all"
        >
          <div className="bg-on-surface/5 p-2 rounded-xl w-fit border border-border">
            <Shield className="text-primary w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-on-surface uppercase tracking-wider">Privacy</h3>
            <p className="text-[10px] text-on-surface-variant font-bold leading-tight mt-1">Data Governance</p>
          </div>
        </motion.div>

        <motion.div 
          variants={item}
          whileHover={{ y: -5 }}
          className="bg-card p-5 rounded-2xl flex flex-col gap-3 group cursor-pointer border border-border hover:border-orange-500/30 transition-all"
        >
          <div className="bg-on-surface/5 p-2 rounded-xl w-fit border border-border">
            <History className="text-orange-400 w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-on-surface uppercase tracking-wider">Audit</h3>
            <p className="text-[10px] text-on-surface-variant font-bold leading-tight mt-1">Log Immutable History</p>
          </div>
        </motion.div>
      </div>

      <footer className="mt-4 pt-10 border-t border-border flex flex-col items-center gap-4">
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-8 py-3 text-on-surface-variant hover:text-primary hover:bg-on-surface/5 rounded-2xl transition-all font-bold group border border-transparent hover:border-primary/20"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          {t.logout}
        </button>

        <button 
          onClick={() => setShowDeleteModal(true)}
          className="text-xs font-bold text-red-500/50 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-2 py-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t.deleteAccount}
        </button>
      </footer>

      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-red-500/10 p-3 rounded-2xl border border-red-500/20">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteInput('');
                    setError(null);
                  }}
                  className="p-2 hover:bg-on-surface/5 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-on-surface mb-2">{t.confirmDelete}</h2>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                {t.deleteWarning}
              </p>

              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
                    {t.typeToDelete}
                  </label>
                  <input 
                    type="text" 
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="DELETE"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-on-surface/5 focus:border-red-500/50 outline-none text-on-surface font-mono tracking-widest"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button 
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteInput('');
                    }}
                    className="h-12 rounded-xl bg-on-surface/5 text-on-surface font-bold hover:bg-on-surface/10 transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    disabled={deleteInput !== 'DELETE' || isDeleting}
                    onClick={handleDeleteAccount}
                    className="h-12 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-30 disabled:shadow-none"
                  >
                    {isDeleting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    ) : (
                      t.permanentlyDelete
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
