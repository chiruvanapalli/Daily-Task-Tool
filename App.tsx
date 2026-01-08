
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { MemberView } from './components/MemberView';
import { LeadView } from './components/LeadView';
import { CompletedView } from './components/CompletedView';
import { TeamView } from './components/TeamView';
import { Task, TeamMember, HealthStatus } from './types';

const INITIAL_MEMBERS: TeamMember[] = ['Akhilesh', 'Pravallika', 'Chandu', 'Sharanya'];

const INITIAL_TASKS: Task[] = [
  {
    id: 'demo-task-1',
    title: 'Landing Page Responsive Fixes',
    project: 'Q3 UI Refresh',
    sprint: 'Sprint 24.1',
    category: 'General',
    assignee: 'Akhilesh',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    healthStatus: 'On Track',
    updates: [
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 30,
        status: 'In Progress',
        workCompleted: 'Fixed navigation menu on mobile devices and tablet view.',
        pendingItems: 'Footer alignment issues and hero section image scaling.',
        expectedCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ],
    leadComments: ['Ensure we test on Safari iOS specifically.']
  }
];

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('workspace_team_v1');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('workspace_tasks_v1');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) {
      console.error("Failed to parse local storage", e);
      return INITIAL_TASKS;
    }
  });

  useEffect(() => {
    localStorage.setItem('workspace_tasks_v1', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('workspace_team_v1', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    if (role) {
      localStorage.setItem('workspace_role', role);
    } else {
      localStorage.removeItem('workspace_role');
    }
  }, [role]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    setTimeout(() => {
      if (passcode === 'admin123') {
        setRole('private');
        setView('dashboard');
        showToast("Authenticated as Lead", "success");
      } else if (passcode === 'team2024') {
        setRole('public');
        setView('dashboard');
        showToast("Authenticated as Member", "success");
      } else {
        showToast("Invalid Passcode.", "error");
      }
      setIsVerifying(false);
    }, 400);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      setRole(null);
      setPasscode('');
      setView('dashboard');
      localStorage.removeItem('workspace_role');
      showToast("Logged out successfully", "info");
    }
  };

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    showToast("Task assigned successfully", "success");
  };
  
  const deleteTask = (taskId: string) => {
    if (role !== 'private') {
      showToast("Unauthorized action", "error");
      return;
    }
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showToast("Task deleted", "info");
    }
  };

  const addUpdate = (taskId: string, update: any) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, updates: [...t.updates, update] };
      }
      return t;
    }));
    showToast("EOD update submitted", "success");
  };

  const addComment = (taskId: string, comment: string) => {
    if (role !== 'private') {
      showToast("Unauthorized action", "error");
      return;
    }
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, leadComments: [...(t.leadComments || []), comment] };
      }
      return t;
    }));
    showToast("Directive posted", "success");
  };

  const handleUpdateHealth = (taskId: string, health: HealthStatus) => {
    if (role !== 'private') return;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, healthStatus: health } : t));
    showToast(`Health updated to ${health}`, "info");
  };

  const addMember = (name: string) => {
    setTeamMembers(prev => [...prev, name]);
    showToast(`${name} added to team`, "success");
  };

  const removeMember = (name: string) => {
    if (window.confirm(`Remove ${name}?`)) {
      setTeamMembers(prev => prev.filter(m => m !== name));
      showToast("Member removed", "info");
    }
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify({ tasks, teamMembers }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `workspace_backup_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showToast("Full backup exported", "success");
  };

  const importJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.tasks && json.teamMembers) {
          setTasks(json.tasks);
          setTeamMembers(json.teamMembers);
        } else if (Array.isArray(json)) {
          setTasks(json);
        }
        showToast("Imported successfully!", "success");
      } catch (err) {
        showToast("Error parsing file.", "error");
      }
    };
    reader.readAsText(file);
  };

  const exportToExcel = () => {
    const headers = ['Project', 'Sprint', 'Task Title', 'Assignee', 'Start Date', 'Target Date', 'Progress', 'Status', 'Last Update Work', 'Blockers', 'Health'];
    const rows = tasks.map(t => {
      const latest = t.updates[t.updates.length - 1];
      return [
        t.project,
        t.sprint || '',
        t.title,
        t.assignee,
        t.startDate,
        t.targetDate,
        `${latest?.progress || 0}%`,
        latest?.status || 'Assigned',
        `"${(latest?.workCompleted || '').replace(/"/g, '""')}"`,
        `"${(latest?.blockers || '').replace(/"/g, '""')}"`,
        t.healthStatus || 'Not Set'
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    showToast("CSV report generated", "success");
  };

  const activeTasks = tasks.filter(t => t.updates[t.updates.length - 1]?.status !== 'Completed');

  const renderToasts = () => (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`pointer-events-auto min-w-[320px] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-4 transition-all duration-500 transform animate-in slide-in-from-right-full fade-in zoom-in-95 ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
            toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-900' :
            'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 shadow-inner ${
            toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-600' :
            toast.type === 'error' ? 'bg-red-500/20 text-red-600' :
            'bg-white/10 text-white'
          }`}>
            <i className={`fa-solid ${
              toast.type === 'success' ? 'fa-circle-check' :
              toast.type === 'error' ? 'fa-circle-exclamation' :
              'fa-circle-info'
            }`}></i>
          </div>
          <p className="font-bold text-sm flex-1 leading-snug">{toast.message}</p>
          <button 
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5 opacity-40 hover:opacity-100 transition-all shrink-0"
          >
            <i className="fa-solid fa-xmark text-[10px]"></i>
          </button>
        </div>
      ))}
    </div>
  );

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 antialiased font-sans">
        <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-blue-500/20 mb-4">WS</div>
            <h1 className="text-3xl font-black text-white tracking-tight">Work Space</h1>
            <p className="text-slate-400 font-medium italic mt-1">Task Tracker</p>
          </div>
          
          <form onSubmit={handleLogin} className="bg-white p-10 rounded-xl shadow-2xl space-y-8">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Enter Passcode</label>
              <input 
                type="password" 
                placeholder="Enter" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-5 outline-none font-bold text-slate-800 text-center tracking-widest focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-xl"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
              />
            </div>

            <button 
              type="submit" 
              disabled={isVerifying}
              className={`w-full bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${isVerifying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black'}`}
            >
              {isVerifying ? 'Verifying...' : 'Unlock Workspace'}
            </button>
          </form>
        </div>
        {renderToasts()}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans text-slate-900 antialiased relative">
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col shadow-2xl z-20 max-h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-xl font-black shadow-lg shadow-blue-500/20">WS</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Work Space</h1>
            <div className={`text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded inline-block ${role === 'private' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {role === 'private' ? 'Lead' : 'Member'}
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${view === 'dashboard' ? 'bg-blue-600 shadow-lg shadow-blue-600/30 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-chart-pie"></i>
              <span className="font-semibold text-sm">Dashboard</span>
            </div>
          </button>
          
          {role === 'private' && (
            <>
              <button 
                onClick={() => setView('lead')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${view === 'lead' ? 'bg-blue-600 shadow-lg shadow-blue-600/30 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                <i className="fa-solid fa-circle-plus"></i>
                <span className="font-semibold text-sm">Assign Tasks</span>
              </button>

              <button 
                onClick={() => setView('team')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${view === 'team' ? 'bg-blue-600 shadow-lg shadow-blue-600/30 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                <i className="fa-solid fa-users-gear"></i>
                <span className="font-semibold text-sm">Manage Team</span>
              </button>
            </>
          )}
          
          <button 
            onClick={() => setView('member')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${view === 'member' ? 'bg-blue-600 shadow-lg shadow-blue-600/30 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-circle-user"></i>
            <span className="font-semibold text-sm">Member Portal</span>
          </button>

          <button 
            onClick={() => setView('completed')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${view === 'completed' ? 'bg-slate-700 shadow-lg text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-layer-group"></i>
              <span className="font-semibold text-sm">Tasks</span>
            </div>
          </button>

          {role === 'private' && (
            <div className="pt-6 mt-6 border-t border-slate-800 space-y-4">
              <button 
                onClick={exportToJSON}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <i className="fa-solid fa-file-export text-blue-400"></i>
                Export Backup
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <i className="fa-solid fa-file-import text-orange-400"></i>
                Import JSON
              </button>
              <input type="file" ref={fileInputRef} onChange={importJSON} accept=".json" className="hidden" />
              <button 
                onClick={exportToExcel}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <i className="fa-solid fa-file-excel text-emerald-400"></i>
                Export CSV
              </button>
            </div>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all group"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span className="font-bold text-xs uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 bg-[#f8fafc]">
        {view === 'dashboard' && <Dashboard tasks={activeTasks} teamMembers={teamMembers} onAddComment={addComment} onDeleteTask={deleteTask} onUpdateHealth={handleUpdateHealth} isReadOnly={role !== 'private'} />}
        {view === 'lead' && role === 'private' && <LeadView teamMembers={teamMembers} onAddTask={addTask} showToast={showToast} />}
        {view === 'team' && role === 'private' && <TeamView teamMembers={teamMembers} onAddMember={addMember} onRemoveMember={removeMember} showToast={showToast} />}
        {view === 'member' && <MemberView tasks={tasks} teamMembers={teamMembers} onAddUpdate={addUpdate} showToast={showToast} />}
        {view === 'completed' && <CompletedView tasks={tasks} teamMembers={teamMembers} onAddComment={addComment} onDeleteTask={deleteTask} isReadOnly={role !== 'private'} />}
      </main>

      {renderToasts()}
    </div>
  );
};

export default App;
