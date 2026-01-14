
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { MemberView } from '@/components/MemberView';
import { LeadView } from '@/components/LeadView';
import { CompletedView } from '@/components/CompletedView';
import { TeamView } from '@/components/TeamView';
import { Task, TeamMember, HealthStatus } from '@/types';

const SYNC_INTERVAL = 5000;

export default function Page() {
  const [view, setView] = useState<'dashboard' | 'lead' | 'member' | 'completed' | 'team'>('dashboard');
  const [role, setRole] = useState<'private' | 'public' | null>(null);
  const [passcode, setPasscode] = useState('');
  const [toasts, setToasts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('workspace_role');
    if (savedRole === 'private' || savedRole === 'public') setRole(savedRole as any);
  }, []);

  const showToast = useCallback((message: string, type: string = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        setTeamMembers(data.teamMembers || []);
      }
      setIsLoading(false);
    } catch (err) {
      console.warn("Retrying sync...");
    }
  };

  const syncWithServer = async (updatedTasks: Task[], updatedMembers: TeamMember[]) => {
    setIsSyncing(true);
    try {
      const authCode = passcode || (role === 'private' ? 'admin123' : 'team2024');
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: updatedTasks,
          teamMembers: updatedMembers,
          passcode: authCode
        })
      });
      setIsSyncing(false);
    } catch (err) {
      setIsSyncing(false);
      showToast("Cloud sync failed", "error");
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
      showToast("Admin Access Granted", "success");
    } else if (passcode === 'team2024') {
      setRole('public');
      localStorage.setItem('workspace_role', 'public');
      showToast("Team Access Granted", "success");
    } else {
      showToast("Invalid Passcode", "error");
    }
  };

  const handleLogout = () => {
    setRole(null);
    setPasscode('');
    localStorage.removeItem('workspace_role');
  };

  const addTask = (task: Task) => {
    const newTasks = [...tasks, { ...task, updatedAt: Date.now() }];
    setTasks(newTasks);
    syncWithServer(newTasks, teamMembers);
  };

  const addUpdate = (taskId: string, update: any) => {
    const newTasks = tasks.map(t => t.id === taskId ? {
      ...t,
      updatedAt: Date.now(),
      updates: [...t.updates, { ...update, updatedAt: Date.now() }]
    } : t);
    setTasks(newTasks);
    syncWithServer(newTasks, teamMembers);
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 antialiased">
        <div className="max-w-sm w-full">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-2xl mb-6">WS</div>
            <h1 className="text-3xl font-black text-white">Work Space</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Enterprise Portal</p>
          </div>
          <form onSubmit={handleLogin} className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 space-y-6 backdrop-blur-md">
            <input 
              type="password" placeholder="Passcode" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-2xl font-bold text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-800"
              value={passcode} onChange={(e) => setPasscode(e.target.value)} autoFocus
            />
            <button type="submit" className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-blue-500 transition-all shadow-lg active:scale-95">Verify</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className="w-full md:w-72 bg-slate-950 text-white p-6 flex flex-col shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black">WS</div>
          <h2 className="font-black text-lg">Work Space</h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-blue-600' : 'hover:bg-white/5 text-slate-400'}`}>
            <i className="fa-solid fa-house"></i><span className="font-bold text-sm">Dashboard</span>
          </button>
          {role === 'private' && (
            <button onClick={() => setView('lead')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${view === 'lead' ? 'bg-blue-600' : 'hover:bg-white/5 text-slate-400'}`}>
              <i className="fa-solid fa-plus"></i><span className="font-bold text-sm">Assign</span>
            </button>
          )}
          <button onClick={() => setView('member')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${view === 'member' ? 'bg-blue-600' : 'hover:bg-white/5 text-slate-400'}`}>
            <i className="fa-solid fa-user-edit"></i><span className="font-bold text-sm">Reports</span>
          </button>
          <button onClick={() => setView('completed')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${view === 'completed' ? 'bg-blue-600' : 'hover:bg-white/5 text-slate-400'}`}>
            <i className="fa-solid fa-archive"></i><span className="font-bold text-sm">Archive</span>
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-400 transition-all font-black text-xs uppercase tracking-widest">
          <i className="fa-solid fa-sign-out"></i> Logout
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        {view === 'dashboard' && <Dashboard tasks={tasks.filter(t => t.updates[t.updates.length-1]?.status !== 'Completed')} teamMembers={teamMembers} onAddComment={() => {}} onDeleteTask={() => {}} isReadOnly={role !== 'private'} />}
        {view === 'lead' && <LeadView teamMembers={teamMembers} onAddTask={addTask} showToast={showToast} />}
        {view === 'member' && <MemberView tasks={tasks} teamMembers={teamMembers} onAddUpdate={addUpdate} showToast={showToast} />}
        {view === 'completed' && <CompletedView tasks={tasks} teamMembers={teamMembers} onAddComment={() => {}} onDeleteTask={() => {}} />}
      </main>

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-5 py-3 rounded-xl shadow-2xl text-white font-bold text-sm animate-in slide-in-from-right ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-slate-900'}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
