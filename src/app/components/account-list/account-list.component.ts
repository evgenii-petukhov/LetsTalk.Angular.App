import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AccountDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent {
    @Input() accounts: AccountDto[];
    @Input() selectedAccountId: AccountDto[];
    @Output() accountSelectedEvent = new EventEmitter<number>();

    onAccountSelected(accountId: number): void {
        this.accountSelectedEvent.emit(accountId);
    }
}