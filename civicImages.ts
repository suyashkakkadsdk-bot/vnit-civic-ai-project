export interface CivicIssueImageCategory {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  iconName: string;
  severityDefault: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  department: string;
  examplePrompt: string;
}

export const CIVIC_ISSUE_IMAGES: Record<string, CivicIssueImageCategory> = {
  road_damage: {
    title: 'ROAD DAMAGE',
    category: 'Road Damage',
    description: 'Potholes, asphalt cracks, collapsed pavements, and road surface hazards.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    iconName: 'AlertTriangle',
    severityDefault: 'HIGH',
    department: 'Roads Department',
    examplePrompt: 'A deep pothole (approx 2.5 ft wide) has developed on Main Boulevard near the university exit. Vehicles are swerving into oncoming traffic to avoid rim damage.'
  },
  waste_management: {
    title: 'WASTE MANAGEMENT',
    category: 'Waste Management',
    description: 'Illegal dumping, overflowing public dumpsters, and uncollected commercial waste.',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    iconName: 'Trash2',
    severityDefault: 'MEDIUM',
    department: 'Sanitation & Waste',
    examplePrompt: 'Commercial garbage bin overflowing onto the pedestrian footpath behind Central Market. Strong odor and stray animals gathering for 3 consecutive days.'
  },
  water_drainage: {
    title: 'WATER & DRAINAGE',
    category: 'Water Leakage',
    description: 'High-pressure water main burst, leaking valves, and urban water wastage.',
    imageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    iconName: 'Droplets',
    severityDefault: 'HIGH',
    department: 'Water Works & Sewerage',
    examplePrompt: 'Fresh water pipeline ruptured underground on Oakwood Road. Clean water has been flooding the roadway for over 5 hours with significant pressure loss in nearby buildings.'
  },
  streetlights: {
    title: 'STREETLIGHTS',
    category: 'Streetlight',
    description: 'Broken pole lights, exposed wiring, flickering LED fixtures, and unlit dark corridors.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    iconName: 'Lightbulb',
    severityDefault: 'MEDIUM',
    department: 'Electrical & Lighting',
    examplePrompt: 'Four continuous streetlights are completely non-functional between 5th and 9th Avenue, creating a dangerous pitch-black stretch for night commuters.'
  },
  traffic_safety: {
    title: 'TRAFFIC & SAFETY',
    category: 'Traffic & Safety',
    description: 'Damaged guardrails, malfunctioning traffic signals, obscured stop signs, and missing road barriers.',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    iconName: 'ShieldAlert',
    severityDefault: 'CRITICAL',
    department: 'Traffic Management',
    examplePrompt: 'Traffic signal at busy 4-way intersection (Grand Ave & 2nd St) is stuck flashing yellow on all four sides. Near-collisions occurring during rush hour.'
  },
  public_infrastructure: {
    title: 'PUBLIC INFRASTRUCTURE',
    category: 'Public Infrastructure',
    description: 'Broken public benches, collapsed storm drains, cracked sidewalk slabs, and damaged municipal transit shelters.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    iconName: 'Building2',
    severityDefault: 'LOW',
    department: 'Public Works Department',
    examplePrompt: 'Sidewalk concrete slabs broken and lifted by tree roots on Westside Promenade, causing tripping hazard for elderly pedestrians and wheelchair users.'
  },
};

export const HERO_BACKGROUND_IMAGE =
  'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1920&q=80';

export const CITIZEN_PORTAL_HERO =
  'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1000&q=80';

export const GOV_PORTAL_HERO =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80';
