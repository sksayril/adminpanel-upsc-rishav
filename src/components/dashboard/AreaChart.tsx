"use client";

import React, { useState } from "react";
import { Card } from "../ui/Card";

export const AreaChart: React.FC = () => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const points = [
    { x: 50, y: 70, val: "1,678" },
    { x: 180, y: 40, val: "4,112" },
  ];

  return (
    <Card className="flex flex-col h-[280px] justify-between">
      {/* Title */}
      <div className="flex items-center justify-between select-none">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Amet lorem
        </span>
      </div>

      {/* SVG Wave Chart */}
      <div className="relative flex-1 flex flex-col justify-end mt-4">
        {/* Absolute values display */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-2 text-[10px] text-slate-400 font-bold select-none pointer-events-none">
          {points.map((p, idx) => (
            <div
              key={idx}
              className={`bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 shadow-sm transition-all duration-300 ${
                hoveredPoint === idx || hoveredPoint === null
                  ? "opacity-100 scale-100"
                  : "opacity-40 scale-95"
              }`}
              style={{
                position: "absolute",
                left: `${p.x - 20}px`,
                top: `${p.y - 32}px`,
              }}
            >
              {p.val}
            </div>
          ))}
        </div>

        {/* Chart SVG */}
        <svg className="w-full h-32" viewBox="0 0 280 120" preserveAspectRatio="none">
          <defs>
            {/* Gradient for fill */}
            <linearGradient id="area-pink-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF4C91" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FF4C91" stopOpacity="0.0" />
            </linearGradient>
            {/* Gradient for stroke */}
            <linearGradient id="line-pink-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF7CA3" />
              <stop offset="50%" stopColor="#FF4C91" />
              <stop offset="100%" stopColor="#E03276" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="30" x2="280" y2="30" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="60" x2="280" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="90" x2="280" y2="90" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />

          {/* Area Path */}
          <path
            d="M 0,110 C 30,105 40,85 60,80 C 80,75 105,95 125,90 C 145,85 160,50 180,50 C 200,50 215,85 240,80 C 265,75 275,105 280,110 L 280,120 L 0,120 Z"
            fill="url(#area-pink-gradient)"
          />

          {/* Wave Line */}
          <path
            d="M 0,110 C 30,105 40,85 60,80 C 80,75 105,95 125,90 C 145,85 160,50 180,50 C 200,50 215,85 240,80 C 265,75 275,105 280,110"
            fill="none"
            stroke="url(#line-pink-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            className="neon-glow-pink"
          />

          {/* Interactive circles */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y + 10}
              r={hoveredPoint === idx ? "7" : "5"}
              className="fill-white stroke-[#FF4C91] stroke-[3px] transition-all duration-200 cursor-pointer drop-shadow-sm"
              onMouseEnter={() => setHoveredPoint(idx)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between border-t border-slate-100/85 pt-3 text-[9px] text-slate-400 font-bold select-none mt-1">
        <span>1,000</span>
        <span>2,000</span>
        <span>3,000</span>
        <span>4,000</span>
        <span>5,000</span>
      </div>
    </Card>
  );
};
