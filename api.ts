export type ComplaintCategory =
  | 'Road Damage'
  | 'Waste Management'
  | 'Water Leakage'
  | 'Streetlight'
  | 'Drainage'
  | 'Traffic & Safety'
  | 'Public Infrastructure'
  | 'Other';

export type ComplaintSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplaintStatus =
  | 'Submitted'
  | 'AI Verified'
  | 'Under Review'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type Department =
  | 'Roads Department'
  | 'Sanitation & Waste'
  | 'Water Works & Sewerage'
  | 'Electrical & Lighting'
  | 'Traffic Management'
  | 'Public Works Department'
  | 'Urban Planning'
  | 'Emergency Response';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  address?: string;
  landmark?: string;
  city?: string;
  ward?: string;
  postalCode?: string;
  geohash?: string;
  capturedAt?: string;
  sensorType?: string;
}

export type AuthRole = 'citizen' | 'government';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  badgeId?: string;
  department?: Department;
  clearanceLevel?: 'Level 1 - Field Crew' | 'Level 2 - Supervisor' | 'Level 3 - Operations Chief';
  phone?: string;
  avatarUrl?: string;
  registeredAt?: string;
}

export interface ImageValidationDetails {
  provided: boolean;
  validator: {
    relevant: boolean;
    match: boolean;
    issue_type: string;
    confidence: number; // 0 - 100 percentage
    reason: string;
  };
}

export interface DuplicateValidationDetails {
  possible: boolean;
  score: number; // 0 - 100 percentage
  matched_complaint_id?: string;
  matched_summary?: string;
}

export interface LocationValidationDetails {
  valid: boolean;
  distance_meters: number;
  reason: string;
}

export interface AIVerificationResponse {
  status: 'VERIFIED' | 'REJECTED' | 'NEEDS_REVIEW';
  complaint_id: string;
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  urgency_score: number; // 0 - 100
  summary: string;
  recommended_department: Department;
  image: ImageValidationDetails;
  duplicate: DuplicateValidationDetails;
  location_validation: LocationValidationDetails;
  confidence_score: number;
  created_at: string;
}

export interface InternalNote {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'creation' | 'verification' | 'assignment' | 'status_change' | 'note' | 'resolution';
  actor: string;
}

export interface CivicComplaint {
  id: string;
  title?: string;
  description: string;
  category: ComplaintCategory;
  imageUrl: string;
  imageFileName?: string;
  imageFileSize?: string;
  location: LocationData;
  severity: ComplaintSeverity;
  urgency_score: number;
  status: ComplaintStatus;
  department: Department;
  ai_verification: AIVerificationResponse;
  created_at: string;
  updated_at: string;
  citizen_name?: string;
  citizen_contact?: string;
  timeline: TimelineEvent[];
  internal_notes: InternalNote[];
}

export interface DashboardStats {
  total_complaints: number;
  pending: number;
  ai_verified: number;
  critical: number;
  resolved: number;
  average_resolution_hours: number;
  ai_accuracy_rate: number;
}

export interface ComplaintSubmissionPayload {
  description: string;
  category: ComplaintCategory;
  imageFile?: File | null;
  imageBase64?: string;
  location: LocationData;
  citizen_name?: string;
  citizen_contact?: string;
}
