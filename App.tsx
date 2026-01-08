
import React, { useState, useEffect, useRef } from 'react';
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

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'lead' | 'member' | 'completed' | 'team'>('dashboard');
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('workspace_role');
    return (savedRole === 'private' || savedRole === 'public') ? savedRole : null;
  });
  const [passcode, setPasscode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      } else if (passcode === 'team2024') {
        setRole('public');
        setView('dashboard');
      } else {
        alert("Invalid Passcode. Hint: admin123 for Private, team2024 for Public.");
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
    }
  };

  const addTask = (task: Task) => setTasks(prev => [...prev, task]);
  
  const deleteTask = (taskId: string) => {
    if (role !== 'private') {
      alert("Unauthorized: Only Lead access can delete tasks.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const addUpdate = (taskId: string, update: any) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, updates: [...t.updates, update] };
      }
      return t;
    }));
  };

  const addComment = (taskId: string, comment: string) => {
    if (role !== 'private') {
      alert("Unauthorized: Only Lead access can post directives.");
      return;
    }
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, leadComments: [...(t.leadComments || []), comment] };
      }
      return t;
    }));
  };

  const handleUpdateHealth = (taskId: string, health: HealthStatus) => {
    if (role !== 'private') return;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, healthStatus: health } : t));
  };

  const addMember = (name: string) => setTeamMembers(prev => [...prev, name]);
  const removeMember = (name: string) => {
    if (window.confirm(`Remove ${name} from the team roster?`)) {
      setTeamMembers(prev => prev.filter(m => m !== name));
    }
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify({ tasks, teamMembers }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `workspace_full_backup_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
        alert("Data imported successfully!");
      } catch (err) {
        alert("Error parsing JSON file.");
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
    link.setAttribute('download', `workspace_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const activeTasks = tasks.filter(t => t.updates[t.updates.length - 1]?.status !== 'Completed');

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 antialiased font-sans">
        <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-blue-500/20 mb-4">WS</div>
            <h1 className="text-3xl font-black text-white tracking-tight">Work Space</h1>
            <p className="text-slate-400 font-medium italic mt-1">High-Performance Task Tracker</p>
          </div>
          
          <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-2xl space-y-8">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Portal Access Key</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 outline-none font-bold text-slate-800 text-center tracking-widest focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-xl"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
              />
            </div>

            <button 
              type="submit" 
              disabled={isVerifying}
              className={`w-full bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${isVerifying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black hover:shadow-slate-200'}`}
            >
              {isVerifying ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                  Authenticating...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-shield-halved"></i>
                  Unlock Workspace
                </>
              )}
            </button>

            <div className="pt-6 border-t border-slate-100 flex flex-col gap-2">
              <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Tiers</p>
              <div className="flex justify-center gap-6">
                 <div className="text-center">
                    <p className="text-[9px] font-black text-blue-500 uppercase">Private</p>
                    <p className="text-[10px] text-slate-300 font-mono">admin123</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[9px] font-black text-emerald-500 uppercase">Public</p>
                    <p className="text-[10px] text-slate-300 font-mono">team2024</p>
                 </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans text-slate-900 antialiased">
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col shadow-2xl z-20 max-h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-xl font-black shadow-lg shadow-blue-500/20">WS</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Work Space</h1>
            <div className={`text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded inline-block ${role === 'private' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {role === 'private' ? 'Command/Lead' : 'Public/Member'}
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${view === 'dashboard' ? 'bg-blue-600 shadow-lg shadow-blue-600/30 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'lead' ? 'bg-blue-600 shadow-lg shadow-blue-600/30 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                <i className="fa-solid fa-plus-circle"></i>
                <span className="font-semibold text-sm">Assign Tasks</span>
              </button>

              <button 
                onClick={() => setView('team')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'team' ? 'bg-blue-600 shadow-lg shadow-blue-600/30 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                <i className="fa-solid fa-users-gear"></i>
                <span className="font-semibold text-sm">Manage Team</span>
              </button>
            </>
          )}
          
          <button 
            onClick={() => setView('member')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'member' ? 'bg-blue-600 shadow-lg shadow-blue-600/30 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-user-circle"></i>
            <span className="font-semibold text-sm">Member Portal</span>
          </button>

          <button 
            onClick={() => setView('completed')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${view === 'completed' ? 'bg-slate-700 shadow-lg text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-layer-group"></i>
              <span className="font-semibold text-sm">Tasks</span>
            </div>
            {tasks.length > 0 && (
              <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full">{tasks.length}</span>
            )}
          </button>

          {role === 'private' && (
            <div className="pt-6 mt-6 border-t border-slate-800 space-y-4">
              <h4 className="px-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Storage & Export</h4>
              
              <button 
                onClick={exportToJSON}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <i className="fa-solid fa-file-export text-blue-400"></i>
                Save Full Backup
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
                Excel (CSV)
              </button>
            </div>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all group"
          >
            <i className="fa-solid fa-right-from-bracket group-hover:translate-x-1 transition-transform"></i>
            <span className="font-bold text-xs uppercase tracking-widest">Logout Session</span>
          </button>
          <div className="mt-4 flex items-center gap-2 text-[9px] text-slate-600 font-medium px-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span>Live Local Sync</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 bg-[#f8fafc]">
        {view === 'dashboard' && <Dashboard tasks={activeTasks} teamMembers={teamMembers} onAddComment={addComment} onDeleteTask={deleteTask} onUpdateHealth={handleUpdateHealth} isReadOnly={role !== 'private'} />}
        {view === 'lead' && role === 'private' && <LeadView teamMembers={teamMembers} onAddTask={addTask} />}
        {view === 'team' && role === 'private' && <TeamView teamMembers={teamMembers} onAddMember={addMember} onRemoveMember={removeMember} />}
        {view === 'member' && <MemberView tasks={tasks} teamMembers={teamMembers} onAddUpdate={addUpdate} />}
        {view === 'completed' && <CompletedView tasks={tasks} teamMembers={teamMembers} onAddComment={addComment} onDeleteTask={deleteTask} isReadOnly={role !== 'private'} />}
      </main>
    </div>
  );
};

export default App;
