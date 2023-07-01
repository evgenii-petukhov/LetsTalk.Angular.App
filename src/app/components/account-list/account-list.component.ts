import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAccountDto } from 'src/app/api-client/api-client';
import { selectAccounts } from 'src/app/state/accounts/accounts.selector';
import { selectSelectedAccountId } from 'src/app/state/selected-account-id/select-selected-account-id.selectors';
import { StoreService } from 'src/app/services/store.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit, OnDestroy {
    accounts: readonly IAccountDto[] = [];
    accounts$ = this.store.select(selectAccounts);
    selectedAccountId$ = this.store.select(selectSelectedAccountId);
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private store: Store,
        private storeService: StoreService) { }

    ngOnInit(): void {
        this.accounts$.pipe(takeUntil(this.unsubscribe$)).subscribe(accounts => {
            this.accounts = accounts;
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onAccountSelected(accountId: number): void {
        this.storeService.setSelectedAccountId(accountId);
        this.storeService.readAllMessages(accountId);
        this.storeService.setLayoutSettings({ activeArea: 'chat' });
    }
}
