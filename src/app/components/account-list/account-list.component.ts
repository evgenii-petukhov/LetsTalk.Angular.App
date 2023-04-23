import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAccountDto } from 'src/app/api-client/api-client';
import { selectAccounts } from 'src/app/state/accounts/accounts.selector';
import { selectSelectedAccountId } from 'src/app/state/selected-account-id/select-selected-account-id.selectors';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit {
    accounts: readonly IAccountDto[] = [];
    accounts$ = this.store.select(selectAccounts);
    selectedAccountId$ = this.store.select(selectSelectedAccountId);

    constructor(
        private store: Store,
        private storeService: StoreService) {}

    ngOnInit(): void {
        this.accounts$.subscribe(accounts => {
            this.accounts = accounts;
        });
    }

    onAccountSelected(accountId: number): void {
        this.storeService.setSelectedAccountId(accountId);
        this.storeService.readAllMessages(accountId);
        this.storeService.setLayoutSettings({ activeArea: 'chat' });
    }
}
