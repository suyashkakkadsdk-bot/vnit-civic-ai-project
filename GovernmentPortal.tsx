import React, { useState, useEffect } from 'react';
import {
  Building,
  BarChart3,
  MapPin,
  ListFilter,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  BrainCircuit,
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Send,
  X,
  UserCheck,
  ChevronRight,
  Info,
  Calendar,
  Eye,
  Shield,
} from 'lucide-react';
import {
  CivicComplaint,
  ComplaintCategory,
  ComplaintSeverity,
  ComplaintStatus,
  DashboardStats,
  Department,
} from '../types/api';
import { getComplaints, getDashboardStats, updateComplaintStatus } from '../services/api';
import { CivicImage } from './CivicImage';

interface GovernmentPortalProps {
  onOpenCitizenPortal?: () => void;
}

export const GovernmentPortal: React.FC<GovernmentPortalProps> = ({ onOpenCitizenPortal }) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'complaints' | 'map' | 'analytics' | 'departments' | 'critical'
  >('overview');

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [complaints, setComplaints] = useState<CivicComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Table Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Selected Complaint for Detail Modal
  const [selectedComplaint, setSelectedComplaint] = useState<CivicComplaint | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState('Inspector Miller');
  const [newNoteRole, setNewNoteRole] = useState('Operations Officer');
  const [isUpdating, setIsUpdating] = useState(false);

  // Map state
  const [mapCategoryFilter, setMapCategoryFilter] = useState('ALL');
  const [hoveredPin, setHoveredPin] = useState<CivicComplaint | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [fetchedStats, fetchedComplaints] = await Promise.all([
      getDashboardStats(),
      getComplaints({
        search,
        category: categoryFilter,
        severity: severityFilter,
        status: statusFilter,
        department: departmentFilter,
      }),
    ]);
    setStats(fetchedStats);
    setComplaints(fetchedComplaints);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [search, categoryFilter, severityFilter, statusFilter, departmentFilter]);

  // Handle Status Update
  const handleUpdateStatus = async (status: ComplaintStatus) => {
    if (!selectedComplaint) return;
    setIsUpdating(true);
    const updated = await updateComplaintStatus(selectedComplaint.id, {
      status,
      actor: 'Municipal Supervisor',
    });
    if (updated) {
      setSelectedComplaint(updated);
      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      const newStats = await getDashboardStats();
      setStats(newStats);
    }
    setIsUpdating(false);
  };

  // Handle Department Reassignment
  const handleReassignDepartment = async (department: Department) => {
    if (!selectedComplaint) return;
    setIsUpdating(true);
    const updated = await updateComplaintStatus(selectedComplaint.id, {
      department,
      actor: 'Operations Dispatcher',
    });
    if (updated) {
      setSelectedComplaint(updated);
      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }
    setIsUpdating(false);
  };

  // Handle Add Internal Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !newNoteContent.trim()) return;
    setIsUpdating(true);
    const updated = await updateComplaintStatus(selectedComplaint.id, {
      note: {
        author: newNoteAuthor || 'Staff Member',
        role: newNoteRole || 'Municipal Officer',
        content: newNoteContent.trim(),
      },
    });
    if (updated) {
      setSelectedComplaint(updated);
      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setNewNoteContent('');
    }
    setIsUpdating(false);
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'AI Verified':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'In Progress':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getSeverityBadge = (severity: ComplaintSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-orange-600 text-white';
      case 'LOW':
        return 'bg-slate-600 text-white';
    }
  };

  const criticalComplaints = complaints.filter(
    (c) => c.severity === 'CRITICAL' || c.urgency_score >= 85
  );

  return (
    <div id="government-portal-root" className="min-h-screen bg-[#FFFBF7]">
      {/* Top Operations Header */}
      <div className="bg-[#071A2B] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EA580C] to-[#F97316] flex items-center justify-center shadow-md">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Government Operations Dashboard
                    </h1>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                      Demo Data
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    AI-assisted civic complaint triage, automated departmental routing, and resolution telemetry.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Telemetry</span>
              </button>

              <button
                onClick={onOpenCitizenPortal}
                className="px-4 py-2 rounded-lg bg-[#EA580C] hover:bg-[#C2410C] text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Switch to Citizen Portal</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <div className="flex items-center space-x-1 sm:space-x-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto pb-1">
            {[
              { id: 'overview', label: 'Overview', icon: Layers },
              { id: 'complaints', label: 'Complaints Table', icon: ListFilter, count: complaints.length },
              { id: 'map', label: 'Interactive GIS Map', icon: MapPin },
              { id: 'analytics', label: 'Operations Analytics', icon: BarChart3 },
              { id: 'critical', label: 'Critical Escalations', icon: Flame, count: criticalComplaints.length, highlight: true },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#EA580C] text-white shadow'
                      : tab.highlight
                      ? 'text-red-400 bg-red-950/40 hover:bg-red-900/50 border border-red-800/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] ${
                        isActive
                          ? 'bg-black/30 text-white'
                          : tab.highlight
                          ? 'bg-red-900 text-red-200'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Operations Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI METRIC CARDS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* TOTAL COMPLAINTS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">TOTAL COMPLAINTS</span>
              <Layers className="w-4 h-4 text-orange-600" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#071A2B]">
              {stats?.total_complaints.toLocaleString() || '1,284'}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>+14% vs last month</span>
            </p>
          </div>

          {/* PENDING */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">PENDING REVIEW</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-extrabold text-amber-600">
              {stats?.pending.toLocaleString() || '248'}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Under triage or dispatch</p>
          </div>

          {/* AI VERIFIED */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">AI VERIFIED</span>
              <Sparkles className="w-4 h-4 text-[#EA580C]" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#EA580C]">
              {stats?.ai_verified.toLocaleString() || '934'}
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">97.4% Model Accuracy</p>
          </div>

          {/* CRITICAL */}
          <div className="bg-white rounded-2xl border border-red-200 bg-red-50/20 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">CRITICAL</span>
              <Flame className="w-4 h-4 text-red-600 animate-bounce" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-extrabold text-red-600">
              {stats?.critical.toLocaleString() || '37'}
            </div>
            <p className="text-[10px] text-red-600 font-medium mt-1">Immediate action needed</p>
          </div>

          {/* RESOLVED */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">RESOLVED</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {stats?.resolved.toLocaleString() || '702'}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Avg turnaround 4.8 hrs</p>
          </div>
        </div>

        {/* AI INSIGHTS NOTIFICATION BANNER */}
        <div className="bg-gradient-to-r from-[#071A2B] to-[#1E293B] rounded-2xl p-6 text-white border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-amber-400 animate-pulse" />
              <h2 className="font-display text-lg font-bold text-white">AI Operational Insights</h2>
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2.5 py-1 rounded border border-amber-800">
              AI-generated insights (Demo Telemetry)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>12 Possible Duplicate Complaints Detected</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Spatial clustering identified multiple reports for the same water leak on Pine Street. Merged into master ticket.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <Flame className="w-4 h-4" />
                <span>8 Critical Road Safety Issues Require Dispatch</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Severe arterial craters detected on Main Boulevard & Grand Avenue posing immediate traffic collision hazards.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <TrendingUp className="w-4 h-4" />
                <span>Streetlight Complaints Increased +34% This Week</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Substation circuit breaker B-12 outage identified affecting 4 continuous lamp poles on Oakwood Walkway.
              </p>
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & SUMMARY */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Split layout: Recent Critical Incidents & Quick Operations Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Critical Escalations Queue (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-600" />
                    <h3 className="font-display text-base font-bold text-[#071A2B]">
                      Critical Escalations Requiring Immediate Action
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('critical')}
                    className="text-xs font-bold text-[#EA580C] hover:underline"
                  >
                    View All ({criticalComplaints.length}) →
                  </button>
                </div>

                <div className="space-y-3">
                  {criticalComplaints.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedComplaint(item)}
                      className="p-4 rounded-xl border border-red-200 bg-red-50/30 hover:bg-red-50/70 transition-colors cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <CivicImage
                            src={item.imageUrl}
                            alt={item.title || item.category}
                            fallbackCategory={item.category}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-red-700">{item.id}</span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                              {item.severity}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{item.category}</span>
                          </div>
                          <p className="text-xs font-bold text-[#071A2B] mt-0.5 line-clamp-1">
                            {item.title || item.description}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.location.address}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Urgency</span>
                        <span className="text-sm font-extrabold text-red-600">{item.urgency_score}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Workload Breakdown (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-display text-base font-bold text-[#071A2B]">
                    Department Dispatch Distribution
                  </h3>
                  <span className="text-xs text-slate-400">Live Active</span>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    { name: 'Roads Department', active: 312, pct: 85, color: 'bg-orange-600' },
                    { name: 'Water Works & Sewerage', active: 284, pct: 72, color: 'bg-amber-500' },
                    { name: 'Sanitation & Waste', active: 245, pct: 90, color: 'bg-emerald-500' },
                    { name: 'Electrical & Lighting', active: 180, pct: 64, color: 'bg-purple-600' },
                    { name: 'Traffic Management', active: 140, pct: 95, color: 'bg-red-500' },
                  ].map((dept) => (
                    <div key={dept.name} className="space-y-1">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>{dept.name}</span>
                        <span>{dept.active} tickets</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${dept.color}`} style={{ width: `${dept.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Complaints Table Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-base font-bold text-[#071A2B]">
                  Recent Verified Incident Queue
                </h3>
                <button
                  onClick={() => setActiveTab('complaints')}
                  className="text-xs font-bold text-[#EA580C] hover:underline"
                >
                  Open Full Complaints Table →
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Issue Category</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3">Urgency</th>
                      <th className="py-2.5 px-3">AI Confidence</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaints.slice(0, 5).map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedComplaint(row)}
                        className="hover:bg-orange-50/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-3 font-mono font-bold text-[#EA580C]">{row.id}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">{row.category}</td>
                        <td className="py-3 px-3 text-slate-600 truncate max-w-[160px]">
                          {row.location.address || 'Metro Area'}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${getSeverityBadge(row.severity)}`}>
                            {row.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">{row.urgency_score}/100</td>
                        <td className="py-3 px-3 font-bold text-emerald-600">
                          {row.ai_verification?.confidence_score || 95}%
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">{row.department}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedComplaint(row);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-orange-600 hover:bg-orange-50 rounded"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPLAINTS TABLE (FULL VIEW WITH FILTERS) */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            {/* Multi-Filters Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ID, issue, address..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 bg-slate-50/50"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50/50 text-slate-700"
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

                {/* Severity Filter */}
                <div>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50/50 text-slate-700"
                  >
                    <option value="ALL">All Severities</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50/50 text-slate-700"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Submitted">Submitted</option>
                    <option value="AI Verified">AI Verified</option>
                    <option value="Under Review">Under Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Department Filter */}
                <div>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50/50 text-slate-700"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Roads Department">Roads Department</option>
                    <option value="Sanitation & Waste">Sanitation & Waste</option>
                    <option value="Water Works & Sewerage">Water Works & Sewerage</option>
                    <option value="Electrical & Lighting">Electrical & Lighting</option>
                    <option value="Traffic Management">Traffic Management</option>
                    <option value="Public Works Department">Public Works Department</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Issue Title / Description</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Severity</th>
                      <th className="py-3 px-4">Urgency</th>
                      <th className="py-3 px-4">AI Conf.</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Reported</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {complaints.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedComplaint(row)}
                        className="hover:bg-orange-50/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#EA580C]">{row.id}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 line-clamp-1">{row.title || row.category}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{row.description}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 truncate max-w-[150px]">
                          {row.location.address || 'Metro Center'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${getSeverityBadge(row.severity)}`}>
                            {row.severity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">{row.urgency_score}/100</td>
                        <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                          {row.ai_verification?.confidence_score || 95}%
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold">{row.department}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(row.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedComplaint(row);
                            }}
                            className="px-3 py-1 text-xs font-bold text-white bg-[#071A2B] hover:bg-[#EA580C] rounded-lg transition-colors"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE GIS CITY MAP */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#071A2B]">
                    Municipal GIS Spatial Incident Map
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live spatial markers plotted with priority status, category filters, and active geofences.
                  </p>
                </div>

                {/* Category Filter for Map */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Layer:</span>
                  <select
                    value={mapCategoryFilter}
                    onChange={(e) => setMapCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-slate-50 text-slate-700"
                  >
                    <option value="ALL">All Incident Layers</option>
                    <option value="Road Damage">Road Damage</option>
                    <option value="Waste Management">Waste Management</option>
                    <option value="Water Leakage">Water Leakage</option>
                    <option value="Streetlight">Streetlight</option>
                    <option value="Traffic & Safety">Traffic & Safety</option>
                  </select>
                </div>
              </div>

              {/* Attractive Simulated GIS Map Canvas */}
              <div className="relative h-[540px] w-full rounded-xl overflow-hidden bg-[#071A2B] border-2 border-slate-800 shadow-inner flex items-center justify-center">
                {/* SVG City Street Grid Background */}
                <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid Lines */}
                  <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#F97316" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid-pattern)" />

                  {/* Simulated River / Arterial Highways */}
                  <path
                    d="M0,280 Q300,240 600,320 T1200,290"
                    fill="none"
                    stroke="#EA580C"
                    strokeWidth="14"
                    opacity="0.4"
                  />
                  <path
                    d="M150,0 L200,600"
                    fill="none"
                    stroke="#FB923C"
                    strokeWidth="3"
                    opacity="0.3"
                  />
                  <path
                    d="M750,0 L700,600"
                    fill="none"
                    stroke="#FB923C"
                    strokeWidth="3"
                    opacity="0.3"
                  />
                  <path
                    d="M0,150 L1200,180"
                    fill="none"
                    stroke="#FB923C"
                    strokeWidth="3"
                    opacity="0.3"
                  />
                  <path
                    d="M0,450 L1200,420"
                    fill="none"
                    stroke="#FB923C"
                    strokeWidth="3"
                    opacity="0.3"
                  />
                </svg>

                {/* City Sector Labels on Map */}
                <div className="absolute top-6 left-8 text-[11px] font-mono font-bold text-amber-400/60 uppercase tracking-widest pointer-events-none">
                  SECTOR 1 — UNIVERSITY QUARTER
                </div>
                <div className="absolute bottom-6 left-8 text-[11px] font-mono font-bold text-amber-400/60 uppercase tracking-widest pointer-events-none">
                  SECTOR 3 — RIVERFRONT PROMENADE
                </div>
                <div className="absolute top-6 right-8 text-[11px] font-mono font-bold text-amber-400/60 uppercase tracking-widest pointer-events-none">
                  SECTOR 2 — COMMERCIAL ZONE
                </div>
                <div className="absolute bottom-6 right-8 text-[11px] font-mono font-bold text-amber-400/60 uppercase tracking-widest pointer-events-none">
                  SECTOR 4 — METRO ARTERIAL CORRIDOR
                </div>

                {/* Render Incident Pins */}
                {complaints
                  .filter(
                    (c) =>
                      mapCategoryFilter === 'ALL' || c.category === mapCategoryFilter
                  )
                  .map((comp, i) => {
                    // Position calculations mapped to 2D canvas coordinates
                    const posX = 15 + ((i * 19 + 7) % 70);
                    const posY = 18 + ((i * 23 + 11) % 65);
                    const isCritical = comp.severity === 'CRITICAL';

                    return (
                      <div
                        key={comp.id}
                        style={{ left: `${posX}%`, top: `${posY}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                        onClick={() => setSelectedComplaint(comp)}
                        onMouseEnter={() => setHoveredPin(comp)}
                        onMouseLeave={() => setHoveredPin(null)}
                      >
                        {/* Critical Pulsing Ring */}
                        {isCritical && (
                          <span className="absolute -inset-2 rounded-full bg-red-500/40 animate-ping"></span>
                        )}

                        {/* Pin Bubble */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 transition-transform duration-200 group-hover:scale-125 ${
                            isCritical
                              ? 'bg-red-600 border-white text-white'
                              : comp.severity === 'HIGH'
                              ? 'bg-orange-500 border-white text-white'
                              : 'bg-orange-600 border-white text-white'
                          }`}
                        >
                          <MapPin className="w-5 h-5" />
                        </div>

                        {/* Pin Tag */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {comp.id} • {comp.category}
                        </div>
                      </div>
                    );
                  })}

                {/* Hover Details Floating Card */}
                {hoveredPin && (
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-slate-200 w-72 z-30 pointer-events-none animate-fadeIn text-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#EA580C]">{hoveredPin.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${getSeverityBadge(hoveredPin.severity)}`}>
                        {hoveredPin.severity}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-[#071A2B] mt-1 line-clamp-1">
                      {hoveredPin.title || hoveredPin.category}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{hoveredPin.location.address}</p>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100 text-[11px]">
                      <span>Urgency: <strong>{hoveredPin.urgency_score}/100</strong></span>
                      <span className="text-orange-600 font-bold">Click to inspect →</span>
                    </div>
                  </div>
                )}

                {/* Bottom Left Map Controls Badge */}
                <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md text-slate-300 p-2.5 rounded-xl border border-slate-700 text-xs flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                    <span className="text-[11px]">Critical Hazard</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span className="text-[11px]">High Priority</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
                    <span className="text-[11px]">Standard Issue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: OPERATIONS ANALYTICS CHARTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Complaint Volume Trends Over Time */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#071A2B]">
                      Daily Incident Submissions & Resolutions
                    </h3>
                    <p className="text-xs text-slate-500">Past 7 days reporting volume</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
                    +18% Resolution Rate
                  </span>
                </div>

                {/* SVG Visual Bar & Line Chart */}
                <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
                  {[
                    { day: 'Mon', reported: 140, resolved: 110 },
                    { day: 'Tue', reported: 185, resolved: 160 },
                    { day: 'Wed', reported: 220, resolved: 195 },
                    { day: 'Thu', reported: 190, resolved: 175 },
                    { day: 'Fri', reported: 260, resolved: 230 },
                    { day: 'Sat', reported: 160, resolved: 140 },
                    { day: 'Sun', reported: 130, resolved: 125 },
                  ].map((bar) => {
                    const maxH = 260;
                    const hReported = (bar.reported / maxH) * 180;
                    const hResolved = (bar.resolved / maxH) * 180;
                    return (
                      <div key={bar.day} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex items-end justify-center gap-1.5 h-48">
                          {/* Reported Bar */}
                          <div
                            style={{ height: `${hReported}px` }}
                            className="w-1/2 bg-[#EA580C] rounded-t-md hover:brightness-110 transition-all relative group"
                          >
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-slate-900 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {bar.reported}
                            </span>
                          </div>
                          {/* Resolved Bar */}
                          <div
                            style={{ height: `${hResolved}px` }}
                            className="w-1/2 bg-emerald-500 rounded-t-md hover:brightness-110 transition-all relative group"
                          >
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-slate-900 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {bar.resolved}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-600">{bar.day}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#EA580C]"></span>
                    <span className="text-slate-700">Reported Issues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-500"></span>
                    <span className="text-slate-700">Resolved by Field Crews</span>
                  </div>
                </div>
              </div>

              {/* Chart 2: Category Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#071A2B]">
                      Incident Category Distribution
                    </h3>
                    <p className="text-xs text-slate-500">Total volume by issue taxonomy</p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-2">
                  {[
                    { cat: 'Road Damage (Potholes / Pavement)', pct: 34, count: 436, color: 'bg-orange-600' },
                    { cat: 'Water Leakage & Drainage', pct: 26, count: 334, color: 'bg-amber-500' },
                    { cat: 'Waste & Illegal Dumping', pct: 19, count: 244, color: 'bg-emerald-500' },
                    { cat: 'Streetlights & Electrical', pct: 13, count: 167, color: 'bg-purple-600' },
                    { cat: 'Traffic Signals & Safety', pct: 8, count: 103, color: 'bg-red-500' },
                  ].map((item) => (
                    <div key={item.cat} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{item.cat}</span>
                        <span>{item.count} ({item.pct}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CRITICAL ESCALATIONS */}
        {activeTab === 'critical' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-red-950 text-white border border-red-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="font-display font-bold text-base">High-Urgency Critical Safety Incidents</h3>
                  <p className="text-xs text-red-200">
                    Complaints flagged with structural danger, active water main ruptures, or traffic intersection hazards.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded bg-red-800 text-red-100 text-xs font-bold font-mono">
                {criticalComplaints.length} Active Tickets
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {criticalComplaints.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedComplaint(item)}
                  className="bg-white rounded-2xl border-2 border-red-200 hover:border-red-500 p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          {item.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white">
                          CRITICAL
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-base text-[#071A2B] mt-2 line-clamp-1">
                        {item.title || item.description}
                      </h4>
                    </div>

                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <CivicImage
                        src={item.imageUrl}
                        alt={item.title || item.category}
                        fallbackCategory={item.category}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">{item.department}</span>
                    <span className="text-red-600 font-extrabold">Urgency Score: {item.urgency_score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* COMPLAINT DETAIL MODAL / DRAWER */}
      {selectedComplaint && (
        <div
          id="complaint-detail-modal"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300 space-y-6 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-[#071A2B] text-white flex items-center justify-between sticky top-0 z-10 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-amber-400 bg-amber-950 px-2.5 py-1 rounded border border-amber-800">
                  {selectedComplaint.id}
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">
                    {selectedComplaint.title || selectedComplaint.category}
                  </h3>
                  <p className="text-xs text-slate-300">{selectedComplaint.location.address || 'Metro Area'}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Evidence Photo & Core Telemetry Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo with zoom inspect */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Citizen Photo Evidence
                  </span>
                  <div className="relative h-64 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner">
                    <CivicImage
                      src={selectedComplaint.imageUrl}
                      alt={selectedComplaint.title || selectedComplaint.category}
                      fallbackCategory={selectedComplaint.category}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/80 text-white text-[10px] font-mono">
                      {selectedComplaint.imageFileName || 'evidence.jpg'} ({selectedComplaint.imageFileSize || '2.4 MB'})
                    </div>
                  </div>
                </div>

                {/* AI Scorecard & Metrics */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Multi-Modal AI Audit Scorecard
                  </span>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Severity</span>
                      <span className={`text-xs font-extrabold ${selectedComplaint.severity === 'CRITICAL' ? 'text-red-600' : 'text-slate-900'}`}>
                        {selectedComplaint.severity}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Urgency</span>
                      <span className="text-xs font-extrabold text-[#071A2B]">
                        {selectedComplaint.urgency_score}/100
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">AI Confidence</span>
                      <span className="text-xs font-extrabold text-emerald-600">
                        {selectedComplaint.ai_verification?.confidence_score || 95}%
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200 text-xs space-y-1">
                    <span className="font-bold text-[#EA580C] block">AI Summary:</span>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedComplaint.ai_verification?.summary || selectedComplaint.description}
                    </p>
                  </div>

                  {/* Verification Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Optical Match:</span>
                      <span className="font-bold text-emerald-700">
                        {selectedComplaint.ai_verification?.image.validator.match ? '✓ Verified (96%)' : '✕ Mismatch'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Duplicate Check:</span>
                      <span className="font-bold text-slate-800">
                        {selectedComplaint.ai_verification?.duplicate.possible ? '⚠ Possible Duplicate' : '✓ Unique (18%)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Citizen Description Text */}
              <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-700 block">
                  Citizen Description ({selectedComplaint.citizen_name || 'Anonymous'})
                </span>
                <p className="text-slate-800 leading-relaxed">{selectedComplaint.description}</p>
              </div>

              {/* Precise Sensor Location Telemetry Box */}
              <div className="p-4.5 rounded-xl border-2 border-amber-200 bg-amber-50/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>Precise GPS Location Telemetry (Field Evidence)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    High Accuracy Fix (±{selectedComplaint.location.accuracy}m)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Latitude</span>
                    <p className="font-mono font-bold text-slate-900">
                      {selectedComplaint.location.latitude >= 0 ? `${selectedComplaint.location.latitude.toFixed(6)}° N` : `${Math.abs(selectedComplaint.location.latitude).toFixed(6)}° S`}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Longitude</span>
                    <p className="font-mono font-bold text-slate-900">
                      {selectedComplaint.location.longitude >= 0 ? `${selectedComplaint.location.longitude.toFixed(6)}° E` : `${Math.abs(selectedComplaint.location.longitude).toFixed(6)}° W`}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Municipal Area</span>
                    <p className="font-bold text-[#EA580C] truncate" title={selectedComplaint.location.ward || selectedComplaint.location.city || 'GNSS Verified'}>
                      {selectedComplaint.location.ward || selectedComplaint.location.city || 'GNSS Verified'}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Spatial Geohash</span>
                    <p className="font-mono font-bold text-amber-800">
                      {selectedComplaint.location.geohash || 'ACTIVE'}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center justify-between gap-2 pt-1 border-t border-amber-100 font-medium">
                  <span className="truncate">
                    📍 {selectedComplaint.location.address} {selectedComplaint.location.landmark && `(${selectedComplaint.location.landmark})`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${selectedComplaint.location.latitude}, ${selectedComplaint.location.longitude}`);
                      alert('Coordinates copied to clipboard: ' + `${selectedComplaint.location.latitude}, ${selectedComplaint.location.longitude}`);
                    }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[10px] font-bold text-slate-700 shrink-0"
                  >
                    Copy GPS
                  </button>
                </div>
              </div>

              {/* Action Bar: Status & Department Assignment */}
              <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Municipal Action Controls
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Update Status</label>
                    <select
                      value={selectedComplaint.status}
                      onChange={(e) => handleUpdateStatus(e.target.value as ComplaintStatus)}
                      disabled={isUpdating}
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-800"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="AI Verified">AI Verified</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Department Assignment */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Assigned Department</label>
                    <select
                      value={selectedComplaint.department}
                      onChange={(e) => handleReassignDepartment(e.target.value as Department)}
                      disabled={isUpdating}
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-800"
                    >
                      <option value="Roads Department">Roads Department</option>
                      <option value="Sanitation & Waste">Sanitation & Waste</option>
                      <option value="Water Works & Sewerage">Water Works & Sewerage</option>
                      <option value="Electrical & Lighting">Electrical & Lighting</option>
                      <option value="Traffic Management">Traffic Management</option>
                      <option value="Public Works Department">Public Works Department</option>
                      <option value="Urban Planning">Urban Planning</option>
                    </select>
                  </div>

                  {/* Mark Resolved Quick CTA */}
                  <div className="flex items-end">
                    <button
                      onClick={() => handleUpdateStatus('Resolved')}
                      disabled={selectedComplaint.status === 'Resolved' || isUpdating}
                      className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{selectedComplaint.status === 'Resolved' ? 'Resolved ✓' : 'Mark Resolved'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Timeline and Staff Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timeline */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Incident Audit Timeline
                  </span>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-48 overflow-y-auto space-y-3">
                    {selectedComplaint.timeline.map((event, idx) => (
                      <div key={event.id || idx} className="text-xs flex items-start gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-[#EA580C] mt-1.5 shrink-0"></div>
                        <div>
                          <p className="font-bold text-slate-900">{event.title}</p>
                          <p className="text-[11px] text-slate-500">{event.description}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {event.actor}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Internal Staff Notes
                  </span>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="max-h-24 overflow-y-auto space-y-2">
                      {selectedComplaint.internal_notes.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No internal notes added yet.</p>
                      ) : (
                        selectedComplaint.internal_notes.map((note) => (
                          <div key={note.id} className="bg-white p-2.5 rounded border border-slate-200 text-xs">
                            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                              <strong>{note.author} ({note.role})</strong>
                              <span>{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-800">{note.content}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Note Form */}
                    <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t border-slate-200">
                      <input
                        type="text"
                        placeholder="Add internal dispatch note..."
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800"
                      />
                      <button
                        type="submit"
                        disabled={!newNoteContent.trim() || isUpdating}
                        className="px-3 py-1.5 bg-[#071A2B] text-white text-xs font-bold rounded-lg hover:bg-[#EA580C] transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
