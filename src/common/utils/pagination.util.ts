import { PaginationMeta } from '../interceptors/response.interceptor';

export interface PaginationParams {
    page: number;
    pageSize: number;
    skip: number;
    take: number;
}

export interface SortParams {
    sortBy?: string;
    sortDir: 'asc' | 'desc';
}

export function parsePagination(
    page?: number,
    pageSize?: number,
): PaginationParams {
    const safePage = Math.max(1, page ?? 1);
    const safePageSize = Math.min(100, Math.max(1, pageSize ?? 20));
    const skip = (safePage - 1) * safePageSize;

    return {
        page: safePage,
        pageSize: safePageSize,
        skip,
        take: safePageSize,
    };
}

// Updated version that works with QueryPaginationDto
export function parsePaginationFromDto(dto: { page?: number; getEffectivePageSize(): number }): PaginationParams {
    const safePage = Math.max(1, dto.page ?? 1);
    const safePageSize = Math.min(100, Math.max(1, dto.getEffectivePageSize()));
    const skip = (safePage - 1) * safePageSize;

    return {
        page: safePage,
        pageSize: safePageSize,
        skip,
        take: safePageSize,
    };
}

export function parseSort(
    sortBy?: string,
    sortDir?: string,
    allowedFields: string[] = [],
): SortParams {
    const direction = sortDir === 'desc' ? 'desc' : 'asc';

    if (!sortBy) {
        return { sortDir: direction };
    }

    if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
        return { sortDir: direction };
    }

    return {
        sortBy,
        sortDir: direction,
    };
}

export function buildPaginationMeta(
    total: number,
    params: PaginationParams,
): PaginationMeta {
    return {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
    };
}

export function paginatedResponse<T>(
    data: T[],
    total: number,
    params: PaginationParams,
) {
    return {
        data,
        meta: buildPaginationMeta(total, params),
    };
}
