"use client";

import React, { useState } from "react";
import { Card } from "../ui/Card";

export const SlidersCard: React.FC = () => {
  const [val1, setVal1] = useState(65);
  const [val2, setVal2] = useState(82);

  return (
    <Card className="flex flex-col h-[180px] justify-center gap-6 select-none">
      {/* Slider 1 */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Lorem ipsum</span>
          <span className="text-amber-500">{val1}%</span>
        </div>
        <div className="relative w-full flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={val1}
            onChange={(e) => setVal1(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-100 accent-amber-400 outline-none transition-all focus:ring-1 focus:ring-amber-200"
            style={{
              background: `linear-gradient(to right, #F5D547 0%, #F5D547 ${val1}%, #F1F5F9 ${val1}%, #F1F5F9 100%)`
            }}
          />
        </div>
      </div>

      {/* Slider 2 */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Lorem ipsum</span>
          <span className="text-pink-500">{val2}%</span>
        </div>
        <div className="relative w-full flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={val2}
            onChange={(e) => setVal2(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-100 accent-pink-500 outline-none transition-all focus:ring-1 focus:ring-pink-200"
            style={{
              background: `linear-gradient(to right, #FF4C91 0%, #FF4C91 ${val2}%, #F1F5F9 ${val2}%, #F1F5F9 100%)`
            }}
          />
        </div>
      </div>
    </Card>
  );
};
