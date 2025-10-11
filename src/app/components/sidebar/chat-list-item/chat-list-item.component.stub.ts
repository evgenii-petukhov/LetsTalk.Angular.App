import { Component, Input } from '@angular/core';
import { IChatDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-chat-list-item',
    template: '<div></div>',
    standalone: false,
})
export class ChatListItemStubComponent {
    @Input() chat: IChatDto;
}
