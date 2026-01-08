
import React, { useState, useRef, useEffect } from 'react';
import { Task, TeamMember, EODUpdate, TaskStatus } from '../types';

interface MemberViewProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onAddUpdate: (taskId: string, update: EODUpdate) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const MemberView: React.FC<MemberViewProps> = ({ tasks, teamMembers, onAddUpdate, showToast }) => {
  const [selectedUser, setSelectedUser] = useState<TeamMember>(teamMembers[0] || '');
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  
  const [updateForm, setUpdateForm] = useState<Omit<EODUpdate, 'date'>>({
    progress: 0,
    status: 'In Progress',
    workCompleted: '',
    pendingItems: '',
    blockers: '',
    expectedCompletionDate: ''
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const myTasks = tasks.filter(t => t.assignee === selectedUser);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;

    const task = tasks.find(t => t.id === activeTask);
    const lastProgress = task?.updates.length ? task.updates[task.updates.length - 1].progress : 0;

    if (updateForm.progress < lastProgress) {
      showToast("Error: Progress cannot decrease!", "error");
      return;
    }

    if (updateForm.status === 'Completed' && updateForm.progress < 100) {
      showToast("Error: Complete status requires 100% progress", "error");
      return;
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
  };

  const statusOptions: { value: TaskStatus; icon: string; color: string }[] = [
    { value: 'In Progress', icon: 'fa-spinner', color: 'text-blue-500' },
    { value: 'In Review', icon: 'fa-eye', color: 'text-indigo-500' },
    { value: 'Completed', icon: 'fa-check-double', color: 'text-emerald-500' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Member Portal</h2>
          <p className="text-slate-500 font-medium italic">Daily status report</p>
        </div>

        <div className="relative z-[100]" ref={userDropdownRef}>
          <button 
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all min-w-[220px] group"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-black">
              {selectedUser ? selectedUser.charAt(0) : '?'}
            </div>
            <div className="flex-1 text-left">
              <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-0.5">User</p>
              <p className="text-sm font-black text-slate-800 truncate">{selectedUser || 'Select User'}</p>
            </div>
            <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : ''}`}></i>
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-t-4 border-t-blue-500">
              {teamMembers.map(member => (
                <button 
                  key={member}
                  onClick={() => { setSelectedUser(member); setIsUserDropdownOpen(false); setActiveTask(null); }}
                  className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between hover:bg-slate-50 transition-colors ${selectedUser === member ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                >
                  <span className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400">
                      {member.charAt(0)}
                    </div>
                    {member}
                  </span>
                  {selectedUser === member && <i className="fa-solid fa-check text-[10px]"></i>}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <section className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Your Tasks</h3>
          {myTasks.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
               <i className="fa-solid fa-mug-hot text-slate-200 text-2xl mb-3"></i>
               <p className="text-slate-400 text-sm italic font-medium">No tasks assigned.</p>
            </div>
          ) : (
            myTasks.map(t => (
              <button 
                key={t.id}
                onClick={() => setActiveTask(t.id)}
                className={`w-full text-left p-6 rounded-xl border transition-all duration-300 ${activeTask === t.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200 -translate-y-1' : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm text-slate-700'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-[9px] uppercase font-black tracking-widest mb-1 ${activeTask === t.id ? 'text-blue-400' : 'text-slate-400'}`}>{t.project}</p>
                    <h4 className="text-lg font-black leading-tight">{t.title}</h4>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                   <p className={`text-xs font-bold ${activeTask === t.id ? 'text-slate-400' : 'text-slate-500'}`}>Progress: {t.updates.length > 0 ? t.updates[t.updates.length-1].progress : 0}%</p>
                   {t.updates.length > 0 && (
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-tighter ${activeTask === t.id ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
                        {t.updates[t.updates.length-1].status}
                      </span>
                   )}
                </div>
              </button>
            ))
          )}
        </section>

        <section className="lg:col-span-3">
          {activeTask ? (
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>
              <h3 className="text-xl font-black text-slate-900 mb-2">EOD Report</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative" ref={statusDropdownRef}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                  <button 
                    type="button"
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-400 transition-all text-left"
                  >
                    <span className="flex items-center gap-3">
                      <i className={`fa-solid ${statusOptions.find(o => o.value === updateForm.status)?.icon} ${statusOptions.find(o => o.value === updateForm.status)?.color} text-xs`}></i>
                      <span className="text-sm font-bold text-slate-700">{updateForm.status}</span>
                    </span>
                    <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}></i>
                  </button>

                  {isStatusDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-2xl z-[90] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      {statusOptions.map(option => (
                        <button 
                          key={option.value}
                          type="button"
                          onClick={() => { setUpdateForm({...updateForm, status: option.value}); setIsStatusDropdownOpen(false); }}
                          className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between hover:bg-slate-50 transition-colors ${updateForm.status === option.value ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                        >
                          <span className="flex items-center gap-3">
                            <i className={`fa-solid ${option.icon} opacity-50`}></i>
                            {option.value}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Progress ({updateForm.progress}%)</label>
                   <input 
                    type="range" 
                    min="0" max="100" 
                    className="w-full h-8 mt-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 px-2"
                    value={updateForm.progress}
                    onChange={e => setUpdateForm({...updateForm, progress: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Work Completed</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none h-28 leading-relaxed"
                  placeholder="Enter"
                  value={updateForm.workCompleted}
                  onChange={e => setUpdateForm({...updateForm, workCompleted: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending Items</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none h-20 leading-relaxed"
                  placeholder="Enter"
                  value={updateForm.pendingItems}
                  onChange={e => setUpdateForm({...updateForm, pendingItems: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Blockers</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-medium focus:ring-2 focus:ring-red-500/20 outline-none h-24 leading-relaxed border-l-4 border-l-red-100"
                  placeholder="Enter"
                  value={updateForm.blockers}
                  onChange={e => setUpdateForm({...updateForm, blockers: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Expected Completion</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={updateForm.expectedCompletionDate}
                  onChange={e => setUpdateForm({...updateForm, expectedCompletionDate: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-cloud-upload"></i>
                Submit EOD Report
              </button>
            </form>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-center">
              <i className="fa-solid fa-arrow-left text-3xl mb-4 opacity-20"></i>
              <p className="italic font-medium">Select a task to report status.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
