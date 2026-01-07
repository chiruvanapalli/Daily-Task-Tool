
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task, TeamMember, TaskStatus, TaskCategory } from '../types';

interface CompletedViewProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onAddComment: (id: string, comment: string) => void;
  onDeleteTask: (id: string) => void;
}

export const CompletedView: React.FC<CompletedViewProps> = ({ tasks, teamMembers, onAddComment, onDeleteTask }) => {
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});
  const [filterUser, setFilterUser] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) setIsUserDropdownOpen(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) setIsStatusDropdownOpen(false);
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) setIsCategoryDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const latest = t.updates[t.updates.length - 1];
      const statusMatch = filterStatus === 'All' || latest?.status === filterStatus;
      const userMatch = filterUser === 'All' || t.assignee === filterUser;
      const categoryMatch = filterCategory === 'All' || t.category === filterCategory;
      return statusMatch && userMatch && categoryMatch;
    });
  }, [tasks, filterUser, filterStatus, filterCategory]);

  const getStatusStyles = (status?: string) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'In Review': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  }

  const getTimeStatus = (task: Task) => {
    const latest = task.updates[task.updates.length - 1];
    if (latest?.status === 'Completed') return { label: 'Delivered', color: 'text-emerald-500' };
    const target = new Date(task.targetDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `${Math.abs(diffDays)}d Overdue`, color: 'text-red-500' };
    if (diffDays === 0) return { label: 'Due Today', color: 'text-orange-500' };
    return { label: `${diffDays}d remaining`, color: 'text-slate-400' };
  };

  const statusOptions = [
    { label: 'All Statuses', value: 'All', icon: 'fa-layer-group', color: 'text-slate-400' },
    { label: 'In Progress', value: 'In Progress', icon: 'fa-spinner', color: 'text-blue-500' },
    { label: 'In Review', value: 'In Review', icon: 'fa-eye', color: 'text-indigo-500' },
    { label: 'Completed', value: 'Completed', icon: 'fa-check-double', color: 'text-emerald-500' }
  ];

  const categoryOptions = [
    { label: 'All Categories', value: 'All', icon: 'fa-filter' },
    { label: 'Demo', value: 'Demo', icon: 'fa-laptop-code' },
    { label: 'Element', value: 'Element', icon: 'fa-cube' },
    { label: 'Migration', value: 'Migration', icon: 'fa-route' }
  ];

  const getCategoryIcon = (cat: TaskCategory) => {
    switch(cat) {
      case 'Demo': return 'fa-laptop-code';
      case 'Element': return 'fa-cube';
      case 'Migration': return 'fa-route';
      default: return 'fa-tasks';
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
            <i className="fa-solid fa-box-archive text-2xl"></i>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tasks Archive</h2>
            <p className="text-slate-500 font-medium italic">Comprehensive log of all project workstreams</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="relative z-[70]" ref={statusDropdownRef}>
            <button onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all min-w-[180px] group">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-blue-50 group-hover:text-blue-500">
                <i className={`fa-solid ${statusOptions.find(s => s.value === filterStatus)?.icon || 'fa-filter'}`}></i>
              </div>
              <div className="flex-1 text-left">
                <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-0.5">Status</p>
                <p className="text-sm font-black text-slate-800 truncate">{filterStatus}</p>
              </div>
            </button>
            {isStatusDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full min-w-[220px] bg-white border border-slate-100 rounded-2xl shadow-2xl z-[70] py-2 overflow-hidden border-t-4 border-t-slate-800">
                {statusOptions.map(status => (
                  <button key={status.value} onClick={() => { setFilterStatus(status.value); setIsStatusDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between hover:bg-slate-50 transition-colors ${filterStatus === status.value ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}>
                    <span className="flex items-center gap-3"><i className={`fa-solid ${status.icon} ${status.color} text-xs`}></i>{status.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative z-[65]" ref={categoryDropdownRef}>
            <button onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)} className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all min-w-[180px] group">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-blue-50 group-hover:text-blue-500">
                <i className={`fa-solid ${categoryOptions.find(c => c.value === filterCategory)?.icon || 'fa-tag'}`}></i>
              </div>
              <div className="flex-1 text-left">
                <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-0.5">Category</p>
                <p className="text-sm font-black text-slate-800 truncate">{filterCategory}</p>
              </div>
            </button>
            {isCategoryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full min-w-[220px] bg-white border border-slate-100 rounded-2xl shadow-2xl z-[65] py-2 overflow-hidden border-t-4 border-t-slate-800">
                {categoryOptions.map(cat => (
                  <button key={cat.value} onClick={() => { setFilterCategory(cat.value); setIsCategoryDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between hover:bg-slate-50 transition-colors ${filterCategory === cat.value ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}>
                    <span className="flex items-center gap-3"><i className={`fa-solid ${cat.icon} text-xs opacity-50`}></i>{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Filter */}
          <div className="relative z-[60]" ref={userDropdownRef}>
            <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all min-w-[180px] group">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-blue-50 group-hover:text-blue-500">
                <i className="fa-solid fa-user-tag"></i>
              </div>
              <div className="flex-1 text-left">
                <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-0.5">Member</p>
                <p className="text-sm font-black text-slate-800 truncate">{filterUser === 'All' ? 'Full Team' : filterUser}</p>
              </div>
            </button>
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full min-w-[220px] bg-white border border-slate-100 rounded-2xl shadow-2xl z-[60] py-2 overflow-hidden border-t-4 border-t-slate-800">
                <button onClick={() => { setFilterUser('All'); setIsUserDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between hover:bg-slate-50 transition-colors ${filterUser === 'All' ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}><span className="flex items-center gap-3"><i className="fa-solid fa-users text-xs opacity-40"></i>All Members</span></button>
                {teamMembers.map(member => (
                  <button key={member} onClick={() => { setFilterUser(member); setIsUserDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between hover:bg-slate-50 transition-colors ${filterUser === member ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}><span className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400">{member.charAt(0)}</div>{member}</span></button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 relative z-10">
        {filteredTasks.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><i className="fa-solid fa-magnifying-glass text-slate-200 text-3xl"></i></div>
            <h3 className="text-xl font-bold text-slate-800">No matching records</h3>
            <p className="text-slate-400 mt-2">Adjust filters to browse archive.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const latest = task.updates[task.updates.length - 1];
            const statusStyles = getStatusStyles(latest?.status);
            const timeInfo = getTimeStatus(task);
            
            return (
              <div key={task.id} className="group bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative hover:shadow-xl hover:border-blue-200 transition-all">
                <button onClick={() => onDeleteTask(task.id)} className="absolute top-6 right-6 p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 z-10"><i className="fa-solid fa-trash-can"></i></button>
                <div className="p-8">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pr-10">
                    <div className="flex gap-5">
                      <div className="mt-1.5 text-3xl text-slate-200 group-hover:text-blue-500 transition-colors">
                        <i className={`fa-solid ${getCategoryIcon(task.category || 'General')}`}></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{task.project}</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100`}>{task.category || 'General'}</span>
                          <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-tighter border ${statusStyles}`}>{latest?.status || 'Assigned'}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-tight ${timeInfo.color}`}>{timeInfo.label}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-900 transition-colors">{task.title}</h3>
                        <p className="text-sm text-slate-500 font-semibold mt-1 flex items-center gap-2">
                           <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black">{task.assignee.charAt(0)}</div>{task.assignee}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 mb-2 uppercase font-black tracking-widest">Latest Progress Note</p>
                      <p className="text-sm text-slate-700 italic font-medium leading-relaxed">{latest?.workCompleted ? `"${latest.workCompleted}"` : "Waiting for initial report..."}</p>
                    </div>
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 mb-2 uppercase font-black tracking-widest">Project Health</p>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-xs text-slate-600 font-bold"><span className="flex items-center gap-2"><i className="fa-solid fa-calendar-plus opacity-30"></i> Assigned:</span><span>{new Date(task.startDate).toLocaleDateString()}</span></div>
                        <div className="flex justify-between text-xs text-slate-600 font-bold"><span className="flex items-center gap-2"><i className="fa-solid fa-clock opacity-30"></i> Target:</span><span>{new Date(task.targetDate).toLocaleDateString()}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-3 mb-4"><div className="p-1.5 bg-slate-100 rounded-lg"><i className="fa-solid fa-history text-slate-400 text-xs"></i></div><h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lead Feedback Log</h4></div>
                    <div className="space-y-3 mb-6">
                      {task.leadComments?.length ? task.leadComments.map((c, i) => (<div key={i} className="text-sm bg-blue-50/20 text-blue-900 p-4 rounded-2xl border border-blue-100/30 flex items-start gap-3"><span className="flex-1 font-medium italic leading-relaxed">{c}</span></div>)) : <p className="text-xs text-slate-400 italic px-2">No archive feedback found.</p>}
                    </div>
                    <div className="flex gap-3">
                      <input type="text" placeholder="Add retrospective comment..." className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" value={commentInput[task.id] || ''} onChange={e => setCommentInput({...commentInput, [task.id]: e.target.value})} />
                      <button onClick={() => { if (!commentInput[task.id]) return; onAddComment(task.id, commentInput[task.id]); setCommentInput({...commentInput, [task.id]: ''}); }} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95">Append Note</button>
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
