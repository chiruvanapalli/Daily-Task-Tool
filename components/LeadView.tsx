
import React, { useState } from 'react';
import { Task, TEAM_MEMBERS, TeamMember } from '../types';

interface LeadViewProps {
  onAddTask: (task: Task) => void;
}

export const LeadView: React.FC<LeadViewProps> = ({ onAddTask }) => {
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    assignee: TEAM_MEMBERS[0] as TeamMember,
    startDate: new Date().toISOString().split('T')[0],
    targetDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.targetDate) return;

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      updates: []
    };

    onAddTask(newTask);
    setFormData({
      title: '',
      project: '',
      assignee: TEAM_MEMBERS[0] as TeamMember,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: ''
    });
    alert('Task assigned successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Assign New Task</h2>
        <p className="text-slate-500">Create templates and set timelines for team members</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Project Name</label>
          <input 
            type="text" 
            placeholder="e.g., Q3 UI Refresh"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={formData.project}
            onChange={e => setFormData({...formData, project: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Task Title</label>
          <input 
            type="text" 
            placeholder="e.g., Integrate Auth Components"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Assignee</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
              value={formData.assignee}
              onChange={e => setFormData({...formData, assignee: e.target.value as TeamMember})}
            >
              {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
            <input 
              type="date" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.startDate}
              onChange={e => setFormData({...formData, startDate: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Expected Completion Date</label>
          <input 
            type="date" 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={formData.targetDate}
            onChange={e => setFormData({...formData, targetDate: e.target.value})}
            required
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        >
          Assign Task
        </button>
      </form>
    </div>
  );
};
