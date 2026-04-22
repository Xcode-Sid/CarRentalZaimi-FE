export interface AppLogEntry {
    id: number;
    message: string;
    template: string;
    level: string;
    timestamp: string;
    exception: string | null;
    properties: string | null;
}

export interface AppLogPagedResponse {
    items: AppLogEntry[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export type LogLevel = 'Information' | 'Warning' | 'Error' | 'Debug';

export const LOG_LEVELS: LogLevel[] = ['Information', 'Warning', 'Error', 'Debug'];

export const LOG_LEVEL_COLOR: Record<string, string> = {
    Information: 'blue',
    Warning: 'yellow',
    Error: 'red',
    Debug: 'gray',
};

export const LOG_LEVEL_ICON_COLOR: Record<string, string> = {
    Information: 'blue.6',
    Warning: 'yellow.6',
    Error: 'red.6',
    Debug: 'gray.6',
};
