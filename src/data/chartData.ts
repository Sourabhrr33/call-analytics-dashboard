// --- TypeScript Interfaces ---

export interface ChartDataInput {
    // Allows Recharts to treat this as a generic data object
    [key: string]: any; 
    value: number;
}

export interface CallDurationData extends ChartDataInput {
    name: string;
    count: number;
    percentage: number;
}

export interface SadPathData extends ChartDataInput {
    issue: string;
    value: number;
    fill: string;
}

// FIXED: Now correctly extends ChartDataInput to satisfy Recharts' requirements
export interface HostilityData extends ChartDataInput {
    label: string;
    value: number;
    color: string;
}

// --- DUMMY DATA ---
// ... (Data remains the same)
export const CHART_TITLE = 'Call Duration Analysis';

export const DUMMY_CALL_DURATION_DATA: CallDurationData[] = [
    { name: '0-60s', count: 4000, percentage: 40, value: 4000 }, // Added 'value' for ChartDataInput
    { name: '60-120s', count: 3000, percentage: 30, value: 3000 }, // Added 'value' for ChartDataInput
    { name: '120-180s', count: 2000, percentage: 20, value: 2000 }, // Added 'value' for ChartDataInput
    { name: '180s+', count: 1000, percentage: 10, value: 1000 }, // Added 'value' for ChartDataInput
];

export const DUMMY_SAD_PATH_DATA: SadPathData[] = [
    { issue: 'Caller Identification Failed', value: 350, fill: '#ef4444' },
    { issue: 'Unsupported Language', value: 200, fill: '#f97316' },
    { issue: 'Agent Aggression', value: 150, fill: '#facc15' },
    { issue: 'Incorrect Caller ID', value: 100, fill: '#22c55e' },
];

export const DUMMY_HOSTILITY_DATA: HostilityData[] = [
    { label: 'Low', value: 65, color: '#22c55e' },
    { label: 'Medium', value: 25, color: '#facc15' },
    { label: 'High', value: 10, color: '#ef4444' },
];
