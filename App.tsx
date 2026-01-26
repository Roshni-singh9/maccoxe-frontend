
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  LogOut,
  ChevronRight,
  ChevronLeft,
  Search,
  Cpu,
  Database,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Zap,
  Menu
} from 'lucide-react';
import { DocumentType, SavedDocument } from './types';
import { DOC_TEMPLATES } from './constants';
import DocumentEditor from './components/DocumentEditor';

// Global types for AI Studio environment
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('it_docgen_auth') === 'true';
    } catch (e) {
      return false;
    }
  });
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [view, setView] = useState<'dashboard' | 'history'>('dashboard');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);
  const [selectedSavedDoc, setSelectedSavedDoc] = useState<SavedDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedDocs, setSavedDocs] = useState<SavedDocument[]>([]);
  const [isMainSidebarCollapsed, setIsMainSidebarCollapsed] = useState(false);
  
  const [appName] = useState(() => {
    try { return localStorage.getItem('it_docgen_app_name') || 'MACCOXE'; } catch(e) { return 'MACCOXE'; }
  });
  const [appSlogan] = useState(() => {
    try { return localStorage.getItem('it_docgen_app_slogan') || 'Professional Suite'; } catch(e) { return 'Professional Suite'; }
  });
  const [appLogo] = useState(() => {
    try { return localStorage.getItem('it_docgen_app_logo') || ''; } catch(e) { return ''; }
  });
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      try {
        const history = localStorage.getItem('it_docgen_history');
        if (history) {
          setSavedDocs(JSON.parse(history));
        }
      } catch (e) {
        setSavedDocs([]);
      }
    }
  }, [view, selectedDocType, isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    setTimeout(() => {
      if (loginEmail === 'admin@maccoxe.in' && loginPassword === 'admin123') {
        localStorage.setItem('it_docgen_auth', 'true');
        setIsAuthenticated(true);
      } else {
        setLoginError('Invalid credentials. Please use admin@maccoxe.in / admin123');
      }
      setIsLoggingIn(false);
    }, 800);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('it_docgen_auth');
      setIsAuthenticated(false);
      setView('dashboard');
      setSelectedDocType(null);
    }
  };

  const filteredTemplates = DOC_TEMPLATES.filter(t => 
    t.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBackFromEditor = () => {
    setSelectedDocType(null);
    setSelectedSavedDoc(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
            <div className="p-10 pt-12">
              <div className="flex flex-col items-center mb-10">
                <div className="w-16 h-16 bg-[#e11d48] rounded-[1.25rem] flex items-center justify-center shadow-xl mb-6 overflow-hidden p-2">
                  {appLogo ? <img src={appLogo} className="w-full h-full object-contain" /> : <Cpu className="text-white w-8 h-8" />}
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{appName}</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{appSlogan}</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Identity</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
                    <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="admin@maccoxe.in" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
                    <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                {loginError && <p className="text-[11px] font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{loginError}</p>}
                <button type="submit" disabled={isLoggingIn} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 mt-4 active:scale-95 transition-transform">
                  {isLoggingIn ? <Loader2 className="animate-spin w-4 h-4" /> : <>Secure Sign In <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If a document type is selected, we show the Editor view which handles its own sidebar
  if (selectedDocType) {
    return (
      <DocumentEditor 
        type={selectedDocType} 
        initialDoc={selectedSavedDoc || undefined}
        onBack={handleBackFromEditor}
        appBranding={{ name: appName, logo: appLogo, slogan: appSlogan }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`bg-white border-r border-slate-200 flex flex-col h-screen shadow-xl z-50 transition-all duration-300 ease-in-out relative ${isMainSidebarCollapsed ? 'w-0 opacity-0 -translate-x-full' : 'w-72 translate-x-0 opacity-100'}`}>
        <div className="p-8 flex items-start justify-between">
          <div className="flex items-center gap-3 w-full overflow-hidden">
            <div className="w-10 h-10 bg-[#e11d48] rounded-xl flex items-center justify-center shadow-lg shrink-0 overflow-hidden p-1.5">
              {appLogo ? <img src={appLogo} className="w-full h-full object-contain" /> : <Cpu className="text-white w-6 h-6" />}
            </div>
            <div className="flex-1 whitespace-nowrap overflow-hidden">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight block leading-none">{appName}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">{appSlogan}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsMainSidebarCollapsed(true)}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors ml-2"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-hidden">
          <button onClick={() => setView('dashboard')} className={`flex items-center w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><LayoutDashboard className="w-5 h-5 mr-3" />Templates</button>
          <button onClick={() => setView('history')} className={`flex items-center w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${view === 'history' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}><Database className="w-5 h-5 mr-3" />Vault</button>
          <div className="pt-4 mt-4 border-t border-slate-100">
             <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-50 hover:text-red-600 transition-all whitespace-nowrap"><LogOut className="w-5 h-5 mr-3" />Sign Out</button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            {isMainSidebarCollapsed && (
              <button 
                onClick={() => setIsMainSidebarCollapsed(false)}
                className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex-1 max-w-xl relative">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
              <input type="text" placeholder="Search templates..." className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-6 ml-4">
             <div className="hidden sm:flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Active</span>
             </div>
             <div className="w-10 h-10 rounded-xl bg-indigo-100 border-2 border-indigo-200 overflow-hidden shrink-0">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`} alt="User" />
             </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {view === 'dashboard' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.type} onClick={() => setSelectedDocType(template.type)} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all cursor-pointer">
                  <div className="w-14 h-14 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {template.icon}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">{template.type}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">{template.description}</p>
                  <span className="text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">Generate <ChevronRight size={14} /></span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900 mb-8">Document Vault</h2>
              {savedDocs.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border border-dashed border-slate-200">
                  <Database size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold">No documents saved in your vault yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {savedDocs.map((doc) => (
                    <div 
                      key={doc.id} 
                      onClick={() => { setSelectedSavedDoc(doc); setSelectedDocType(doc.type); }}
                      className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <LayoutDashboard size={20} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900">{doc.type}</h4>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{doc.recipientName} • {new Date(doc.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
