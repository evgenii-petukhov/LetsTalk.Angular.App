import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IChatDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-chat-list-item',
    template: '<div></div>'
})
export class ChatListItemStubComponent {
    @Input() chat: IChatDto;
    @Output() chatSelected = new EventEmitter<IChatDto>();
}
