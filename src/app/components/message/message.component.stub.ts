import { Component, Input } from '@angular/core';
import { Message } from 'src/app/models/message';

@Component({
    selector: 'app-message',
    template: '<div></div>',
    standalone: false,
})
export class MessageStubComponent {
    @Input() message: Message;
}
