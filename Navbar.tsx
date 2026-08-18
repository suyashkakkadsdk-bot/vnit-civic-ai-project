import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Building2,
  Cpu,
  Menu,
  X,
  FileText,
  UserCheck,
  Building,
  Sparkles,
  Layers,
  HelpCircle,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  Mail,
  BadgeCheck,
} from 'lucide-react';
import { AuthUser, AuthRole } from '../types/api';

interface NavbarProps {
  activeView: 'home' | 'citizen' | 'government' | 'my-reports' | 'how-it-works' | 'login';
  setActiveView: (view: 'home' | 'citizen' | 'government' | 'my-reports' | 'how-it-works' | 'login') => void;
  currentUser?: AuthUser | null;
  onQuickReport?: () => void;
  onLogout?: () => void;
  onOpenLoginWithRole?: (role: AuthRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  currentUser,
  onQuickReport,
  onLogout,
  onOpenLoginWithRole,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: {
    id: 'home' | 'citizen' | 'government' | 'my-reports' | 'how-it-works';
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    { id: 'home', label: 'Home', icon: Layers },
    { id: 'citizen', label: 'Citizen Portal', icon: UserCheck },
    { id: 'government', label: 'Government Hub', icon: Building, badge: 'OPS' },
    { id: 'how-it-works', label: 'How It Works', icon: HelpCircle },
    { id: 'my-reports', label: 'My Reports', icon: FileText },
  ];

  const handleNavClick = (view: 'home' | 'citizen' | 'government' | 'my-reports' | 'how-it-works' | 'login') => {
    if (view === 'citizen' && !currentUser) {
      if (onOpenLoginWithRole) {
        onOpenLoginWithRole('citizen');
      } else {
        setActiveView('login');
      }
    } else if (view === 'government' && !currentUser) {
      if (onOpenLoginWithRole) {
        onOpenLoginWithRole('government');
      } else {
        setActiveView('login');
      }
    } else {
      setActiveView(view);
    }
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoutClick = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#071A2B]/95 backdrop-blur-md shadow-lg shadow-[#071A2B]/20 border-b border-slate-800'
          : 'bg-[#071A2B] border-b border-slate-800/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <button
            id="brand-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg p-1 group"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-[#EA580C] via-[#F97316] to-[#FB923C] p-0.5 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#071A2B] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-orange-500/10 blur-sm"></div>
                <div className="relative flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#FB923C]" />
                  <Building2 className="w-3.5 h-3.5 text-white absolute -bottom-0.5 -right-0.5" />
                  <Cpu className="w-2.5 h-2.5 text-amber-300 absolute -top-0.5 -left-0.5 animate-pulse" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  NAGAR <span className="text-[#F97316]">MITRA</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 border border-orange-500/40 text-orange-300 rounded">
                  v3.4
                </span>
              </div>
              <p className="text-[11px] font-medium tracking-widest text-slate-400 uppercase">
                Report. Verify. Resolve.
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 relative ${
                    isActive
                      ? 'bg-orange-600/20 text-[#FB923C] border border-orange-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FB923C]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Section: Profile Menu or Login Button */}
          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                {/* Profile Toggle Button */}
                <button
                  id="navbar-profile-menu-btn"
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-left transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                      currentUser.role === 'government'
                        ? 'bg-gradient-to-tr from-purple-700 to-indigo-900'
                        : 'bg-gradient-to-tr from-[#EA580C] to-[#FB923C]'
                    }`}
                  >
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="text-left leading-tight">
                    <span className="text-slate-100 font-bold block max-w-[120px] truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-orange-400 font-medium capitalize block">
                      {currentUser.role === 'government' ? 'Government Official' : 'Citizen Account'}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      profileDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div
                    id="navbar-profile-dropdown"
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-slate-100 space-y-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{currentUser.email}</span>
                      </p>
                      <div className="pt-1 flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                            currentUser.role === 'government'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {currentUser.role === 'government' ? '🏛️ Municipal Staff' : '👤 Citizen'}
                        </span>
                        {currentUser.badgeId && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {currentUser.badgeId}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Navigation Options */}
                    <div className="py-1">
                      {currentUser.role === 'citizen' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleNavClick('citizen')}
                            className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <UserCheck className="w-4 h-4 text-[#EA580C]" />
                            <span>Citizen Portal</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNavClick('my-reports')}
                            className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4 text-slate-500" />
                            <span>My Reports & History</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleNavClick('government')}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Building className="w-4 h-4 text-purple-700" />
                          <span>Government Operations Hub</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleNavClick('login')}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Switch Account / Portal</span>
                      </button>
                    </div>

                    {/* Logout Option */}
                    <div className="border-t border-slate-100 pt-1">
                      <button
                        id="dropdown-logout-btn"
                        type="button"
                        onClick={handleLogoutClick}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="navbar-signin-btn"
                  type="button"
                  onClick={() => {
                    if (onOpenLoginWithRole) onOpenLoginWithRole('citizen');
                    else handleNavClick('login');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-orange-400" />
                  <span>Sign In</span>
                </button>

                <button
                  id="navbar-citizen-login-btn"
                  type="button"
                  onClick={() => {
                    if (onOpenLoginWithRole) onOpenLoginWithRole('citizen');
                    else handleNavClick('login');
                  }}
                  className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/60 transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Citizen Login</span>
                </button>

                <button
                  id="navbar-gov-login-btn"
                  type="button"
                  onClick={() => {
                    if (onOpenLoginWithRole) onOpenLoginWithRole('government');
                    else handleNavClick('login');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-orange-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-orange-800 transition-all"
                >
                  <Building className="w-3.5 h-3.5 text-orange-400" />
                  <span>Gov Login</span>
                </button>
              </div>
            )}

            {/* Quick Report Button */}
            <button
              id="navbar-quick-report-btn"
              onClick={() => {
                if (onQuickReport) onQuickReport();
                else handleNavClick('citizen');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#C2410C] hover:to-[#EA580C] rounded-lg shadow-sm shadow-orange-500/30 transition-all hover:shadow-orange-500/50 hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Report Issue</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className="md:hidden bg-[#071A2B] border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {currentUser && (
            <div className="p-3 mb-2 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{currentUser.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/20 text-orange-300">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">{currentUser.email}</p>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-orange-600/20 text-[#FB923C] border border-orange-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#FB923C]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Mobile Auth Button */}
          {currentUser ? (
            <button
              id="mobile-logout-btn"
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              <span>Logout ({currentUser.name})</span>
            </button>
          ) : (
            <button
              id="mobile-login-btn"
              onClick={() => handleNavClick('login')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-orange-300 bg-slate-800/80 border border-orange-800"
            >
              <LogIn className="w-5 h-5 text-orange-400" />
              <span>Portal Login (Citizen / Government)</span>
            </button>
          )}

          <div className="pt-2">
            <button
              id="mobile-quick-report-btn"
              onClick={() => {
                if (onQuickReport) onQuickReport();
                else handleNavClick('citizen');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#EA580C] to-[#F97316] rounded-lg shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Report Issue Now</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
