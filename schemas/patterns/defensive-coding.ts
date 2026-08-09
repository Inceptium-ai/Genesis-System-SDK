/**
 * Genesis SDK - Defensive Coding Patterns
 * 
 * Patterns for null-safe, edge-case resistant code.
 * These patterns prevent common runtime errors from:
 * - Accessing properties on null/undefined
 * - Treating empty objects as truthy
 * - Incomplete API responses
 * - Missing session/auth data
 * 
 * Copy to your project's src/lib/ or src/utils/ directory.
 */

// =============================================================================
// OPTIONAL CHAINING & NULLISH COALESCING PATTERNS
// =============================================================================

/**
 * ❌ ANTI-PATTERN: Using || for defaults
 * Problem: Empty string, 0, false become the default value
 */
// const name = user.name || 'Anonymous';  // '' becomes 'Anonymous'
// const count = data.count || 10;         // 0 becomes 10

/**
 * ✅ PATTERN: Using ?? (nullish coalescing) for defaults
 * Only null/undefined trigger the default
 */
// const name = user.name ?? 'Anonymous';  // '' stays ''
// const count = data.count ?? 10;         // 0 stays 0

/**
 * ✅ PATTERN: Optional chaining for nested access
 */
// const city = user?.address?.city ?? 'Unknown';
// const firstItem = items?.[0]?.name;
// const result = callback?.();

// =============================================================================
// SAFE PROPERTY ACCESS
// =============================================================================

/**
 * Safely access nested properties with a path string
 * 
 * @example
 * const city = safeGet(user, 'address.city', 'Unknown');
 * const price = safeGet(product, 'variants.0.price', 0);
 */
/** Keys that would walk or mutate the prototype chain — never traverse them. */
const UNSAFE_PATH_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function safeGet<T>(
  obj: unknown,
  path: string,
  defaultValue: T
): T {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    // Guard against prototype-chain traversal: reject dangerous keys and only
    // read own properties, so attacker-controlled paths like
    // '__proto__.polluted' or 'constructor.prototype' resolve to the default.
    if (
      UNSAFE_PATH_KEYS.has(key) ||
      !Object.prototype.hasOwnProperty.call(result, key)
    ) {
      return defaultValue;
    }
    // nosemgrep: javascript.lang.security.audit.prototype-pollution.prototype-pollution-loop.prototype-pollution-loop -- read-only own-property traversal; __proto__/constructor/prototype rejected above
    result = (result as Record<string, unknown>)[key];
  }

  return (result ?? defaultValue) as T;
}

/**
 * Type-safe property access with explicit null check
 * 
 * @example
 * const user = getOrNull(session, 'user');
 * if (user) {
 *   console.log(user.email);  // TypeScript knows user exists
 * }
 */
export function getOrNull<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K
): T[K] | null {
  if (obj === null || obj === undefined) {
    return null;
  }
  return obj[key] ?? null;
}

// =============================================================================
// EMPTINESS CHECKS
// =============================================================================

/**
 * Check if a value is "empty" (null, undefined, empty string, empty array, empty object)
 * 
 * @example
 * if (isEmpty(apiResponse.data)) {
 *   return defaultData;
 * }
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * Check if a value has content (opposite of isEmpty)
 */
export function hasContent(value: unknown): boolean {
  return !isEmpty(value);
}

/**
 * Return value only if it has content, otherwise return default
 * 
 * @example
 * // Handles {} as empty, unlike || operator
 * const content = valueOrDefault(apiData.content, defaultContent);
 */
export function valueOrDefault<T>(value: T | null | undefined, defaultValue: T): T {
  if (isEmpty(value)) {
    return defaultValue;
  }
  return value as T;
}

// =============================================================================
// DEEP MERGE WITH DEFAULTS
// =============================================================================

/**
 * Deep merge data with defaults, handling empty objects correctly
 * 
 * @example
 * const defaults = { contact: { name: '', email: '' }, skills: [] };
 * const merged = deepMergeWithDefaults(apiData, defaults);
 * // If apiData.contact is {}, it gets replaced with defaults
 */
export function deepMergeWithDefaults<T extends Record<string, unknown>>(
  data: Partial<T> | null | undefined,
  defaults: T
): T {
  if (!data) {
    return { ...defaults };
  }
  
  const result: Record<string, unknown> = { ...defaults };
  
  for (const key of Object.keys(defaults)) {
    const dataValue = data[key as keyof typeof data];
    const defaultValue = defaults[key as keyof T];
    
    // If data value is empty, use default
    if (isEmpty(dataValue)) {
      result[key] = defaultValue;
      continue;
    }
    
    // If both are objects (not arrays), recursively merge
    if (
      typeof dataValue === 'object' &&
      !Array.isArray(dataValue) &&
      typeof defaultValue === 'object' &&
      !Array.isArray(defaultValue) &&
      defaultValue !== null
    ) {
      result[key] = deepMergeWithDefaults(
        dataValue as Record<string, unknown>,
        defaultValue as Record<string, unknown>
      );
    } else {
      result[key] = dataValue;
    }
  }
  
  return result as T;
}

