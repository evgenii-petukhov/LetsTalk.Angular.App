import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Message } from 'src/app/models/rendering/message';
import { SignalService } from 'src/app/services/signalr.service';
import { ToastrService } from 'ngx-toastr';
import { AccountDto } from 'src/app/api-client/api-client';
import { Store } from '@ngrx/store';
import { selectMessages } from 'src/app/state/messages.selectors';
import { MessagesActions } from 'src/app/state/messages.actions';

@Component({
    selector: 'app-messager',
    templateUrl: './messager.component.html',
    styleUrls: ['./messager.component.scss']
})
export class MessagerComponent implements OnInit {

    accounts = new Array<AccountDto>();

    selectedAccount: AccountDto = null;

    me: AccountDto = null;

    messages$ = this.store.select(selectMessages);

    constructor(
        private apiService: ApiService,
        private signalService: SignalService,
        private toastr: ToastrService,
        private store: Store
    ) {}

    ngOnInit(): void {
        this.apiService.getMe().subscribe(account => {
            this.me = account;
        });

        this.apiService.getAccounts().subscribe(accounts => {
            this.accounts.push(...accounts);

            if (this.accounts.length) {
                this.selectedAccount = this.accounts[0];
                this.loadMessages(this.accounts[0].id);
            }
        });

        this.signalService.init(data => {
            if (data.senderId === this.selectedAccount?.id) {
                const message = new Message();
                message.text = data.text;
                message.date = data.created;
                message.isMine = false;
                this.store.dispatch(MessagesActions.add({message}));
            } else {
                const sender = this.accounts.find(account => account.id === data.senderId);
                if (sender) {
                    this.toastr.info(data.text, `${sender.firstName} ${sender.lastName}`);
                }
            }
        });
    }

    onAccountSelected(accountId: number): void {
        this.selectedAccount = this.accounts.find(x => x.id === accountId);
        this.loadMessages(accountId);
    }

    onMessageSent(message: Message): void {
        this.store.dispatch(MessagesActions.add({message}));
    }

    private loadMessages(accountId: number): void {
        this.apiService.getMessages(accountId).subscribe(messages => {
            this.store.dispatch(MessagesActions.init({
                messages: messages.map((m) => {
                    const message = new Message();
                    message.text = m.text;
                    message.date = m.created;
                    message.isMine = m.senderId !== accountId
                    return message;
                })
            }));
        });
    }
}
