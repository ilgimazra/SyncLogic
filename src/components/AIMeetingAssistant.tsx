import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, User, MessageSquare, Trash2, Share2, Loader2 } from 'lucide-react';
import { useSyncLogic } from '../context/SyncLogicContext';
import { MeetingNote, MeetingSummary } from '../types';
import { motion, AnimatePresence } from 'motion/react';

import { GoogleGenAI } from "@google/genai";

const AIMeetingAssistant: React.FC = () => {
  const { state, addMeetingNote, addMeetingSummary, clearMeetingNotes } = useSyncLogic();
  const [isOpen, setIsOpen] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const currentTeam = state.teams.find(t => t.id === state.currentTeamId);
  const teamNotes = (state.meetingNotes || []).filter(n => n.teamId === state.currentTeamId);
  const teamSummaries = (state.meetingSummaries || []).filter(s => s.teamId === state.currentTeamId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [teamNotes]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !noteText.trim() || !state.currentTeamId) return;

    const newNote: MeetingNote = {
      id: `note-${Date.now()}`,
      member: memberName,
      text: noteText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      teamId: state.currentTeamId
    };

    addMeetingNote(newNote);
    setNoteText('');
  };

  const handleGenerateSummary = async () => {
    if (teamNotes.length === 0 || !state.currentTeamId) return;
    
    setIsGenerating(true);
    try {
      const notesContext = teamNotes.map(n => `${n.member}: ${n.text}`).join('\n');
      const prompt = `
        You are an AI Meeting Assistant. Below are the notes from a team meeting. 
        Please generate a structured summary in Markdown format with the following sections:
        - 🎯 Key Decisions
        - 📋 Action Items
        - 🚀 Next Steps

        Meeting Notes:
        ${notesContext}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const summaryText = response.text || 'Failed to generate summary.';

      const newSummary: MeetingSummary = {
        id: `summary-${Date.now()}`,
        text: summaryText,
        timestamp: new Date().toLocaleString(),
        teamId: state.currentTeamId
      };

      addMeetingSummary(newSummary);
    } catch (error) {
      console.error('AI Generation Error:', error);
      alert('Failed to generate AI summary. Please check your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNotifyTeam = () => {
    // In a real app, this would send an email or push notification
    alert('AI Summary shared with all team members successfully!');
  };

  if (!state.currentTeamId) return null;

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center z-50 group"
        id="ai-assistant-fab"
      >
        <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">AI</span>
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[380px] bg-white/80 backdrop-blur-xl border-l border-emerald-100 shadow-2xl z-[70] flex flex-col"
              id="ai-assistant-drawer"
            >
              {/* Header */}
              <div className="p-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-600 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="font-bold">AI Meeting Assistant</h2>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-emerald-500 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Notes Feed */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
              >
                {teamNotes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-60">
                    <MessageSquare className="w-12 h-12" />
                    <p className="text-sm">No notes yet. Start collaborating!</p>
                  </div>
                ) : (
                  teamNotes.map((note) => (
                    <div key={note.id} className="bg-white p-3 rounded-xl border border-emerald-50 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <User className="w-3 h-3" /> {note.member}
                        </span>
                        <span className="text-[10px] text-gray-400">{note.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{note.text}</p>
                    </div>
                  ))
                )}

                {/* AI Summary Box */}
                {teamSummaries.length > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-br from-emerald-50 to-amber-50 border border-emerald-200 rounded-2xl shadow-inner">
                    <div className="flex items-center gap-2 mb-3 text-emerald-800">
                      <Sparkles className="w-4 h-4" />
                      <h3 className="text-sm font-bold uppercase tracking-wider">Latest AI Summary</h3>
                    </div>
                    <div className="prose prose-sm text-emerald-900 whitespace-pre-wrap">
                      {teamSummaries[teamSummaries.length - 1].text}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={handleNotifyTeam}
                        className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                      >
                        <Share2 className="w-3 h-3" /> Notify Team
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Section */}
              <div className="p-4 border-t border-emerald-100 bg-emerald-50/50">
                <form onSubmit={handleAddNote} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      className="w-1/3 p-2 text-xs border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Add a note..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 p-2 text-xs border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      required
                    />
                    <button 
                      type="submit"
                      className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isGenerating || teamNotes.length === 0}
                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate AI Summary
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => clearMeetingNotes(state.currentTeamId!)}
                    title="Clear all notes"
                    className="p-2.5 text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIMeetingAssistant;
