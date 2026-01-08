
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task, TeamMember, TaskCategory } from '../types';

interface DashboardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onAddComment: (id: string, comment: string) => void;
  onDeleteTask: (id: string) => void;
  isReadOnly?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, teamMembers, onAddComment, onDeleteTask, isReadOnly = false }) => {
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});
  const [filterUser, setFilterUser] = useState<string>('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTasks = useMemo(() => {
    if (filterUser === 'All') return tasks;
    return tasks.filter(t => t.assignee === filterUser);
  }, [tasks, filterUser]);

  const calculateFlag = (task: Task) => {
    const start = new Date(task.startDate).getTime();
    const target = new Date(task.targetDate).getTime();
    const now = new Date().getTime();
    const totalDuration = target - start;
    const elapsed = now - start;
    const plannedProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const latestUpdate = task.updates[task.updates.length - 1];
    const actualProgress = latestUpdate ? latestUpdate.progress : 0;

    if (latestUpdate?.status === 'Completed') return { label: 'Completed', color: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-50', icon: 'fa-check-circle', flagColor: 'text-emerald-500' };
    if (latestUpdate?.blockers && latestUpdate.blockers.trim() !== "") return { label: 'Delayed (Blocked)', color: 'bg-red-100 text-red-800', dot: 'bg-red-500', icon: 'fa-flag', flagColor: 'text-red-600' };
    if (actualProgress < plannedProgress - 20) return { label: 'Delayed', color: 'bg-red-100 text-red-800', dot: 'bg-red-500', icon: 'fa-flag', flagColor: 'text-red-600' };
    if (actualProgress < plannedProgress - 5) return { label: 'At Risk', color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', icon: 'fa-flag', flagColor: 'text-orange-500' };
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

  const getCategoryIcon = (cat: TaskCategory) => {
    switch(cat) {
      case 'Demo': return 'fa-laptop-code';
      case 'Element': return 'fa-cube';
      case 'Migration': return 'fa-route';
      default: return 'fa-tasks';
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Team Dashboard</h2>
          <p className="text-slate-500 font-medium italic">Monitoring {tasks.length} active workstreams</p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex gap-5 px-2">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span> On Track</span>
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"></span> At Risk</span>
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span> Delayed</span>
          </div>
          <div className="relative z-[60]" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-blue-400 transition-all min-w-[200px] group">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold group-hover:bg-blue-100"><i className="fa-solid fa-user-tag"></i></div>
              <div className="flex-1 text-left"><p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-0.5">Filter by User</p><p className="text-sm font-black text-slate-800 truncate">{filterUser === 'All' ? 'All Members' : filterUser}</p></div>
              <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180 text-blue-500' : ''}`}></i>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full min-w-[220px] bg-white border border-slate-100 rounded-2xl shadow-2xl z-[70] py-2 overflow-hidden border-t-4 border-t-blue-500">
                <button onClick={() => { setFilterUser('All'); setIsDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between hover:bg-slate-50 transition-colors ${filterUser === 'All' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}><span className="flex items-center gap-3"><i className="fa-solid fa-users-viewfinder text-xs opacity-50"></i>All Team</span></button>
                {teamMembers.map(member => (
                  <button key={member} onClick={() => { setFilterUser(member); setIsDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between hover:bg-slate-50 transition-colors ${filterUser === member ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}><span className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400">{member.charAt(0)}</div>{member}</span></button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 relative z-10">
        {filteredTasks.length === 0 ? (
          <div className="bg-white p-20 rounded-[2.5rem] border border-slate-200 text-center shadow-sm">
            <i className="fa-solid fa-mug-hot text-slate-200 text-4xl mb-4"></i>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Active Tracks Found</p>
          </div>
        ) : filteredTasks.map(task => {
          const flag = calculateFlag(task);
          const latest = task.updates[task.updates.length - 1];
          return (
            <div key={task.id} className="group bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden hover:border-blue-200 hover:shadow-xl transition-all relative">
              {!isReadOnly && (
                <button onClick={() => onDeleteTask(task.id)} className="absolute top-6 right-6 p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 z-10"><i className="fa-solid fa-trash-can"></i></button>
              )}
              <div className="p-8">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pr-10">
                  <div className="flex gap-5">
                    <div className={`mt-1.5 text-3xl text-slate-200 group-hover:text-blue-500 transition-colors`}>
                      <i className={`fa-solid ${getCategoryIcon(task.category || 'General')}`}></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{task.project}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md`}>{task.category || 'General'}</span>
                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-tighter shadow-sm ${getStatusBadgeStyles(latest?.status)}`}>{latest?.status || 'Assigned'}</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 leading-tight">{task.title}</h3>
                    </div>
                  </div>
                  <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 ${flag.color} border border-current/10 shadow-sm`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${flag.dot}`}></span>{flag.label}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100/50"><p className="text-[10px] text-slate-400 mb-2 uppercase font-black tracking-widest">Progress Metrics</p><div className="flex items-center gap-4"><div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden"><div className={`h-full ${flag.flagColor.replace('text', 'bg')}`} style={{ width: `${latest?.progress || 0}%` }}></div></div><span className="text-sm font-black text-slate-700">{latest?.progress || 0}%</span></div></div>
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100/50"><p className="text-[10px] text-slate-400 mb-2 uppercase font-black tracking-widest">Target Deadline</p><p className="text-sm font-bold text-slate-800 flex items-center gap-2"><i className="fa-regular fa-calendar-check text-blue-500"></i>{new Date(task.targetDate).toLocaleDateString()}</p></div>
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100/50"><p className="text-[10px] text-slate-400 mb-2 uppercase font-black tracking-widest">Assignee</p><p className="text-sm font-bold text-slate-800 flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-black">{task.assignee.charAt(0)}</div>{task.assignee}</p></div>
                </div>
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-3 mb-4"><div className="p-1.5 bg-slate-100 rounded-lg"><i className="fa-solid fa-comments text-slate-400 text-xs"></i></div><h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Directives</h4></div>
                  <div className="space-y-3 mb-6">
                    {task.leadComments?.length ? task.leadComments.map((c, i) => (<div key={i} className="text-sm bg-blue-50/30 text-blue-900 p-4 rounded-2xl border border-blue-100/50 flex items-start gap-3 shadow-sm"><i className="fa-solid fa-quote-left text-blue-200 mt-1"></i><span className="flex-1 font-medium italic leading-relaxed">{c}</span></div>)) : <p className="text-xs text-slate-400 italic px-2">No active feedback.</p>}
                  </div>
                  {!isReadOnly && (
                    <div className="flex gap-3">
                      <input type="text" placeholder="Add feedback..." className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none" value={commentInput[task.id] || ''} onChange={e => setCommentInput({...commentInput, [task.id]: e.target.value})} />
                      <button onClick={() => { if (!commentInput[task.id]) return; onAddComment(task.id, commentInput[task.id]); setCommentInput({...commentInput, [task.id]: ''}); }} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg active:scale-95">Post</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
