import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-inline-countdown',
    templateUrl: './inline-countdown.component.html'
})
export class InlineCountdownComponent implements OnInit, OnDestroy {
    @Input() startValue: number;
    value: number;
    @Output() expired = new EventEmitter<void>();
    private timerId = 0;

    ngOnInit(): void {
        this.start();
    }

    ngOnDestroy(): void {
        clearInterval(this.timerId);
    }

    private start(): void {
        this.value = this.startValue;
        this.timerId = window.setInterval(() => this.tick(), 1000);
    }

    private stop(): void {
        this.expired.emit();
        window.clearInterval(this.timerId);
    }

    private tick(): void {
        --this.value;

        if (this.value <= 0) {
            this.stop();
        }
    }
}
