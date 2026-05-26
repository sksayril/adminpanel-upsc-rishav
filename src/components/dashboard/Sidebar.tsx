"use client";

import React, { useState } from "react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  activeItem: string;
  onChangeActiveItem: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onLogout,
  activeItem,
  onChangeActiveItem,
}) => {
  const [isAppManagerOpen, setIsAppManagerOpen] = useState(true);
  const [showPopover, setShowPopover] = useState(false);

  const menuItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "app-settings",
      label: "App Settings",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`relative flex-shrink-0 bg-gradient-to-b from-[#7B3FE4] to-[#5113C2] text-white flex flex-col justify-between rounded-[2rem] m-4 mr-0 select-none shadow-[0_12px_40px_rgba(81,19,194,0.15)] transition-all duration-500 ease-in-out ${
        isCollapsed ? "w-20 p-4" : "w-72 p-7"
      }`}
    >
      {/* Absolute Edge Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-[#F5C518] hover:bg-[#E5B612] flex items-center justify-center text-[#42169B] shadow-md z-30 transition-transform duration-300 hover:scale-110 cursor-pointer"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-500 ${isCollapsed ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Upper Section */}
      <div className="flex flex-col gap-9">
        {/* Brand / Logo */}
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF6B6B] to-[#FF8E53] flex items-center justify-center font-bold text-lg text-white shadow-md flex-shrink-0">
            L
          </div>
          {!isCollapsed && (
            <div className="border border-white/40 px-3 py-1 rounded-md text-xs font-semibold tracking-wider text-white/90 animate-fade-in">
              LOGO
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex flex-col gap-6">
          <div
            className={`text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 pl-3 transition-opacity duration-300 ${
              isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
            }`}
          >
            Lorem
          </div>
          <nav className="flex flex-col gap-1.5 relative">
            {/* 1. Main Dashboard Link */}
            {menuItems.map((item) => {
              const isActive = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onChangeActiveItem(item.id)}
                  className={`relative flex items-center rounded-2xl text-sm font-medium tracking-wide text-left transition-all duration-300 overflow-hidden ${
                    isCollapsed ? "justify-center p-3" : "gap-4 py-3.5"
                  } ${
                    isActive
                      ? "bg-white/15 text-white font-semibold shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)] " + (isCollapsed ? "pl-4" : "pl-7")
                      : `text-white/70 hover:text-white hover:bg-white/5 ` + (isCollapsed ? "" : "pl-5")
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* Left white indicator capsule */}
                  {isActive && (
                    <div className={`absolute left-0 top-0 bottom-0 bg-white rounded-r-2xl ${isCollapsed ? "w-1" : "w-2"}`} />
                  )}
                  <span className={`transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="transition-opacity duration-300 overflow-hidden whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}

            {/* 2. Collapsible App Manager Link */}
            <div className="flex flex-col">
              <button
                onClick={() => {
                  if (isCollapsed) {
                    setShowPopover(!showPopover);
                  } else {
                    setIsAppManagerOpen(!isAppManagerOpen);
                  }
                }}
                className={`relative flex items-center rounded-2xl text-sm font-medium tracking-wide text-left transition-all duration-300 overflow-hidden ${
                  isCollapsed ? "justify-center p-3" : "pl-5 pr-4 py-3.5 justify-between"
                } ${
                  activeItem.startsWith("app-manager") && !isCollapsed
                    ? "bg-white/15 text-white font-semibold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
                title={isCollapsed ? "App Manager" : undefined}
              >
                <div className="flex items-center gap-4">
                  {/* Grid Cubes Icon */}
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  {!isCollapsed && <span>App Manager</span>}
                </div>
                {!isCollapsed && (
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-300 text-white/60 ${isAppManagerOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Sub-options for App Manager (Open Sidebar) */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden flex flex-col gap-1 pl-12 mt-1.5 ${
                  isAppManagerOpen && !isCollapsed ? "max-h-24 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                }`}
              >
                <button
                  onClick={() => onChangeActiveItem("app-manager-upsc")}
                  className={`flex items-center gap-3.5 py-2 px-3 text-xs font-semibold rounded-xl text-left transition-all duration-300 w-full ${
                    activeItem === "app-manager-upsc"
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      activeItem === "app-manager-upsc" ? "bg-[#F5C518] shadow-[0_0_6px_#F5C518]" : "bg-white/40"
                    }`}
                  />
                  <span>UPSC</span>
                </button>
                <button
                  onClick={() => onChangeActiveItem("app-manager-ncert")}
                  className={`flex items-center gap-3.5 py-2 px-3 text-xs font-semibold rounded-xl text-left transition-all duration-300 w-full ${
                    activeItem === "app-manager-ncert"
                      ? "text-white bg-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      activeItem === "app-manager-ncert" ? "bg-[#F5C518] shadow-[0_0_6px_#F5C518]" : "bg-white/40"
                    }`}
                  />
                  <span>NCERT</span>
                </button>
              </div>

              {/* Popover list (Collapsed Sidebar) */}
              {isCollapsed && showPopover && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPopover(false)} />
                  <div className="absolute left-24 top-24 bg-gradient-to-b from-[#7B3FE4] to-[#6023C9] border border-white/15 rounded-2xl p-2 w-36 premium-shadow z-50 animate-fade-in flex flex-col gap-1">
                    <button
                      onClick={() => {
                        onChangeActiveItem("app-manager-upsc");
                        setShowPopover(false);
                      }}
                      className={`flex items-center gap-2.5 py-2.5 px-3 text-xs font-bold rounded-xl text-left transition-all w-full ${
                        activeItem === "app-manager-upsc" ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${activeItem === "app-manager-upsc" ? "bg-[#F5C518]" : "bg-white/40"}`} />
                      <span>UPSC</span>
                    </button>
                    <button
                      onClick={() => {
                        onChangeActiveItem("app-manager-ncert");
                        setShowPopover(false);
                      }}
                      className={`flex items-center gap-2.5 py-2.5 px-3 text-xs font-bold rounded-xl text-left transition-all w-full ${
                        activeItem === "app-manager-ncert" ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${activeItem === "app-manager-ncert" ? "bg-[#F5C518]" : "bg-white/40"}`} />
                      <span>NCERT</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className={`flex items-center rounded-2xl text-sm font-medium tracking-wide text-left text-rose-300 hover:text-rose-100 hover:bg-rose-950/20 transition-all duration-300 mt-4 ${
                isCollapsed ? "justify-center p-3" : "gap-4 px-4 py-3.5"
              }`}
              title={isCollapsed ? "Sign Out" : undefined}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isCollapsed && (
                <span className="transition-opacity duration-300 overflow-hidden whitespace-nowrap">
                  Sign Out
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Lower Section Card */}
      <div className="flex flex-col gap-6">
        {!isCollapsed ? (
          <div className="bg-white/10 rounded-3xl p-5 border border-white/10 relative overflow-hidden backdrop-blur-md transition-all duration-500">
            <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />

            <h4 className="text-xs font-bold tracking-wider text-white uppercase mb-2">
              Lorem Ipsum
            </h4>
            <p className="text-[11px] leading-relaxed text-white/60 mb-4 font-normal">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
            </p>
            <button className="w-full bg-[#F5C518] hover:bg-[#E5B612] text-[#42169B] text-xs font-bold py-3 px-4 rounded-xl transition-all duration-300 active:scale-95 shadow-md">
              LOREM
            </button>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mx-auto hover:bg-white/15 cursor-pointer shadow-sm" title="Lorem Ipsum alert">
            <span className="text-xs font-extrabold text-[#F5C518]">!</span>
          </div>
        )}

        <div className="text-center text-[10px] text-white/40 font-medium">
          {isCollapsed ? "L.I.D." : "Lorem ipsum dolor"}
        </div>
      </div>
    </aside>
  );
};
