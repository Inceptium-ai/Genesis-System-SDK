/**
 * Genesis SDK - Authenticated User Patterns
 * 
 * Generic user shapes for authentication flows.
 * Works with Keycloak, Auth0, Cognito, or custom auth.
 * Copy to your project's src/types/ directory and adapt as needed.
 */

// =============================================================================
// BASE USER INTERFACE
// =============================================================================

/**
 * Core user identity from authentication provider
 * This is the minimal set of fields common to most OIDC providers
 */
export interface AuthUser {
  /** Unique user identifier (sub claim in JWT) */
  id: string;
  
  /** User's email address */
  email: string;
  
  /** Display name */
  name: string;
  
  /** User's roles/permissions */
  roles: string[];
  
  /** Current access token (for API calls) */
  token: string;
}

/**
 * Extended user profile with optional fields
 */
export interface UserProfile extends AuthUser {
  /** Username (may differ from email) */
  username?: string;
  
  /** First name */
  firstName?: string;
  
  /** Last name */
  lastName?: string;
  
  /** Profile picture URL */
  avatarUrl?: string;
  
  /** Email verification status */
  emailVerified?: boolean;
  
  /** Account creation date */
  createdAt?: string;
  
  /** Last login date */
  lastLoginAt?: string;
  
  /** User preferences/settings */
  preferences?: Record<string, unknown>;
}

// =============================================================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// =============================================================================

/**
 * Common role names
 * Extend this for your application's specific roles
 */
export const Roles = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  GUEST: 'guest',
} as const;

export type Role = typeof Roles[keyof typeof Roles];

/**
 * Check if user has a specific role
 */
export function hasRole(user: AuthUser | null, role: string): boolean {
  return user?.roles.includes(role) ?? false;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: AuthUser | null, roles: string[]): boolean {
  return roles.some(role => hasRole(user, role));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(user: AuthUser | null, roles: string[]): boolean {
  return roles.every(role => hasRole(user, role));
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, Roles.ADMIN);
}

// =============================================================================
// JWT TOKEN CLAIMS
// =============================================================================

/**
 * Standard JWT claims from OIDC token
 * These are the claims typically available in Keycloak/Auth0 tokens
 */
export interface TokenClaims {
  /** Subject (user ID) */
  sub: string;
  
  /** Email address */
  email?: string;
  
  /** Email verified flag */
  email_verified?: boolean;
  
  /** Full name */
  name?: string;
  
  /** Given (first) name */
  given_name?: string;
  
  /** Family (last) name */
  family_name?: string;
  
  /** Preferred username */
  preferred_username?: string;
  
  /** Issued at (Unix timestamp) */
  iat?: number;
  
  /** Expiration (Unix timestamp) */
  exp?: number;
  
  /** Issuer */
  iss?: string;
  
  /** Audience */
  aud?: string | string[];
  
  /** Keycloak-specific: Realm roles */
  realm_access?: {
    roles: string[];
  };
  
  /** Keycloak-specific: Client roles */
  resource_access?: Record<string, { roles: string[] }>;
}

/**
 * Extract AuthUser from JWT token claims
 * Works with Keycloak token structure
 */
export function userFromTokenClaims(
  claims: TokenClaims,
  token: string
): AuthUser {
  return {
    id: claims.sub,
    email: claims.email || '',
    name: claims.name || claims.preferred_username || '',
    roles: claims.realm_access?.roles || [],
    token,
  };
}

/**
 * Check if token is expired
 */
export function isTokenExpired(claims: TokenClaims): boolean {
  if (!claims.exp) return true;
  // Add 30 second buffer
  return claims.exp * 1000 < Date.now() + 30000;
}

// =============================================================================
// AUTHENTICATION STATE
// =============================================================================

/**
 * Authentication state for React context/stores
 */
export interface AuthState {
  /** Whether authentication is being checked */
  loading: boolean;
  
  /** Whether user is authenticated */
  authenticated: boolean;
  
  /** Current user (null if not authenticated) */
  user: AuthUser | null;
  
  /** Authentication error (if any) */
  error: string | null;
}

/**
 * Initial auth state
 */
export const initialAuthState: AuthState = {
  loading: true,
  authenticated: false,
  user: null,
  error: null,
};

/**
 * Auth action types for reducers
 */
export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; user: AuthUser }
  | { type: 'AUTH_ERROR'; error: string }
  | { type: 'AUTH_LOGOUT' };

/**
 * Auth state reducer
 */
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return { loading: false, authenticated: true, user: action.user, error: null };
    case 'AUTH_ERROR':
      return { loading: false, authenticated: false, user: null, error: action.error };
    case 'AUTH_LOGOUT':
      return { loading: false, authenticated: false, user: null, error: null };
    default:
      return state;
  }
}

// =============================================================================
// ZUSTAND STORE PATTERN
// =============================================================================

/*
// Example Zustand auth store (src/lib/auth-store.ts):

import { create } from 'zustand';
import { AuthUser, AuthState, initialAuthState } from '@/types/auth-user';

interface AuthStore extends AuthState {
  setUser: (user: AuthUser) => void;
  setError: (error: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialAuthState,
  
  setUser: (user) => set({ 
    loading: false, 
    authenticated: true, 
    user, 
    error: null 
  }),
  
  setError: (error) => set({ 
    loading: false, 
    authenticated: false, 
    user: null, 
    error 
  }),
  
  logout: () => set({ 
    loading: false, 
    authenticated: false, 
    user: null, 
    error: null 
  }),
  
  setLoading: (loading) => set({ loading }),
}));
*/

// =============================================================================
// REACT CONTEXT PATTERN
// =============================================================================

/*
// Example React context (src/contexts/auth-context.tsx):

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { AuthState, AuthAction, authReducer, initialAuthState, AuthUser } from '@/types/auth-user';

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  
  const login = async () => {
    dispatch({ type: 'AUTH_START' });
    // ... keycloak login logic
  };
  
  const logout = async () => {
    dispatch({ type: 'AUTH_LOGOUT' });
    // ... keycloak logout logic
  };
  
  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
*/

// =============================================================================
// PERMISSION GUARDS
// =============================================================================

/**
 * Permission check result
 */
export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

/**
 * Create a permission guard function
 * 
 * @example
 * const canEdit = createPermissionGuard(['admin', 'editor']);
 * if (!canEdit(user).allowed) redirect('/unauthorized');
 */
export function createPermissionGuard(
  allowedRoles: string[]
): (user: AuthUser | null) => PermissionCheck {
  return (user) => {
    if (!user) {
      return { allowed: false, reason: 'Not authenticated' };
    }
    if (!hasAnyRole(user, allowedRoles)) {
      return { allowed: false, reason: `Requires one of: ${allowedRoles.join(', ')}` };
    }
    return { allowed: true };
  };
}
