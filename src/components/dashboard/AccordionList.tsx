"use client";

import React, { useState } from "react";

interface AccordionItemProps {
  title: string;
  icon: React.ReactNode;
  content: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100/80 premium-shadow overflow-hidden transition-all duration-300 hover:border-slate-200">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3.5">
          <div className="text-slate-400 p-1.5 rounded-lg bg-slate-50 border border-slate-100 shadow-sm">
            {icon}
          </div>
          <span className="text-xs font-bold text-slate-700 tracking-wide">{title}</span>
        </div>

        <button
          className={`w-7 h-7 rounded-full bg-[#F5C518] hover:bg-[#E5B612] flex items-center justify-center text-slate-800 transition-transform duration-300 shadow-sm ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expandable Content Panel */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-24 opacity-100 border-t border-slate-50" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 text-[11px] text-slate-500 leading-relaxed bg-slate-50/30">
          {content}
        </div>
      </div>
    </div>
  );
};

export const AccordionList: React.FC = () => {
  return (
    <div className="flex flex-col gap-3">
      <AccordionItem
        title="Lorem ipsum"
        content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />
      <AccordionItem
        title="Lorem ipsum"
        content="Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 13v-1m0 1v-3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 7h.01M12 10h.01M12 13h.01M19 7h.01M19 10h.01M19 13h.01M16 7h.01M16 10h.01M16 13h.01" />
          </svg>
        }
      />
    </div>
  );
};
