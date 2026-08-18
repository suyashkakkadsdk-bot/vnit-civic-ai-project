import React, { useState, useEffect } from 'react';
import {
  Shield,
  Building,
  UserCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  RefreshCw,
  HelpCircle,
  Key,
  Layers,
  Compass,
  Cpu,
  BadgeCheck,
} from 'lucide-react';
import { AuthRole, AuthUser, Department } from '../types/api';
import {
  loginCitizen,
  loginGovernment,
  DEMO_CITIZEN_CREDENTIALS,
  DEMO_GOVERNMENT_CREDENTIALS,
} from '../services/auth';

interface AuthLandingProps {
  currentUser?: AuthUser | null;
  onLoginSuccess: (user: AuthUser) => void;
  onLogout?: () => void;
  onCancel?: () => void;
  defaultRole?: AuthRole;
  accessWarning?: string | null;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({
  currentUser,
  onLoginSuccess,
  onLogout,
  onCancel,
  defaultRole = 'citizen',
  accessWarning,
}) => {
  const [activeTab, setActiveTab] = useState<AuthRole>(defaultRole);

  useEffect(() => {
    setActiveTab(defaultRole);
    setErrorMessage(null);
  }, [defaultRole]);

  // Citizen Form state
  const [citizenIdentifier, setCitizenIdentifier] = useState(DEMO_CITIZEN_CREDENTIALS.email);
  const [citizenPassword, setCitizenPassword] = useState(DEMO_CITIZEN_CREDENTIALS.password);
  const [showCitizenPassword, setShowCitizenPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [citizenName, setCitizenName] = useState('');

  // Government Form state
  const [govIdentifier, setGovIdentifier] = useState(DEMO_GOVERNMENT_CREDENTIALS.email);
  const [govPassword, setGovPassword] = useState(DEMO_GOVERNMENT_CREDENTIALS.password);
  const [govDepartment, setGovDepartment] = useState<Department>('Roads Department');
  const [showGovPassword, setShowGovPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  // Citizen Submit
  const handleCitizenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginCitizen({
        identifier: citizenIdentifier,
        password: citizenPassword,
      });

      if (res.success && res.user) {
        if (isRegisterMode && citizenName.trim()) {
          res.user.name = citizenName.trim();
        }
        setSuccessMessage('Citizen identity authenticated successfully.');
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 400);
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Please verify and try again.');
      }
    } catch {
      setErrorMessage('Network or authorization timeout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Government Submit
  const handleGovernmentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginGovernment({
        identifier: govIdentifier,
        password: govPassword,
        department: govDepartment,
      });

      if (res.success && res.user) {
        setSuccessMessage('Municipal officer credentials verified.');
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 400);
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Please verify and try again.');
      }
    } catch {
      setErrorMessage('Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Autofill helpers for fast demo testing
  const autofillCitizenDemo = () => {
    setCitizenIdentifier(DEMO_CITIZEN_CREDENTIALS.email);
    setCitizenPassword(DEMO_CITIZEN_CREDENTIALS.password);
    setIsRegisterMode(false);
    setErrorMessage(null);
  };

  const autofillGovDemo = () => {
    setGovIdentifier(DEMO_GOVERNMENT_CREDENTIALS.email);
    setGovPassword(DEMO_GOVERNMENT_CREDENTIALS.password);
    setErrorMessage(null);
  };

  return (
    <div
      id="auth-landing-screen"
      className="min-h-[85vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden"
    >
      {/* Background Decorative Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 bg-gradient-to-r from-orange-400/10 via-amber-400/15 to-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="w-full max-w-xl space-y-6">
        {/* ACCESS WARNING BANNER (IF REDIRECTED DUE TO ROLE MISMATCH) */}
        {accessWarning && (
          <div
            id="auth-access-warning"
            className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-start gap-3 shadow-sm animate-fadeIn"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm text-amber-950">{accessWarning}</p>
              <p className="text-amber-800">
                Please sign in with the corresponding authorized account to access that section.
              </p>
            </div>
          </div>
        )}

        {/* LOGO & HERO HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#EA580C]/10 via-[#FB923C]/10 to-[#EA580C]/10 border border-orange-200/80 text-[#EA580C] text-xs font-extrabold uppercase tracking-wider shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse"></div>
            <span>NAGAR MITRA</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#071A2B] tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto">
            Secure access to Nagar Mitra
          </p>
        </div>

        {/* ACTIVE SESSION BANNER (IF ALREADY SIGNED IN) */}
        {currentUser && (
          <div
            id="active-session-card"
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm ${
                  currentUser.role === 'government'
                    ? 'bg-gradient-to-br from-purple-700 to-indigo-900'
                    : 'bg-gradient-to-br from-[#EA580C] to-amber-600'
                }`}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#071A2B]">{currentUser.name}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                      currentUser.role === 'government'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-orange-100 text-orange-800 border border-orange-200'
                    }`}
                  >
                    {currentUser.role === 'government' ? '🏛️ Official' : '👤 Citizen'}
                  </span>
                </div>
                <span className="text-xs text-slate-500 block truncate">{currentUser.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onLoginSuccess(currentUser)}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* MAIN AUTHENTICATION CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-orange-900/5 overflow-hidden">
          {/* DUAL ROLE SWITCHER */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 border-b border-slate-200 gap-1.5">
            <button
              id="auth-tab-citizen-btn"
              type="button"
              onClick={() => {
                setActiveTab('citizen');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-display text-sm font-bold transition-all ${
                activeTab === 'citizen'
                  ? 'bg-white text-[#EA580C] shadow-sm border border-slate-200/90'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              <UserCheck
                className={`w-4 h-4 ${activeTab === 'citizen' ? 'text-[#EA580C]' : 'text-slate-400'}`}
              />
              <span>Citizen Login</span>
            </button>

            <button
              id="auth-tab-government-btn"
              type="button"
              onClick={() => {
                setActiveTab('government');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-display text-sm font-bold transition-all ${
                activeTab === 'government'
                  ? 'bg-[#071A2B] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              <Building
                className={`w-4 h-4 ${activeTab === 'government' ? 'text-[#FB923C]' : 'text-slate-400'}`}
              />
              <span>Government Login</span>
            </button>
          </div>

          {/* TAB 1: CITIZEN LOGIN */}
          {activeTab === 'citizen' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold text-[#071A2B]">
                  {isRegisterMode ? 'Create Citizen Account' : 'Citizen Login'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Report civic infrastructure issues with automated AI verification and live GPS tracking.
                </p>
              </div>

              {/* Error / Success Alerts */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleCitizenLogin} className="space-y-4">
                {isRegisterMode && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        placeholder="Alex Mercer"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] bg-slate-50/50"
                      />
                    </div>
                  </div>
                )}

                {/* Email / Mobile Field */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email / Mobile Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="citizen-identifier-input"
                      type="text"
                      required
                      value={citizenIdentifier}
                      onChange={(e) => setCitizenIdentifier(e.target.value)}
                      placeholder="citizen@demo.com or mobile"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(true)}
                      className="text-[11px] font-medium text-[#EA580C] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="citizen-password-input"
                      type={showCitizenPassword ? 'text' : 'password'}
                      required
                      value={citizenPassword}
                      onChange={(e) => setCitizenPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCitizenPassword(!showCitizenPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showCitizenPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    id="citizen-login-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#C2410C] hover:to-[#EA580C] shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    <span>{isRegisterMode ? 'Create Citizen Account' : 'Login as Citizen'}</span>
                  </button>
                </div>

                {/* Secondary Option: Register Toggle */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(!isRegisterMode);
                      setErrorMessage(null);
                    }}
                    className="text-xs text-slate-600 hover:text-[#EA580C] font-semibold transition-colors"
                  >
                    {isRegisterMode
                      ? 'Already have an account? Login as Citizen'
                      : 'New to Nagar Mitra? Create Citizen Account'}
                  </button>
                </div>
              </form>

              {/* DEMO CITIZEN CREDENTIALS CALLOUT */}
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#EA580C] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    <span>Demo Citizen Credentials</span>
                  </span>
                  <button
                    type="button"
                    onClick={autofillCitizenDemo}
                    className="text-[11px] font-bold text-orange-700 bg-white hover:bg-orange-100 px-2 py-0.5 rounded-md border border-orange-300 shadow-2xs transition-all"
                  >
                    Auto-Fill
                  </button>
                </div>

                <div className="font-mono text-xs text-slate-700 bg-white/90 p-2.5 rounded-lg border border-orange-100 space-y-0.5">
                  <p>
                    <span className="text-slate-400">Email:</span> {DEMO_CITIZEN_CREDENTIALS.email}
                  </p>
                  <p>
                    <span className="text-slate-400">Password:</span> {DEMO_CITIZEN_CREDENTIALS.password}
                  </p>
                </div>

                <p className="text-[10px] text-slate-500 italic">
                  Demo account — replace with real authentication backend.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: GOVERNMENT LOGIN */}
          {activeTab === 'government' && (
            <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-[#071A2B] to-slate-900 text-white">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-orange-950/80 border border-orange-800 text-orange-300 text-[10px] font-mono font-bold mb-1">
                  <BadgeCheck className="w-3 h-3 text-orange-400" />
                  <span>GOVERNMENT OPERATIONS ENCLAVE</span>
                </div>
                <h2 className="font-display text-xl font-bold text-white">Government Login</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Department triage, GIS spatial analytics, field work orders, and resolution dispatch.
                </p>
              </div>

              {/* Error / Success Alerts */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleGovernmentLogin} className="space-y-4">
                {/* Official Email / Employee ID */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Official Email / Employee ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      id="gov-identifier-input"
                      type="text"
                      required
                      value={govIdentifier}
                      onChange={(e) => setGovIdentifier(e.target.value)}
                      placeholder="officer@demo.gov or OFF-8842"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Assigned Department */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Assigned Municipal Department
                  </label>
                  <select
                    value={govDepartment}
                    onChange={(e) => setGovDepartment(e.target.value as Department)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white font-medium focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Roads Department">Roads Department</option>
                    <option value="Water Works & Sewerage">Water Works & Sewerage</option>
                    <option value="Sanitation & Waste">Sanitation & Waste</option>
                    <option value="Electrical & Lighting">Electrical & Lighting</option>
                    <option value="Traffic Management">Traffic Management</option>
                    <option value="Public Works Department">Public Works Department</option>
                    <option value="Emergency Response">Emergency Response</option>
                  </select>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(true)}
                      className="text-[11px] font-medium text-orange-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      id="gov-password-input"
                      type={showGovPassword ? 'text' : 'password'}
                      required
                      value={govPassword}
                      onChange={(e) => setGovPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGovPassword(!showGovPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 p-0.5"
                    >
                      {showGovPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    id="gov-login-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#FB923C] hover:brightness-110 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Shield className="w-4 h-4 text-amber-100" />
                    )}
                    <span>Login as Government Official</span>
                  </button>
                </div>
              </form>

              {/* DEMO GOVERNMENT CREDENTIALS CALLOUT */}
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    <span>Demo Government Credentials</span>
                  </span>
                  <button
                    type="button"
                    onClick={autofillGovDemo}
                    className="text-[11px] font-bold text-orange-300 bg-slate-900 hover:bg-slate-950 px-2 py-0.5 rounded-md border border-orange-800 shadow-2xs transition-all"
                  >
                    Auto-Fill
                  </button>
                </div>

                <div className="font-mono text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
                  <p>
                    <span className="text-slate-500">Email:</span> {DEMO_GOVERNMENT_CREDENTIALS.email}
                  </p>
                  <p>
                    <span className="text-slate-500">Password:</span> {DEMO_GOVERNMENT_CREDENTIALS.password}
                  </p>
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  Demo account — replace with real authentication backend.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SECURITY & ARCHITECTURE NOTICE */}
        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 text-slate-600 text-xs flex items-start gap-3 shadow-2xs">
          <Shield className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-slate-800 font-semibold">Security Architecture: </strong>
            Demo credentials are strictly for frontend testing and role separation. In production,
            the backend developer will replace these with JWT / session-based authentication via{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">VITE_API_BASE_URL</code>.
          </p>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-[#EA580C] mx-auto flex items-center justify-center">
              <Key className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-[#071A2B]">Password Reset</h3>
              <p className="text-xs text-slate-600">
                For this prototype, use the demo credentials provided below or enter any password of 4+ characters.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 text-left space-y-1">
              <p>👤 Citizen: <span className="font-bold text-[#EA580C]">citizen123</span></p>
              <p>🏛️ Official: <span className="font-bold text-purple-700">officer123</span></p>
            </div>
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="w-full py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Got it, return to login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
