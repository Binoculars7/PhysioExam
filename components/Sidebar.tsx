/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React from 'react';
import { Section } from '../types';
import { BookOpen, ChevronRight, X, RefreshCw } from './Icons';

interface SidebarProps {
  sections: Section[];
  selectedSectionId: string;
  onSelectSection: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onClearCache: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sections, selectedSectionId, onSelectSection, isOpen, onClose, onClearCache }) => {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={onClose} />}

      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 bg-blue-600 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6" />
              <h1 className="text-xl font-bold tracking-tight">PhysioExam</h1>
            </div>
            <button onClick={onClose} className="md:hidden"><X /></button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Knowledge Areas</div>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => { onSelectSection(section.id); onClose(); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between group transition-all ${selectedSectionId === section.id ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="line-clamp-2">{section.title}</span>
                {selectedSectionId === section.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={onClearCache}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase"
            >
              <RefreshCw className="w-3 h-3" />
              Clear Saved Answers
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;