/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SectionView from './components/SectionView';
import { SECTIONS } from './data';
import { Menu } from './components/Icons';
import { AnswerState } from './types';

const CACHE_KEY = 'physio_exam_answers_v1';

const App: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(SECTIONS[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Initialize state from LocalStorage or empty object
  const [answers, setAnswers] = useState<AnswerState>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  });

  // Persist answers to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(answers));
  }, [answers]);

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

  const clearCache = () => {
    if (window.confirm("Are you sure you want to clear all saved answers?")) {
      setAnswers({});
      localStorage.removeItem(CACHE_KEY);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar 
        sections={SECTIONS}
        selectedSectionId={selectedSectionId}
        onSelectSection={setSelectedSectionId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onClearCache={clearCache}
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