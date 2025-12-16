/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React from 'react';
import { Section } from '../types';
import { BookOpen, ChevronRight, X } from './Icons';

interface SidebarProps {
  sections: Section[];
  selectedSectionId: string;
  onSelectSection: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sections, selectedSectionId, onSelectSection, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-blue-600 text-white shadow-md">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6" />
              <h1 className="text-xl font-bold tracking-tight">PhysioExam</h1>
            </div>
            <button onClick={onClose} className="md:hidden p-1 rounded hover:bg-blue-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title - Sections */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sections</h2>
          </div>

          {/* Navigation List */}
          <nav className="flex-1 overflow-y-auto py-2">
            <ul className="space-y-1 px-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => {
                      onSelectSection(section.id);
                      onClose(); // Close on mobile selection
                    }}
                    className={`
                      w-full text-left px-3 py-3 rounded-md text-sm font-medium flex items-center justify-between group transition-colors
                      ${selectedSectionId === section.id 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                    `}
                  >
                    <span className="line-clamp-2 leading-relaxed">{section.title}</span>
                    {selectedSectionId === section.id && (
                      <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;