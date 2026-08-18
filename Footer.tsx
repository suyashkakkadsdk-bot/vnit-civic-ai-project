import React from 'react';
import {
  Shield,
  Building2,
  Cpu,
  Heart,
  ExternalLink,
  Github,
  Sparkles,
  Terminal,
} from 'lucide-react';

interface FooterProps {
  onSelectView: (view: 'home' | 'citizen' | 'government' | 'my-reports' | 'how-it-works' | 'login') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectView }) => {
  return (
    <footer id="main-footer" className="bg-[#071A2B] text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EA580C] via-[#F97316] to-[#FB923C] p-0.5 shadow-md">
                <div className="w-full h-full bg-[#071A2B] rounded-[10px] flex items-center justify-center relative">
                  <Shield className="w-5 h-5 text-[#FB923C]" />
                  <Building2 className="w-3 h-3 text-white absolute -bottom-0.5 -right-0.5" />
                </div>
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white">
                  NAGAR <span className="text-[#F97316]">MITRA</span>
                </span>
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  REPORT. VERIFY. RESOLVE.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Next-generation municipal infrastructure incident reporting platform. Powered by multi-modal AI verification, optical telemetry, and automated departmental dispatch.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-orange-400 flex items-center gap-1.5">
                <Terminal className="w-3 h-3" />
                <span>REST API Ready</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
                <span>Frontend v3.4</span>
              </div>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-white">
              Platform Views
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectView('home')}
                  className="hover:text-white transition-colors"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectView('citizen')}
                  className="hover:text-white transition-colors"
                >
                  Citizen Reporting Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectView('government')}
                  className="hover:text-white transition-colors"
                >
                  Government Operations Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectView('my-reports')}
                  className="hover:text-white transition-colors"
                >
                  My Submitted Reports
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectView('how-it-works')}
                  className="hover:text-white transition-colors"
                >
                  How Verification Works
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Incident Categories */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-white">
              Civic Taxonomy
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-slate-200">Road Damage & Potholes</li>
              <li className="hover:text-slate-200">Water Leakage & Mains</li>
              <li className="hover:text-slate-200">Municipal Waste & Dumping</li>
              <li className="hover:text-slate-200">Streetlight Outages</li>
              <li className="hover:text-slate-200">Traffic & Safety Hazards</li>
              <li className="hover:text-slate-200">Public Walkways & Parks</li>
            </ul>
          </div>

          {/* Col 5: API Architecture */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-white">
              Backend Integration
            </h4>
            <p className="text-xs text-slate-400">
              Cleanly structured REST service layer in <code className="text-amber-300">src/services/api.ts</code>. Ready to connect to backend via <code className="text-amber-300">VITE_API_BASE_URL</code>.
            </p>
            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-300">
              POST /api/complaints/verify
              <br />
              GET /api/complaints
              <br />
              PATCH /api/complaints/:id/status
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 NAGAR MITRA. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built for Modern Urban Governance & Civic Innovation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
