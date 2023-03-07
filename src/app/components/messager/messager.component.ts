import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SignalService } from 'src/app/services/signalr.service';
import { ToastrService } from 'ngx-toastr';
import { IAccountDto } from 'src/app/api-client/api-client';
import { Store } from '@ngrx/store';
import { selectSelectedAccountId } from 'src/app/state/selected-account-id/select-selected-account-id.selectors';
import { MessagesActions } from 'src/app/state/messages/messages.actions';
import { AccountsActions } from 'src/app/state/accounts/accounts.actions';
import { selectLayoutSettings } from 'src/app/state/layout-settings/select-layout-settings.selectors';

@Component({
    selector: 'app-messager',
    templateUrl: './messager.component.html',
    styleUrls: ['./messager.component.scss']
})
export class MessagerComponent implements OnInit {
    selectedAccountId$ = this.store.select(selectSelectedAccountId);
    layout$ = this.store.select(selectLayoutSettings);

    private accounts: ReadonlyArray<IAccountDto> = [];
    private selectedAccountId: number;

    constructor(
        private apiService: ApiService,
        private signalService: SignalService,
        private toastr: ToastrService,
        private store: Store
    ) {}

    ngOnInit(): void {
        this.apiService.getAccounts().subscribe(accounts => {
            this.accounts = accounts;
            this.store.dispatch(AccountsActions.init({
                accounts: accounts
            }));
        });

        this.selectedAccountId$.subscribe(accountId => {
            this.selectedAccountId = accountId;
        });

        this.signalService.init(data => {
            if (data.accountId === this.selectedAccountId) {
                const message = {
                    text: data.text,
                    created: data.created,
                    isMine: false
                };
                this.store.dispatch(MessagesActions.add({message}));
                this.apiService.markAsRead(data.id).subscribe();
            } else {
                const sender = this.accounts.find(account => account.id === data.accountId);
                if (sender) {
                    this.toastr.info(data.text, `${sender.firstName} ${sender.lastName}`);
                    this.store.dispatch(AccountsActions.increment({
                        accountId: data.accountId
                    }));
                }
            }
        });
    }
}
