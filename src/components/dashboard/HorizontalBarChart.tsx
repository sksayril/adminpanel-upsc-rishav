"use client";

import React from "react";
import { Card } from "../ui/Card";

export const HorizontalBarChart: React.FC = () => {
  const chartData = [
    { id: 1, label: "500", progress: 84, color: "bg-gradient-to-r from-[#B088FF] to-[#D8B4FE]" },
    { id: 2, label: "400", progress: 70, color: "bg-gradient-to-r from-[#C084FC] to-[#E9D5FF]" },
    { id: 3, label: "300", progress: 80, color: "bg-gradient-to-r from-[#F5D547] to-[#FDE047]" },
  ];

  const gridLines = ["500", "400", "300", "200", "100"];

  return (
    <Card className="flex flex-col h-[280px] justify-between">
      {/* Chart grid area */}
      <div className="relative flex-1 flex flex-col justify-between py-1">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pl-10 pr-2 py-1">
          {gridLines.map((line, idx) => (
            <div key={idx} className="w-full flex items-center border-t border-slate-100 h-0" />
          ))}
        </div>

        {/* Chart Bars */}
        <div className="flex flex-col gap-6 relative z-10">
          {chartData.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              {/* Y Axis Label */}
              <span className="w-6 text-[10px] font-bold text-slate-400 text-right select-none">
                {item.label}
              </span>
              
              {/* Bar track */}
              <div className="flex-1 h-6 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 shadow-inner">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out hover:brightness-105 shadow-sm`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Custom Y-axis bottom labels placeholder to align grid bottom */}
        <div className="flex justify-between pl-10 text-[9px] text-slate-300 font-medium select-none pt-2">
          <span>0</span>
          <span>100</span>
          <span>200</span>
          <span>300</span>
          <span>400</span>
          <span>500</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-start gap-6 border-t border-slate-100/80 pt-4 mt-2 select-none">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-[#F5D547] inline-block shadow-sm" />
          <span className="text-[11px] font-bold text-slate-500">Amet lorem</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-[#B088FF] inline-block shadow-sm" />
          <span className="text-[11px] font-bold text-slate-500">Ipsum dolor</span>
        </div>
      </div>
    </Card>
  );
};
