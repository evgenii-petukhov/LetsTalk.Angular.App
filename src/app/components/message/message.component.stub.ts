import { Component, Input } from '@angular/core';
import { Message } from 'src/app/models/message';

@Component({
    selector: 'app-message',
    template: '<div></div>',
})
export class MessageStubComponent {
    @Input() message: Message;
}
