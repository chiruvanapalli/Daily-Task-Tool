
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { MemberView } from './components/MemberView';
import { LeadView } from './components/LeadView';
import { Task, Project } from './types';

// Adding a sample task for demonstration
const INITIAL_TASKS: Task[] = [
  {
    id: 'demo-task-1',
    title: 'Landing Page Responsive Fixes',
    project: 'Q3 UI Refresh',
    assignee: 'Akhilesh',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
    targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
    updates: [
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 30,
        // Fixed missing 'status' property in type 'EODUpdate'
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
  const [view, setView] = useState<'dashboard' | 'lead' | 'member'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('task_tracker_data');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  useEffect(() => {
    localStorage.setItem('task_tracker_data', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Task) => setTasks([...tasks, task]);
  
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col shadow-xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-xl font-bold">FT</div>
          <h1 className="text-xl font-bold tracking-tight">TrackJS</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <i className="fa-solid fa-chart-line"></i>
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setView('lead')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'lead' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <i className="fa-solid fa-plus"></i>
            <span className="font-medium">Assign Tasks</span>
          </button>
          
          <button 
            onClick={() => setView('member')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'member' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <i className="fa-solid fa-user-edit"></i>
            <span className="font-medium">Member Portal</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 text-xs text-slate-500">
          <p>© 2024 Frontend Tracker</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8">
        {view === 'dashboard' && <Dashboard tasks={tasks} onAddComment={addComment} />}
        {view === 'lead' && <LeadView onAddTask={addTask} />}
        {view === 'member' && <MemberView tasks={tasks} onAddUpdate={addUpdate} />}
      </main>
    </div>
  );
};

export default App;
