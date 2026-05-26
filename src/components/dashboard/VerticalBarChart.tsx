"use client";

import React, { useState } from "react";
import { Card } from "../ui/Card";

export const VerticalBarChart: React.FC = () => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const bars = [
    { value: 56, heightPercent: 82 },
    { value: 51, heightPercent: 74 },
    { value: 28, heightPercent: 41 },
    { value: 54, heightPercent: 79 },
    { value: 37, heightPercent: 54 },
    { value: 52, heightPercent: 76 },
  ];

  return (
    <Card className="flex flex-col h-[200px] justify-between select-none">
      {/* Bars container */}
      <div className="flex-1 flex items-end justify-between px-2 gap-4 pb-2 border-b border-slate-100/80 relative">
        {bars.map((bar, index) => {
          const isHovered = hoveredBar === index;
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Tooltip on hover */}
              <div
                className={`absolute bottom-full mb-1 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow transition-all duration-200 ${
                  isHovered ? "opacity-100 scale-100 -translate-y-1" : "opacity-0 scale-90 translate-y-1 pointer-events-none"
                }`}
              >
                {bar.value}%
              </div>

              {/* Bar bar fill */}
              <div className="w-full bg-slate-50 border border-slate-100/30 rounded-t-full h-full flex items-end overflow-hidden shadow-inner">
                <div
                  className={`w-full bg-gradient-to-t from-[#5113C2] to-[#8C52FF] rounded-t-full transition-all duration-500 ease-out origin-bottom ${
                    isHovered ? "brightness-110 shadow-indigo-200/50 shadow-md" : ""
                  }`}
                  style={{ height: `${bar.heightPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis Values */}
      <div className="flex justify-between px-2 text-[10px] text-slate-500 font-extrabold pt-2">
        {bars.map((bar, index) => (
          <span
            key={index}
            className={`w-full text-center transition-colors duration-200 ${
              hoveredBar === index ? "text-[#5113C2]" : "text-slate-400"
            }`}
          >
            {bar.value}
          </span>
        ))}
      </div>
    </Card>
  );
};
