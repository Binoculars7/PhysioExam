/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState, useEffect, useRef } from 'react';
import { Section, AnswerState, AnswerData } from '../types';
import QuestionCard from './QuestionCard';
import { Search } from './Icons';
import { generateAnswer } from '../services/geminiService';

interface SectionViewProps {
  section: Section;
  answers: AnswerState;
  onUpdateAnswer: (id: string, data: Partial<AnswerData>) => void;
}

const SectionView: React.FC<SectionViewProps> = ({ section, answers, onUpdateAnswer }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use a ref to prevent double-firing effects or stale closure issues during the async loop
  const isGeneratingRef = useRef(false);

  const filteredQuestions = section.questions.filter(q => 
    q.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchAnswer = async (questionId: string, text: string) => {
    onUpdateAnswer(questionId, { loading: true, error: null });
    try {
      const result = await generateAnswer(text);
      onUpdateAnswer(questionId, { text: result, loading: false });
    } catch (err) {
      onUpdateAnswer(questionId, { 
        loading: false, 
        error: err instanceof Error ? err.message : 'Failed to generate answer' 
      });
    }
  };

  // Automatically generate answers when the section changes
  useEffect(() => {
    const generateAllMissing = async () => {
      // Prevent overlapping generation loops
      if (isGeneratingRef.current) return;
      
      const questionsToFetch = section.questions.filter(q => !answers[q.id]?.text && !answers[q.id]?.loading);
      
      if (questionsToFetch.length === 0) return;

      isGeneratingRef.current = true;

      // Mark all as loading initially to show skeletons immediately
      questionsToFetch.forEach(q => {
         onUpdateAnswer(q.id, { loading: true });
      });

      for (const question of questionsToFetch) {
        // Double check if it was solved in the meantime (e.g. user action)
        // Note: accessing 'answers' here directly would be stale, so we rely on the loop's initial set.
        // Ideally we fetch one by one.
        
        await fetchAnswer(question.id, question.text);
        
        // Brief delay to be polite to the API rate limits
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      isGeneratingRef.current = false;
    };

    generateAllMissing();
    
    // Cleanup function to cancel flag if user switches away (though async loop continues, it prevents new starts)
    return () => {
        isGeneratingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id]); // Only re-run when section changes

  const completedCount = filteredQuestions.filter(q => answers[q.id]?.text).length;
  const totalCount = filteredQuestions.length;
  const progress = Math.round((completedCount / totalCount) * 100) || 0;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
             <div>
                <h5 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Study Guide</h5>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                  {section.title}
                </h2>
             </div>
             <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="text-right w-full md:w-auto">
                  <p className="text-sm font-medium text-gray-900">{completedCount} of {totalCount} Answered</p>
                  <div className="w-full md:w-48 h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
               </div>
             </div>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                placeholder="Search questions in this section..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-8">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <QuestionCard 
                key={question.id} 
                question={question} 
                answerData={answers[question.id] || { text: null, loading: true, error: null }} // Default to loading if not found, since auto-gen starts immediately
                onGenerate={() => fetchAnswer(question.id, question.text)}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No questions found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
        
        {/* Footer spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default SectionView;