/**
 * Genesis SDK - Pagination Patterns
 * 
 * Standard pagination patterns for list endpoints.
 * Copy to your project's src/types/ directory and adapt as needed.
 */

// =============================================================================
// PAGINATION REQUEST
// =============================================================================

/**
 * Pagination parameters for list requests
 * Use in query parameters or request body
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page?: number;
  
  /** Number of items per page */
  limit?: number;
  
  /** Sort field name */
  sortBy?: string;
  
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Default pagination values
 */
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
  sortOrder: 'desc' as const,
} as const;

/**
 * Parse and validate pagination params from query string
 * 
 * @example
 * const params = parsePaginationParams(searchParams);
 * // { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }
 */
export function parsePaginationParams(
  searchParams: URLSearchParams | Record<string, string | undefined>,
  defaults = PAGINATION_DEFAULTS
): Required<PaginationParams> {
  const get = (key: string) => 
    searchParams instanceof URLSearchParams 
      ? searchParams.get(key) 
      : searchParams[key];
  
  const page = Math.max(1, parseInt(get('page') || '', 10) || defaults.page);
  const limit = Math.min(
    defaults.maxLimit,
    Math.max(1, parseInt(get('limit') || '', 10) || defaults.limit)
  );
  const sortBy = get('sortBy') || 'createdAt';
  const sortOrder = get('sortOrder') === 'asc' ? 'asc' : defaults.sortOrder;
  
  return { page, limit, sortBy, sortOrder };
}

// =============================================================================
// PAGINATION RESPONSE
// =============================================================================

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  /** Current page number (1-indexed) */
  page: number;
  
  /** Items per page */
  limit: number;
  
  /** Total number of items across all pages */
  total: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Whether there's a next page */
  hasNextPage: boolean;
  
  /** Whether there's a previous page */
  hasPrevPage: boolean;
}

/**
 * Paginated response wrapper
 * Extends ApiResponse with pagination metadata
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  meta?: {
    timestamp?: string;
    requestId?: string;
  };
}

/**
 * Create pagination metadata from total count and params
 * 
 * @example
 * const pagination = createPaginationMeta(150, { page: 2, limit: 20 });
 * // { page: 2, limit: 20, total: 150, totalPages: 8, hasNextPage: true, hasPrevPage: true }
 */
export function createPaginationMeta(
  total: number,
  params: Pick<PaginationParams, 'page' | 'limit'>
): PaginationMeta {
  const page = params.page || PAGINATION_DEFAULTS.page;
  const limit = params.limit || PAGINATION_DEFAULTS.limit;
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Create a paginated response
 * 
 * @example
 * const response = paginatedResponse(items, 150, { page: 1, limit: 20 });
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: Pick<PaginationParams, 'page' | 'limit'>
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination: createPaginationMeta(total, params),
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

// =============================================================================
// CURSOR-BASED PAGINATION (Alternative)
// =============================================================================

/**
 * Cursor-based pagination params
 * Better for real-time data or infinite scroll
 */
export interface CursorPaginationParams {
  /** Cursor for the next page (typically an ID or timestamp) */
  cursor?: string;
  
  /** Number of items to fetch */
  limit?: number;
  
  /** Direction relative to cursor */
  direction?: 'after' | 'before';
}

/**
 * Cursor-based pagination response
 */
export interface CursorPaginatedResponse<T> {
  success: boolean;
  data: T[];
  cursors: {
    /** Cursor for fetching next page */
    next: string | null;
    /** Cursor for fetching previous page */
    prev: string | null;
  };
  hasMore: boolean;
}

// =============================================================================
// NEXT.JS API ROUTE EXAMPLE
// =============================================================================

/*
// Example usage in Next.js API route (app/api/items/route.ts):

import { NextRequest, NextResponse } from 'next/server';
import { parsePaginationParams, paginatedResponse } from '@/types/pagination';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = parsePaginationParams(searchParams);
  
  // Calculate offset for database query
  const offset = (params.page - 1) * params.limit;
  
  // Fetch data with pagination
  const [items, total] = await Promise.all([
    db.items.findMany({
      skip: offset,
      take: params.limit,
      orderBy: { [params.sortBy]: params.sortOrder },
    }),
    db.items.count(),
  ]);
  
  return NextResponse.json(paginatedResponse(items, total, params));
}
*/

// =============================================================================
// FASTAPI EXAMPLE
// =============================================================================

/*
# Example usage in FastAPI:

from fastapi import Query
from pydantic import BaseModel
from typing import Generic, TypeVar, List

T = TypeVar('T')

class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool

class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    data: List[T]
    pagination: PaginationMeta

@app.get("/items", response_model=PaginatedResponse[Item])
async def get_items(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc", regex="^(asc|desc)$")
):
    offset = (page - 1) * limit
    items = await db.get_items(offset=offset, limit=limit, sort_by=sort_by, sort_order=sort_order)
    total = await db.count_items()
    
    return PaginatedResponse(
        data=items,
        pagination=PaginationMeta(
            page=page,
            limit=limit,
            total=total,
            total_pages=(total + limit - 1) // limit,
            has_next=page * limit < total,
            has_prev=page > 1
        )
    )
*/

// =============================================================================
// SQL QUERY HELPER
// =============================================================================

/**
 * Generate SQL LIMIT/OFFSET clause
 * 
 * @example
 * const sql = `SELECT * FROM items ${sqlPagination({ page: 2, limit: 20 })}`;
 * // "SELECT * FROM items LIMIT 20 OFFSET 20"
 */
export function sqlPagination(params: Pick<PaginationParams, 'page' | 'limit'>): string {
  const page = params.page || PAGINATION_DEFAULTS.page;
  const limit = params.limit || PAGINATION_DEFAULTS.limit;
  const offset = (page - 1) * limit;
  return `LIMIT ${limit} OFFSET ${offset}`;
}
