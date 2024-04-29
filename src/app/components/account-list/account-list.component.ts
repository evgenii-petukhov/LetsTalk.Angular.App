import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAccountDto } from 'src/app/api-client/api-client';
import { Subject, takeUntil } from 'rxjs';
import { selectAccounts } from 'src/app/state/accounts/accounts.selector';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit, OnDestroy {
    accounts: readonly IAccountDto[] = [];
    accounts$ = this.store.select(selectAccounts);

    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private store: Store) { }

    ngOnInit(): void {
        this.accounts$.pipe(takeUntil(this.unsubscribe$)).subscribe(accounts => {
            this.accounts = accounts;
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onAccountSelected(accountId: string): void {
        console.log(`Selected account: ${accountId}`);
    }
}
