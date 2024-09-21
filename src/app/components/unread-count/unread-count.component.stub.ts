import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-unread-count',
    template: '<div></div>',
})
export class UnreadCountStubComponent {
    @Input() value: number;
}
