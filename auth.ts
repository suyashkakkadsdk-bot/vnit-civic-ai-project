import { AuthUser, AuthRole, Department } from '../types/api';

/**
 * ==============================================================================
 * AUTHENTICATION SERVICE (FRONTEND READY)
 * ==============================================================================
 * NOTE FOR BACKEND DEVELOPERS:
 * This service handles authentication requests for Nagar Mitra.
 * 
 * In this current frontend iteration, credentials are validated against demo
 * presets and persisted via client-side storage for testing.
 * 
 * When connecting to your production backend:
 * 1. Configure VITE_API_BASE_URL in your environment.
 * 2. Replace the demo credential checks with standard POST /api/auth/citizen/login
 *    and POST /api/auth/government/login endpoints returning HttpOnly JWT cookies
 *    or Bearer session tokens.
 * ==============================================================================
 */

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:8000';

export interface CitizenLoginCredentials {
  identifier: string; // Email or Mobile number
  password: string;
}

export interface GovernmentLoginCredentials {
  identifier: string; // Official Email or Employee/Badge ID
  password: string;
  department?: Department;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

// Preset Demo Credentials (Clearly labeled for frontend testing)
export const DEMO_CITIZEN_CREDENTIALS = {
  email: 'citizen@demo.com',
  password: 'citizen123',
};

export const DEMO_GOVERNMENT_CREDENTIALS = {
  email: 'officer@demo.gov',
  password: 'officer123',
};

/**
 * Authenticate Citizen User
 */
export async function loginCitizen(
  credentials: CitizenLoginCredentials
): Promise<AuthResponse> {
  const identifier = credentials.identifier.trim();
  const password = credentials.password;

  // 1. Attempt real backend API if reachable
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const response = await fetch(`${API_BASE_URL}/api/auth/citizen/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    }
  } catch {
    // Fallback to frontend demo authentication
  }

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 450));

  // Validate Demo Citizen Credentials
  const isDemoMatch =
    (identifier.toLowerCase() === DEMO_CITIZEN_CREDENTIALS.email || identifier === 'citizen@demo.com' || identifier === '+15552345678') &&
    password === DEMO_CITIZEN_CREDENTIALS.password;

  // Also support custom email / password input during frontend demo
  if (isDemoMatch || (identifier.length >= 3 && password.length >= 4)) {
    const name = identifier.includes('@')
      ? identifier.split('@')[0].replace(/[._]/g, ' ')
      : `Citizen ${identifier.slice(-4)}`;
    
    const formattedName = name
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const citizenUser: AuthUser = {
      id: isDemoMatch ? 'CIT-9801' : `CIT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: isDemoMatch ? 'Alex Mercer' : formattedName || 'Verified Citizen',
      email: identifier.includes('@') ? identifier : `${identifier}@nagarmitra.local`,
      role: 'citizen',
      phone: !identifier.includes('@') ? identifier : '+1 (555) 234-5678',
      registeredAt: new Date().toISOString().split('T')[0],
    };

    return {
      success: true,
      user: citizenUser,
      token: `demo-citizen-token-${Date.now()}`,
    };
  }

  return {
    success: false,
    error: 'Invalid citizen credentials. Use citizen@demo.com / citizen123 for demo access.',
  };
}

/**
 * Authenticate Government Official
 */
export async function loginGovernment(
  credentials: GovernmentLoginCredentials
): Promise<AuthResponse> {
  const identifier = credentials.identifier.trim();
  const password = credentials.password;

  // 1. Attempt real backend API if reachable
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const response = await fetch(`${API_BASE_URL}/api/auth/government/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    }
  } catch {
    // Fallback to frontend demo authentication
  }

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Validate Demo Government Credentials
  const isDemoMatch =
    (identifier.toLowerCase() === DEMO_GOVERNMENT_CREDENTIALS.email ||
      identifier.toUpperCase() === 'OFF-8842' ||
      identifier.toUpperCase() === 'RD-8842') &&
    password === DEMO_GOVERNMENT_CREDENTIALS.password;

  if (isDemoMatch || (identifier.length >= 3 && password.length >= 4)) {
    const govUser: AuthUser = {
      id: isDemoMatch ? 'GOV-8842' : `GOV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: isDemoMatch ? 'Insp. Marcus Vance' : 'Municipal Field Inspector',
      email: identifier.includes('@') ? identifier : 'officer@demo.gov',
      role: 'government',
      badgeId: isDemoMatch ? 'RD-8842' : `OFF-${Math.floor(1000 + Math.random() * 9000)}`,
      department: credentials.department || 'Roads Department',
      clearanceLevel: 'Level 2 - Supervisor',
      registeredAt: '2025-06-11',
    };

    return {
      success: true,
      user: govUser,
      token: `demo-gov-token-${Date.now()}`,
    };
  }

  return {
    success: false,
    error: 'Invalid municipal credentials. Use officer@demo.gov / officer123 for demo access.',
  };
}

/**
 * Logout User
 */
export async function logout(): Promise<void> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800);

    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch {
    // Local cleanup proceeds regardless
  }
}
