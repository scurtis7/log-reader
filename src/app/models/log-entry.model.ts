export interface LogField {
  key: string;
  value: unknown;
}

export interface LogEntry {
  timestamp: Date | null;
  level: string | null;
  message: string | null;
  fields: LogField[];
}
