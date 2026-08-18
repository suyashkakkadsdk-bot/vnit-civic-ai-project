import React from 'react';
import { ShieldAlert, ArrowRight, LogIn, Building, UserCheck } from 'lucide-react';
import { AuthRole, AuthUser } from '../types/api';

interface AccessDeniedProps {
  requiredRole: AuthRole;
  currentUser: AuthUser | null;
  onSwitchAccount: (targetRole: AuthRole) => void;
  onReturnToAllowed: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRole,
  currentUser,
  onSwitchAccount,
  onReturnToAllowed,
}) => {
  const isGovRequired = requiredRole === 'government';

  return (
    <div
      id="access-denied-screen"
      className="min-h-[70vh] flex flex-col items-center justify-center p-6 sm:p-12 text-center"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-amber-300 p-8 sm:p-10 shadow-xl space-y-6 relative overflow-hidden">
        {/* Subtle background badge */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-50 rounded-full blur-2xl pointer-events-none -z-0"></div>

        {/* Icon & Shield Badge */}
        <div className="relative z-10 mx-auto w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm">
          <ShieldAlert className="w-8 h-8 text-amber-600 animate-pulse" />
        </div>

        {/* Text Header */}
        <div className="relative z-10 space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            Role Gate Protection Active
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#071A2B] tracking-tight">
            {isGovRequired ? 'Government access required' : 'Citizen account required'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {isGovRequired
              ? 'This section is restricted to authorized municipal officers and departmental operations staff.'
              : 'This section is designated for verified citizen contributors to submit and track public reports.'}
          </p>
        </div>

        {/* Current Active Session Info */}
        {currentUser && (
          <div className="relative z-10 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <span className="text-slate-500">Current Session:</span>
            <span className="font-bold flex items-center gap-1.5 text-slate-900">
              <span>{currentUser.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-200 text-slate-800">
                {currentUser.role}
              </span>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => onSwitchAccount(requiredRole)}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all ${
              isGovRequired
                ? 'bg-[#071A2B] hover:bg-slate-900 text-orange-300'
                : 'bg-[#EA580C] hover:bg-[#C2410C]'
            }`}
          >
            {isGovRequired ? <Building className="w-4 h-4 text-orange-400" /> : <UserCheck className="w-4 h-4" />}
            <span>Login as {isGovRequired ? 'Government Official' : 'Citizen'}</span>
          </button>

          <button
            type="button"
            onClick={onReturnToAllowed}
            className="px-4 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Return to Allowed View</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
