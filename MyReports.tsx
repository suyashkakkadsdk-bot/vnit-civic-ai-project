import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { CivicComplaint, ComplaintCategory, ComplaintStatus } from '../types/api';
import { getComplaints } from '../services/api';
import { CivicImage } from './CivicImage';

interface MyReportsProps {
  onNewReport: () => void;
  onSelectComplaint?: (complaint: CivicComplaint) => void;
}

export const MyReports: React.FC<MyReportsProps> = ({ onNewReport, onSelectComplaint }) => {
  const [complaints, setComplaints] = useState<CivicComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    const data = await getComplaints({
      search,
      status: selectedStatus,
      category: selectedCategory,
    });
    setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [search, selectedStatus, selectedCategory]);

  const sortedComplaints = [...complaints].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const getStatusBadgeClass = (status: ComplaintStatus) => {
    switch (status) {
      case 'AI Verified':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'In Progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Under Review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-orange-600 text-white';
      case 'LOW':
        return 'bg-slate-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div id="my-reports-page" className="py-12 bg-[#FFFBF7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[#EA580C] text-xs font-bold uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Citizen Incident History</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-[#071A2B] tracking-tight">
              My Submitted Reports
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Track live municipal progress, AI verification scorecards, and department dispatch status.
            </p>
          </div>

          <button
            id="my-reports-new-report-btn"
            onClick={onNewReport}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#C2410C] hover:to-[#EA580C] shadow-md shadow-orange-500/20 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-orange-200" />
            <span>Report New Issue</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, street, keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] bg-slate-50/50"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:ring-2 focus:ring-[#EA580C]"
              >
                <option value="ALL">All Statuses</option>
                <option value="AI Verified">AI Verified</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Under Review">Under Review</option>
                <option value="Submitted">Submitted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:ring-2 focus:ring-[#EA580C]"
              >
                <option value="ALL">All Categories</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Streetlight">Streetlight</option>
                <option value="Traffic & Safety">Traffic & Safety</option>
                <option value="Public Infrastructure">Public Infrastructure</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-slate-50/50 hover:bg-slate-100"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Date: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 mx-auto border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-600 mt-3">Loading citizen reports...</p>
          </div>
        ) : sortedComplaints.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#071A2B]">No Reports Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No civic complaints match the current filter or search criteria.
            </p>
            <button
              onClick={onNewReport}
              className="mt-2 px-4 py-2 bg-[#EA580C] text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Submit a Report Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedComplaints.map((item) => {
              const isExpanded = expandedId === item.id;
              const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  id={`report-item-${item.id}`}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Photo Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <CivicImage
                          src={item.imageUrl}
                          alt={item.title || item.category}
                          fallbackCategory={item.category}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Main Info */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#EA580C] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                            {item.id}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{item.category}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${getSeverityBadgeClass(item.severity)}`}>
                            {item.severity}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(item.status)}`}>
                            {item.status}
                          </span>
                        </div>

                        <h3 className="font-display text-base font-bold text-[#071A2B] line-clamp-1">
                          {item.title || item.description}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                            <span>{item.location.address || 'Metro Area'}</span>
                          </span>
                          <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                            {item.location.latitude.toFixed(5)}°, {item.location.longitude.toFixed(5)}° (±{item.location.accuracy}m)
                          </span>
                          {item.location.ward && (
                            <span className="text-[11px] text-[#EA580C] font-semibold">
                              {item.location.ward}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.department}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{dateStr}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right action indicator */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Urgency</span>
                        <span className="text-sm font-extrabold text-[#071A2B]">
                          {item.urgency_score} <span className="text-[10px] text-slate-400 font-normal">/100</span>
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Drawer */}
                  {isExpanded && (
                    <div className="p-6 bg-slate-50/70 border-t border-slate-200 space-y-6">
                      {/* Description & AI Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Citizen Description
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>AI Audit Summary</span>
                          </h4>
                          <div className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                            <p className="leading-relaxed">{item.ai_verification.summary}</p>
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                              <div>
                                <span className="text-slate-400">Image Match: </span>
                                <span className="font-bold text-emerald-700">
                                   {item.ai_verification.image.validator.match ? 'Verified' : 'Mismatch'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400">Duplicate Score: </span>
                                <span className="font-bold text-slate-800">
                                  {item.ai_verification.duplicate.score}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Precise Location Telemetry Box */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                          <span>Precise Location Evidence & Geocoding</span>
                        </h4>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                            <span className="text-slate-400 text-[10px] uppercase font-bold">Exact Coordinates</span>
                            <p className="font-mono font-bold text-slate-900">
                              {item.location.latitude >= 0 ? `${item.location.latitude.toFixed(6)}° N` : `${Math.abs(item.location.latitude).toFixed(6)}° S`}, {item.location.longitude >= 0 ? `${item.location.longitude.toFixed(6)}° E` : `${Math.abs(item.location.longitude).toFixed(6)}° W`}
                            </p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                            <span className="text-slate-400 text-[10px] uppercase font-bold">GPS Accuracy & Geohash</span>
                            <p className="font-mono text-emerald-700 font-bold">
                              ±{item.location.accuracy}m radius {item.location.geohash ? `• ${item.location.geohash}` : ''}
                            </p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                            <span className="text-slate-400 text-[10px] uppercase font-bold">Location & Address</span>
                            <p className="text-slate-800 font-medium truncate" title={item.location.address}>
                              {item.location.ward ? `${item.location.ward} • ` : ''}{item.location.address || 'GPS location captured'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Progression */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Resolution Timeline
                        </h4>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                          {item.timeline.map((event, idx) => (
                            <div key={event.id || idx} className="flex items-start gap-3 text-xs">
                              <div className="w-2 h-2 rounded-full bg-[#EA580C] mt-1.5 shrink-0"></div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">{event.title}</span>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-[11px] mt-0.5">{event.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
