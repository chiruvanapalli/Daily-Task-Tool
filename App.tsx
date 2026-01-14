
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { MemberView } from './components/MemberView';
import { LeadView } from './components/LeadView';
import { CompletedView } from './components/CompletedView';
import { TeamView } from './components/TeamView';
import { Task, TeamMember, HealthStatus } from './types';

// Replace the placeholder URL with your actual deployed backend URL (e.g., from Render or Heroku)
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://your-production-backend-url.com/api'; 

const SYNC_INTERVAL = 5000;

type UserRole = 'private' | 'public' | null;
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'lead' | 'member' | 'completed' | 'team'>('dashboard');
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('workspace_role');
    return (savedRole === 'private' || savedRole === 'public') ? savedRole : null;
  });
  const [passcode, setPasscode] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/data`);
      if (!response.ok) throw new Error("Server unreachable");
      const data = await response.json();
      setTasks(data.tasks || []);
      setTeamMembers(data.teamMembers || []);
      setIsLoading(false);
    } catch (err) {
      console.warn("Backend not found. Falling back to empty state.");
    }
  };

  const syncWithServer = async (updatedTasks: Task[], updatedMembers: TeamMember[]) => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: updatedTasks,
          teamMembers: updatedMembers,
          passcode: passcode || (role === 'private' ? 'admin123' : 'team2024')
        })
      });
      if (!response.ok) throw new Error("Sync Failed");
      setIsSyncing(false);
    } catch (err) {
      setIsSyncing(false);
      showToast("Sync Error: Is your backend running?", "error");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'admin123') {
      setRole('private');
      localStorage.setItem('workspace_role', 'private');
      showToast("Admin Authorized", "success");
    } else if (passcode === 'team2024') {
      setRole('public');
      localStorage.setItem('workspace_role', 'public');
      showToast("Team Authorized", "success");
    } else {
      showToast("Access Denied", "error");
    }
  };

  const handleLogout = () => {
    setRole(null);
    setPasscode('');
    localStorage.removeItem('workspace_role');
  };

  const updateTaskTS = (t: Task): Task => ({ ...t, updatedAt: Date.now() });

  const addTask = (task: Task) => {
    const newTasks = [...tasks, updateTaskTS(task)];
    setTasks(newTasks);
    syncWithServer(newTasks, teamMembers);
  };

  const deleteTask = (taskId: string) => {
    if (window.confirm("Erase workstream?")) {
      const newTasks = tasks.filter(t => t.id !== taskId);
      setTasks(newTasks);
      syncWithServer(newTasks, teamMembers);
    }
  };

  const addUpdate = (taskId: string, update: any) => {
    const newTasks = tasks.map(t => t.id === taskId ? updateTaskTS({
      ...t,
      updates: [...t.updates, { ...update, updatedAt: Date.now() }]
    }) : t);
    setTasks(newTasks);
    syncWithServer(newTasks, teamMembers);
  };

  const addComment = (taskId: string, comment: string) => {
    const newTasks = tasks.map(t => t.id === taskId ? updateTaskTS({
      ...t,
      leadComments: [...(t.leadComments || []), comment]
    }) : t);
    setTasks(newTasks);
    syncWithServer(newTasks, teamMembers);
  };

  const handleUpdateHealth = (taskId: string, health: HealthStatus) => {
    const newTasks = tasks.map(t => t.id === taskId ? updateTaskTS({ ...t, healthStatus: health }) : t);
    setTasks(newTasks);
    syncWithServer(newTasks, teamMembers);
  };

  const addMember = (name: string) => {
    const newMembers = [...teamMembers, name];
    setTeamMembers(newMembers);
    syncWithServer(tasks, newMembers);
  };

  const removeMember = (name: string) => {
    const newMembers = teamMembers.filter(m => m !== name);
    setTeamMembers(newMembers);
    syncWithServer(tasks, newMembers);
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 antialiased font-sans">
        <div className="max-w-sm w-full animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl mb-6">WS</div>
            <h1 className="text-3xl font-black text-white">Work Space</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 text-center leading-relaxed">Centralized Task Reporting<br/>Enterprise Portal</p>
          </div>
          <form onSubmit={handleLogin} className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-white/5 space-y-8 backdrop-blur-md">
            <input 
              type="password" placeholder="Passcode" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none font-bold text-white text-center text-3xl focus:border-blue-500 transition-all placeholder:text-slate-700"
              value={passcode} onChange={(e) => setPasscode(e.target.value)} autoFocus
            />
            <button type="submit" className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-blue-500 transition-all shadow-xl active:scale-95">Verify Access</button>
          </form>
        </div>
      </div>
    );
  }

  const activeTasks = tasks.filter(t => t.updates[t.updates.length - 1]?.status !== 'Completed');

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc] font-sans">
      <aside className="w-full md:w-80 bg-slate-950 text-white p-8 flex flex-col shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-14">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg">WS</div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none">Work Space</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Active</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}>
            <i className="fa-solid fa-house"></i><span className="font-bold text-sm">Dashboard</span>
          </button>
          {role === 'private' && (
            <>
              <button onClick={() => setView('lead')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'lead' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}>
                <i className="fa-solid fa-plus"></i><span className="font-bold text-sm">Assign</span>
              </button>
              <button onClick={() => setView('team')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'team' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}>
                <i className="fa-solid fa-users"></i><span className="font-bold text-sm">Team</span>
              </button>
            </>
          )}
          <button onClick={() => setView('member')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'member' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}>
            <i className="fa-solid fa-user"></i><span className="font-bold text-sm">Member Portal</span>
          </button>
          <button onClick={() => setView('completed')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${view === 'completed' ? 'bg-slate-800 text-white' : 'hover:bg-white/5 text-slate-400'}`}>
            <i className="fa-solid fa-archive"></i><span className="font-bold text-sm">Archive</span>
          </button>
        </nav>

        <div className="mt-auto pt-10">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 text-slate-500 hover:text-red-400 transition-all">
            <i className="fa-solid fa-sign-out"></i>
            <span className="font-black text-[11px] uppercase tracking-widest">Terminate Session</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto p-10 lg:p-16 relative">
        {isLoading && tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center px-6 leading-relaxed">
              Polling External API...<br/>
              <span className="text-[10px] lowercase font-normal italic opacity-60">Connecting to {API_BASE_URL}</span>
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            {view === 'dashboard' && <Dashboard tasks={activeTasks} teamMembers={teamMembers} onAddComment={addComment} onDeleteTask={deleteTask} onUpdateHealth={handleUpdateHealth} isReadOnly={role !== 'private'} />}
            {view === 'lead' && role === 'private' && <LeadView teamMembers={teamMembers} onAddTask={addTask} showToast={showToast} />}
            {view === 'team' && role === 'private' && <TeamView teamMembers={teamMembers} onAddMember={addMember} onRemoveMember={removeMember} showToast={showToast} />}
            {view === 'member' && <MemberView tasks={tasks} teamMembers={teamMembers} onAddUpdate={addUpdate} showToast={showToast} />}
            {view === 'completed' && <CompletedView tasks={tasks} teamMembers={teamMembers} onAddComment={addComment} onDeleteTask={deleteTask} isReadOnly={role !== 'private'} />}
          </div>
        )}
      </main>

      <div className="fixed bottom-10 right-10 z-[100] flex flex-col gap-4">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white shadow-slate-900/40'
          }`}>
            <p className="font-bold text-sm tracking-tight">{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
