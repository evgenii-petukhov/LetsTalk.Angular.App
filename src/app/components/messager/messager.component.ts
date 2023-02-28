import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Account } from '../../models/rendering/account';
import { AccountMappingService } from '../../services/account-mapping.service';
import { Message } from 'src/app/models/rendering/message';
import { SignalService } from 'src/app/services/signalr.service';

@Component({
    selector: 'app-messager',
    templateUrl: './messager.component.html',
    styleUrls: ['./messager.component.scss']
})
export class MessagerComponent implements OnInit {

    accounts = new Array<Account>();

    account: Account = null;

    messages = new Array<Message>();

    constructor(
        private apiService: ApiService,
        private accountMappingService: AccountMappingService,
        private signalService: SignalService
    ) {

    }

    ngOnInit(): void {
        this.apiService.getAccounts().subscribe((accounts) => {
            this.accounts.push(...accounts.map((account) => this.accountMappingService.map(account)));
        });

        this.signalService.init(data => {
            if (data.senderId === this.account.id) {
                const message = new Message();
                message.text = data.text;
                message.date = data.created;
                message.isMine = false;
                this.messages.push(message);
            }
        });
    }

    onAccountSelected(accountId: number): void {
        this.account = this.accounts.find(x => x.id === accountId);
        this.messages.splice(0);
        this.apiService.getMessages(accountId).subscribe((messages) => {
            this.messages.push(...messages.map((m) => {
                const message = new Message();
                message.text = m.text;
                message.date = m.created;
                message.isMine = m.senderId !== accountId
                return message;
            }));
        });
    }

    onMessageSent(message: Message): void {
        this.messages.push(message);
    }
}
