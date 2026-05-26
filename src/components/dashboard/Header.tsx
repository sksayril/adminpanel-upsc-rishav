"use client";

import React, { useState } from "react";
import { UserSession } from "@/hooks/useAuth";

interface HeaderProps {
  user: UserSession;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="flex items-center justify-between py-4 px-6 mb-2 select-none relative">
      {/* Left side tabs removed */}
      <div />

      {/* Right side options */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <button className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
          <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Notifications */}
        <button className="relative text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
          <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Badge */}
          <span className="absolute -top-1.5 -right-1.5 bg-[#05C287] border-2 border-white text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
            5
          </span>
        </button>

        {/* User Name & Profile Indicator */}
        <div className="flex items-center gap-3 relative">
          <span className="text-xs font-bold text-slate-600 select-none hidden md:inline">
            {user.name}
          </span>
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-sky-400 to-[#05C287] p-[2px] transition-transform duration-300 hover:scale-105 shadow-md cursor-pointer"
          >
            <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
              <svg className="w-6 h-6 text-slate-600 mt-1.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#05C287] border-2 border-white rounded-full" />
          </div>

          {/* User Menu Dropdown */}
          {showProfileMenu && (
            <>
              {/* Backscreen tap layer to close */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-12 bg-white border border-slate-100 rounded-2xl p-4 w-52 premium-shadow z-50 animate-fade-in flex flex-col gap-3">
                <div className="flex flex-col border-b border-slate-50 pb-2">
                  <span className="text-xs font-black text-slate-800">{user.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 py-2 px-3 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Hamburger Menu */}
        <button className="text-slate-700 hover:text-slate-900 transition-colors cursor-pointer">
          <svg className="w-6.5 h-6.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};
