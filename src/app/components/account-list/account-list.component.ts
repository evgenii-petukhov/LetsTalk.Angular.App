import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAccountDto } from 'src/app/api-client/api-client';
import { selectAccounts } from 'src/app/state/accounts/accounts.selector';
import { selectSelectedAccountId } from 'src/app/state/selected-account-id/select-selected-account-id.selectors';
import { StoreService } from 'src/app/services/store.service';
import { Subject, takeUntil } from 'rxjs';
import { selectSelectedAccount } from 'src/app/state/selected-account/select-selected-account.selector';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit, OnDestroy {
    accounts: readonly IAccountDto[] = [];
    accounts$ = this.store.select(selectAccounts);
    selectedAccountId$ = this.store.select(selectSelectedAccountId);
    selectedAccount$ = this.store.select(selectSelectedAccount);

    private unsubscribe$: Subject<void> = new Subject<void>();
    private selectedAccount: IAccountDto;

    constructor(
        private store: Store,
        private storeService: StoreService) { }

    ngOnInit(): void {
        this.accounts$.pipe(takeUntil(this.unsubscribe$)).subscribe(accounts => {
            this.accounts = accounts;
        });

        this.selectedAccount$.pipe(takeUntil(this.unsubscribe$)).subscribe(account => {
            this.selectedAccount = account;
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onAccountSelected(accountId: string): void {
        this.storeService.setSelectedAccountId(accountId);
        this.storeService.markAllAsRead(this.selectedAccount);
        this.storeService.setLayoutSettings({ activeArea: 'chat' });
    }
}
