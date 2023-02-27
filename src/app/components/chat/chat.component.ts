import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Account } from "src/app/models/rendering/account";
import { Message } from "src/app/models/rendering/message";
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    @Input() account: Account;
    @Input() messages: Message[];
    @Output() messageSentEvent = new EventEmitter<Message>();
    message = '';

    constructor(private apiService: ApiService) {

    }

    send(): void {
        this.apiService.sendMessage(this.account.id, this.message).subscribe(response => {
            this.message = '';
            const message = new Message();
            message.date = response.created;
            message.text = response.text;
            message.isMine = true;
            this.messageSentEvent.emit(message);
        });
    }
}
