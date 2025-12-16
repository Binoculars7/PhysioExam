/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SectionView from './components/SectionView';
import { SECTIONS } from './data';
import { Menu } from './components/Icons';
import { AnswerState } from './types';

const App: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(SECTIONS[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Global state to store answers for all questions
  const [answers, setAnswers] = useState<AnswerState>({});

  const selectedSection = SECTIONS.find(s => s.id === selectedSectionId) || SECTIONS[0];

  const handleUpdateAnswer = (questionId: string, data: Partial<import('./types').AnswerData>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || { text: null, loading: false, error: null }),
        ...data
      }
    }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar 
        sections={SECTIONS}
        selectedSectionId={selectedSectionId}
        onSelectSection={setSelectedSectionId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header Bar */}
        <div className="md:hidden bg-blue-600 text-white p-4 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="p-1 rounded hover:bg-blue-700">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg">PhysioExam</span>
          </div>
        </div>

        <SectionView 
          section={selectedSection} 
          answers={answers}
          onUpdateAnswer={handleUpdateAnswer}
        />
      </main>
    </div>
  );
};

export default App;