// =============================================================================
// TYPE GUARDS (No external dependencies)
// =============================================================================

/**
 * Check if value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if value is a non-empty array
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Check if value is a valid email (basic check)
 */
export function isValidEmail(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Create a type guard for specific object shape
 * 
 * @example
 * const isUser = createTypeGuard<User>(['id', 'email', 'name']);
 * if (isUser(data)) {
 *   console.log(data.email);  // TypeScript knows data is User
 * }
 */
export function createTypeGuard<T>(requiredKeys: (keyof T)[]): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    if (!isObject(value)) return false;
    return requiredKeys.every(key => key in value);
  };
}

// =============================================================================
// SESSION/AUTH SAFE ACCESS
// =============================================================================

/**
 * Safe session user type
 */
export interface SafeUser {
  id: string | null;
  email: string | null;
  name: string | null;
  image: string | null;
}

/**
 * Extract safe user from session-like object
 * Always returns an object with null properties rather than undefined
 * 
 * @example
 * const user = getSafeUser(session);
 * // user.name is string | null, never undefined
 */
export function getSafeUser(session: unknown): SafeUser {
  const defaults: SafeUser = {
    id: null,
    email: null,
    name: null,
    image: null,
  };
  
  if (!isObject(session)) {
    return defaults;
  }
  
  const user = session.user;
  if (!isObject(user)) {
    return defaults;
  }
  
  return {
    id: typeof user.id === 'string' ? user.id : null,
    email: typeof user.email === 'string' ? user.email : null,
    name: typeof user.name === 'string' ? user.name : null,
    image: typeof user.image === 'string' ? user.image : null,
  };
}

// =============================================================================
// API RESPONSE HANDLING
// =============================================================================

/**
 * Safely extract data from API response
 * 
 * @example
 * const users = safeApiData(response, 'users', []);
 * const profile = safeApiData(response, 'profile', defaultProfile);
 */
export function safeApiData<T>(
  response: unknown,
  key: string,
  defaultValue: T
): T {
  if (!isObject(response)) {
    return defaultValue;
  }
  
  const data = response[key];
  
  if (isEmpty(data)) {
    return defaultValue;
  }
  
  return data as T;
}

/**
 * Wrap async API calls with error handling
 * 
 * @example
 * const result = await safeAsync(fetchUser(id), null);
 * if (result) {
 *   // Handle success
 * }
 */
export async function safeAsync<T>(
  promise: Promise<T>,
  defaultValue: T
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error('[safeAsync] Error:', error);
    return defaultValue;
  }
}

/**
 * Wrap async API calls with error details
 * 
 * @example
 * const { data, error } = await safeAsyncWithError(fetchUser(id));
 * if (error) {
 *   showToast(error.message);
 * } else {
 *   setUser(data);
 * }
 */
export async function safeAsyncWithError<T>(
  promise: Promise<T>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    const normalizedError = error instanceof Error 
      ? error 
      : new Error(String(error));
    return { data: null, error: normalizedError };
  }
}

// =============================================================================
// DEFENSIVE CODING CHECKLIST
// =============================================================================

/**
 * ## Checklist for AI Agents
 * 
 * When generating code, apply these defensive patterns:
 * 
 * ### 1. Optional Chaining
 * - [ ] Use ?. for session.user access
 * - [ ] Use ?. for API response nested data
 * - [ ] Use ?. for props from parent components
 * - [ ] Use ?. for array element access (arr?.[0])
 * 
 * ### 2. Nullish Coalescing
 * - [ ] Use ?? instead of || for defaults
 * - [ ] Only use || when you want falsy values to trigger default
 * 
 * ### 3. Empty Object Handling
 * - [ ] Check Object.keys(obj).length > 0 before using object
 * - [ ] Use isEmpty() utility for general emptiness checks
 * - [ ] Use deepMergeWithDefaults() when merging API data
 * 
 * ### 4. Type Guards
 * - [ ] Validate API response shape before using
 * - [ ] Use isObject(), isNonEmptyArray() etc. for runtime checks
 * 
 * ### 5. Error Handling
 * - [ ] Wrap async calls in try/catch or use safeAsync()
 * - [ ] Provide meaningful fallback values
 * - [ ] Log errors for debugging
 */

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// Example: Safe session access in Next.js

// ❌ Dangerous
function Profile({ session }) {
  return <div>Hello {session.user.name}</div>;  // Crashes if no session
}

// ✅ Safe
function Profile({ session }) {
  const user = getSafeUser(session);
  return <div>Hello {user.name ?? 'Guest'}</div>;
}


// Example: Safe API data handling

// ❌ Dangerous
const content = apiResponse.data.content || defaultContent;  // {} is truthy!

// ✅ Safe
const content = valueOrDefault(apiResponse?.data?.content, defaultContent);

// Or with deep merge
const fullData = deepMergeWithDefaults(apiResponse?.data, {
  content: defaultContent,
  metadata: defaultMetadata,
});
*/
