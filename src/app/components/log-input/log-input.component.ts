import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

export const LOG_LEVEL_OPTIONS = ['Error', 'Warn', 'Info', 'Debug', 'Trace'] as const;

@Component({
  selector: 'app-log-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './log-input.component.html',
  styleUrl: './log-input.component.scss'
})
export class LogInputComponent {
  @Output() content = new EventEmitter<string>();
  @Output() levelFilterChange = new EventEmitter<Set<string>>();
  @Output() reversedChange = new EventEmitter<boolean>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly levelOptions = LOG_LEVEL_OPTIONS;
  selectedLevels = new Set<string>();
  reversed = false;

  pastedText = '';
  fileName: string | null = null;
  isDragOver = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.readFile(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.readFile(file);
    }
    input.value = '';
  }

  onPaste(): void {
    // Defer until after the browser's default paste updates pastedText via ngModel.
    setTimeout(() => this.format());
  }

  format(): void {
    this.content.emit(this.pastedText);
  }

  clear(): void {
    this.pastedText = '';
    this.fileName = null;
    this.content.emit('');
  }

  toggleOrder(): void {
    this.reversed = !this.reversed;
    this.reversedChange.emit(this.reversed);
  }

  toggleLevel(level: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const upperLevel = level.toUpperCase();
    if (checked) {
      this.selectedLevels.add(upperLevel);
    } else {
      this.selectedLevels.delete(upperLevel);
    }
    this.levelFilterChange.emit(new Set(this.selectedLevels));
  }

  private readFile(file: File): void {
    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.pastedText = typeof reader.result === 'string' ? reader.result : '';
      this.content.emit(this.pastedText);
    };
    reader.readAsText(file);
  }
}
