import { Component, Input } from '@angular/core';
import { AccountDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-chat-header',
    templateUrl: './chat-header.component.html',
    styleUrls: ['./chat-header.component.scss']
})
export class ChatHeaderComponent {
    @Input() account: AccountDto;
}
