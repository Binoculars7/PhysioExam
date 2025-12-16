/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React from 'react';
import { Question, AnswerData } from '../types';
import { RefreshCw, AlertCircle } from './Icons';

interface QuestionCardProps {
  question: Question;
  answerData: AnswerData;
  onGenerate: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, answerData, onGenerate }) => {
  const { text, loading, error } = answerData;
  
  const isPendingOrLoading = loading || (!text && !error);

  // Render markdown-like text with specific formatting for physiology study guides
  const renderAnswer = (content: string) => {
    if (!content) return null;
    return content.split('\n').map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={index} className="h-1" />; // Smaller gap for empty lines
      
      // Handle Bullet Points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
         const listContent = trimmed.substring(2);
         const parts = listContent.split('**');
         return (
           <div key={index} className="flex items-start ml-4 mb-1.5 text-gray-800 text-sm md:text-base leading-relaxed">
              <span className="mr-2 text-blue-500 mt-1.5 text-xs">•</span>
              <span>
                {parts.map((part, i) => {
                  if (i % 2 === 1) return <strong key={i} className="font-bold text-gray-900">{part}</strong>;
                  return <span key={i}>{part}</span>;
                })}
              </span>
           </div>
         );
      }
      
      // Handle "Section" headers (e.g., "**1. Subject of physiology**")
      // We look for lines that start and end with ** or are just bold text starting with a number
      if (trimmed.startsWith('**') && (trimmed.match(/^\*\*\d+\./) || trimmed.endsWith('**'))) {
          // Remove the ** markers for cleaner display, but keep the boldness
          const cleanText = trimmed.replace(/\*\*/g, '');
          return (
            <h4 key={index} className="font-bold text-gray-900 mt-5 mb-2 text-base md:text-lg border-l-4 border-blue-500 pl-3">
              {cleanText}
            </h4>
          );
      }
      
      // Handle Standard Markdown Headers
      if (trimmed.startsWith('### ')) {
          return <h4 key={index} className="font-bold text-gray-900 mt-4 mb-2 text-base border-b border-gray-100 pb-1">{trimmed.substring(4)}</h4>
      }
      if (trimmed.startsWith('## ')) {
          return <h3 key={index} className="font-bold text-gray-900 mt-6 mb-3 text-lg">{trimmed.substring(3)}</h3>
      }

      // Handle standard paragraphs with bold text
      const parts = line.split('**');
      if (parts.length > 1) {
         return (
           <p key={index} className="mb-2 text-gray-800 text-sm md:text-base leading-relaxed">
              {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part))}
           </p>
         )
      }

      return <p key={index} className="mb-2 text-gray-800 text-sm md:text-base leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden break-inside-avoid">
      
      {/* Question Header */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {question.number}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 leading-snug">
               {question.text}
            </h3>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 bg-white min-h-[100px]">
        
        {/* Loading / Pending State - Always show skeleton if not ready */}
        {isPendingOrLoading && (
           <div className="space-y-3 animate-pulse">
              <div className="h-2.5 bg-gray-100 rounded w-full"></div>
              <div className="h-2.5 bg-gray-100 rounded w-5/6"></div>
              <div className="h-2.5 bg-gray-100 rounded w-4/6"></div>
              <div className="h-2.5 bg-gray-100 rounded w-full mt-4"></div>
              <div className="h-2.5 bg-gray-100 rounded w-3/4"></div>
           </div>
        )}

        {/* Error State */}
        {!isPendingOrLoading && error && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 text-red-700 bg-red-50 rounded-lg border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="text-sm flex-1">
                  <p className="font-semibold">Unable to load explanation</p>
                  <p className="text-red-600 mt-1">{error}</p>
              </div>
              <button 
                  onClick={onGenerate}
                  className="px-4 py-2 bg-white border border-red-200 rounded-md hover:bg-red-50 text-sm font-semibold shadow-sm text-red-700 whitespace-nowrap"
              >
                  Retry
              </button>
          </div>
        )}

        {/* Answer Content */}
        {!isPendingOrLoading && text && (
            <div className="animate-fadeIn">
                <div className="prose prose-blue max-w-none text-gray-800">
                    {renderAnswer(text)}
                </div>
                
                {/* Regeneration Action */}
                <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end opacity-0 hover:opacity-100 transition-opacity">
                     <button 
                     onClick={onGenerate}
                     className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1.5 transition-colors uppercase font-bold tracking-wider"
                     title="Regenerate Answer"
                   >
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