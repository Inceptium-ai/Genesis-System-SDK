/**
 * Genesis SDK - API Response Patterns
 * 
 * Standard response wrapper patterns for consistent API design.
 * Copy to your project's src/types/ directory and adapt as needed.
 */

// =============================================================================
// BASIC API RESPONSE
// =============================================================================

/**
 * Standard API response wrapper
 * Use for all API endpoints to ensure consistent response format
 */
export interface ApiResponse<T = unknown> {
  /** Whether the request was successful */
  success: boolean;
  
  /** Response data (present on success) */
  data?: T;
  
  /** Error details (present on failure) */
  error?: ApiError;
  
  /** Optional metadata */
  meta?: ResponseMeta;
}

/**
 * Error details for failed requests
 */
export interface ApiError {
  /** Machine-readable error code (e.g., "VALIDATION_ERROR", "NOT_FOUND") */
  code: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Additional error details (e.g., field-level validation errors) */
  details?: Record<string, unknown>;
}

/**
 * Response metadata
 */
export interface ResponseMeta {
  /** ISO timestamp of when response was generated */
  timestamp?: string;
  
  /** Request ID for debugging/tracing */
  requestId?: string;
  
  /** API version */
  version?: string;
}

// =============================================================================
// RESPONSE HELPERS
// =============================================================================

/**
 * Create a success response
 * 
 * @example
 * return successResponse(users);
 * // { success: true, data: [...] }
 */
export function successResponse<T>(data: T, meta?: ResponseMeta): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Create an error response
 * 
 * @example
 * return errorResponse("NOT_FOUND", "User not found");
 * // { success: false, error: { code: "NOT_FOUND", message: "User not found" } }
 */
export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

// =============================================================================
// COMMON ERROR CODES
// =============================================================================

/**
 * Standard error codes for consistent error handling
 */
export const ErrorCodes = {
  // Client errors (4xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// =============================================================================
// NEXT.JS API ROUTE EXAMPLE
// =============================================================================

/*
// Example usage in Next.js API route (app/api/items/route.ts):

import { NextResponse } from 'next/server';
import { successResponse, errorResponse, ErrorCodes } from '@/types/api-response';

export async function GET() {
  try {
    const items = await fetchItems();
    return NextResponse.json(successResponse(items));
  } catch (error) {
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch items'),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.name) {
      return NextResponse.json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, 'Name is required', {
          field: 'name',
          reason: 'required',
        }),
        { status: 400 }
      );
    }
    
    const item = await createItem(body);
    return NextResponse.json(successResponse(item), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create item'),
      { status: 500 }
    );
  }
}
*/

// =============================================================================
// FASTAPI EXAMPLE
// =============================================================================

/*
# Example usage in FastAPI (models.py):

from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, Dict, Any
from datetime import datetime

T = TypeVar('T')

class ApiError(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None

class ResponseMeta(BaseModel):
    timestamp: str = datetime.utcnow().isoformat()
    request_id: Optional[str] = None

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[ApiError] = None
    meta: Optional[ResponseMeta] = None

# Usage in endpoint:
@app.get("/items", response_model=ApiResponse[List[Item]])
async def get_items():
    items = await fetch_items()
    return ApiResponse(
        success=True,
        data=items,
        meta=ResponseMeta()
    )
*/
