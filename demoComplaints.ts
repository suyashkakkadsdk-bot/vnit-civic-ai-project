import { CivicComplaint } from '../types/api';

export const INITIAL_COMPLAINTS: CivicComplaint[] = [
  {
    id: 'COMP-00012',
    title: 'Severe Asphalt Pothole near College Entrance Gate',
    description: 'A deep pothole (approx 2.5 ft wide) has developed on Main Boulevard near the university exit. Vehicles are swerving into oncoming traffic to avoid rim damage.',
    category: 'Road Damage',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    imageFileName: 'pothole_main_gate.jpg',
    imageFileSize: '2.4 MB',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 8,
      address: 'Main Boulevard & 4th Avenue',
      landmark: 'Opposite University Science Complex',
      city: 'Metro Municipal Central Zone'
    },
    severity: 'HIGH',
    urgency_score: 84,
    status: 'In Progress',
    department: 'Roads Department',
    created_at: '2026-08-16T14:32:00Z',
    updated_at: '2026-08-17T08:15:00Z',
    citizen_name: 'Alex Mercer',
    citizen_contact: 'alex.m@example.org',
    ai_verification: {
      status: 'VERIFIED',
      complaint_id: 'COMP-00012',
      category: 'Road Damage',
      severity: 'HIGH',
      urgency_score: 84,
      summary: 'Verified deep crater pothole on high-traffic secondary arterial road with vehicle swerving risk.',
      recommended_department: 'Roads Department',
      confidence_score: 96,
      created_at: '2026-08-16T14:33:12Z',
      image: {
        provided: true,
        validator: {
          relevant: true,
          match: true,
          issue_type: 'Pothole / Road Surface Fracture',
          confidence: 96,
          reason: 'Uploaded photo exhibits high-contrast edge breakage and asphalt subsurface degradation matching the reported dimensions.'
        }
      },
      duplicate: {
        possible: false,
        score: 18,
        matched_complaint_id: undefined
      },
      location_validation: {
        valid: true,
        distance_meters: 14,
        reason: 'GPS telemetry matches urban arterial road corridor metadata.'
      }
    },
    timeline: [
      {
        id: 't1',
        title: 'Complaint Logged by Citizen',
        description: 'Photo and GPS coordinates submitted via Citizen Portal.',
        timestamp: '2026-08-16T14:32:00Z',
        type: 'creation',
        actor: 'Citizen Alex M.'
      },
      {
        id: 't2',
        title: 'Multi-Modal AI Verification Completed',
        description: 'Image matches road damage (96%), location verified within 14m, duplicate risk 18%.',
        timestamp: '2026-08-16T14:33:12Z',
        type: 'verification',
        actor: 'Nagar Mitra AI Engine v3.4'
      },
      {
        id: 't3',
        title: 'Assigned to Municipal Roads Depot',
        description: 'Auto-routed based on category classification and severity score (84/100).',
        timestamp: '2026-08-16T15:00:00Z',
        type: 'assignment',
        actor: 'Auto Dispatcher'
      },
      {
        id: 't4',
        title: 'Status Updated to In Progress',
        description: 'Road repair crew #4 dispatched with asphalt hot-mix unit.',
        timestamp: '2026-08-17T08:15:00Z',
        type: 'status_change',
        actor: 'Supervisor D. Vance (Roads Dept)'
      }
    ],
    internal_notes: [
      {
        id: 'n1',
        author: 'D. Vance',
        role: 'Senior Road Inspector',
        content: 'Crew scheduled for patch work during off-peak morning window. Traffic cone perimeter placed.',
        timestamp: '2026-08-17T08:15:00Z'
      }
    ]
  },
  {
    id: 'COMP-00008',
    title: 'High Pressure Water Pipe Leak Flooding Sidewalk',
    description: 'Fresh clean water gushing from an underground municipal junction line onto Pine Street. Water is pooling 4 inches deep and eroding sidewalk foundation.',
    category: 'Water Leakage',
    imageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    imageFileName: 'water_pipe_burst.jpg',
    imageFileSize: '3.1 MB',
    location: {
      latitude: 37.7833,
      longitude: -122.4167,
      accuracy: 6,
      address: 'Pine Street & 12th Way',
      landmark: 'Near Central Community Hospital',
      city: 'Metro Municipal Central Zone'
    },
    severity: 'CRITICAL',
    urgency_score: 94,
    status: 'AI Verified',
    department: 'Water Works & Sewerage',
    created_at: '2026-08-17T02:10:00Z',
    updated_at: '2026-08-17T02:11:45Z',
    citizen_name: 'Elena Rostova',
    citizen_contact: 'elena.r@example.com',
    ai_verification: {
      status: 'VERIFIED',
      complaint_id: 'COMP-00008',
      category: 'Water Leakage',
      severity: 'CRITICAL',
      urgency_score: 94,
      summary: 'Critical pressurized water main rupture causing rapid localized pooling and structural soil erosion.',
      recommended_department: 'Water Works & Sewerage',
      confidence_score: 98,
      created_at: '2026-08-17T02:11:45Z',
      image: {
        provided: true,
        validator: {
          relevant: true,
          match: true,
          issue_type: 'High-Volume Pressurized Water Leak',
          confidence: 98,
          reason: 'Clear visual presence of surface water surge, pooling and asphalt undermining.'
        }
      },
      duplicate: {
        possible: false,
        score: 12,
        matched_complaint_id: undefined
      },
      location_validation: {
        valid: true,
        distance_meters: 6,
        reason: 'GPS telemetry aligns with municipal water main transmission line grid.'
      }
    },
    timeline: [
      {
        id: 't1',
        title: 'Report Submitted',
        description: 'Urgent emergency water leakage reported with image evidence.',
        timestamp: '2026-08-17T02:10:00Z',
        type: 'creation',
        actor: 'Citizen Elena R.'
      },
      {
        id: 't2',
        title: 'AI Priority Escalation',
        description: 'Severity classified as CRITICAL (Urgency: 94). Flagged for immediate valve isolation.',
        timestamp: '2026-08-17T02:11:45Z',
        type: 'verification',
        actor: 'Nagar Mitra AI Engine v3.4'
      }
    ],
    internal_notes: [
      {
        id: 'n1',
        author: 'Dispatch Center',
        role: 'Automated Bot',
        content: 'Emergency alert sent to on-call water utilities technician #7.',
        timestamp: '2026-08-17T02:12:00Z'
      }
    ]
  },
  {
    id: 'COMP-00005',
    title: 'Overflowing Commercial Dumpster & Illegal Debris Dumping',
    description: 'Commercial waste bin overflowing into public pedestrian alleyway. Plastic bags torn apart and food waste scattered across 20 meters.',
    category: 'Waste Management',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    imageFileName: 'waste_dump_alley.jpg',
    imageFileSize: '1.8 MB',
    location: {
      latitude: 37.7689,
      longitude: -122.4289,
      accuracy: 10,
      address: 'Market Street Commercial Zone',
      landmark: 'Behind Plaza Food Court Alley',
      city: 'Metro Municipal Central Zone'
    },
    severity: 'MEDIUM',
    urgency_score: 62,
    status: 'Under Review',
    department: 'Sanitation & Waste',
    created_at: '2026-08-16T19:40:00Z',
    updated_at: '2026-08-17T06:00:00Z',
    citizen_name: 'Marcus Chen',
    citizen_contact: 'marcus.c@example.org',
    ai_verification: {
      status: 'VERIFIED',
      complaint_id: 'COMP-00005',
      category: 'Waste Management',
      severity: 'MEDIUM',
      urgency_score: 62,
      summary: 'Excessive municipal waste overflow in commercial pedestrian alley with hygiene concern.',
      recommended_department: 'Sanitation & Waste',
      confidence_score: 93,
      created_at: '2026-08-16T19:41:20Z',
      image: {
        provided: true,
        validator: {
          relevant: true,
          match: true,
          issue_type: 'Municipal Solid Waste Spill',
          confidence: 93,
          reason: 'Identified overflowing waste bins, scattered packaging debris and bio-spill hazard.'
        }
      },
      duplicate: {
        possible: true,
        score: 73,
        matched_complaint_id: 'COMP-00002',
        matched_summary: 'Earlier report regarding overflowing bins on Market St alleyway.'
      },
      location_validation: {
        valid: true,
        distance_meters: 22,
        reason: 'GPS coordinates within municipal sanitation route Sector 4.'
      }
    },
    timeline: [
      {
        id: 't1',
        title: 'Report Logged',
        description: 'Citizen report with photo uploaded.',
        timestamp: '2026-08-16T19:40:00Z',
        type: 'creation',
        actor: 'Citizen Marcus C.'
      },
      {
        id: 't2',
        title: 'AI Verification & Duplicate Flag',
        description: 'Possible duplicate detected with COMP-00002 (73% similarity).',
        timestamp: '2026-08-16T19:41:20Z',
        type: 'verification',
        actor: 'Nagar Mitra AI Engine v3.4'
      }
    ],
    internal_notes: []
  },
  {
    id: 'COMP-00004',
    title: 'Cluster of 4 Broken LED Streetlights on Residential Walkway',
    description: 'Four consecutive streetlights are broken on Oakwood Walkway. Complete blackout creates safety vulnerability for evening joggers and residents.',
    category: 'Streetlight',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    imageFileName: 'dark_streetlight_corridor.jpg',
    imageFileSize: '1.9 MB',
    location: {
      latitude: 37.7558,
      longitude: -122.4449,
      accuracy: 12,
      address: 'Oakwood Road & Pine Lane',
      landmark: 'Near Community Park North Gate',
      city: 'Metro Municipal Central Zone'
    },
    severity: 'HIGH',
    urgency_score: 78,
    status: 'In Progress',
    department: 'Electrical & Lighting',
    created_at: '2026-08-15T22:15:00Z',
    updated_at: '2026-08-16T11:20:00Z',
    citizen_name: 'Priya Patel',
    citizen_contact: 'priya.p@example.net',
    ai_verification: {
      status: 'VERIFIED',
      complaint_id: 'COMP-00004',
      category: 'Streetlight',
      severity: 'HIGH',
      urgency_score: 78,
      summary: 'Multiple consecutive luminaire outages in high-density pedestrian zone with nocturnal safety implications.',
      recommended_department: 'Electrical & Lighting',
      confidence_score: 91,
      created_at: '2026-08-15T22:16:30Z',
      image: {
        provided: true,
        validator: {
          relevant: true,
          match: true,
          issue_type: 'Non-functional Street Lamp Fixtures',
          confidence: 91,
          reason: 'Low lux night photo confirms non-illuminated pole heads along continuous corridor.'
        }
      },
      duplicate: {
        possible: false,
        score: 25,
        matched_complaint_id: undefined
      },
      location_validation: {
        valid: true,
        distance_meters: 35,
        reason: 'Matches GIS street lighting circuit ID #EL-409.'
      }
    },
    timeline: [
      {
        id: 't1',
        title: 'Report Logged',
        description: 'Night photo submitted by citizen.',
        timestamp: '2026-08-15T22:15:00Z',
        type: 'creation',
        actor: 'Citizen Priya P.'
      },
      {
        id: 't2',
        title: 'Assigned to Electric Lineworkers',
        description: 'Work order #WO-882 created for bulb replacement & circuit test.',
        timestamp: '2026-08-16T08:00:00Z',
        type: 'assignment',
        actor: 'Municipal Dispatch'
      }
    ],
    internal_notes: [
      {
        id: 'n1',
        author: 'K. Larson',
        role: 'Electrical Supervisor',
        content: 'Faulty relay identified at distribution box B-12. Replacement unit being installed.',
        timestamp: '2026-08-16T11:20:00Z'
      }
    ]
  },
  {
    id: 'COMP-00003',
    title: 'Malfunctioning 4-Way Traffic Signal Flashing Yellow',
    description: 'Traffic signal at intersection of Grand Ave and 2nd St is stuck in caution blinker mode. Vehicles from all directions are entering simultaneously.',
    category: 'Traffic & Safety',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    imageFileName: 'traffic_light_glitch.jpg',
    imageFileSize: '2.7 MB',
    location: {
      latitude: 37.7925,
      longitude: -122.4055,
      accuracy: 5,
      address: 'Grand Avenue near Metro Station',
      landmark: 'Intersection of Grand Ave & 2nd St',
      city: 'Metro Municipal Central Zone'
    },
    severity: 'CRITICAL',
    urgency_score: 96,
    status: 'Resolved',
    department: 'Traffic Management',
    created_at: '2026-08-15T09:00:00Z',
    updated_at: '2026-08-15T11:45:00Z',
    citizen_name: 'David Becker',
    citizen_contact: 'david.b@example.org',
    ai_verification: {
      status: 'VERIFIED',
      complaint_id: 'COMP-00003',
      category: 'Traffic & Safety',
      severity: 'CRITICAL',
      urgency_score: 96,
      summary: 'Critical intersection traffic light controller failure creating active vehicle collision hazard.',
      recommended_department: 'Traffic Management',
      confidence_score: 99,
      created_at: '2026-08-15T09:01:10Z',
      image: {
        provided: true,
        validator: {
          relevant: true,
          match: true,
          issue_type: 'Traffic Signal Controller Failure',
          confidence: 99,
          reason: 'Optical and telemetry verification confirms desynchronized intersection signal.'
        }
      },
      duplicate: {
        possible: false,
        score: 9,
        matched_complaint_id: undefined
      },
      location_validation: {
        valid: true,
        distance_meters: 4,
        reason: 'GPS telemetry exact match with intersection signal controller pole.'
      }
    },
    timeline: [
      {
        id: 't1',
        title: 'Citizen Report Logged',
        description: 'Urgent traffic hazard flagged.',
        timestamp: '2026-08-15T09:00:00Z',
        type: 'creation',
        actor: 'Citizen David B.'
      },
      {
        id: 't2',
        title: 'Emergency AI Escalation',
        description: 'Severity: CRITICAL, routed to Traffic Emergency Rapid Response.',
        timestamp: '2026-08-15T09:01:10Z',
        type: 'verification',
        actor: 'Nagar Mitra AI Engine v3.4'
      },
      {
        id: 't3',
        title: 'Traffic Police Traffic Control Dispatched',
        description: 'Manual traffic control deployed within 12 minutes.',
        timestamp: '2026-08-15T09:14:00Z',
        type: 'assignment',
        actor: 'Transit Command'
      },
      {
        id: 't4',
        title: 'Issue Resolved & Signal Reset',
        description: 'Signal controller firmware rebooted and optical sensor replaced.',
        timestamp: '2026-08-15T11:45:00Z',
        type: 'resolution',
        actor: 'Field Tech S. Jenkins'
      }
    ],
    internal_notes: [
      {
        id: 'n1',
        author: 'S. Jenkins',
        role: 'Traffic Signal Engineer',
        content: 'Solid-state logic card swapped. Full cycle tested and back online in synchronized mode.',
        timestamp: '2026-08-15T11:45:00Z'
      }
    ]
  },
  {
    id: 'COMP-00001',
    title: 'Cracked Sidewalk Slabs and Exposed Tree Roots',
    description: 'Concrete sidewalk blocks displaced by 4 inches on Riverfront Promenade. Multiple tripping incidents reported by local morning walkers.',
    category: 'Public Infrastructure',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    imageFileName: 'sidewalk_cracks.jpg',
    imageFileSize: '2.1 MB',
    location: {
      latitude: 37.7602,
      longitude: -122.4350,
      accuracy: 9,
      address: 'Riverfront Promenade West',
      landmark: 'Beside Tech Innovation Park',
      city: 'Metro Municipal Central Zone'
    },
    severity: 'LOW',
    urgency_score: 38,
    status: 'AI Verified',
    department: 'Public Works Department',
    created_at: '2026-08-14T16:00:00Z',
    updated_at: '2026-08-14T16:02:00Z',
    citizen_name: 'Sara Miller',
    citizen_contact: 'sara.m@example.com',
    ai_verification: {
      status: 'VERIFIED',
      complaint_id: 'COMP-00001',
      category: 'Public Infrastructure',
      severity: 'LOW',
      urgency_score: 38,
      summary: 'Displaced concrete walkway pavers caused by biological root heave, non-critical tripping risk.',
      recommended_department: 'Public Works Department',
      confidence_score: 90,
      created_at: '2026-08-14T16:02:00Z',
      image: {
        provided: true,
        validator: {
          relevant: true,
          match: true,
          issue_type: 'Sidewalk Heave / Pavement Fracture',
          confidence: 90,
          reason: 'Identified cracked paving slabs with moderate displacement.'
        }
      },
      duplicate: {
        possible: false,
        score: 14,
        matched_complaint_id: undefined
      },
      location_validation: {
        valid: true,
        distance_meters: 18,
        reason: 'GPS aligns with public pedestrian park path.'
      }
    },
    timeline: [
      {
        id: 't1',
        title: 'Report Logged',
        description: 'Photo of broken sidewalk uploaded.',
        timestamp: '2026-08-14T16:00:00Z',
        type: 'creation',
        actor: 'Citizen Sara M.'
      }
    ],
    internal_notes: []
  }
];

export const INITIAL_DASHBOARD_STATS = {
  total_complaints: 1284,
  pending: 248,
  ai_verified: 934,
  critical: 37,
  resolved: 702,
  average_resolution_hours: 4.8,
  ai_accuracy_rate: 97.4
};
