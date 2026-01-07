
import React, { useState } from 'react';
import { Task } from '../types';

interface DashboardProps {
  tasks: Task[];
  onAddComment: (id: string, comment: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, onAddComment }) => {
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});

  const calculateFlag = (task: Task) => {
    const start = new Date(task.startDate).getTime();
    const target = new Date(task.targetDate).getTime();
    const now = new Date().getTime();
    
    const totalDuration = target - start;
    const elapsed = now - start;
    
    // Expected progress based on current time
    const plannedProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const latestUpdate = task.updates[task.updates.length - 1];
    const actualProgress = latestUpdate ? latestUpdate.progress : 0;

    // If completed, always green
    if (latestUpdate?.status === 'Completed') {
      return { label: 'Completed', color: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', icon: 'fa-check-circle', flagColor: 'text-emerald-500' };
    }

    // Priority 1: Blockers explicitly mentioned
    if (latestUpdate?.blockers && latestUpdate.blockers.trim() !== "") {
      return { label: 'Delayed (Blocked)', color: 'bg-red-100 text-red-800', dot: 'bg-red-500', icon: 'fa-flag', flagColor: 'text-red-600' };
    }

    // Priority 2: Critical delay (more than 20% behind)
    if (actualProgress < plannedProgress - 20) {
      return { label: 'Delayed', color: 'bg-red-100 text-red-800', dot: 'bg-red-500', icon: 'fa-flag', flagColor: 'text-red-600' };
    }

    // Priority 3: Minor delay (between 5% and 20% behind)
    if (actualProgress < plannedProgress - 5) {
      return { label: 'At Risk', color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', icon: 'fa-flag', flagColor: 'text-orange-500' };
    }

    // Priority 4: On Track
    return { label: 'On Track', color: 'bg-green-100 text-green-800', dot: 'bg-green-500', icon: 'fa-flag', flagColor: 'text-green-600' };
  };

  const getStatusBadgeStyles = (status?: string) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-600 text-white';
      case 'In Review': return 'bg-indigo-600 text-white';
      case 'In Progress': return 'bg-blue-600 text-white';
      default: return 'bg-slate-400 text-white';
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Team Progress Dashboard</h2>
          <p className="text-slate-500">Real-time status tracking with automated flag alerts</p>
        </div>
        <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> On Track</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> At Risk</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Delayed</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {tasks.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-400 italic">No tasks assigned yet. Go to "Assign Tasks" to begin.</p>
          </div>
        ) : (
          tasks.map(task => {
            const flag = calculateFlag(task);
            const latest = task.updates[task.updates.length - 1];
            
            return (
              <div key={task.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:border-slate-300 transition-all">
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div className="flex gap-4">
                      <div className={`mt-1 text-2xl ${flag.flagColor}`}>
                        <i className={`fa-solid ${flag.icon}`}></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">{task.project}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm ${getStatusBadgeStyles(latest?.status)}`}>
                            {latest?.status || 'Assigned'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mt-1">{task.title}</h3>
                        <p className="text-sm text-slate-500">Assigned to: <span className="font-semibold text-slate-700">{task.assignee}</span></p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${flag.color} shadow-sm border border-current opacity-90`}>
                      <span className={`w-2 h-2 rounded-full ${flag.dot}`}></span>
                      {flag.label}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1 uppercase font-bold tracking-tighter">Current Progress</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-500 ${flag.flagColor.replace('text', 'bg')}`} style={{ width: `${latest?.progress || 0}%` }}></div>
                        </div>
                        <span className="text-sm font-bold">{latest?.progress || 0}%</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1 uppercase font-bold tracking-tighter">Target Date</p>
                      <p className="text-sm font-bold text-slate-700">
                        <i className="fa-regular fa-calendar-check mr-2 opacity-50"></i>
                        {new Date(task.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1 uppercase font-bold tracking-tighter">Last EOD Report</p>
                      <p className="text-sm font-bold text-slate-700">
                        <i className="fa-regular fa-clock mr-2 opacity-50"></i>
                        {latest ? new Date(latest.date).toLocaleDateString() : 'Pending first update'}
                      </p>
                    </div>
                  </div>

                  {latest?.blockers && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
                      <i className="fa-solid fa-triangle-exclamation text-red-500 mt-1"></i>
                      <div>
                        <p className="text-xs font-bold text-red-600 uppercase mb-0.5">Reported Blocker</p>
                        <p className="text-sm text-red-800 leading-relaxed">{latest.blockers}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <i className="fa-solid fa-comments text-slate-300"></i>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Team Lead Feedback & Rules</h4>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {task.leadComments?.length ? (
                        task.leadComments.map((c, i) => (
                          <div key={i} className="text-sm bg-blue-50/50 text-blue-900 p-3 rounded-xl border-l-4 border-blue-400 flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5 opacity-50 font-serif">“</span>
                            <span className="flex-1 italic">{c}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic px-1">No feedback provided yet.</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Add rule (e.g. Escalate if blocked for 2 days) or comment..." 
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-inner"
                        value={commentInput[task.id] || ''}
                        onChange={e => setCommentInput({...commentInput, [task.id]: e.target.value})}
                      />
                      <button 
                        onClick={() => {
                          if (!commentInput[task.id]) return;
                          onAddComment(task.id, commentInput[task.id]);
                          setCommentInput({...commentInput, [task.id]: ''});
                        }}
                        className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-md active:scale-95"
                      >
                        <i className="fa-solid fa-paper-plane text-xs"></i>
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
