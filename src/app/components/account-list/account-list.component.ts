import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAccountDto } from 'src/app/api-client/api-client';
import { selectAccounts } from 'src/app/state/accounts/accounts.selector';
import { SelectedAccountIdActions } from 'src/app/state/selected-account-id/selected-account-id.actions';
import { selectSelectedAccountId } from 'src/app/state/selected-account-id/select-selected-account-id.selectors';
import { AccountsActions } from 'src/app/state/accounts/accounts.actions';
import { LayoutSettingsActions } from 'src/app/state/layout-settings/layout-settings.actions';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit {
    accounts: ReadonlyArray<IAccountDto> = [];
    accounts$ = this.store.select(selectAccounts);
    selectedAccountId$ = this.store.select(selectSelectedAccountId);

    constructor(private store: Store) {}

    ngOnInit(): void {
        this.accounts$.subscribe(accounts => {
            this.accounts = accounts;
        });
    }

    onAccountSelected(accountId: number): void {
        this.store.dispatch(SelectedAccountIdActions.init({
            accountId: accountId
        }));

        this.store.dispatch(AccountsActions.readall({
            accountId: accountId
        }));

        this.store.dispatch(LayoutSettingsActions.init({
            settings: {
                activeArea: 'chat'
            }
        }));
    }
}