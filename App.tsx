
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { MemberView } from './components/MemberView';
import { LeadView } from './components/LeadView';
import { CompletedView } from './components/CompletedView';
import { Task } from './types';

const INITIAL_TASKS: Task[] = [
  {
    id: 'demo-task-1',
    title: 'Landing Page Responsive Fixes',
    project: 'Q3 UI Refresh',
    assignee: 'Akhilesh',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'lead' | 'member' | 'completed'>('dashboard');
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('trackjs_tasks_v1');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) {
      console.error("Failed to parse local storage", e);
      return INITIAL_TASKS;
    }
  });

  useEffect(() => {
    localStorage.setItem('trackjs_tasks_v1', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Task) => setTasks(prev => [...prev, task]);
  
  const addUpdate = (taskId: string, update: any) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, updates: [...t.updates, update] };
      }
      return t;
    }));
  };

  const addComment = (taskId: string, comment: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, leadComments: [...(t.leadComments || []), comment] };
      }
      return t;
    }));
  };

  const completedCount = tasks.filter(t => t.updates[t.updates.length - 1]?.status === 'Completed').length;
  const activeTasks = tasks.filter(t => t.updates[t.updates.length - 1]?.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.updates[t.updates.length - 1]?.status === 'Completed');

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans text-slate-900">
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col shadow-2xl z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-xl font-black shadow-lg shadow-blue-500/20">JS</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">TrackJS</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Team Monitor</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${view === 'dashboard' ? 'bg-blue-600 shadow-lg shadow-blue-600/30 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-chart-pie"></i>
              <span className="font-semibold">Dashboard</span>
            </div>
          </button>
          
          <button 
            onClick={() => setView('lead')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'lead' ? 'bg-blue-600 shadow-lg shadow-blue-600/30 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-plus-circle"></i>
            <span className="font-semibold">Assign Tasks</span>
          </button>
          
          <button 
            onClick={() => setView('member')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'member' ? 'bg-blue-600 shadow-lg shadow-blue-600/30 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-user-circle"></i>
            <span className="font-semibold">Member Portal</span>
          </button>

          <div className="pt-4 mt-4 border-t border-slate-800">
             <button 
              onClick={() => setView('completed')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${view === 'completed' ? 'bg-emerald-600 shadow-lg shadow-emerald-600/30 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-folder-closed"></i>
                <span className="font-semibold">Completed</span>
              </div>
              {completedCount > 0 && (
                <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full">{completedCount}</span>
              )}
            </button>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 text-[10px] text-slate-500 font-medium">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span>Local Storage Active</span>
          </div>
          <p>© 2024 TrackJS Engine</p>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 bg-[#f8fafc]">
        {view === 'dashboard' && <Dashboard tasks={activeTasks} onAddComment={addComment} />}
        {view === 'lead' && <LeadView onAddTask={addTask} />}
        {view === 'member' && <MemberView tasks={tasks} onAddUpdate={addUpdate} />}
        {view === 'completed' && <CompletedView tasks={completedTasks} onAddComment={addComment} />}
      </main>
    </div>
  );
};

export default App;
