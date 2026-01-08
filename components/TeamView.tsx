
import React, { useState } from 'react';
import { TeamMember } from '../types';

interface TeamViewProps {
  teamMembers: TeamMember[];
  onAddMember: (name: string) => void;
  onRemoveMember: (name: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const TeamView: React.FC<TeamViewProps> = ({ teamMembers, onAddMember, onRemoveMember, showToast }) => {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (teamMembers.includes(trimmed)) {
      showToast("Member already exists in roster!", "error");
      return;
    }
    onAddMember(trimmed);
    setNewName('');
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Team Management</h2>
        <p className="text-slate-500 font-medium italic">Manage roster</p>
      </header>

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Add Member</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Enter" 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white font-black uppercase tracking-widest px-8 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>
              Add
            </button>
          </div>
        </form>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Active Roster ({teamMembers.length})</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {teamMembers.map((member) => (
              <div key={member} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm border border-blue-100">
                    {member.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{member}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Team Member</p>
                  </div>
                </div>
                {member !== 'Akhilesh' && (
                  <button 
                    onClick={() => onRemoveMember(member)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <i className="fa-solid fa-user-minus"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
