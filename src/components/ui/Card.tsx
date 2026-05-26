import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`premium-card p-6 bg-white premium-shadow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_0_rgba(142,156,198,0.12)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
