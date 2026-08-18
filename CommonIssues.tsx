import React from 'react';
import {
  AlertTriangle,
  Trash2,
  Droplets,
  Lightbulb,
  ShieldAlert,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CIVIC_ISSUE_IMAGES } from '../data/civicImages';
import { CivicImage } from './CivicImage';
import { ComplaintCategory } from '../types/api';

interface CommonIssuesProps {
  onSelectCategory: (category: ComplaintCategory, defaultDescription?: string) => void;
}

export const CommonIssues: React.FC<CommonIssuesProps> = ({ onSelectCategory }) => {
  const iconMap: Record<string, React.ElementType> = {
    AlertTriangle,
    Trash2,
    Droplets,
    Lightbulb,
    ShieldAlert,
    Building2,
  };

  const issues = Object.entries(CIVIC_ISSUE_IMAGES);

  return (
    <section id="common-issues-section" className="py-20 bg-[#FFFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[#EA580C] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Civic Incident Taxonomy</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#071A2B] tracking-tight">
            What Can You Report?
          </h2>
          <p className="text-base text-slate-600">
            Spot a problem. Report it. Help your city respond faster.
          </p>
        </div>

        {/* 6 Image Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {issues.map(([key, item]) => {
            const Icon = iconMap[item.iconName] || AlertTriangle;
            return (
              <div
                key={key}
                id={`issue-card-${key}`}
                className="group relative bg-white rounded-2xl border border-slate-200 hover:border-[#EA580C] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Image Container with Zoom on Hover */}
                  <div className="relative h-48 overflow-hidden bg-slate-200">
                    <CivicImage
                      src={item.imageUrl}
                      alt={item.title}
                      fallbackCategory={item.category}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071A2B]/75 via-transparent to-transparent"></div>

                    {/* Category Icon Badge */}
                    <div className="absolute top-3 right-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md text-[#EA580C]">
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Department Tag */}
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-[#071A2B]/90 text-orange-300 text-[11px] font-semibold tracking-wide border border-orange-800/60">
                      {item.department}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-bold text-[#071A2B] group-hover:text-[#EA580C] transition-colors">
                        {item.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {item.severityDefault}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="p-6 pt-0">
                  <button
                    id={`report-btn-${key}`}
                    onClick={() =>
                      onSelectCategory(
                        item.category as ComplaintCategory,
                        item.examplePrompt
                      )
                    }
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold text-[#EA580C] bg-orange-50 hover:bg-[#EA580C] hover:text-white transition-all duration-200 group/btn"
                  >
                    <span>Report this</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
