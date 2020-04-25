export interface ITelemetryFilterExtensionConfig {
    filteredHeaders?: {
        [key: string]: string[2];
    };
    filteredName?: string[2];
    filteredData?: string[2];
}
