
import React, { useState } from 'react';
import { Task } from '../types';

interface CompletedViewProps {
  tasks: Task[];
  onAddComment: (id: string, comment: string) => void;
}

export const CompletedView: React.FC<CompletedViewProps> = ({ tasks, onAddComment }) => {
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <i className="fa-solid fa-box-archive text-emerald-500"></i>
          Completed Archive
        </h2>
        <p className="text-slate-500">Review all finalized team tasks and their history</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {tasks.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center">
            <i className="fa-solid fa-folder-open text-slate-200 text-5xl mb-4"></i>
            <p className="text-slate-400 italic">No tasks have been marked as completed yet.</p>
          </div>
        ) : (
          tasks.map(task => {
            const latest = task.updates[task.updates.length - 1];
            
            return (
              <div key={task.id} className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden opacity-90 grayscale-[0.2] hover:grayscale-0 transition-all">
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div className="flex gap-4">
                      <div className="mt-1 text-2xl text-emerald-500">
                        <i className="fa-solid fa-circle-check"></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">{task.project}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm bg-emerald-600 text-white">
                            Completed
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mt-1 line-through decoration-emerald-500/30">{task.title}</h3>
                        <p className="text-sm text-slate-500">Delivered by: <span className="font-semibold text-slate-700">{task.assignee}</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                      <p className="text-xs text-emerald-600 mb-1 uppercase font-bold tracking-tighter">Completion Summary</p>
                      <p className="text-sm text-slate-700 italic">"{latest?.workCompleted}"</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1 uppercase font-bold tracking-tighter">Timeline Meta</p>
                      <div className="flex justify-between text-xs text-slate-600 mt-2 font-medium">
                         <span>Started: {new Date(task.startDate).toLocaleDateString()}</span>
                         <span>Finished: {new Date(latest.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <i className="fa-solid fa-comments text-slate-300"></i>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lead Post-Mortem Feedback</h4>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {task.leadComments?.length ? (
                        task.leadComments.map((c, i) => (
                          <div key={i} className="text-sm bg-emerald-50/50 text-emerald-900 p-3 rounded-xl border-l-4 border-emerald-400 flex items-start gap-2">
                            <span className="flex-1 italic">{c}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic px-1">No final feedback provided.</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Add final comment or review notes..." 
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-inner"
                        value={commentInput[task.id] || ''}
                        onChange={e => setCommentInput({...commentInput, [task.id]: e.target.value})}
                      />
                      <button 
                        onClick={() => {
                          if (!commentInput[task.id]) return;
                          onAddComment(task.id, commentInput[task.id]);
                          setCommentInput({...commentInput, [task.id]: ''});
                        }}
                        className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-md"
                      >
                        Add Note
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
