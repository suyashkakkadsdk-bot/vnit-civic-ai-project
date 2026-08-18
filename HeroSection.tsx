import React from 'react';
import {
  UserCheck,
  Building,
  CheckCircle2,
  Cpu,
  MapPin,
  Sparkles,
  ArrowRight,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';
import { HERO_BACKGROUND_IMAGE } from '../data/civicImages';

interface HeroSectionProps {
  onSelectCitizen: () => void;
  onSelectGovernment: () => void;
  onExploreIssues: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectCitizen,
  onSelectGovernment,
  onExploreIssues,
}) => {
  return (
    <section id="hero-section" className="relative min-h-[90vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#071A2B]">
      {/* Background Image with Dark Navy & Blue Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BACKGROUND_IMAGE}
          alt="Modern Urban Infrastructure Skyline"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 filter brightness-50 contrast-125"
        />
        {/* Multi-layer Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071A2B] via-[#071A2B]/90 to-[#EA580C]/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#071A2B] via-transparent to-transparent"></div>
        
        {/* Subtle grid lines pattern for futuristic civic-tech vibe */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #FB923C 1px, transparent 0)`,
            backgroundSize: '36px 36px',
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: Heading & CTAs */}
        <div className="w-full lg:w-3/5 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/60 border border-orange-500/40 backdrop-blur-md shadow-lg shadow-orange-500/10">
            <Cpu className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-orange-300">
              Next-Gen Municipal AI Engine
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-2">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Make Your City Better.
            </h1>
            <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#FB923C] via-[#F97316] to-[#FBBF24] bg-clip-text text-transparent tracking-tight">
              Report. Verify. Resolve.
            </div>
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
            AI-powered civic reporting that verifies evidence, location, and duplicate complaints before they reach the right department. Faster resolution with zero manual backlog.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              id="hero-citizen-portal-cta"
              onClick={onSelectCitizen}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#FB923C] hover:from-[#C2410C] hover:to-[#EA580C] rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
              <UserCheck className="w-5 h-5 text-amber-100 group-hover:scale-110 transition-transform" />
              <span>Citizen Portal</span>
              <ArrowRight className="w-4 h-4 text-amber-100 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-government-dashboard-cta"
              onClick={onSelectGovernment}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-xl backdrop-blur-md shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
              <Building className="w-5 h-5 text-slate-300 group-hover:text-orange-300 transition-colors" />
              <span>Government Dashboard</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>AI Evidence Verification</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-orange-400" />
              <span>GPS Telemetry Validation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span>Duplicate Incident Detection</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive AI Verification Preview Card Floating */}
        <div className="w-full lg:w-2/5 max-w-md">
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/90 to-[#071A2B]/90 border border-slate-700/80 p-6 backdrop-blur-xl shadow-2xl shadow-orange-950/40 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                <span className="text-xs font-bold text-white tracking-wider uppercase">Live Incident Ingestion</span>
              </div>
              <span className="text-[11px] font-mono text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800">
                AI Engine 97.4% ACC
              </span>
            </div>

            {/* Simulated Live Verified Card */}
            <div className="space-y-3 bg-slate-900/90 rounded-xl p-4 border border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Incoming Telemetry #COMP-00012</span>
                  <p className="text-sm font-bold text-white mt-0.5">High-Pressure Pothole on Main Blvd</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  HIGH SEVERITY
                </span>
              </div>

              {/* Progress bars / check indicators */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Optical Structural Match</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">96% Verified</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>GPS Telemetry Radius</span>
                  </span>
                  <span className="font-mono text-orange-400 font-bold">14m (Exact)</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Duplicate Cluster Risk</span>
                  </span>
                  <span className="font-mono text-purple-400 font-bold">18% (Unique)</span>
                </div>
              </div>

              {/* Auto routed banner */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Assigned Department:</span>
                <span className="font-semibold text-orange-300 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800">
                  Roads Department
                </span>
              </div>
            </div>

            {/* Action link */}
            <button
              onClick={onExploreIssues}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-orange-300 hover:text-orange-200 bg-orange-950/40 hover:bg-orange-900/60 border border-orange-800/60 rounded-lg transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Explore All Civic Categories & Reports</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
