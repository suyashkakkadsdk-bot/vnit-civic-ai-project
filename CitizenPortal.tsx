import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  MapPin,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  Building,
  ShieldCheck,
  Activity,
  ArrowRight,
  Info,
  Sliders,
  Check,
  FileCheck,
  Navigation,
  Copy,
  Crosshair,
  Compass,
  Radio,
  ExternalLink,
} from 'lucide-react';
import {
  AIVerificationResponse,
  CivicComplaint,
  ComplaintCategory,
  LocationData,
} from '../types/api';
import { getCurrentLocation } from '../utils/geolocation';
import { verifyComplaint, submitComplaint } from '../services/api';
import { CIVIC_ISSUE_IMAGES } from '../data/civicImages';

interface CitizenPortalProps {
  initialCategory?: ComplaintCategory;
  initialDescription?: string;
  onComplaintSubmitted?: (complaint: CivicComplaint) => void;
  onViewMyReports?: () => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  initialCategory = 'Road Damage',
  initialDescription = '',
  onComplaintSubmitted,
  onViewMyReports,
}) => {
  // Form State
  const [description, setDescription] = useState(initialDescription);
  const [category, setCategory] = useState<ComplaintCategory>(initialCategory);
  const [citizenName, setCitizenName] = useState('');
  const [citizenContact, setCitizenContact] = useState('');

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    CIVIC_ISSUE_IMAGES.road_damage.imageUrl // default realistic preview so demo is immediately testable!
  );
  const [imageFileName, setImageFileName] = useState<string>('pothole_evidence.jpg');
  const [imageFileSize, setImageFileSize] = useState<string>('2.4 MB');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Location state
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Verification & Submission state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<number>(0);
  const [aiResult, setAiResult] = useState<AIVerificationResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<CivicComplaint | null>(null);

  // Demo Simulation Toggles for Hackathon judges
  const [simMode, setSimMode] = useState<'normal' | 'mismatch' | 'duplicate' | 'far_location'>('normal');

  const categories: ComplaintCategory[] = [
    'Road Damage',
    'Waste Management',
    'Water Leakage',
    'Streetlight',
    'Drainage',
    'Traffic & Safety',
    'Public Infrastructure',
    'Other',
  ];

  // Handle Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/i)) {
      alert('Please upload a valid image (JPG, PNG, or WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size must be less than 10MB.');
      return;
    }

    setImageFile(file);
    setImageFileName(file.name);
    setImageFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setImageFileName('');
    setImageFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Capture Geolocation
  const handleGetLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    const res = await getCurrentLocation();
    setIsLocating(false);

    if (res.success && res.location) {
      setLocation(res.location);
    } else {
      setLocationError(res.error || 'Could not retrieve coordinates.');
    }
  };

  // Perform AI Verification
  const handleVerify = async () => {
    if (!description.trim() || description.length < 20) {
      alert('Please enter at least 20 characters describing the issue.');
      return;
    }
    if (!imagePreviewUrl) {
      alert('Please add a photo evidence.');
      return;
    }
    if (!location) {
      alert('Please capture or specify your location.');
      return;
    }

    setIsVerifying(true);
    setAiResult(null);
    setVerificationStep(1);

    // Progressive step animations for realistic AI telemetry feel
    const timer1 = setTimeout(() => setVerificationStep(2), 400);
    const timer2 = setTimeout(() => setVerificationStep(3), 800);
    const timer3 = setTimeout(() => setVerificationStep(4), 1200);
    const timer4 = setTimeout(() => setVerificationStep(5), 1500);

    try {
      const result = await verifyComplaint(
        {
          description,
          category,
          imageFile,
          imageBase64: imagePreviewUrl || undefined,
          location,
          citizen_name: citizenName,
          citizen_contact: citizenContact,
        },
        {
          simulateMismatch: simMode === 'mismatch',
          simulateDuplicate: simMode === 'duplicate',
          simulateFarLocation: simMode === 'far_location',
        }
      );

      setAiResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      setIsVerifying(false);
    }
  };

  // Final Submission to Municipal Queue
  const handleSubmitReport = async () => {
    if (!aiResult || !location) return;

    setIsSubmitting(true);
    try {
      const complaint = await submitComplaint(
        {
          description,
          category,
          imageFile,
          imageBase64: imagePreviewUrl || undefined,
          location,
          citizen_name: citizenName || 'Anonymous Citizen',
          citizen_contact: citizenContact || 'citizen@nagarmitra.local',
        },
        aiResult
      );

      setSubmittedComplaint(complaint);
      if (onComplaintSubmitted) {
        onComplaintSubmitted(complaint);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setDescription('');
    setCategory('Road Damage');
    setImageFile(null);
    setImagePreviewUrl(null);
    setAiResult(null);
    setSubmittedComplaint(null);
    setVerificationStep(0);
  };

  // Validation checks
  const isFormValid = description.trim().length >= 20 && !!imagePreviewUrl && !!location;

  return (
    <div id="citizen-portal-container" className="py-12 bg-[#FFFBF7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[#EA580C] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Direct Citizen Intake</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#071A2B] tracking-tight">
              Report a Civic Issue
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Submit verified evidence in under a minute with instant multi-modal validation.
            </p>
          </div>

          {/* Quick links & Demo Presets */}
          <div className="flex items-center gap-3">
            <button
              onClick={onViewMyReports}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
            >
              View My Reports →
            </button>
          </div>
        </div>

        {/* Success Modal / Banner when Submitted */}
        {submittedComplaint && (
          <div
            id="submission-success-banner"
            className="mb-10 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4 animate-fadeIn"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                  Incident Officially Logged
                </span>
                <h3 className="font-display text-2xl font-bold text-emerald-950">
                  Complaint #{submittedComplaint.id} Successfully Dispatched!
                </h3>
                <p className="text-slate-700 text-sm">
                  Your complaint has been verified by the AI engine and routed directly to the{' '}
                  <strong className="text-emerald-900">{submittedComplaint.department}</strong> queue with Priority Score{' '}
                  <strong className="text-emerald-900">{submittedComplaint.urgency_score}/100</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onViewMyReports}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Track in "My Reports"</span>
              </button>
              <button
                onClick={handleResetForm}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg transition-colors"
              >
                + Report Another Civic Issue
              </button>
            </div>
          </div>
        )}

        {/* Demo Simulation Controls for Presentation */}
        <div className="mb-8 p-3.5 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <Sliders className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-orange-200 uppercase tracking-wider">Demo AI Test Modes:</span>
            <span className="text-slate-300 hidden md:inline">Test different AI verification scenarios for judges:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSimMode('normal');
                if (aiResult) handleVerify();
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                simMode === 'normal'
                  ? 'bg-[#EA580C] text-white ring-2 ring-orange-400 shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ✓ Normal Verified Match
            </button>
            <button
              onClick={() => {
                setSimMode('mismatch');
                if (aiResult) handleVerify();
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                simMode === 'mismatch'
                  ? 'bg-red-600 text-white ring-2 ring-red-300 shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ✕ Image Mismatch Test
            </button>
            <button
              onClick={() => {
                setSimMode('duplicate');
                if (aiResult) handleVerify();
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                simMode === 'duplicate'
                  ? 'bg-amber-600 text-white ring-2 ring-amber-300 shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ⚠ Duplicate Alert Test
            </button>
            <button
              onClick={() => {
                setSimMode('far_location');
                if (aiResult) handleVerify();
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                simMode === 'far_location'
                  ? 'bg-purple-600 text-white ring-2 ring-purple-300 shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              📍 Far Location Warning
            </button>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Complaint Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="font-display text-xl font-bold text-[#071A2B]">
                Incident Evidence & Location
              </h2>
              <p className="text-xs text-slate-500">Provide accurate details for instant verification</p>
            </div>

            {/* 1. Category Selector */}
            <div className="space-y-2">
              <label htmlFor="category-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Civic Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                        isSelected
                          ? 'bg-orange-50/90 border-[#EA580C] text-[#EA580C] shadow-xs'
                          : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{cat}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Text Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="complaint-description" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  What happened? <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs font-mono font-medium ${
                    description.length < 20 ? 'text-amber-600' : 'text-slate-500'
                  }`}
                >
                  {description.length} / 1000 chars {description.length < 20 && '(min 20)'}
                </span>
              </div>
              <textarea
                id="complaint-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: A deep pothole has formed in the right lane near the intersection. Vehicles are swerving into oncoming traffic to avoid tire damage..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] text-sm text-slate-800 placeholder-slate-400 bg-white"
                maxLength={1000}
              ></textarea>
            </div>

            {/* 3. Photo Evidence Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Add Photo Evidence <span className="text-red-500">*</span>
              </label>

              {imagePreviewUrl ? (
                /* Uploaded Preview State */
                <div className="relative rounded-xl border-2 border-orange-200 bg-orange-50/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 truncate">{imageFileName}</p>
                        <p className="text-[11px] text-slate-500">{imageFileSize} • Ready for AI verification</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-semibold text-orange-700 bg-white border border-orange-300 hover:bg-orange-50 rounded-lg shadow-xs transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Large Image Preview */}
                  <div className="relative h-48 sm:h-56 rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
                    <img
                      src={imagePreviewUrl}
                      alt="Uploaded civic issue evidence"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/70 text-white text-[10px] font-mono backdrop-blur-sm">
                      Optical Evidence Ready
                    </div>
                  </div>
                </div>
              ) : (
                /* Drag & Drop Box */
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-300 hover:border-[#EA580C] rounded-xl p-6 sm:p-8 text-center bg-slate-50/70 hover:bg-orange-50/30 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center text-[#EA580C]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Upload a clear photo of the reported issue
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Drag and drop, or browse from your device (JPG, PNG, WEBP max 10MB)
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-xs hover:bg-slate-50"
                    >
                      Browse Files
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cameraInputRef.current?.click();
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg shadow-xs flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Photo</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* 4. Location Capture Card & Precise Coordinate Telemetry */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Precise User Location Evidence <span className="text-red-500">*</span>
                </label>
                {location && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>WGS84 GNSS FIX ACTIVE</span>
                  </span>
                )}
              </div>

              <div className="p-4 sm:p-5 rounded-2xl border-2 border-orange-200/80 bg-gradient-to-br from-slate-50 via-orange-50/20 to-white shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#071A2B] text-orange-400 flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                      <Crosshair className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          {location ? 'Real GPS Location Acquired' : 'Device GPS Required'}
                        </p>
                        {location && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                            Live GNSS Fix
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {location ? location.address : 'Click button to capture your device position using real browser GPS'}
                      </p>
                      {location?.landmark && (
                        <p className="text-[11px] text-orange-800 flex items-center gap-1 font-medium mt-0.5">
                          <MapPin className="w-3 h-3 text-orange-600 shrink-0" />
                          <span>Area: {location.landmark}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="px-4 py-2.5 text-xs font-bold text-[#FB923C] bg-[#071A2B] hover:bg-[#0F2A44] rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-[1.02] border border-orange-500/30"
                  >
                    {isLocating ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
                    ) : (
                      <Compass className="w-4 h-4 text-orange-400" />
                    )}
                    <span>{isLocating ? 'Acquiring Real GPS...' : (location ? 'Recalibrate GPS' : 'Use My Current Location')}</span>
                  </button>
                </div>

                {/* PRECISE COORDINATE TELEMETRY DISPLAY */}
                {location && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-200">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {/* Latitude */}
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Real Latitude
                        </span>
                        <span className="text-slate-900 font-mono font-bold text-xs sm:text-sm">
                          {location.latitude > 0 ? `${location.latitude.toFixed(6)}° N` : `${Math.abs(location.latitude).toFixed(6)}° S`}
                        </span>
                      </div>

                      {/* Longitude */}
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Real Longitude
                        </span>
                        <span className="text-slate-900 font-mono font-bold text-xs sm:text-sm">
                          {location.longitude < 0 ? `${Math.abs(location.longitude).toFixed(6)}° W` : `${location.longitude.toFixed(6)}° E`}
                        </span>
                      </div>

                      {/* Accuracy */}
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          GPS Accuracy
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-emerald-700 font-mono font-bold text-xs sm:text-sm">
                            ±{location.accuracy} meters
                          </span>
                        </div>
                      </div>

                      {/* Location Area / City */}
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Municipal Sector
                        </span>
                        <span className="text-[#EA580C] font-bold text-xs truncate block" title={location.ward || location.city || 'Verified Location'}>
                          {location.ward || location.city || 'GNSS Verified'}
                        </span>
                      </div>
                    </div>

                    {/* Secondary Telemetry Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-mono">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-orange-400 font-bold flex items-center gap-1">
                          <Radio className="w-3 h-3 animate-pulse" />
                          <span>Spatial Geohash: {location.geohash}</span>
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-300">
                          {location.altitude !== undefined ? `Alt: ${location.altitude}m ASL` : 'GNSS Fix Active'}
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-400 text-[10px]">
                          Captured: {location.capturedAt ? new Date(location.capturedAt).toLocaleTimeString() : 'Live'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const coordString = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
                          navigator.clipboard.writeText(coordString);
                          setCopiedCoords(true);
                          setTimeout(() => setCopiedCoords(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-orange-300 text-[10px] font-bold flex items-center gap-1 transition-colors ml-auto"
                      >
                        {copiedCoords ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy GPS</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {locationError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                    <span>{locationError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Optional Citizen Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Citizen Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Mercer"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-800 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Contact Phone / Email (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. alex@example.com"
                  value={citizenContact}
                  onChange={(e) => setCitizenContact(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-800 bg-white"
                />
              </div>
            </div>

            {/* Verify CTA */}
            <div className="pt-4 border-t border-slate-100">
              <button
                id="btn-verify-complaint"
                type="button"
                onClick={handleVerify}
                disabled={!isFormValid || isVerifying}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-base transition-all ${
                  isFormValid && !isVerifying
                    ? 'bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#FB923C] text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.01]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-white" />
                    <span>Running Multi-Modal AI Verification...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-orange-200" />
                    <span>Verify Complaint →</span>
                  </>
                )}
              </button>
              {!isFormValid && (
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  * Fill at least 20 characters in description, provide photo evidence, and enable location to verify.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: AI Verification Result & Telemetry (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Progress Card when Verifying */}
            {isVerifying && (
              <div className="bg-[#071A2B] text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-2xl space-y-5 animate-pulse-glow">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-400 animate-spin" />
                    <h3 className="font-display text-lg font-bold text-white">
                      AI is verifying your complaint…
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-orange-400">Processing</span>
                </div>

                <div className="space-y-3.5 text-xs font-medium">
                  <div className={`flex items-center gap-3 ${verificationStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {verificationStep > 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shrink-0"></div>}
                    <span>Reading and parsing complaint context</span>
                  </div>
                  <div className={`flex items-center gap-3 ${verificationStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {verificationStep > 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : verificationStep === 2 ? <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shrink-0"></div> : <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0"></div>}
                    <span>Checking photo evidence integrity & optical features</span>
                  </div>
                  <div className={`flex items-center gap-3 ${verificationStep >= 3 ? 'text-orange-400' : 'text-slate-500'}`}>
                    {verificationStep > 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : verificationStep === 3 ? <div className="w-4 h-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin shrink-0"></div> : <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0"></div>}
                    <span>Comparing image issue with declared category</span>
                  </div>
                  <div className={`flex items-center gap-3 ${verificationStep >= 4 ? 'text-purple-400' : 'text-slate-500'}`}>
                    {verificationStep > 4 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : verificationStep === 4 ? <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin shrink-0"></div> : <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0"></div>}
                    <span>Validating GPS telemetry against GIS urban boundaries</span>
                  </div>
                  <div className={`flex items-center gap-3 ${verificationStep >= 5 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {verificationStep >= 5 ? <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0"></div> : <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0"></div>}
                    <span>Checking spatial duplicate complaints index</span>
                  </div>
                </div>
              </div>
            )}

            {/* AI Verification Results Dashboard */}
            {aiResult && !isVerifying && (
              <div
                id="ai-verification-results-panel"
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden space-y-5"
              >
                {/* Result Header Badge */}
                <div
                  className={`p-6 text-white ${
                    aiResult.status === 'VERIFIED'
                      ? 'bg-gradient-to-r from-[#071A2B] via-[#EA580C] to-[#F97316]'
                      : aiResult.status === 'REJECTED'
                      ? 'bg-gradient-to-r from-[#071A2B] via-red-900 to-red-600'
                      : 'bg-gradient-to-r from-[#071A2B] via-amber-900 to-amber-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-orange-200">
                      AI Audit Scorecard
                    </span>
                    <span className="text-xs font-mono bg-black/30 px-2 py-0.5 rounded">
                      ID: {aiResult.complaint_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mt-2">
                    {aiResult.status === 'VERIFIED' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-300 shrink-0" />
                    )}
                    <h3 className="font-display text-2xl font-black tracking-tight">
                      {aiResult.status === 'VERIFIED'
                        ? 'COMPLAINT VERIFIED'
                        : aiResult.status === 'REJECTED'
                        ? 'VERIFICATION REJECTED'
                        : 'REQUIRES MANUAL REVIEW'}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-200 mt-1 line-clamp-2">{aiResult.summary}</p>
                </div>

                <div className="px-6 space-y-4">
                  {/* KPI Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Severity</span>
                      <span
                        className={`text-xs font-extrabold ${
                          aiResult.severity === 'CRITICAL'
                            ? 'text-red-600'
                            : aiResult.severity === 'HIGH'
                            ? 'text-orange-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {aiResult.severity}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Urgency</span>
                      <span className="text-xs font-extrabold text-[#071A2B]">
                        {aiResult.urgency_score} <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Confidence</span>
                      <span className="text-xs font-extrabold text-emerald-600">
                        {aiResult.confidence_score}%
                      </span>
                    </div>
                  </div>

                  {/* Recommended Department Banner */}
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Recommended Department:</span>
                    <span className="font-bold text-[#EA580C]">{aiResult.recommended_department}</span>
                  </div>

                  {/* CARD 1: IMAGE MATCH CARD */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-[#EA580C]" />
                        <span>Image Verification</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          aiResult.image.validator.match
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {aiResult.image.validator.match ? '✓ MATCHED' : '✕ MISMATCH'}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Detected Issue Type:</span>
                        <span className="font-semibold text-slate-900">
                          {aiResult.image.validator.issue_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 pt-1">
                        {aiResult.image.validator.reason}
                      </p>
                    </div>
                  </div>

                  {/* CARD 2: LOCATION VALIDATION CARD */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FB923C]" />
                        <span>Location Validation</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          aiResult.location_validation.valid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {aiResult.location_validation.valid ? '✓ LOCATION VERIFIED' : '✕ MISMATCH'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Proximity Variance:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {aiResult.location_validation.distance_meters} m
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{aiResult.location_validation.reason}</p>
                  </div>

                  {/* CARD 3: DUPLICATE CHECK CARD */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Duplicate Audit</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          !aiResult.duplicate.possible
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {!aiResult.duplicate.possible ? '✓ NO DUPLICATE' : '⚠ POSSIBLE DUPLICATE'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Cluster Similarity:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {aiResult.duplicate.score}%
                      </span>
                    </div>

                    {aiResult.duplicate.matched_complaint_id && (
                      <p className="text-[11px] text-amber-700 font-medium">
                        Matched with existing report #{aiResult.duplicate.matched_complaint_id}
                      </p>
                    )}
                  </div>

                  {/* Demo Disclaimer */}
                  <div className="p-2.5 rounded-lg bg-slate-100 text-[10px] text-slate-500 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Demo verification — connect your backend API to use real AI results.</span>
                  </div>
                </div>

                {/* Submit to Municipal Queue Action Button */}
                <div className="p-6 pt-2 bg-slate-50 border-t border-slate-200 space-y-2">
                  <button
                    id="btn-submit-final-report"
                    type="button"
                    onClick={handleSubmitReport}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md transition-all"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Check className="w-4 h-4 text-emerald-200" />
                    )}
                    <span>
                      {isSubmitting
                        ? 'Dispatching to Municipal Queue...'
                        : 'Submit Final Verified Report'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Default Placeholder when not verified */}
            {!aiResult && !isVerifying && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EA580C]">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-bold text-[#071A2B]">
                    Multi-Modal AI Engine Ready
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Fill out the incident form, attach evidence and click "Verify Complaint" to preview automated verification telemetry.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Instant Category & Structural Match</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" />
                    <span>GPS Telemetry & City Geofencing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                    <span>Anti-Duplicate Spatial Screening</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
