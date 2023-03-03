import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAccounts } from 'src/app/state/accounts/accounts.selectors';
import { selectSelectedAccount } from 'src/app/state/selected-account/selectedSelectedAccount.selectors';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent {
    @Output() accountSelectedEvent = new EventEmitter<number>();

    accounts$ = this.store.select(selectAccounts);

    selectedAccount$ = this.store.select(selectSelectedAccount);

    constructor(private store: Store) {}

    onAccountSelected(accountId: number): void {
        this.accountSelectedEvent.emit(accountId);
    }
}