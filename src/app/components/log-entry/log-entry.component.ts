import { Component, Input } from '@angular/core';
import { LogEntry, LogField } from '../../models/log-entry.model';

type FieldKind = 'multiline' | 'object' | 'value';

// Intl handles the EST/EDT switch correctly; DatePipe's `timezone` option does not
// understand IANA zone names, only fixed offsets.
const EASTERN_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
  timeZoneName: 'short'
});

@Component({
  selector: 'app-log-entry',
  standalone: true,
  imports: [],
  templateUrl: './log-entry.component.html',
  styleUrl: './log-entry.component.scss'
})
export class LogEntryComponent {
  @Input({ required: true }) entry!: LogEntry;

  get levelClass(): string {
    return this.entry.level ? `log-entry--${this.entry.level.toLowerCase()}` : '';
  }

  formatTimestamp(date: Date): string {
    const parts: Record<string, string> = {};
    for (const part of EASTERN_TIME_FORMATTER.formatToParts(date)) {
      parts[part.type] = part.value;
    }
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    return `${parts['year']}-${parts['month']}-${parts['day']} ${parts['hour']}:${parts['minute']}:${parts['second']}.${milliseconds} ${parts['dayPeriod']} ${parts['timeZoneName']}`;
  }

  fieldKind(value: unknown): FieldKind {
    if (typeof value === 'string' && value.includes('\n')) {
      return 'multiline';
    }
    if (value !== null && typeof value === 'object') {
      return 'object';
    }
    return 'value';
  }

  objectEntries(value: unknown): LogField[] {
    if (value === null || typeof value !== 'object') {
      return [];
    }
    return Object.entries(value as Record<string, unknown>).map(([key, v]) => ({ key, value: v }));
  }

  displayValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    return typeof value === 'string' ? value : JSON.stringify(value);
  }
}
