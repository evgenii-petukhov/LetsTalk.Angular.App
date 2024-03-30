import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IChatDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-account-list-item',
    templateUrl: './account-list-item.component.html',
    styleUrls: ['./account-list-item.component.scss']
})
export class AccountListItemComponent{
    @Input() chat: IChatDto;
    @Output() chatSelected = new EventEmitter<string>();

    onChatSelected(): boolean {
        this.chatSelected.emit(this.chat.id);
        return false;
    }
}
