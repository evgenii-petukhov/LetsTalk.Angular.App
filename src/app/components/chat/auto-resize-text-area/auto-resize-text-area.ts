import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
    selector: 'app-auto-resize-text-area',
    templateUrl: './auto-resize-text-area.html',
    styleUrl: './auto-resize-text-area.scss',
    standalone: false,
})
export class AutoResizeTextArea {
    @Input() text = '';
    @Output() textChange = new EventEmitter<string>();

    @ViewChild('textarea')
    textareaRef: ElementRef<HTMLTextAreaElement>;

    @Output() onSubmit = new EventEmitter<string>();

    focus(): void {
        const element = this.textareaRef.nativeElement;
        element.style.height = 'auto';
        element.focus();
    }

    onTextChanged(): void {
        const element = this.textareaRef.nativeElement;
        element.style.height = 'auto';
        element.style.height = `${element.scrollHeight}px`;
        this.textChange.emit(this.text);
    }

    submit(): void {
        this.onSubmit.emit(this.text);
    }
}
