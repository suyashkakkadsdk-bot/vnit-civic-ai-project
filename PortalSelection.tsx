import React from 'react';
import {
  UserCheck,
  Building,
  Camera,
  MapPin,
  Sparkles,
  Search,
  BrainCircuit,
  BarChart3,
  Flame,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { CITIZEN_PORTAL_HERO, GOV_PORTAL_HERO } from '../data/civicImages';
import { CivicImage } from './CivicImage';

interface PortalSelectionProps {
  onSelectCitizen: () => void;
  onSelectGovernment: () => void;
}

export const PortalSelection: React.FC<PortalSelectionProps> = ({
  onSelectCitizen,
  onSelectGovernment,
}) => {
  return (
    <section id="portal-selection-section" className="py-20 bg-[#F5F9FF] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold uppercase tracking-widest">
            Dual Dedicated Workflows
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#071A2B] tracking-tight">
            Choose Your Portal
          </h2>
          <p className="text-base text-slate-600">
            Tailored interfaces engineered for citizens to submit verified evidence and municipal officers to resolve operational tasks.
          </p>
        </div>

        {/* Two Large Portal Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* CARD 1: CITIZEN PORTAL */}
          <div
            id="portal-card-citizen"
            className="group relative rounded-2xl bg-white border-2 border-orange-100 hover:border-orange-500/80 shadow-md hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Top Accent Gradient Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-[#EA580C] to-[#FB923C]"></div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Image Preview Banner */}
              <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden shadow-inner">
                <CivicImage
                  src={CITIZEN_PORTAL_HERO}
                  alt="Citizen reporting civic issue on mobile"
                  fallbackCategory="Citizen Reporting"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071A2B]/80 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#EA580C]/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>FOR RESIDENTS & CITIZENS</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#071A2B]">
                    Citizen Portal
                  </h3>
                </div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Report civic problems with verified photo and location evidence in under 60 seconds with instant AI feedback.
                </p>
              </div>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-orange-50/80 border border-orange-100 text-xs font-semibold text-slate-800">
                  <Camera className="w-4 h-4 text-[#EA580C]" />
                  <span>Photo Evidence</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-amber-50/80 border border-amber-100 text-xs font-semibold text-slate-800">
                  <MapPin className="w-4 h-4 text-[#D97706]" />
                  <span>GPS Location</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-purple-50/80 border border-purple-100 text-xs font-semibold text-slate-800">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <span>AI Verification</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-50/80 border border-emerald-100 text-xs font-semibold text-slate-800">
                  <Search className="w-4 h-4 text-emerald-600" />
                  <span>Complaint Tracking</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-6 sm:p-8 pt-0">
              <button
                id="portal-btn-citizen"
                onClick={onSelectCitizen}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-base text-white bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#C2410C] hover:to-[#EA580C] shadow-md shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-all"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* CARD 2: GOVERNMENT PORTAL */}
          <div
            id="portal-card-government"
            className="group relative rounded-2xl bg-white border-2 border-slate-200 hover:border-[#071A2B] shadow-md hover:shadow-2xl hover:shadow-slate-900/15 transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Top Accent Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-[#071A2B] via-[#1E293B] to-[#EA580C]"></div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Image Preview Banner */}
              <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden shadow-inner">
                <CivicImage
                  src={GOV_PORTAL_HERO}
                  alt="Municipal Operations Command Center"
                  fallbackCategory="Government Command"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071A2B]/85 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#071A2B]/90 backdrop-blur-md text-orange-300 text-xs font-bold flex items-center gap-1.5 shadow border border-orange-800">
                  <Building className="w-3.5 h-3.5" />
                  <span>FOR MUNICIPAL AUTHORITIES</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#071A2B]">
                    Government Portal
                  </h3>
                </div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Manage, prioritize, and resolve verified civic complaints with automated routing, GIS maps, and telemetry analytics.
                </p>
              </div>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
                  <BrainCircuit className="w-4 h-4 text-[#7C3AED]" />
                  <span>AI Insights</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
                  <BarChart3 className="w-4 h-4 text-[#EA580C]" />
                  <span>Complaint Analytics</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
                  <Flame className="w-4 h-4 text-[#DC2626]" />
                  <span>Priority Management</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Resolution Tracking</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-6 sm:p-8 pt-0">
              <button
                id="portal-btn-government"
                onClick={onSelectGovernment}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-base text-white bg-[#071A2B] hover:bg-[#0F2A44] shadow-md transition-all group-hover:border-slate-600"
              >
                <span>Open Operations Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-orange-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
