
import React, { useState, useRef, useEffect } from 'react';
import { Task, TeamMember, TaskCategory } from '../types';

interface LeadViewProps {
  teamMembers: TeamMember[];
  onAddTask: (task: Task) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const LeadView: React.FC<LeadViewProps> = ({ teamMembers, onAddTask, showToast }) => {
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    sprint: '',
    category: 'General' as TaskCategory,
    assignee: teamMembers[0] || '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: ''
  });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.targetDate || !formData.assignee) {
      showToast("Ensure all fields are filled.", "error");
      return;
    }

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      updates: [],
      healthStatus: undefined
    };

    onAddTask(newTask);
    setFormData({
      title: '',
      project: '',
      sprint: '',
      category: 'General',
      assignee: teamMembers[0] || '',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: ''
    });
  };

  const categories: { value: TaskCategory; icon: string; desc: string }[] = [
    { value: 'General', icon: 'fa-tasks', desc: 'Standard work' },
    { value: 'Demo', icon: 'fa-laptop-code', desc: 'Client showcase' },
    { value: 'Element', icon: 'fa-cube', desc: 'UI Component' },
    { value: 'Migration', icon: 'fa-route', desc: 'System update' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Assign Task</h2>
        <p className="text-slate-500 font-medium italic">Define workstreams</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Project Entity</label>
            <input 
              type="text" 
              placeholder="Enter"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={formData.project}
              onChange={e => setFormData({...formData, project: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sprint / Milestone</label>
            <input 
              type="text" 
              placeholder="Enter"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={formData.sprint}
              onChange={e => setFormData({...formData, sprint: e.target.value})}
            />
          </div>
        </div>

        <div>
           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat.value})}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-xs font-bold transition-all ${formData.category === cat.value ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'}`}
                >
                  <i className={`fa-solid ${cat.icon} ${formData.category === cat.value ? 'text-blue-400' : 'opacity-40'}`}></i>
                  {cat.value}
                </button>
              ))}
            </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Task Title</label>
          <input 
            type="text" 
            placeholder="Enter"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative" ref={dropdownRef}>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assignee</label>
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-blue-400 transition-all group"
            >
              <span className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-black">
                  {formData.assignee ? formData.assignee.charAt(0) : '?'}
                </div>
                <span className="text-sm font-bold text-slate-800">{formData.assignee || 'Select Member'}</span>
              </span>
              <i className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-[70] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {teamMembers.map(member => (
                  <button 
                    key={member}
                    type="button"
                    onClick={() => { setFormData({...formData, assignee: member}); setIsDropdownOpen(false); }}
                    className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between hover:bg-slate-50 transition-colors ${formData.assignee === member ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400">
                        {member.charAt(0)}
                      </div>
                      {member}
                    </span>
                    {formData.assignee === member && <i className="fa-solid fa-check text-[10px]"></i>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start Date</label>
            <input 
              type="date" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={formData.startDate}
              onChange={e => setFormData({...formData, startDate: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deadline</label>
          <input 
            type="date" 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={formData.targetDate}
            onChange={e => setFormData({...formData, targetDate: e.target.value})}
            required
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <i className="fa-solid fa-paper-plane"></i>
          Deploy Assignment
        </button>
      </form>
    </div>
  );
};
