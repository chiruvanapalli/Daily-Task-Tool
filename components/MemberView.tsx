
import React, { useState } from 'react';
import { Task, TEAM_MEMBERS, TeamMember, EODUpdate, TaskStatus } from '../types';

interface MemberViewProps {
  tasks: Task[];
  onAddUpdate: (taskId: string, update: EODUpdate) => void;
}

export const MemberView: React.FC<MemberViewProps> = ({ tasks, onAddUpdate }) => {
  const [selectedUser, setSelectedUser] = useState<TeamMember>(TEAM_MEMBERS[0]);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  
  const [updateForm, setUpdateForm] = useState<Omit<EODUpdate, 'date'>>({
    progress: 0,
    status: 'In Progress',
    workCompleted: '',
    pendingItems: '',
    blockers: '',
    expectedCompletionDate: ''
  });

  const myTasks = tasks.filter(t => t.assignee === selectedUser);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;

    const task = tasks.find(t => t.id === activeTask);
    const lastProgress = task?.updates.length ? task.updates[task.updates.length - 1].progress : 0;

    if (updateForm.progress < lastProgress) {
      alert("Error: Progress cannot decrease!");
      return;
    }

    if (updateForm.status === 'Completed' && updateForm.progress < 100) {
      alert("Error: Status cannot be 'Completed' if progress is less than 100%");
      return;
    }

    if (updateForm.progress < 100 && !updateForm.blockers) {
      if (updateForm.progress < 50) {
         alert("Please mention any blockers or dependencies for tasks under 50% progress.");
         return;
      }
    }

    onAddUpdate(activeTask, {
      ...updateForm,
      date: new Date().toISOString()
    });

    setUpdateForm({
      progress: 0,
      status: 'In Progress',
      workCompleted: '',
      pendingItems: '',
      blockers: '',
      expectedCompletionDate: ''
    });
    setActiveTask(null);
    alert("EOD Update submitted!");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Member Portal</h2>
          <p className="text-slate-500">Submit your mandatory daily status updates</p>
        </div>
        <select 
          className="bg-white border border-slate-200 rounded-lg px-4 py-2 font-bold shadow-sm"
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value as TeamMember)}
        >
          {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Active Tasks</h3>
          {myTasks.length === 0 ? (
            <p className="text-slate-400 italic">No tasks assigned to you yet.</p>
          ) : (
            myTasks.map(t => (
              <button 
                key={t.id}
                onClick={() => setActiveTask(t.id)}
                className={`w-full text-left p-6 rounded-2xl border transition-all ${activeTask === t.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm text-slate-700'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs uppercase font-bold opacity-70 mb-1">{t.project}</p>
                    <h4 className="text-lg font-bold">{t.title}</h4>
                  </div>
                  {t.updates.length > 0 && (
                    <span className="text-[10px] px-2 py-1 rounded bg-white/20 font-bold uppercase">
                      {t.updates[t.updates.length-1].status}
                    </span>
                  )}
                </div>
                <p className="text-sm mt-2 opacity-80">Last Progress: {t.updates.length > 0 ? t.updates[t.updates.length-1].progress : 0}%</p>
              </button>
            ))
          )}
        </section>

        <section>
          {activeTask ? (
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-slate-800 mb-4">EOD Status Form</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={updateForm.status}
                    onChange={e => setUpdateForm({...updateForm, status: e.target.value as TaskStatus})}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Progress ({updateForm.progress}%)</label>
                   <input 
                    type="range" 
                    min="0" max="100" 
                    className="w-full h-8 mt-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    value={updateForm.progress}
                    onChange={e => setUpdateForm({...updateForm, progress: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Work Completed Today</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
                  placeholder="Summarize your achievements..."
                  value={updateForm.workCompleted}
                  onChange={e => setUpdateForm({...updateForm, workCompleted: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Pending Items</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-16"
                  value={updateForm.pendingItems}
                  onChange={e => setUpdateForm({...updateForm, pendingItems: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Dependencies / Blockers</label>
                <input 
                  type="text" 
                  placeholder="What is stopping you? (Leave empty if none)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={updateForm.blockers}
                  onChange={e => setUpdateForm({...updateForm, blockers: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Estimated Completion Date</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={updateForm.expectedCompletionDate}
                  onChange={e => setUpdateForm({...updateForm, expectedCompletionDate: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all shadow-md"
              >
                Submit EOD Update
              </button>
            </form>
          ) : (
            <div className="h-full flex items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 italic">
              Select a task to start your daily update
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
