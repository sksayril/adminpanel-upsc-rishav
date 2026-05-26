"use client";

import React, { useState } from "react";
import { Card } from "../ui/Card";

export const FinancialMetricCard: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Card className="flex flex-col h-[180px] justify-between relative overflow-visible select-none">
      {/* Top Value and Question helper */}
      <div className="flex items-center gap-2 relative">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">$3 580</h2>
        
        {/* Tooltip trigger button */}
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4B73FF] hover:bg-[#4B73FF] hover:text-white transition-colors cursor-pointer text-xs font-bold shadow-sm"
        >
          ?
        </button>

        {/* Hover Tooltip Box */}
        {showTooltip && (
          <div className="absolute top-8 left-20 bg-slate-800 text-white text-[10px] rounded-lg py-1.5 px-3 z-30 shadow-lg w-44 leading-relaxed transition-all duration-300">
            Total consolidated earnings calculated in real-time.
          </div>
        )}
      </div>

      {/* Description and rate change */}
      <div className="flex flex-col gap-1 -mt-2">
        <p className="text-[11px] text-slate-400 font-semibold tracking-wide">
          Lorem ipsum dolor sit amet
        </p>
        <span className="text-xs font-extrabold text-[#4B73FF] tracking-wide">
          +5.4% ($125)
        </span>
      </div>

      {/* Footer link and button */}
      <div className="flex items-center justify-between border-t border-slate-100/80 pt-4 mt-1">
        <span className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
          Lorem ipsum
        </span>
        <button className="flex items-center gap-1.5 bg-gradient-to-r from-[#FF6B99] to-[#FF4C91] hover:brightness-105 active:scale-95 text-white font-extrabold text-xs px-5 py-2.5 rounded-full transition-all duration-300 shadow-md shadow-rose-200">
          <span>Lorem</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </Card>
  );
};
