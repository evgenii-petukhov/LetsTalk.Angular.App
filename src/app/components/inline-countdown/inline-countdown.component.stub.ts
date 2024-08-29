import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-inline-countdown',
    template: '<div></div>',
})
export class InlineCountdownStubComponent {
    @Input() startValue!: number;
    @Output() expired = new EventEmitter<void>();
}
