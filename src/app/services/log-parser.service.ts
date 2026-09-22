import { Injectable } from '@angular/core';
import { LogEntry } from '../models/log-entry.model';

export interface LogParseResult {
  entries: LogEntry[];
  errorCount: number;
}

/**
 * Keys rendered specially by LogEntryComponent (timestamp/level/message).
 * Everything else on a parsed object is surfaced generically as a "field" -
 * add/remove keys here if the fields worth pulling out change later.
 */
const KNOWN_KEYS: ReadonlySet<string> = new Set(['ts', 'level', 'msg']);

@Injectable({ providedIn: 'root' })
export class LogParserService {
  /**
   * Parses either a single JSON value (object or array of objects) or
   * newline-delimited JSON (NDJSON) into a flat list of LogEntry objects.
   */
  parse(raw: string): LogParseResult {
    const text = raw.trim();
    if (!text) {
      return { entries: [], errorCount: 0 };
    }

    const rawObjects: unknown[] = [];
    let errorCount = 0;

    const wholeDocument = this.tryParseJson(text);
    if (wholeDocument !== undefined) {
      if (Array.isArray(wholeDocument)) {
        rawObjects.push(...wholeDocument);
      } else {
        rawObjects.push(wholeDocument);
      }
    } else {
      for (const line of text.split(/\r?\n/)) {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          continue;
        }
        const parsedLine = this.tryParseJson(trimmedLine);
        if (parsedLine === undefined) {
          errorCount++;
          continue;
        }
        rawObjects.push(parsedLine);
      }
    }

    const entries = rawObjects
      .filter((value): value is Record<string, unknown> => this.isPlainObject(value))
      .map((value) => this.toLogEntry(value));

    return { entries, errorCount };
  }

  private toLogEntry(obj: Record<string, unknown>): LogEntry {
    const fields: LogEntry['fields'] = [];
    for (const key of Object.keys(obj)) {
      if (!KNOWN_KEYS.has(key)) {
        fields.push({ key, value: obj[key] });
      }
    }

    return {
      timestamp: this.toDate(obj['ts']),
      level: typeof obj['level'] === 'string' ? (obj['level'] as string) : null,
      message: typeof obj['msg'] === 'string' ? (obj['msg'] as string) : null,
      fields
    };
  }

  private toDate(ts: unknown): Date | null {
    if (typeof ts !== 'number' || !Number.isFinite(ts)) {
      return null;
    }
    // Epoch seconds have ~10 digits, epoch milliseconds have ~13.
    const milliseconds = ts > 1e12 ? ts : ts * 1000;
    const date = new Date(milliseconds);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private tryParseJson(text: string): unknown {
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  }
}
