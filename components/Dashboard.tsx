
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task, TeamMember, TaskCategory, HealthStatus } from '../types';

interface DashboardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onAddComment: (id: string, comment: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateHealth?: (id: string, health: HealthStatus) => void;
  isReadOnly?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, teamMembers, onAddComment, onDeleteTask, onUpdateHealth, isReadOnly = false }) => {
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});
  const [filterUser, setFilterUser] = useState<string>('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeHealthSelect, setActiveHealthSelect] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const healthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (healthRef.current && !healthRef.current.contains(event.target as Node)) {
        setActiveHealthSelect(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTasks = useMemo(() => {
    if (filterUser === 'All') return tasks;
    return tasks.filter(t => t.assignee === filterUser);
  }, [tasks, filterUser]);

  const getHealthConfig = (status?: HealthStatus) => {
    switch(status) {
      case 'On Track': return { label: 'On Track', color: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', flagColor: 'text-emerald-500' };
      case 'At Risk': return { label: 'At Risk', color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', flagColor: 'text-orange-500' };
      case 'Delayed': return { label: 'Delayed', color: 'bg-red-100 text-red-800', dot: 'bg-red-500', flagColor: 'text-red-600' };
      case 'Review Required': return { label: 'Review Req.', color: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500', flagColor: 'text-indigo-600' };
      default: return null;
    }
  };

  const getCategoryIcon = (cat: TaskCategory) => {
    switch(cat) {
      case 'Demo': return 'fa-laptop-code';
      case 'Element': return 'fa-cube';
      case 'Migration': return 'fa-route';
      default: return 'fa-tasks';
    }
  };

  const healthOptions: HealthStatus[] = ['On Track', 'At Risk', 'Delayed', 'Review Required'];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Workstreams</h2>
          <p className="text-slate-500 font-medium italic">Operational overview of {tasks.length} live tracks</p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative z-[60]" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all min-w-[200px] group">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold"><i className="fa-solid fa-user-tag"></i></div>
              <div className="flex-1 text-left"><p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-0.5">Filter User</p><p className="text-sm font-black text-slate-800 truncate">{filterUser === 'All' ? 'Full Team' : filterUser}</p></div>
              <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full min-w-[220px] bg-white border border-slate-100 rounded-xl shadow-2xl z-[70] py-2 overflow-hidden border-t-4 border-t-blue-500 animate-in fade-in zoom-in-95 duration-200">
                <button onClick={() => { setFilterUser('All'); setIsDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between hover:bg-slate-50 transition-colors ${filterUser === 'All' ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}>All Team</button>
                {teamMembers.map(member => (
                  <button key={member} onClick={() => { setFilterUser(member); setIsDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between hover:bg-slate-50 transition-colors ${filterUser === member ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}>{member}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full bg-white p-20 rounded-xl border border-slate-200 text-center shadow-sm">
            <i className="fa-solid fa-mug-hot text-slate-200 text-4xl mb-4"></i>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Active Tracks</p>
          </div>
        ) : filteredTasks.map(task => {
          const flag = getHealthConfig(task.healthStatus);
          const latest = task.updates[task.updates.length - 1];
          return (
            <div 
              key={task.id} 
              onClick={() => setSelectedTask(task)}
              className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer relative flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${flag ? flag.color : 'bg-slate-100 text-slate-400'}`}>
                  <i className={`fa-solid ${getCategoryIcon(task.category)}`}></i>
                </div>
                {flag && (
                  <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded ${flag.color}`}>
                    {flag.label}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{task.project}</p>
                <h3 className="text-lg font-black text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors">{task.title}</h3>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black border border-slate-200">
                      {task.assignee.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-600">{task.assignee}</span>
                  </div>
                  <span className="text-xs font-black text-slate-400">{latest?.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${flag ? flag.dot : 'bg-blue-500'}`} style={{ width: `${latest?.progress || 0}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal Overlay */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 relative flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setSelectedTask(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all z-10"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="p-10 overflow-y-auto">
              <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{selectedTask.project}</span>
                  {selectedTask.sprint && <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{selectedTask.sprint}</span>}
                </div>
                <h3 className="text-3xl font-black text-slate-900 leading-tight">{selectedTask.title}</h3>
                
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-black border border-slate-200">{selectedTask.assignee.charAt(0)}</div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase leading-none">Assignee</p>
                      <p className="text-xs font-bold text-slate-800">{selectedTask.assignee}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-black border border-slate-200 text-blue-500">
                      <i className="fa-solid fa-calendar"></i>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase leading-none">Deadline</p>
                      <p className="text-xs font-bold text-slate-800">{new Date(selectedTask.targetDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </header>

              <div className="space-y-8">
                {/* Last Update Block */}
                <div className="p-6 bg-blue-50/20 border border-blue-100/30 rounded-xl relative">
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest rounded">Last Status Report</div>
                  <div className="flex justify-between items-center mb-4 pt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress: {selectedTask.updates[selectedTask.updates.length-1]?.progress || 0}%</p>
                    <span className="text-[9px] font-black uppercase tracking-tighter bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      {selectedTask.updates[selectedTask.updates.length-1]?.status || 'Assigned'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 italic font-medium leading-relaxed">
                    {selectedTask.updates[selectedTask.updates.length-1]?.workCompleted ? 
                      `"${selectedTask.updates[selectedTask.updates.length-1].workCompleted}"` : 
                      <span className="text-slate-400">Awaiting EOD report from {selectedTask.assignee}.</span>
                    }
                  </p>
                </div>

                {/* Directives / Lead Comments */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-comments text-blue-400"></i>
                    Lead Directives
                  </h4>
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                    {selectedTask.leadComments?.length ? 
                      selectedTask.leadComments.map((c, i) => (
                        <div key={i} className="text-sm bg-slate-50 text-slate-800 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                          <i className="fa-solid fa-quote-left text-slate-300 mt-1"></i>
                          <span className="flex-1 font-medium">{c}</span>
                        </div>
                      )) : 
                      <p className="text-xs text-slate-400 italic">No directives issued yet.</p>
                    }
                  </div>
                </div>

                {/* Commenting Interface for Leads */}
                {!isReadOnly && (
                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Post a directive..." 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                        value={commentInput[selectedTask.id] || ''} 
                        onChange={e => setCommentInput({...commentInput, [selectedTask.id]: e.target.value})} 
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && commentInput[selectedTask.id]) {
                            onAddComment(selectedTask.id, commentInput[selectedTask.id]);
                            setCommentInput({...commentInput, [selectedTask.id]: ''});
                          }
                        }}
                      />
                      <button 
                        onClick={() => { if (!commentInput[selectedTask.id]) return; onAddComment(selectedTask.id, commentInput[selectedTask.id]); setCommentInput({...commentInput, [selectedTask.id]: ''}); }} 
                        className="bg-slate-900 text-white px-8 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                      >
                        Deploy
                      </button>
                    </div>
                  </div>
                )}

                {/* Lead Management Actions */}
                {!isReadOnly && (
                  <div className="flex justify-between items-center pt-4">
                    <button 
                      onClick={() => { onDeleteTask(selectedTask.id); setSelectedTask(null); }}
                      className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-all flex items-center gap-2"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                      Terminate Workstream
                    </button>
                    
                    <div className="relative" ref={healthRef}>
                      <button 
                        onClick={() => setActiveHealthSelect(activeHealthSelect === selectedTask.id ? null : selectedTask.id)}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm transition-all ${getHealthConfig(selectedTask.healthStatus)?.color || 'bg-slate-100 text-slate-400'}`}
                      >
                         <span className={`w-2 h-2 rounded-full ${getHealthConfig(selectedTask.healthStatus)?.dot || 'bg-slate-300'}`}></span>
                         {selectedTask.healthStatus || 'Update Health'}
                         <i className="fa-solid fa-chevron-down opacity-50"></i>
                      </button>
                      {activeHealthSelect === selectedTask.id && (
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-slate-100 rounded-xl shadow-2xl z-[80] py-2 overflow-hidden border-t-4 border-t-slate-900">
                          {healthOptions.map(opt => (
                            <button 
                              key={opt}
                              onClick={() => { onUpdateHealth?.(selectedTask.id, opt); setSelectedTask({...selectedTask, healthStatus: opt}); setActiveHealthSelect(null); }}
                              className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-colors ${selectedTask.healthStatus === opt ? 'bg-slate-50 text-slate-900' : 'text-slate-400'}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${getHealthConfig(opt)?.dot}`}></span>
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
