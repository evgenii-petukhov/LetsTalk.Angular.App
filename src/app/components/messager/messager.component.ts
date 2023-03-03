import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Message } from 'src/app/models/rendering/message';
import { SignalService } from 'src/app/services/signalr.service';
import { ToastrService } from 'ngx-toastr';
import { AccountDto } from 'src/app/api-client/api-client';
import { Store } from '@ngrx/store';
import { selectMessages } from 'src/app/state/messages/messages.selectors';
import { selectSelectedAccount } from 'src/app/state/selected-account/selectedSelectedAccount.selectors';
import { MessagesActions } from 'src/app/state/messages/messages.actions';
import { SelectedAccountActions } from 'src/app/state/selected-account/selectedAccount.actions';
import { AccountsActions } from 'src/app/state/accounts/accounts.actions';

@Component({
    selector: 'app-messager',
    templateUrl: './messager.component.html',
    styleUrls: ['./messager.component.scss']
})
export class MessagerComponent implements OnInit {

    accounts = new Array<AccountDto>();
    
    selectedAccount$ = this.store.select(selectSelectedAccount);

    me: AccountDto = null;

    messages$ = this.store.select(selectMessages);

    private selectedAccountId: number;

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
            this.accounts = accounts;
            this.store.dispatch(AccountsActions.init({
                accounts: accounts
            }))

            if (accounts.length) {
                this.store.dispatch(SelectedAccountActions.init({
                    account: accounts[0]
                }));
            }
        });

        this.selectedAccount$.subscribe(selectedAccount => {
            this.selectedAccountId = selectedAccount?.id
        });

        this.signalService.init(data => {
            if (data.senderId === this.selectedAccountId) {
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
}
