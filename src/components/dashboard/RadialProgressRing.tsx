"use client";

import React from "react";
import { Card } from "../ui/Card";

interface SingleRingProps {
  percentage: number;
  color: string;
  glowClass: string;
  label: string;
}

const SingleRing: React.FC<SingleRingProps> = ({ percentage, color, glowClass, label }) => {
  const radius = 34;
  const strokeDasharray = 2 * Math.PI * radius; // ~213.6
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  return (
    <div className="flex flex-col items-center gap-4 flex-1">
      {/* Circle Container */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Shadow layer underneath for premium depth */}
        <div className="absolute inset-2 bg-slate-50/50 rounded-full border border-slate-100 shadow-inner pointer-events-none" />

        <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 80 80">
          {/* Background track circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-slate-100"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Active progress track */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className={`stroke-current ${color} ${glowClass} transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        {/* Percentage Label */}
        <span className="absolute text-sm font-extrabold text-slate-800 z-20 select-none">
          {percentage}%
        </span>
      </div>

      {/* Under Label */}
      <div className="text-center">
        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
          {label}
        </span>
      </div>
    </div>
  );
};

export const RadialProgressRing: React.FC = () => {
  return (
    <Card className="flex items-center justify-around h-[180px] py-4">
      <SingleRing
        percentage={77}
        color="text-[#FF4C91]"
        glowClass="neon-glow-pink"
        label="Lorem ipsum dolor"
      />
      <div className="w-[1px] h-20 bg-slate-100/80" />
      <SingleRing
        percentage={62}
        color="text-[#05C287]"
        glowClass="neon-glow-green"
        label="Lorem ipsum dolor"
      />
    </Card>
  );
};
