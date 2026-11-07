import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Scale,
  User as UserIcon,
  LogOut,
  Calendar,
  Briefcase,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
  openApplyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal,
  openApplyModal,
}) => {
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div
            onClick={() => setCurrentTab("home")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-navy-900 text-gold-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-navy-950 flex items-center gap-1.5">
                Juris<span className="text-gold-600">Connect</span>
              </span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold hidden sm:block">
                Online Legal Consultation Platform
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setCurrentTab("home")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === "home"
                  ? "bg-navy-50 text-navy-900 font-semibold"
                  : "text-slate-600 hover:text-navy-900 hover:bg-slate-100"
              }`}
            >
              Find Lawyers
            </button>

            {isAuthenticated && user?.role === "CLIENT" && (
              <>
                <button
                  onClick={() => setCurrentTab("client-dashboard")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === "client-dashboard"
                      ? "bg-navy-50 text-navy-900 font-semibold"
                      : "text-slate-600 hover:text-navy-900 hover:bg-slate-100"
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-navy-800" />
                  Client Dashboard
                </button>
                <button
                  onClick={() => setCurrentTab("my-appointments")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === "my-appointments"
                      ? "bg-navy-50 text-navy-900 font-semibold"
                      : "text-slate-600 hover:text-navy-900 hover:bg-slate-100"
                  }`}
                >
                  <Calendar className="w-4 h-4 text-navy-800" />
                  My Consultations
                </button>
              </>
            )}

            {isAuthenticated && user?.role === "LAWYER" && (
              <button
                onClick={() => setCurrentTab("lawyer-dashboard")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === "lawyer-dashboard"
                    ? "bg-navy-50 text-navy-900 font-semibold"
                    : "text-slate-600 hover:text-navy-900 hover:bg-slate-100"
                }`}
              >
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Lawyer Practice Portal
              </button>
            )}

            {isAuthenticated && user?.role === "ADMIN" && (
              <button
                onClick={() => setCurrentTab("admin-dashboard")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === "admin-dashboard"
                    ? "bg-navy-50 text-navy-900 font-semibold"
                    : "text-slate-600 hover:text-navy-900 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Admin Governance
              </button>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors shadow-xs"
                title="Switch demo role instantly"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Demo Switcher</span>
                <span className="sm:hidden">Demo</span>
                <ChevronDown className="w-3 h-3 text-amber-700" />
              </button>

              {demoMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setDemoMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Instant Role Testing
                  </div>
                  <button
                    onClick={() => {
                      loginAsDemo("CLIENT");
                      setCurrentTab("client-dashboard");
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>👤 Rahul Verma (Client)</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Client</span>
                  </button>
                  <button
                    onClick={() => {
                      loginAsDemo("LAWYER");
                      setCurrentTab("lawyer-dashboard");
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>⚖️ Adv. Rajesh Sharma</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Lawyer</span>
                  </button>
                  <button
                    onClick={() => {
                      loginAsDemo("ADMIN");
                      setCurrentTab("admin-dashboard");
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>🛡️ Super Admin</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {/* If not authenticated */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={openApplyModal}
                  className="hidden sm:inline-flex text-xs font-semibold text-navy-900 border border-slate-300 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
                >
                  Join as Lawyer
                </button>
                <button
                  onClick={openAuthModal}
                  className="text-xs sm:text-sm font-semibold bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <UserIcon className="w-4 h-4" />
                  Sign In
                </button>
              </div>
            ) : (
              /* User Profile & Dropdown */
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-navy-900 text-white text-xs font-bold flex items-center justify-center">
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {user?.fullName}
                    </p>
                    <span
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        user?.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : user?.role === "LAWYER"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      {user?.role === "CLIENT" && (
                        <>
                          <button
                            onClick={() => setCurrentTab("client-dashboard")}
                            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <UserIcon className="w-4 h-4 text-navy-800" />
                            Client Dashboard
                          </button>
                          <button
                            onClick={() => setCurrentTab("my-appointments")}
                            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Calendar className="w-4 h-4 text-navy-800" />
                            My Consultations
                          </button>
                        </>
                      )}

                      {user?.role === "LAWYER" && (
                        <button
                          onClick={() => setCurrentTab("lawyer-dashboard")}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Briefcase className="w-4 h-4 text-emerald-600" />
                          Lawyer Dashboard & Schedule
                        </button>
                      )}

                      {user?.role === "ADMIN" && (
                        <button
                          onClick={() => setCurrentTab("admin-dashboard")}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          Admin Console
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setCurrentTab("home");
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
