import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AccountDto } from 'src/app/api-client/api-client';
import { selectAccounts } from 'src/app/state/accounts/accounts.selectors';
import { SelectedAccountActions } from 'src/app/state/selected-account/selectedAccount.actions';
import { selectSelectedAccount } from 'src/app/state/selected-account/selectedSelectedAccount.selectors';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit {
    accounts = new Array<AccountDto>();

    accounts$ = this.store.select(selectAccounts);

    selectedAccount$ = this.store.select(selectSelectedAccount);

    constructor(private store: Store) {}

    ngOnInit(): void {
        this.accounts$.subscribe(accounts => {
            this.accounts = accounts;
        });
    }

    onAccountSelected(accountId: number): void {
        this.store.dispatch(SelectedAccountActions.init({
            account: this.accounts.find(account => account.id === accountId)
        }));
    }
}