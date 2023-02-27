import { Component, Input } from "@angular/core";
import { Account } from "src/app/models/rendering/account";
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    @Input() account: Account;
    message = '';

    constructor(private apiService: ApiService) {

    }

    send(): void {
        this.apiService.sendMessage(this.account.id, this.message).subscribe(data => {
            this.message = '';
        });
    }
}
