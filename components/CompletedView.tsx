
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task, TeamMember, TaskStatus, TaskCategory } from '../types';

interface CompletedViewProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onAddComment: (id: string, comment: string) => void;
  onDeleteTask: (id: string) => void;
  isReadOnly?: boolean;
}

export const CompletedView: React.FC<CompletedViewProps> = ({ tasks, teamMembers, onAddComment, onDeleteTask, isReadOnly = false }) => {
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});
  const [filterUser, setFilterUser] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterSprint, setFilterSprint] = useState<string>('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSprintDropdownOpen, setIsSprintDropdownOpen] = useState(false);
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sprintDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) setIsUserDropdownOpen(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) setIsStatusDropdownOpen(false);
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) setIsCategoryDropdownOpen(false);
      if (sprintDropdownRef.current && !sprintDropdownRef.current.contains(event.target as Node)) setIsSprintDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const uniqueSprints = useMemo(() => {
    const sprints = tasks.map(t => t.sprint).filter(Boolean) as string[];
    return Array.from(new Set(sprints)).sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const latest = t.updates[t.updates.length - 1];
      const statusMatch = filterStatus === 'All' || latest?.status === filterStatus;
      const userMatch = filterUser === 'All' || t.assignee === filterUser;
      const categoryMatch = filterCategory === 'All' || t.category === filterCategory;
      const sprintMatch = filterSprint === 'All' || t.sprint === filterSprint;
      return statusMatch && userMatch && categoryMatch && sprintMatch;
    });
  }, [tasks, filterUser, filterStatus, filterCategory, filterSprint]);

  const getTimeStatus = (task: Task) => {
    const latest = task.updates[task.updates.length - 1];
    const targetDate = new Date(task.targetDate);
    
    if (latest?.status === 'Completed') {
      const completionUpdate = task.updates.find(u => u.status === 'Completed');
      if (completionUpdate) {
        const completionDate = new Date(completionUpdate.date);
        const d1 = new Date(completionDate.getFullYear(), completionDate.getMonth(), completionDate.getDate());
        const d2 = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        if (d1 <= d2) return { label: 'Delivered On-time', color: 'text-emerald-500', icon: 'fa-circle-check' };
        const delay = Math.ceil((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
        return { label: `Delivered Late (${delay}d)`, color: 'text-red-500', icon: 'fa-circle-exclamation' };
      }
      return { label: 'Delivered', color: 'text-emerald-500', icon: 'fa-check' };
    }

    const dNow = new Date(); dNow.setHours(0,0,0,0);
    const dTarget = new Date(targetDate); dTarget.setHours(0,0,0,0);
    const diffDays = Math.ceil((dTarget.getTime() - dNow.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `${Math.abs(diffDays)}d Overdue`, color: 'text-red-500', icon: 'fa-triangle-exclamation' };
    if (diffDays === 0) return { label: 'Due Today', color: 'text-orange-500', icon: 'fa-clock' };
    return { label: `${diffDays}d remaining`, color: 'text-slate-400', icon: 'fa-calendar' };
  };

  const getCategoryIcon = (cat: TaskCategory) => {
    switch(cat) {
      case 'Demo': return 'fa-laptop-code';
      case 'Element': return 'fa-cube';
      case 'Migration': return 'fa-route';
      default: return 'fa-tasks';
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Task Repository</h2>
          <p className="text-slate-500 font-medium italic">Full history of {tasks.length} tracked entities</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sprint Filter */}
          <div className="relative z-[75]" ref={sprintDropdownRef}>
            <button onClick={() => setIsSprintDropdownOpen(!isSprintDropdownOpen)} className="flex items-center gap-3 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-all min-w-[140px]">
              <div className="flex-1 text-left"><p className="text-[8px] font-black uppercase text-slate-400">Sprint</p><p className="text-xs font-black text-slate-800 truncate">{filterSprint === 'All' ? 'All' : filterSprint}</p></div>
              <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
            </button>
            {isSprintDropdownOpen && (
              <div className="absolute right-0 mt-1 w-full min-w-[180px] bg-white border border-slate-100 rounded-xl shadow-2xl z-[75] py-2 border-t-4 border-t-indigo-500 max-h-60 overflow-y-auto">
                <button onClick={() => { setFilterSprint('All'); setIsSprintDropdownOpen(false); }} className="w-full text-left px-5 py-2 text-sm font-bold hover:bg-slate-50">All Sprints</button>
                {uniqueSprints.map(s => (<button key={s} onClick={() => { setFilterSprint(s); setIsSprintDropdownOpen(false); }} className="w-full text-left px-5 py-2 text-sm font-bold hover:bg-slate-50">{s}</button>))}
              </div>
            )}
          </div>

          <div className="relative z-[70]" ref={statusDropdownRef}>
            <button onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} className="flex items-center gap-3 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-all min-w-[140px]">
              <div className="flex-1 text-left"><p className="text-[8px] font-black uppercase text-slate-400">Status</p><p className="text-xs font-black text-slate-800 truncate">{filterStatus}</p></div>
              <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
            </button>
            {isStatusDropdownOpen && (
              <div className="absolute right-0 mt-1 w-full min-w-[180px] bg-white border border-slate-100 rounded-xl shadow-2xl z-[70] py-2 border-t-4 border-t-slate-800">
                {['All', 'In Progress', 'In Review', 'Completed'].map(s => (<button key={s} onClick={() => { setFilterStatus(s); setIsStatusDropdownOpen(false); }} className="w-full text-left px-5 py-2 text-sm font-bold hover:bg-slate-50">{s}</button>))}
              </div>
            )}
          </div>

          <div className="relative z-[60]" ref={userDropdownRef}>
            <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center gap-3 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-all min-w-[140px]">
              <div className="flex-1 text-left"><p className="text-[8px] font-black uppercase text-slate-400">Member</p><p className="text-xs font-black text-slate-800 truncate">{filterUser === 'All' ? 'Team' : filterUser}</p></div>
              <i className="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>
            </button>
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-1 w-full min-w-[180px] bg-white border border-slate-100 rounded-xl shadow-2xl z-[60] py-2 border-t-4 border-t-slate-800">
                <button onClick={() => { setFilterUser('All'); setIsUserDropdownOpen(false); }} className="w-full text-left px-5 py-2 text-sm font-bold hover:bg-slate-50">Team</button>
                {teamMembers.map(m => (<button key={m} onClick={() => { setFilterUser(m); setIsUserDropdownOpen(false); }} className="w-full text-left px-5 py-2 text-sm font-bold hover:bg-slate-50">{m}</button>))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Optimized 3-Column Grid View with Increased Font Size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full bg-white p-20 rounded-xl border border-slate-200 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-800">No records found</h3>
            <p className="text-slate-400 mt-2">Try adjusting your filters.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const latest = task.updates[task.updates.length - 1];
            const timeInfo = getTimeStatus(task);
            return (
              <div 
                key={task.id} 
                onClick={() => setSelectedTask(task)}
                className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-900 transition-all cursor-pointer relative flex flex-col hover:shadow-xl shadow-slate-200/50 animate-in fade-in zoom-in-95 duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                   <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{task.project}</div>
                   <div className={`text-[11px] font-black uppercase px-2 py-0.5 rounded ${latest?.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{latest?.status || 'Assigned'}</div>
                </div>
                <h3 className="text-base font-black text-slate-900 leading-tight mb-4 flex-1 line-clamp-2 group-hover:text-blue-600 transition-colors">{task.title}</h3>
                <div className="mt-auto space-y-3 pt-3 border-t border-slate-50">
                   <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2 text-slate-500">
                         <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] border border-slate-200">{task.assignee.charAt(0)}</div>
                         <span>{task.assignee}</span>
                      </div>
                      <div className={timeInfo.color}>{timeInfo.label}</div>
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Modal Overlay */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 relative flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setSelectedTask(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all z-10"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="p-10 overflow-y-auto">
              <header className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded">{selectedTask.project}</span>
                  <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded">{selectedTask.category}</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 leading-tight">{selectedTask.title}</h3>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timeline</p>
                    <p className="text-sm font-bold text-slate-800">Target: {new Date(selectedTask.targetDate).toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner</p>
                    <p className="text-sm font-bold text-slate-800">{selectedTask.assignee}</p>
                  </div>
                </div>
              </header>

              <div className="space-y-8">
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Final Submission Log</p>
                  <p className="text-base text-slate-700 italic font-medium leading-relaxed">
                    {selectedTask.updates[selectedTask.updates.length-1]?.workCompleted ? 
                      `"${selectedTask.updates[selectedTask.updates.length-1].workCompleted}"` : 
                      <span className="text-slate-400">Awaiting first EOD submission.</span>
                    }
                  </p>
                  {selectedTask.updates[selectedTask.updates.length-1]?.blockers && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                       <p className="text-[10px] font-black text-red-400 uppercase mb-1">Managed Blockers</p>
                       <p className="text-sm font-bold text-red-600">{selectedTask.updates[selectedTask.updates.length-1].blockers}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">Feedback History</h4>
                  <div className="space-y-3">
                    {selectedTask.leadComments?.length ? 
                      selectedTask.leadComments.map((c, i) => (
                        <div key={i} className="text-base bg-blue-50/20 text-blue-900 p-4 rounded-xl border border-blue-100/30 font-medium italic">
                          {c}
                        </div>
                      )) : 
                      <p className="text-sm text-slate-400 italic">No historical feedback archived.</p>
                    }
                  </div>
                </div>

                {!isReadOnly && (
                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex gap-3 mb-6">
                      <input 
                        type="text" 
                        placeholder="Add to history..." 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                        value={commentInput[selectedTask.id] || ''} 
                        onChange={e => setCommentInput({...commentInput, [selectedTask.id]: e.target.value})} 
                      />
                      <button 
                        onClick={() => { if (!commentInput[selectedTask.id]) return; onAddComment(selectedTask.id, commentInput[selectedTask.id]); setCommentInput({...commentInput, [selectedTask.id]: ''}); }} 
                        className="bg-slate-900 text-white px-8 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                      >
                        Append
                      </button>
                    </div>
                    <button 
                      onClick={() => { if(window.confirm('Erase this record from history?')) { onDeleteTask(selectedTask.id); setSelectedTask(null); }}}
                      className="w-full py-4 text-[10px] font-black text-red-400 uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all border border-dashed border-red-100"
                    >
                      Delete Historical Record
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
