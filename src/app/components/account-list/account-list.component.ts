import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Account } from '../../models/rendering/account';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent {
    @Input() accounts: Account[];
    @Output() accountSelectedEvent = new EventEmitter<number>();

    onAccountSelected(accountId: number): void {
        this.accountSelectedEvent.emit(accountId);
    }
}