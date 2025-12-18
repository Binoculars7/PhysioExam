/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState, useRef } from 'react';
import { Section, AnswerState, AnswerData } from '../types';
import QuestionCard from './QuestionCard';
import { Search, BookOpen, RefreshCw } from './Icons';
import { generateAnswer } from '../services/geminiService';

interface SectionViewProps {
  section: Section;
  answers: AnswerState;
  onUpdateAnswer: (id: string, data: Partial<AnswerData>) => void;
}

const SectionView: React.FC<SectionViewProps> = ({ section, answers, onUpdateAnswer }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const stopBatchRef = useRef(false);

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

  const handleGenerateAll = async () => {
    if (isBatchGenerating) {
      stopBatchRef.current = true;
      setIsBatchGenerating(false);
      return;
    }

    const missing = filteredQuestions.filter(q => !answers[q.id]?.text);
    if (missing.length === 0) return;

    setIsBatchGenerating(true);
    stopBatchRef.current = false;

    for (const question of missing) {
      if (stopBatchRef.current) break;
      await fetchAnswer(question.id, question.text);
      // Wait 5 seconds between questions to stay safely under free tier rate limits (15 RPM)
      if (missing.indexOf(question) < missing.length - 1) {
        await new Promise(r => setTimeout(r, 5000));
      }
    }
    setIsBatchGenerating(false);
  };

  const completedCount = filteredQuestions.filter(q => !!answers[q.id]?.text).length;
  const progress = Math.round((completedCount / filteredQuestions.length) * 100) || 0;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
             <div className="flex-1">
                <h5 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Study Module</h5>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{section.title}</h2>
             </div>
             
             <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-right w-full sm:w-auto">
                    <p className="text-xs font-bold text-gray-500 mb-1">{completedCount} / {filteredQuestions.length} COMPLETED</p>
                    <div className="w-full sm:w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                
                <button 
                  onClick={handleGenerateAll}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 
                    ${isBatchGenerating 
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {isBatchGenerating ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Stop Generating</>
                  ) : (
                    <><BookOpen className="w-4 h-4" /> Generate All Missing</>
                  )}
                </button>
             </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isBatchGenerating && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Generating sequentially with a 5s delay to prevent API limits. Stay on this tab.</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {filteredQuestions.map((question) => (
            <QuestionCard 
              key={question.id} 
              question={question} 
              answerData={answers[question.id] || { text: null, loading: false, error: null }}
              onGenerate={() => fetchAnswer(question.id, question.text)}
            />
          ))}
        </div>
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default SectionView;