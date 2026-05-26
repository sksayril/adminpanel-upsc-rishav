"use client";

import React from "react";
import { Card } from "../ui/Card";

export const VolumeDensityChart: React.FC = () => {
  // Generate pseudo-random wave heights for density simulation
  const barHeights = [
    30, 45, 55, 40, 25, 35, 50, 65, 80, 75, 60, 45, 30, 40, 55, 70, 90, 85, 75, 60, 40, 50, 60, 75,
    65, 50, 35, 45, 55, 40, 30, 20
  ];

  return (
    <Card className="flex flex-col h-[180px] justify-between select-none">
      {/* Top Header Row */}
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Amet lorem
        </span>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">78,897</h3>
      </div>

      {/* Histogram Density Plot */}
      <div className="h-16 flex items-end gap-[3px] mt-4 px-1">
        {barHeights.map((height, index) => {
          // Color shift between blue-sky and teal-green
          const colorClass =
            index % 3 === 0
              ? "bg-emerald-400/80"
              : index % 3 === 1
              ? "bg-[#05C287]"
              : "bg-cyan-400/80";

          return (
            <div
              key={index}
              className={`flex-1 rounded-full ${colorClass} hover:brightness-115 transition-all duration-300`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      {/* Footer Text */}
      <div className="flex justify-end border-t border-slate-100/80 pt-3 text-[10px] text-slate-400 font-bold mt-1">
        <span>Lorem ipsum</span>
      </div>
    </Card>
  );
};
