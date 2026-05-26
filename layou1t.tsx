import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { useTheme } from '../lib/theme-context';
import { useUsage } from '../lib/use-usage';
import { FileText, CreditCard, LogOut, Moon, Sun, LayoutDashboard } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { getUsageDisplay } = useUsage();
  const location = useLocation();
  const navigate = useNavigate();
  const usage = getUsageDisplay();
  const handleSignOut = async () => { await signOut(); navigate('/'); };
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950">
      <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Resume Tailor AI</span>
            </Link>
            <div className="flex items-center gap-6">
              {user && (
                <div className="hidden sm:flex items-center gap-4">
                  <Link to="/dashboard" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/dashboard') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <LayoutDashboard className="w-4 h-4" />Dashboard
                  </Link>
                  {usage && <div className="px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">{usage.used}/{usage.limit} free tailors used</div>}
                  {profile?.subscription_tier === 'pro' && <div className="px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">Pro Unlimited</div>}
                </div>
              )}
              <button onClick={toggleDarkMode} className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="hidden md:block text-sm text-slate-600 dark:text-slate-400">{profile?.email}</span>
                  <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/pricing" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/pricing') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <CreditCard className="w-4 h-4" />Pricing
                  </Link>
                  <Link to="/auth" className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-medium shadow-lg shadow-emerald-500/25 transition-all">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Resume Tailor AI - Tailor your CV for every job in seconds</p>
        </div>
      </footer>
    </div>
  );
}
