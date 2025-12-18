/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React from 'react';
import { Question, AnswerData } from '../types';
import { RefreshCw, AlertCircle, BookOpen } from './Icons';

interface QuestionCardProps {
  question: Question;
  answerData: AnswerData;
  onGenerate: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, answerData, onGenerate }) => {
  const { text, loading, error } = answerData;
  
  const isIdle = !text && !loading && !error;

  const renderAnswer = (content: string) => {
    if (!content) return null;
    return content.split('\n').map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={index} className="h-1" />;
      
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
         const listContent = trimmed.substring(2);
         return (
           <div key={index} className="flex items-start ml-4 mb-1.5 text-gray-800 text-sm md:text-base leading-relaxed">
              <span className="mr-2 text-blue-500 mt-1.5 text-xs">•</span>
              <span>{listContent.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</span>
           </div>
         );
      }
      
      if (trimmed.startsWith('**') && (trimmed.match(/^\*\*\d+\./) || trimmed.endsWith('**'))) {
          return (
            <h4 key={index} className="font-bold text-gray-900 mt-5 mb-2 text-base md:text-lg border-l-4 border-blue-500 pl-3">
              {trimmed.replace(/\*\*/g, '')}
            </h4>
          );
      }

      const parts = line.split('**');
      return (
        <p key={index} className="mb-2 text-gray-800 text-sm md:text-base leading-relaxed">
          {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part)}
        </p>
      );
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {question.number}
          </div>
          <h3 className="text-lg font-bold text-gray-900 leading-snug">{question.text}</h3>
        </div>
      </div>

      <div className="p-6 bg-white min-h-[80px]">
        {isIdle && (
          <div className="flex flex-col items-center justify-center py-4">
            <button 
              onClick={onGenerate}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              <BookOpen className="w-5 h-5" />
              Reveal Answer
            </button>
            <p className="text-xs text-gray-400 mt-2 italic">Uses AI to generate a detailed explanation</p>
          </div>
        )}

        {loading && (
           <div className="space-y-3 animate-pulse">
              <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Consulting medical literature...</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded w-full"></div>
              <div className="h-2.5 bg-gray-100 rounded w-5/6"></div>
              <div className="h-2.5 bg-gray-100 rounded w-4/6"></div>
           </div>
        )}

        {error && (
          <div className="p-4 text-red-700 bg-red-50 rounded-lg border border-red-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
              <button onClick={onGenerate} className="text-xs font-bold uppercase underline">Retry</button>
          </div>
        )}

        {text && (
            <div className="animate-fadeIn">
                <div className="prose prose-blue max-w-none text-gray-800">
                    {renderAnswer(text)}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={onGenerate} className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1.5 font-bold">
                       <RefreshCw className="w-3 h-3" />
                       Regenerate
                     </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;