import { Component, Input } from '@angular/core';
import { IChatDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-chat-list-item',
    templateUrl: './chat-list-item.component.html',
    styleUrls: ['./chat-list-item.component.scss'],
    standalone: false,
})
export class ChatListItemComponent {
    @Input() chat: IChatDto;
}
