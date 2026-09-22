import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LogEntry, LogField } from '../../models/log-entry.model';

type FieldKind = 'multiline' | 'object' | 'value';

@Component({
  selector: 'app-log-entry',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './log-entry.component.html',
  styleUrl: './log-entry.component.scss'
})
export class LogEntryComponent {
  @Input({ required: true }) entry!: LogEntry;

  get levelClass(): string {
    return this.entry.level ? `log-entry--${this.entry.level.toLowerCase()}` : '';
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
