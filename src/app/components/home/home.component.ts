import { Component } from '@angular/core';
import { LogInputComponent } from '../log-input/log-input.component';
import { LogEntryComponent } from '../log-entry/log-entry.component';
import { LogParserService } from '../../services/log-parser.service';
import { LogEntry } from '../../models/log-entry.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LogInputComponent, LogEntryComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  entries: LogEntry[] = [];
  filteredEntries: LogEntry[] = [];
  error: string | null = null;
  parseErrorCount = 0;
  private reversed = false;
  private selectedLevels = new Set<string>();

  constructor(private readonly logParser: LogParserService) {}

  onContent(raw: string): void {
    if (!raw.trim()) {
      this.entries = [];
      this.error = null;
      this.parseErrorCount = 0;
      this.applyFilter();
      return;
    }

    const result = this.logParser.parse(raw);
    this.entries = result.entries;
    this.parseErrorCount = result.errorCount;
    this.error = result.entries.length === 0
      ? 'No valid JSON log entries were found in the provided content.'
      : null;
    this.applyFilter();
  }

  onLevelFilterChange(levels: Set<string>): void {
    this.selectedLevels = levels;
    this.applyFilter();
  }

  onReversedChange(reversed: boolean): void {
    this.reversed = reversed;
    this.applyFilter();
  }

  private applyFilter(): void {
    const filtered = this.selectedLevels.size === 0
      ? this.entries
      : this.entries.filter(
          (entry) => !!entry.level && this.selectedLevels.has(entry.level.toUpperCase())
        );
    this.filteredEntries = this.reversed ? [...filtered].reverse() : filtered;
  }
}
