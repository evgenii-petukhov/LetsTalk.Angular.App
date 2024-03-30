import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IChatDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-chat-list-item',
    templateUrl: './chat-list-item.component.html',
    styleUrls: ['./chat-list-item.component.scss']
})
export class ChatListItemComponent{
    @Input() chat: IChatDto;
    @Output() chatSelected = new EventEmitter<string>();

    onChatSelected(): boolean {
        this.chatSelected.emit(this.chat.id);
        return false;
    }
}
