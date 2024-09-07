import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-unread-count',
    template: '<div></div>',
    styleUrl: './unread-count.component.scss',
})
export class UnreadCountStubComponent {
    @Input() value: number;
}
