"use client";

import React from "react";

interface ProgressItemProps {
  percentage: number;
  color: string;
  glowClass: string;
  title: string;
  description: string;
}

const ProgressListItem: React.FC<ProgressItemProps> = ({
  percentage,
  color,
  glowClass,
  title,
  description,
}) => {
  const radius = 18;
  const strokeDasharray = 2 * Math.PI * radius; // ~113.1
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-100/80 premium-shadow transition-all duration-300 hover:border-slate-200">
      {/* Mini Circle SVG */}
      <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="stroke-slate-50"
            strokeWidth="4"
            fill="transparent"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            className={`stroke-current ${color} ${glowClass} transition-all duration-1000`}
            strokeWidth="4"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className="absolute text-[10px] font-black text-slate-700">
          {percentage}%
        </span>
      </div>

      {/* Info labels */}
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] font-extrabold text-slate-800 tracking-wider uppercase">
          {title}
        </h4>
        <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
          {description}
        </p>
      </div>
    </div>
  );
};

export const ProgressListCard: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 select-none">
      <ProgressListItem
        percentage={88}
        color="text-[#5113C2]"
        glowClass="glow-purple"
        title="Lorem ipsum dolor"
        description="Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed nonummy nibh euismod"
      />
      <ProgressListItem
        percentage={73}
        color="text-[#B088FF]"
        glowClass="glow-purple"
        title="Lorem ipsum dolor"
        description="Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed nonummy nibh euismod"
      />
    </div>
  );
};
