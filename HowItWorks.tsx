import React from 'react';
import {
  FileEdit,
  Camera,
  Cpu,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'REPORT',
      subtitle: 'Citizen describes problem',
      description:
        'Resident inputs incident details, select category and severity indicators in under a minute.',
      icon: FileEdit,
      accent: 'from-orange-500 to-orange-600',
      iconColor: 'text-orange-500',
      badgeBg: 'bg-orange-100 text-orange-800',
    },
    {
      num: '02',
      title: 'CAPTURE',
      subtitle: 'Photo & GPS Telemetry',
      description:
        'Camera captures real-time structural photo evidence and precise GPS coordinates with device accuracy rating.',
      icon: Camera,
      accent: 'from-amber-500 to-amber-600',
      iconColor: 'text-amber-500',
      badgeBg: 'bg-amber-100 text-amber-800',
    },
    {
      num: '03',
      title: 'VERIFY',
      subtitle: 'Multi-Modal AI Audit',
      description:
        'Computer vision verifies image relevance, compares text descriptions, validates geo-fence, and screens duplicate records.',
      icon: Cpu,
      accent: 'from-purple-500 to-purple-600',
      iconColor: 'text-purple-500',
      badgeBg: 'bg-purple-100 text-purple-800',
    },
    {
      num: '04',
      title: 'RESOLVE',
      subtitle: 'Auto-Routed to Department',
      description:
        'Verified complaint is dispatched straight to the responsible municipal department crew with severity prioritization.',
      icon: CheckCircle2,
      accent: 'from-emerald-500 to-emerald-600',
      iconColor: 'text-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-800',
    },
  ];

  return (
    <section id="how-it-works-section" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>End-to-End Operational Pipeline</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#071A2B] tracking-tight">
            How It Works
          </h2>
          <p className="text-base text-slate-600">
            From resident report to field team dispatch — an automated, tamper-resistant verification workflow.
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-1 bg-gradient-to-r from-orange-200 via-amber-200 to-emerald-200 -translate-y-8 z-0"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  id={`step-card-${step.num}`}
                  className="group relative bg-[#FFFBF7] rounded-2xl p-6 sm:p-7 border border-slate-200 hover:border-orange-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Number Badge & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-display text-2xl font-extrabold text-[#071A2B] bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs">
                        {step.num}
                      </span>
                      <div
                        className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md border border-slate-100 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className={`w-6 h-6 ${step.iconColor}`} />
                      </div>
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="space-y-1.5 mb-3">
                      <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                        STAGE {step.num}
                      </span>
                      <h3 className="font-display text-xl font-bold text-[#071A2B] group-hover:text-[#EA580C] transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#EA580C]">{step.subtitle}</p>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                  </div>

                  {/* Bottom indicator */}
                  <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Step {idx + 1} of 4</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
